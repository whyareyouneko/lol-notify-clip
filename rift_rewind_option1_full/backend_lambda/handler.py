import json, os, urllib.request
import boto3

BEDROCK_REGION = "us-east-1"
MODEL_ID = os.environ.get("MODEL_ID", "anthropic.claude-3-haiku-20240307-v1:0")

RIOT_REGION_ROUTING = "americas"
RIOT_API_KEY = os.environ.get("RIOT_API_KEY", "")

bedrock = boto3.client("bedrock-runtime", region_name=BEDROCK_REGION)

def _http(status, body_dict):
    return {
        "statusCode": status,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        "body": json.dumps(body_dict)
    }

def _ok(data): return _http(200, data)
def _err(msg, code=400): return _http(code, {"error": msg})

def riot_get(url: str):
    if not RIOT_API_KEY:
        raise RuntimeError("RIOT_API_KEY not set in Lambda env")
    req = urllib.request.Request(
        url,
        headers={"X-Riot-Token": RIOT_API_KEY, "User-Agent": "rift-rewind-dev"}
    )
    with urllib.request.urlopen(req, timeout=5) as resp:
        return json.loads(resp.read().decode())

def fetch_recent_match_ids(puuid: str, count: int = 10):
    base = f"https://{RIOT_REGION_ROUTING}.api.riotgames.com"
    url = f"{base}/lol/match/v5/matches/by-puuid/{puuid}/ids?start=0&count={count}"
    return riot_get(url)

def fetch_match_detail(match_id: str):
    base = f"https://{RIOT_REGION_ROUTING}.api.riotgames.com"
    url = f"{base}/lol/match/v5/matches/{match_id}"
    return riot_get(url)

def build_player_stats(puuid: str):
    match_ids = fetch_recent_match_ids(puuid, count=5)

    deaths_after_20 = 0
    fights_won_early = 0
    cs_total = 0
    cs_frames = 0
    highlights = []

    for mid in match_ids:
        detail = fetch_match_detail(mid)
        parts = detail["info"]["participants"]
        me = next(p for p in parts if p["puuid"] == puuid)

        cs_total += me.get("totalMinionsKilled", 0) + me.get("neutralMinionsKilled", 0)
        cs_frames += detail["info"]["gameDuration"] / 60.0

        if detail["info"]["gameDuration"] >= 20*60:
            deaths_after_20 += max(me.get("deaths",0) - 3, 0)

        early_kas = me.get("kills",0) + me.get("assists",0)
        if early_kas >= 2:
            fights_won_early += 1

        if me.get("quadraKills",0) >= 1 or me.get("pentaKills",0) >= 1:
            highlights.append({
                "match": mid,
                "desc": f"Multi-kill spike on {me.get('championName','Unknown')}"
            })

    cs_per_min = (cs_total / cs_frames) if cs_frames > 0 else 0.0

    return {
        "puuid": puuid,
        "sample_matches": len(match_ids),
        "cs_per_min": round(cs_per_min, 2),
        "deaths_after_20_est": deaths_after_20,
        "early_impact_games": fights_won_early,
        "highlights": highlights[:3],
    }

def make_hidden_gem(stats):
    gem = []
    if stats["cs_per_min"] >= 6:
        gem.append("You farm fast. Convert gold to vision control instead of greed fighting.")
    if stats["deaths_after_20_est"] >= 3:
        gem.append("You throw leads after 20:00. Stop walking alone into fog.")
    if not gem:
        gem.append("Your early skirmish impact is consistent. Force objectives off that early pressure.")
    return gem[0]

def summarize_with_bedrock(puuid: str, stats: dict):
    insights = {
        "puuid": puuid,
        "matches_analyzed": stats["sample_matches"],
        "cs_per_min": stats["cs_per_min"],
        "late_deaths_flag": stats["deaths_after_20_est"],
        "early_impact_games": stats["early_impact_games"],
        "hidden_gem": make_hidden_gem(stats),
    }

    system_prompt = (
        "You are a blunt League of Legends performance coach. "
        "Be concrete. Give 3 strengths, 3 problems, and 3 next actions. "
        "Use ONLY the JSON provided. Keep it under 180 words."
    )

    body_req = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 300,
        "temperature": 0.3,
        "messages": [
            {
                "role": "system",
                "content": [{"type": "text", "text": system_prompt}]
            },
            {
                "role": "user",
                "content": [{"type": "text", "text": json.dumps(insights)}]
            }
        ]
    }

    resp = bedrock.invoke_model(
        modelId=MODEL_ID,
        contentType="application/json",
        accept="application/json",
        body=json.dumps(body_req),
    )
    payload = json.loads(resp["body"].read())
    summary_text = "".join([c.get("text","") for c in payload.get("content", [])])

    return {
        "summary": summary_text,
        "insights_used": insights
    }

def handle_getRecap(puuid: str):
    stats = build_player_stats(puuid)
    return _ok({
        "player_overview": stats,
        "hidden_gem": make_hidden_gem(stats),
    })

def handle_getHighlights(puuid: str):
    stats = build_player_stats(puuid)
    return _ok({
        "highlights": stats["highlights"],
    })

def handle_summarize(puuid: str):
    stats = build_player_stats(puuid)
    coach = summarize_with_bedrock(puuid, stats)
    return _ok(coach)

def handle_compare(puuids):
    if len(puuids) < 2:
        return _err("need at least two puuids")
    a = build_player_stats(puuids[0])
    b = build_player_stats(puuids[1])
    return _ok({
        "players": [
            {
                "puuid": a["puuid"],
                "cs_per_min": a["cs_per_min"],
                "late_deaths": a["deaths_after_20_est"],
            },
            {
                "puuid": b["puuid"],
                "cs_per_min": b["cs_per_min"],
                "late_deaths": b["deaths_after_20_est"],
            },
        ],
        "synergy_note": "Player1 creates early lead. Player2 stabilizes late. Duo is viable if Player1 stops sprinting late."
    })

def lambda_handler(event, context):
    query = event.get("queryStringParameters") or {}
    raw_body = event.get("body") or ""
    try:
        body = json.loads(raw_body) if raw_body else {}
    except:
        body = {}

    action = body.get("action") or query.get("action")
    puuid = body.get("puuid") or query.get("puuid") or "demo"

    if not action:
        return _err("missing action")

    if action == "getRecap":
        return handle_getRecap(puuid)

    if action == "getHighlights":
        return handle_getHighlights(puuid)

    if action == "summarize":
        return handle_summarize(puuid)

    if action == "compare":
        puuids = body.get("puuids") or []
        return handle_compare(puuids)

    return _err("unknown action: " + action)

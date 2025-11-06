import json, os, urllib.request, urllib.parse, hashlib
import boto3

# === Config ===
BEDROCK_REGION = "us-east-1"
MODEL_ID = os.environ.get("MODEL_ID", "anthropic.claude-3-haiku-20240307-v1:0")

# Default Riot routing region used for MATCH and ACCOUNT routes when not provided
DEFAULT_RIOT_ROUTING = os.environ.get("RIOT_ROUTING", "americas")
RIOT_API_KEY = os.environ.get("RIOT_API_KEY", "")

# DynamoDB lineup index table for 1Y dataset lookups (set this in Lambda env)
LINEUP_INDEX_TABLE = os.environ.get("LINEUP_INDEX_TABLE", "rr_lineup_index")

bedrock = boto3.client("bedrock-runtime", region_name=BEDROCK_REGION)
ddb = boto3.resource("dynamodb")

# === HTTP helpers ===
def _http(status, body_dict):
    return {
        "statusCode": status,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        },
        "body": json.dumps(body_dict),
    }

def _ok(data): return _http(200, data)
def _err(msg, code=400): return _http(code, {"error": msg})

# === Riot helpers ===
def _riot_get(url: str):
    if not RIOT_API_KEY:
        raise RuntimeError("RIOT_API_KEY not set in Lambda env")
    req = urllib.request.Request(
        url,
        headers={"X-Riot-Token": RIOT_API_KEY, "User-Agent": "rift-rewind-dev"}
    )
    with urllib.request.urlopen(req, timeout=6) as resp:
        return json.loads(resp.read().decode())

def riot_account_by_riot_id(game_name: str, tag_line: str, routing_region: str):
    base = f"https://{routing_region}.api.riotgames.com"
    url = f"{base}/riot/account/v1/accounts/by-riot-id/{urllib.parse.quote(game_name)}/{urllib.parse.quote(tag_line)}"
    return _riot_get(url)  # -> { puuid, gameName, tagLine }

def fetch_recent_match_ids(puuid: str, routing_region: str, count: int = 10):
    base = f"https://{routing_region}.api.riotgames.com"
    url = f"{base}/lol/match/v5/matches/by-puuid/{puuid}/ids?start=0&count={count}"
    return _riot_get(url)

def fetch_match_detail(match_id: str, routing_region: str):
    base = f"https://{routing_region}.api.riotgames.com"
    url = f"{base}/lol/match/v5/matches/{match_id}"
    return _riot_get(url)

# === Stats building (unchanged logic, parameterized for routing) ===
def build_player_stats(puuid: str, routing_region: str):
    match_ids = fetch_recent_match_ids(puuid, routing_region, count=5)

    deaths_after_20 = 0
    fights_won_early = 0
    cs_total = 0
    cs_frames = 0
    highlights = []

    for mid in match_ids:
        detail = fetch_match_detail(mid, routing_region)
        parts = detail["info"]["participants"]
        me = next(p for p in parts if p["puuid"] == puuid)

        cs_total += me.get("totalMinionsKilled", 0) + me.get("neutralMinionsKilled", 0)
        cs_frames += detail["info"]["gameDuration"] / 60.0

        if detail["info"]["gameDuration"] >= 20 * 60:
            deaths_after_20 += max(me.get("deaths", 0) - 3, 0)

        early_kas = me.get("kills", 0) + me.get("assists", 0)
        if early_kas >= 2:
            fights_won_early += 1

        if me.get("quadraKills", 0) >= 1 or me.get("pentaKills", 0) >= 1:
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
            {"role": "system", "content": [{"type": "text", "text": system_prompt}]},
            {"role": "user", "content": [{"type": "text", "text": json.dumps(insights)}]},
        ],
    }

    resp = bedrock.invoke_model(
        modelId=MODEL_ID,
        contentType="application/json",
        accept="application/json",
        body=json.dumps(body_req),
    )
    payload = json.loads(resp["body"].read())
    summary_text = "".join([c.get("text", "") for c in payload.get("content", [])])

    return {"summary": summary_text, "insights_used": insights}

# === 1-Year dataset lineup compare ===
def _canon_role(role: str) -> str:
    r = (role or "").strip().upper()
    if r in ("TOP", "TOPLANE"): return "TOP"
    if r in ("JUNGLE", "JG"): return "JUNGLE"
    if r in ("MID", "MIDLANE"): return "MID"
    if r in ("ADC", "BOT", "BOTTOM"): return "ADC"
    if r in ("SUPPORT", "SUP"): return "SUPPORT"
    return "MID"

def _canon_champ(name: str) -> str:
    return (name or "").strip().upper().replace(" ", "")

def _lineup_key(payload: dict) -> str:
    blue, red = [], []
    for p in payload.get("teams", []):
        side = (p.get("side") or "BLUE").upper()
        item = f"{_canon_role(p.get('role'))}:{_canon_champ(p.get('champ'))}"
        (red if side == "RED" else blue).append(item)
    blue.sort(); red.sort()
    s = "|".join(blue) + "||" + "|".join(red)
    return hashlib.sha1(s.encode()).hexdigest()

def handle_compare_lineup(payload: dict):
    lk = _lineup_key(payload)
    table = ddb.Table(LINEUP_INDEX_TABLE)
    item = table.get_item(Key={"lk": lk}).get("Item")
    if not item:
        return _ok({"found": False})

    # Optional: generate a short coaching blurb via Bedrock
    try:
        prompt = {
            "instruction": "Write a concise 120-word comparison between the current lineup and the historical match. Give one actionable tip.",
            "current": payload,
            "historical": item.get("meta", {}),
        }
        res = bedrock.converse(
            modelId=os.environ.get("BEDROCK_MODEL_ID", MODEL_ID),
            messages=[{"role": "user", "content": [{"text": json.dumps(prompt)}]}],
            inferenceConfig={"temperature": 0.2, "maxTokens": 220},
        )
        pieces = res["output"]["message"]["content"]
        text = "".join(p.get("text", "") for p in pieces)
    except Exception:
        text = "Identical lineup found in the 1Y dataset."

    return _ok({
        "found": True,
        "match_id": item.get("matchId"),
        "distance": 0.0,
        "summary": text,
    })

# === Action handlers using puuid + routing ===
def handle_getRecap(puuid: str, routing_region: str):
    stats = build_player_stats(puuid, routing_region)
    return _ok({"player_overview": stats, "hidden_gem": make_hidden_gem(stats)})

def handle_getHighlights(puuid: str, routing_region: str):
    stats = build_player_stats(puuid, routing_region)
    return _ok({"highlights": stats["highlights"]})

def handle_summarize(puuid: str, routing_region: str):
    stats = build_player_stats(puuid, routing_region)
    coach = summarize_with_bedrock(puuid, stats)
    return _ok(coach)

def handle_compare(puuids, routing_region: str):
    if len(puuids) < 2:
        return _err("need at least two puuids")
    a = build_player_stats(puuids[0], routing_region)
    b = build_player_stats(puuids[1], routing_region)
    return _ok({
        "players": [
            {"puuid": a["puuid"], "cs_per_min": a["cs_per_min"], "late_deaths": a["deaths_after_20_est"]},
            {"puuid": b["puuid"], "cs_per_min": b["cs_per_min"], "late_deaths": b["deaths_after_20_est"]},
        ],
        "synergy_note": "Player1 creates early lead. Player2 stabilizes late. Duo is viable if Player1 stops sprinting late.",
    })

# === Request parsing ===
def _parse_body(event):
    raw = event.get("body") or ""
    if not raw:
        return {}
    # Try JSON
    try:
        return json.loads(raw)
    except Exception:
        pass
    # Try form-encoded
    try:
        parsed = urllib.parse.parse_qs(raw)
        # flatten single values
        return {k: v[0] if isinstance(v, list) and v else v for k, v in parsed.items()}
    except Exception:
        return {}

def _param(event, body, key, default=None):
    qs = event.get("queryStringParameters") or {}
    if key in body and body[key] != "":
        return body[key]
    if key in qs and qs[key] != "":
        return qs[key]
    return default

def _resolve_puuid(puuid, game_name, tag_line, routing_region):
    """
    If puuid is provided use it. Otherwise resolve via Riot ID.
    """
    if puuid and puuid != "demo":
        return puuid
    if game_name and tag_line:
        acct = riot_account_by_riot_id(game_name, tag_line, routing_region)
        return acct.get("puuid")
    raise ValueError("Provide either puuid or gameName+tagLine")

# === Lambda entry ===
def lambda_handler(event, context):
    if event.get("httpMethod") == "OPTIONS":
        return _ok({"ok": True})

    body = _parse_body(event)
    action = _param(event, body, "action")
    if not action:
        return _err("missing action")

    routing_region = _param(event, body, "routingRegion", DEFAULT_RIOT_ROUTING)

    # Inputs for puuid resolution
    puuid = _param(event, body, "puuid")
    game_name = _param(event, body, "gameName")
    tag_line = _param(event, body, "tagLine")

    try:
        if action == "getRecap":
            resolved = _resolve_puuid(puuid, game_name, tag_line, routing_region)
            return handle_getRecap(resolved, routing_region)

        if action == "getHighlights":
            resolved = _resolve_puuid(puuid, game_name, tag_line, routing_region)
            return handle_getHighlights(resolved, routing_region)

        if action == "summarize":
            resolved = _resolve_puuid(puuid, game_name, tag_line, routing_region)
            return handle_summarize(resolved, routing_region)

        if action == "compare":
            puuids = body.get("puuids") or []
            return handle_compare(puuids, routing_region)

        if action == "compareLineup":
            payload_raw = _param(event, body, "payload", "{}")
            try:
                payload = payload_raw if isinstance(payload_raw, dict) else json.loads(payload_raw)
            except Exception:
                return _err("Invalid payload JSON")
            return handle_compare_lineup(payload)

        return _err("unknown action: " + action)
    except Exception as e:
        return _err(str(e), code=500)

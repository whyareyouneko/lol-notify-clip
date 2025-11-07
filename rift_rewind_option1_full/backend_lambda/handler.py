import json, os, urllib.request, urllib.parse, hashlib, io
import boto3

# ===== Config =====
BEDROCK_REGION = os.environ.get("AWS_REGION", "us-east-1")
MODEL_ID = os.environ.get("MODEL_ID", "anthropic.claude-3-haiku-20240307-v1:0")

# Riot routing region used for Account/Match V5. Frontend can override via routingRegion.
DEFAULT_RIOT_ROUTING = os.environ.get("RIOT_ROUTING", "americas")
RIOT_API_KEY = os.environ.get("RIOT_API_KEY", "")

# Exact-match lineup index
LINEUP_INDEX_TABLE = os.environ.get("LINEUP_INDEX_TABLE", "rr_lineup_index")

# Optional: S3 cache to reduce Riot API calls (prefix: matches/)
S3_CACHE_BUCKET = os.environ.get("S3_CACHE_BUCKET", "")

# Optional: Bedrock Knowledge Base (semantic fallback when DDB miss)
KB_ID = os.environ.get("KB_ID", "")

bedrock = boto3.client("bedrock-runtime", region_name=BEDROCK_REGION)
ddb = boto3.resource("dynamodb")
s3 = boto3.client("s3") if S3_CACHE_BUCKET else None
kb = boto3.client("bedrock-agent-runtime", region_name=BEDROCK_REGION) if KB_ID else None

# ===== HTTP helpers =====
def _http(code, body):
    return {
        "statusCode": code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        },
        "body": json.dumps(body),
    }

def _ok(b):  return _http(200, b)
def _err(m, c=400): return _http(c, {"error": m})

# ===== Riot helpers =====
def _riot_get(url: str):
    if not RIOT_API_KEY:
        raise RuntimeError("RIOT_API_KEY not set")
    req = urllib.request.Request(
        url,
        headers={"X-Riot-Token": RIOT_API_KEY, "User-Agent": "rift-rewind"}
    )
    with urllib.request.urlopen(req, timeout=6) as resp:
        return json.loads(resp.read().decode())

def riot_account_by_riot_id(game_name: str, tag_line: str, routing_region: str):
    base = f"https://{routing_region}.api.riotgames.com"
    url  = f"{base}/riot/account/v1/accounts/by-riot-id/{urllib.parse.quote(game_name)}/{urllib.parse.quote(tag_line)}"
    return _riot_get(url)  # -> { puuid, gameName, tagLine }

def _s3_get_text(key: str):
    try:
        obj = s3.get_object(Bucket=S3_CACHE_BUCKET, Key=key)
        return obj["Body"].read().decode()
    except Exception:
        return None

def _s3_put_json(key: str, data: dict):
    try:
        s3.put_object(Bucket=S3_CACHE_BUCKET, Key=key, Body=json.dumps(data).encode(), ContentType="application/json")
    except Exception:
        pass

def fetch_recent_match_ids(puuid: str, routing_region: str, count: int = 10):
    count = max(1, min(int(count), 10))
    cache_key = f"matches/{routing_region}/by-puuid/{puuid}/ids_{count}.json"
    if s3:
        txt = _s3_get_text(cache_key)
        if txt: return json.loads(txt)

    base = f"https://{routing_region}.api.riotgames.com"
    url  = f"{base}/lol/match/v5/matches/by-puuid/{puuid}/ids?start=0&count={count}"
    ids = _riot_get(url)
    if s3: _s3_put_json(cache_key, ids)
    return ids

def fetch_match_detail(match_id: str, routing_region: str):
    cache_key = f"matches/{routing_region}/{match_id}.json"
    if s3:
        txt = _s3_get_text(cache_key)
        if txt: return json.loads(txt)

    base = f"https://{routing_region}.api.riotgames.com"
    url  = f"{base}/lol/match/v5/matches/{match_id}"
    data = _riot_get(url)
    if s3: _s3_put_json(cache_key, data)
    return data

# ===== Feature builders =====
def build_player_stats(puuid: str, routing_region: str):
    ids = fetch_recent_match_ids(puuid, routing_region, count=5)
    deaths_after_20 = fights_won_early = 0
    cs_total = cs_frames = 0.0
    highlights = []

    for mid in ids:
        detail = fetch_match_detail(mid, routing_region)
        info = detail.get("info", {})
        parts = info.get("participants", [])
        me = next(p for p in parts if p.get("puuid") == puuid)

        cs_total  += me.get("totalMinionsKilled", 0) + me.get("neutralMinionsKilled", 0)
        cs_frames += (info.get("gameDuration") or 0) / 60.0

        if info.get("gameDuration", 0) >= 20*60:
            deaths_after_20 += max(me.get("deaths", 0) - 3, 0)

        if me.get("kills",0) + me.get("assists",0) >= 2:
            fights_won_early += 1

        if me.get("quadraKills",0) >= 1 or me.get("pentaKills",0) >= 1:
            highlights.append({"match": mid, "desc": f"Multi-kill spike on {me.get('championName','Unknown')}"})

    cspm = (cs_total / cs_frames) if cs_frames > 0 else 0.0
    return {
        "puuid": puuid,
        "sample_matches": len(ids),
        "cs_per_min": round(cspm, 2),
        "deaths_after_20_est": deaths_after_20,
        "early_impact_games": fights_won_early,
        "highlights": highlights[:3],
    }

def make_hidden_gem(stats):
    if stats["cs_per_min"] >= 6:
        return "You farm fast. Convert gold to vision control instead of greed fighting."
    if stats["deaths_after_20_est"] >= 3:
        return "You throw leads after 20:00. Stop walking alone into fog."
    return "Your early skirmish impact is consistent. Force objectives off that early pressure."

def summarize_with_bedrock(puuid: str, stats: dict):
    insights = {
        "puuid": puuid,
        "matches_analyzed": stats["sample_matches"],
        "cs_per_min": stats["cs_per_min"],
        "late_deaths_flag": stats["deaths_after_20_est"],
        "early_impact_games": stats["early_impact_games"],
        "hidden_gem": make_hidden_gem(stats),
    }
    system = ("You are a blunt League of Legends coach. "
              "Be concrete. Give 3 strengths, 3 problems, and 3 next actions. "
              "Use ONLY the JSON provided. Keep under 180 words.")
    body = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 300,
        "temperature": 0.3,
        "messages": [
            {"role": "system", "content": [{"type":"text","text": system}]},
            {"role": "user",   "content": [{"type":"text","text": json.dumps(insights)}]},
        ],
    }
    resp = bedrock.invoke_model(
        modelId=MODEL_ID, contentType="application/json",
        accept="application/json", body=json.dumps(body),
    )
    payload = json.loads(resp["body"].read())
    text = "".join(part.get("text","") for part in payload.get("content", []))
    return {"summary": text, "insights_used": insights}

# ===== Lineup compare (exact DDB + optional KB fallback) =====
def _canon_role(r: str) -> str:
    x = (r or "").strip().upper()
    return {
        "TOPLANE":"TOP","TOP":"TOP",
        "JG":"JUNGLE","JUNGLE":"JUNGLE",
        "MIDLANE":"MID","MID":"MID",
        "BOT":"ADC","BOTTOM":"ADC","ADC":"ADC",
        "SUP":"SUPPORT","SUPPORT":"SUPPORT",
    }.get(x, "MID")

def _canon_champ(c: str) -> str:
    return (c or "").strip().upper().replace(" ", "")

def _lineup_key(payload: dict) -> str:
    blue, red = [], []
    for p in payload.get("teams", []):
        side = (p.get("side") or "BLUE").upper()
        token = f"{_canon_role(p.get('role'))}:{_canon_champ(p.get('champ'))}"
        (red if side == "RED" else blue).append(token)
    blue.sort(); red.sort()
    s = "|".join(blue) + "||" + "|".join(red)
    return hashlib.sha1(s.encode()).hexdigest()

def _kb_retrieve_fallback(lk: str, queue_id: int|None, duration_s: int|None):
    if not kb: return None
    # Prefer exact metadata filter on lk. If your KB schema differs, adjust keys.
    filters = {"equals": [{"key":"lk","value": lk}]}
    try:
        out = kb.retrieve(
            knowledgeBaseId=KB_ID,
            retrievalQuery={"text": f"lineup {lk}"},
            retrievalConfiguration={
                "vectorSearchConfiguration": {"numberOfResults": 5, "overrideSearchType": "HYBRID"},
                "metadataConfiguration": {"filters": filters},
            },
        )
        items = out.get("retrievalResults", [])
        if not items: return None
        alts = []
        for r in items:
            alts.append({
                "id": r.get("content", {}).get("document", {}).get("id") or r.get("metadata", {}).get("id"),
                "score": r.get("score"),
                "snippet": (r.get("content", {}).get("text") or "")[:240],
            })
        return alts
    except Exception:
        return None

def handle_compare_lineup(payload: dict):
    lk = _lineup_key(payload)
    table = ddb.Table(LINEUP_INDEX_TABLE)
    item = table.get_item(Key={"lk": lk}).get("Item")

    if item:
        # Exact lineup exists
        try:
            res = bedrock.converse(
                modelId=os.environ.get("BEDROCK_MODEL_ID", MODEL_ID),
                messages=[{"role":"user","content":[{"text":json.dumps({
                    "instruction":"120-word comparison and one actionable tip.",
                    "current": payload, "historical": item.get("meta",{})
                })}]}],
                inferenceConfig={"temperature":0.2,"maxTokens":220},
            )
            pieces = res["output"]["message"]["content"]
            text = "".join(p.get("text","") for p in pieces)
        except Exception:
            text = "Identical lineup found in the 1-year dataset."

        return _ok({
            "found": True,
            "match_id": item.get("matchId"),
            "distance": 0.0,
            "summary": text,
        })

    # Fallback: semantic nearest from Knowledge Base (optional)
    alts = _kb_retrieve_fallback(lk, payload.get("queue_id"), payload.get("duration_s"))
    if alts:
        return _ok({"found": True, "distance": 0.27, "alternatives": alts,
                    "summary": "No exact match. Here are the closest historical comps."})

    return _ok({"found": False})

# ===== Action wrappers (resolve puuid or Riot ID) =====
def _parse_body(event):
    raw = event.get("body") or ""
    if not raw: return {}
    try:
        return json.loads(raw)
    except Exception:
        try:
            parsed = urllib.parse.parse_qs(raw)
            return {k: (v[0] if isinstance(v, list) and v else v) for k,v in parsed.items()}
        except Exception:
            return {}

def _param(event, body, key, default=None):
    qs = event.get("queryStringParameters") or {}
    if key in body and body[key] != "": return body[key]
    if key in qs and qs[key] != "":     return qs[key]
    return default

def _resolve_puuid(puuid, game_name, tag_line, routing_region):
    if puuid and puuid != "demo": return puuid
    if game_name and tag_line:
        acct = riot_account_by_riot_id(game_name, tag_line, routing_region)
        return acct.get("puuid")
    raise ValueError("Provide either puuid or gameName+tagLine")

def handle_getRecap(puuid: str, routing_region: str):
    stats = build_player_stats(puuid, routing_region)
    return _ok({"player_overview": stats, "hidden_gem": make_hidden_gem(stats)})

def handle_getHighlights(puuid: str, routing_region: str):
    stats = build_player_stats(puuid, routing_region)
    return _ok({"highlights": stats["highlights"]})

def handle_summarize(puuid: str, routing_region: str):
    stats = build_player_stats(puuid, routing_region)
    return _ok(summarize_with_bedrock(puuid, stats))

def handle_compare(puuids, routing_region: str):
    if len(puuids) < 2: return _err("need at least two puuids")
    a = build_player_stats(puuids[0], routing_region)
    b = build_player_stats(puuids[1], routing_region)
    return _ok({
        "players": [
            {"puuid": a["puuid"], "cs_per_min": a["cs_per_min"], "late_deaths": a["deaths_after_20_est"]},
            {"puuid": b["puuid"], "cs_per_min": b["cs_per_min"], "late_deaths": b["deaths_after_20_est"]},
        ],
        "synergy_note": "Player1 creates early lead. Player2 stabilizes late.",
    })

# ===== Lambda entry =====
def lambda_handler(event, context):
    if event.get("httpMethod") == "OPTIONS":
        return _ok({"ok": True})

    body = _parse_body(event)
    action = _param(event, body, "action")
    if not action: return _err("missing action")

    routing_region = _param(event, body, "routingRegion", DEFAULT_RIOT_ROUTING)

    puuid    = _param(event, body, "puuid")
    gameName = _param(event, body, "gameName")
    tagLine  = _param(event, body, "tagLine")

    try:
        if action == "getRecap":
            resolved = _resolve_puuid(puuid, gameName, tagLine, routing_region)
            return handle_getRecap(resolved, routing_region)

        if action == "getHighlights":
            resolved = _resolve_puuid(puuid, gameName, tagLine, routing_region)
            return handle_getHighlights(resolved, routing_region)

        if action == "summarize":
            resolved = _resolve_puuid(puuid, gameName, tagLine, routing_region)
            return handle_summarize(resolved, routing_region)

        if action == "compare":
            puuids = body.get("puuids") or []
            return handle_compare(puuids, routing_region)

        if action == "compareLineup":
            payload_raw = _param(event, body, "payload", "{}")
            payload = payload_raw if isinstance(payload_raw, dict) else json.loads(payload_raw)
            return handle_compare_lineup(payload)

        return _err("unknown action: " + action)
    except Exception as e:
        return _err(str(e), 500)

import json, boto3, os
from .bedrock_summarize import summarize_comparison

ddb = boto3.client("dynamodb")
TABLE = os.environ.get("LINEUP_TABLE", "lineup_index")

def canon(ch): 
    return ch.strip().upper().replace(" ", "").replace("'", "")

def lineup_key_from_payload(payload):
    tags=[]
    for p in payload["teams"]:
        side = p["side"].upper()[0]      # B or R
        role = p["role"].upper()
        tags.append(f"{side}_{role}:{canon(p['champ'])}")
    return "|".join(sorted(tags))

def ddb_query_exact(lineup_key):
    resp = ddb.query(
        TableName=TABLE,
        KeyConditionExpression="lineup_key = :k",
        ExpressionAttributeValues={":k": {"S": lineup_key}},
        ScanIndexForward=False,  # newest first
        Limit=5
    )
    items = []
    for item in resp.get("Items", []):
        items.append({k: list(v.values())[0] for k, v in item.items()})
    return items

def _team_agg(m, side):
    side_team = [p for p in m["teams"] if p["side"] == side]
    return {
        "kills":  sum(p.get("k",0) for p in side_team),
        "deaths": sum(p.get("d",0) for p in side_team),
        "assists":sum(p.get("a",0) for p in side_team),
        "cs":     sum(p.get("cs",0) for p in side_team),
        "gold":   sum(p.get("gold",0) for p in side_team),
        "win":    any(p.get("win",False) for p in side_team),
    }

def handler(event, _context):
    # Expect JSON body: { "current_match": {...} }
    body = event.get("body")
    if isinstance(body, str) and body:
        try:
            payload = json.loads(body)
        except Exception:
            return _resp(400, {"error": "invalid JSON"})
    elif isinstance(event, dict) and "current_match" in event:
        payload = event
    else:
        return _resp(400, {"error": "no payload"})

    if "current_match" not in payload:
        return _resp(400, {"error": "missing current_match"})

    current = payload["current_match"]
    lineup_k = lineup_key_from_payload(current)
    cands = ddb_query_exact(lineup_k)

    if not cands:
        return _resp(200, {"found": False, "reason": "no exact lineup in dataset"})

    def _rank(x):
        q = int(x.get("queue_id", 0))
        dur = int(x.get("duration_s", 0))
        cq = int(current.get("queue_id", 0))
        cd = int(current.get("duration_s", 0))
        return (0 if q == cq else 1, abs(dur - cd))

    best = sorted(cands, key=_rank)[0]
    hist = json.loads(best["summary_row"])

    compare_ctx = {
        "lineup_key": lineup_k,
        "current": {
            "queue_id": current.get("queue_id"),
            "duration_s": current.get("duration_s"),
            "blue": _team_agg(current, "BLUE"),
            "red":  _team_agg(current, "RED"),
        },
        "historical": hist
    }

    text = summarize_comparison(compare_ctx)

    return _resp(200, {
        "found": True,
        "lineup_key": lineup_k,
        "match_id": best["match_id"],
        "summary": text,
        "context": compare_ctx
    })

def _resp(code, obj):
    return {
        "statusCode": code,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(obj)
    }

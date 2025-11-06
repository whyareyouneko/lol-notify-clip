import json, gzip, boto3

ddb = boto3.client("dynamodb")
TABLE = "lineup_index"
ROLES = {"TOP", "JUNGLE", "MID", "ADC", "SUPPORT"}

def canon(champ: str) -> str:
    return champ.strip().upper().replace(" ", "").replace("'", "")

def lineup_key(teams):
    tags = []
    for t in teams:
        side = t["side"].upper()[0]  # B or R
        role = t["role"].upper()
        if role not in ROLES: 
            continue
        tags.append(f"{side}_{role}:{canon(t['champ'])}")
    return "|".join(sorted(tags))

def _side_stats(m, side):
    side_team = [p for p in m["teams"] if p["side"] == side]
    return {
        "kills":  sum(p.get("k", 0) for p in side_team),
        "deaths": sum(p.get("d", 0) for p in side_team),
        "assists":sum(p.get("a", 0) for p in side_team),
        "cs":     sum(p.get("cs", 0) for p in side_team),
        "gold":   sum(p.get("gold", 0) for p in side_team),
        "win":    any(p.get("win", False) for p in side_team),
    }

def _summarize(m):
    return {
        "match_id": m["match_id"],
        "queue_id": m["queue_id"],
        "duration_s": m["duration_s"],
        "blue": _side_stats(m, "BLUE"),
        "red":  _side_stats(m, "RED"),
    }

def to_ddb_item(m):
    return {
        "lineup_key": {"S": lineup_key(m["teams"])},
        "start_ms":   {"N": str(m["start_ms"])},
        "match_id":   {"S": m["match_id"]},
        "queue_id":   {"N": str(m["queue_id"])},
        "duration_s": {"N": str(m["duration_s"])},
        "summary_row":{"S": json.dumps(_summarize(m), separators=(",",":"))}
    }

def handler(event, _context):
    """
    event = {
      "bucket": "your-bucket",
      "key": "normalized/year.ndjson.gz"  # or .ndjson
    }
    Each line: one normalized match JSON.
    """
    s3 = boto3.client("s3")
    bucket = event["bucket"]
    key    = event["key"]

    body = s3.get_object(Bucket=bucket, Key=key)["Body"].read()
    if key.endswith(".gz"):
        body = gzip.decompress(body)

    for line in body.splitlines():
        if not line:
            continue
        m = json.loads(line)
        ddb.put_item(TableName=TABLE, Item=to_ddb_item(m))

    return {"ok": True}

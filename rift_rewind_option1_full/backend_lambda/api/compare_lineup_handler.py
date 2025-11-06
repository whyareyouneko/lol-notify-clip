# rift_rewind_option1_full/backend_lambda/api/compare_lineup_handler.py
import os, json, hashlib
import boto3
from .bedrock_summarize import bedrock_client  # reuse client factory if you have one

DDB = boto3.resource("dynamodb")
TABLE_NAME = os.environ.get("LINEUP_INDEX_TABLE", "rr_lineup_index")  # set in Lambda env

def canon_role(role: str) -> str:
    r = (role or "").strip().upper()
    # normalize common variants
    if r in ("TOP", "TOPLANE"): return "TOP"
    if r in ("JUNGLE", "JG"): return "JUNGLE"
    if r in ("MID", "MIDLANE"): return "MID"
    if r in ("ADC", "BOT", "BOTTOM"): return "ADC"
    if r in ("SUPPORT", "SUP"): return "SUPPORT"
    return "MID"

def canon_champ(name: str) -> str:
    return (name or "").strip().upper().replace(" ", "")

def lineup_key(payload: dict) -> str:
    # Expect payload["teams"] 10 players with side/role/champ
    blue = []
    red = []
    for p in payload.get("teams", []):
        side = p.get("side", "BLUE").upper()
        role = canon_role(p.get("role", "MID"))
        champ = canon_champ(p.get("champ", ""))
        item = f"{role}:{champ}"
        if side == "RED":
            red.append(item)
        else:
            blue.append(item)
    blue.sort()
    red.sort()
    key_str = "|".join(blue) + "||" + "|".join(red)
    return hashlib.sha1(key_str.encode()).hexdigest()

def handle_compare_lineup(payload: dict):
    key = lineup_key(payload)
    table = DDB.Table(TABLE_NAME)

    # lookup exact lineup
    ddb_item = table.get_item(Key={"lk": key}).get("Item")
    if not ddb_item:
        return {"found": False}

    match_id = ddb_item.get("matchId")
    meta = {
        "queue_id": payload.get("queue_id"),
        "duration_s": payload.get("duration_s"),
        "match_id": match_id,
    }

    # ask Bedrock for a concise comparison sentence
    client = bedrock_client()
    prompt = {
        "instruction": "Write a 120-word coaching blurb comparing the current lineup to the historical match.",
        "current": payload,
        "historical": ddb_item.get("meta", {}),
    }
    # Replace with your model invocation helper; here use Converse API style pseudo-call:
    text = json.dumps(prompt)  # fallback in case model call not wired yet
    try:
        res = client.converse(
            modelId=os.environ.get("BEDROCK_MODEL_ID", "anthropic.claude-3-haiku-20240307-v1:0"),
            messages=[{"role": "user", "content": [{"text": json.dumps(prompt)}]}],
            inferenceConfig={"temperature": 0.2, "maxTokens": 220},
        )
        pieces = res["output"]["message"]["content"]
        text = "".join(p.get("text", "") for p in pieces)
    except Exception:
        pass

    return {
        "found": True,
        "match_id": match_id,
        "distance": 0.0,
        "summary": text,
        "meta": meta,
    }


import json, base64

def _resp(code=200, body=None, headers=None, is_bin=False):
    h = {"Content-Type": "application/json","Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"*"}
    if headers: h.update(headers)
    b = body if body is not None else {}
    if is_bin:
        return {"statusCode": code, "headers": h, "isBase64Encoded": True, "body": base64.b64encode(b).decode()}
    return {"statusCode": code, "headers": h, "body": json.dumps(b)}

def health_handler(event, ctx):
    return _resp(200, {"ok": True})

def summary_handler(event, ctx):
    puuid = event.get("pathParameters",{}).get("puuid","demo")
    return _resp(200, {"puuid": puuid, "cards":[{"id":"demo","title":"Vision Anchor","one_liner":"0.62 vs 0.55 baseline","why_it_matters":"+2.1pp WR","evidence":[{"stat":"wards/min","value":0.62,"baseline":0.55,"delta":0.07}],"actions":["Ward river by 6:00","Buy control wards","Swap to Oracle at 9:00"],"share_text":"I out-warded my elo.","badge":"hidden_gem"}]})

def ingest_handler(event, ctx):
    puuid = event.get("pathParameters",{}).get("puuid","demo")
    return _resp(202, {"ingest_started": True, "puuid": puuid})

def mirror_handler(event, ctx):
    match_id = event.get("pathParameters",{}).get("matchId","demo")
    return _resp(200, {"matchId": match_id, "refs":{"n":43,"tier":"Master+","patch":"14.19"},"gaps":[{"metric":"ADC recall_s","you":420,"target":360,"impact_pp":2.1}]})

def patch_handler(event, ctx):
    puuid = event.get("pathParameters",{}).get("puuid","demo")
    return _resp(200, {"puuid": puuid, "tips":[{"champ":"Ahri","note":"Post-14.20 Q nerf. Buy Lost Chapter early."}]})

def share_handler(event, ctx):
    png = base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAQAAAC1HAwCAAAAD0lEQVR42mP8z8AARgYGABF0BNv2s1wRAAAAAElFTkSuQmCC")
    return _resp(200, png, headers={"Content-Type":"image/png"}, is_bin=True)

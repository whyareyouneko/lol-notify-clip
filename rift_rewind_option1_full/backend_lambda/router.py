import json
from api.compare_lineup_handler import handler as compare_lineup

def router(event, context):
    """
    API Gateway Lambda proxy. Dispatch by ?action= or JSON body.action.
    """
    params = event.get("queryStringParameters") or {}
    action = (params.get("action") or "").lower()

    # If POST with JSON body, prefer body.action
    if not action and isinstance(event.get("body"), str):
        try:
            body_obj = json.loads(event["body"])
            action = (body_obj.get("action") or "").lower()
        except Exception:
            action = action

    if action == "comparelineup":
        # event['body'] must contain JSON with { current_match: {...} }
        return compare_lineup(event, context)

    return {
        "statusCode": 400,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps({"error": "unknown action"})
    }

def handler(event, context):
    return router(event, context)

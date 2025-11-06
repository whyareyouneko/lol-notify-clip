import boto3, json, os

MODEL_ID = os.environ.get("BEDROCK_MODEL", "anthropic.claude-3-haiku-20240307-v1:0")
bedrock = boto3.client("bedrock-runtime")

SYSTEM = (
  "You are a concise League of Legends coach. Compare CURRENT vs HISTORICAL with the SAME lineup. "
  "Use only provided JSON. Output ≤120 words and exactly three bullet action items. No fluff."
)

def summarize_comparison(ctx: dict) -> str:
    payload = {
      "task": "lineup_exact_match_compare",
      "lineup_key": ctx["lineup_key"],
      "current": ctx["current"],
      "historical": ctx["historical"]
    }

    body = {
      "anthropic_version": "bedrock-2023-05-31",
      "system": SYSTEM,
      "max_tokens": 300,
      "temperature": 0.2,
      "messages": [
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": (
                "JSON:\n" + json.dumps(payload, separators=(",",":")) +
                "\n\nInstructions:\n"
                "1) State which team won in CURRENT and HISTORICAL.\n"
                "2) Name two biggest statistical deltas.\n"
                "3) Give exactly 3 bullet fixes for CURRENT to match the better outcome."
              )
            }
          ]
        }
      ]
    }

    res = bedrock.invoke_model(modelId=MODEL_ID, body=json.dumps(body))
    data = json.loads(res["body"].read())
    return "".join(part.get("text", "") for part in data.get("content", []))

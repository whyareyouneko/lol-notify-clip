# Rift Rewind Lambda Backend (Option 1)

Single AWS Lambda function that:
- talks to Riot API using RIOT_API_KEY (kept secret in Lambda env vars)
- aggregates recent match stats
- calls Amazon Bedrock (Claude 3 Haiku) to generate coaching text
- returns JSON to the frontend

## Steps

1. Create Lambda
   - Runtime: Python 3.12
   - Paste `handler.py` code
   - Handler entrypoint: `handler.lambda_handler`

2. Env vars
   - `RIOT_API_KEY=RGAPI-...`
   - `MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0` (or another Bedrock model ID you have access to)

3. Permissions
   - Execution role must allow:
     - `bedrock:InvokeModel`
     - `bedrock:InvokeModelWithResponseStream`
   - Basic Lambda execution policy

4. Networking
   - Leave Lambda with internet access so it can call Riot's API.
   - Do NOT lock it in a private subnet with no NAT, or Riot calls will fail.

5. Function URL
   - In Lambda console, create a Function URL
     - Auth type: NONE
     - CORS: allow `*`
   - Copy that URL

6. Frontend
   - In `frontend/.env.local` set:
     `VITE_LAMBDA_URL=https://<your-lambda-id>.lambda-url.<region>.on.aws`

7. Test manually
   ```bash
   curl "https://<your-lambda-id>.lambda-url.<region>.on.aws/?action=getRecap&puuid=<some-puuid>"
   curl -X POST "https://<your-lambda-id>.lambda-url.<region>.on.aws/"      -H "Content-Type: application/json"      --data '{"action":"summarize","puuid":"<some-puuid>"}'
   ```

These responses drive the UI and also satisfy the hackathon demo + judging requirements.

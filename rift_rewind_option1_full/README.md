# Rift Rewind (Option 1 stack)

This repo contains:
- `frontend/`  (React + Vite + Tailwind)
- `backend_lambda/` (single AWS Lambda with Function URL)

## Flow
1. Frontend asks Lambda for:
   - `action=getRecap`    -> stats, trends, hidden gem
   - `action=summarize`   -> Bedrock coaching summary
2. Lambda:
   - pulls recent match data from Riot using RIOT_API_KEY env var
   - computes insights
   - calls Amazon Bedrock (Claude 3 Haiku) to generate coaching text
   - returns JSON
3. Frontend renders recap card + AI coach card

## Judge requirements mapping
- AWS AI service = Amazon Bedrock in Lambda
- League data = Riot match history in Lambda
- Personalized end-of-year recap = summarize action
- Shareable insights = hidden gem, coach summary
- Working public URL = your deployed frontend URL + Lambda Function URL
- Public code repo = this folder with MIT license

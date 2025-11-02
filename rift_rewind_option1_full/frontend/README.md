# Rift Rewind Frontend (Option 1 setup)

This is the React + Vite frontend.

## Setup
1. Install deps
   ```bash
   npm install
   # or pnpm install / yarn install
   ```

2. Copy `.env.example` to `.env.local` and set:
   ```bash
   VITE_LAMBDA_URL=https://<your-lambda-id>.lambda-url.<region>.on.aws
   ```

3. Run dev
   ```bash
   npm run dev
   ```

4. Open http://localhost:5173

## What it does
- Renders your original UI (`src/App.tsx` etc).
- Shows a "Backend / Bedrock live demo" block at the bottom.
- That block calls your single Lambda Function URL with:
  - `action=getRecap`
  - `action=summarize`
and displays:
  - stats from Riot data
  - coaching summary from Bedrock


# Rift Rewind Monorepo (Combined)
This repo includes a clean frontend/backend/infra skeleton plus all uploaded projects under `legacy/` unmodified.

## Structure
- `frontend/` — Vite React shell wired for /api.
- `backend/` — Lambda handlers with stubbed responses.
- `infra/` — CDK scaffold (placeholder).
- `schema/` — OpenAPI contract.
- `legacy/` — Your original ZIPs extracted for reference.

## Quick start (frontend)
```
cd frontend
npm i
npm run dev
```
Set `VITE_API_BASE` after deploying the backend.


## Use your original projects
All uploaded zips are extracted into `apps/` (identical to your originals).
Pick which one to use for the **frontend** and **backend**:
```
python3 select.py --list
python3 select.py --frontend <folder_name> --backend <folder_name>
```
This copies them into `workspace/frontend` and `workspace/backend` for you to run and modify without touching the originals.

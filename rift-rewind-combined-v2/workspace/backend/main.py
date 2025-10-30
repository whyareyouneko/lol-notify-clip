import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()
RIOT_API_KEY = os.getenv("RIOT_API_KEY")

import Rito
import rules

app = FastAPI(title="Rift Rewind API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_methods=["*"], allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"ok": True}

def compute_summary(puuid: str):
    fn = getattr(Rito, "get_summary", None)
    if callable(fn):
        return fn(puuid, api_key=RIOT_API_KEY)
    # fallback so the UI can render
    return {"puuid": puuid, "cards":[{"id":"demo","title":"Demo Summary","one_liner":"wire works","why_it_matters":"frontend ↔ backend connected","evidence":[],"actions":[],"share_text":"ok","badge":"glowup"}]}

@app.get("/summary/{puuid}")
def summary(puuid: str):
    try:
        return compute_summary(puuid)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

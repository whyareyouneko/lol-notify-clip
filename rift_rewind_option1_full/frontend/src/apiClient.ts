const API_BASE = import.meta.env.VITE_LAMBDA_URL || "";

async function callAPI(payloadOrParams: any, method: "GET" | "POST" = "GET") {
  if (!API_BASE) {
    throw new Error("VITE_LAMBDA_URL not set. Create .env.local and define it.");
  }

  if (method === "GET") {
    const qs = new URLSearchParams(payloadOrParams).toString();
    const res = await fetch(`${API_BASE}/?${qs}`);
    if (!res.ok) throw new Error("API " + res.status);
    return res.json();
  } else {
    const res = await fetch(API_BASE + "/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadOrParams),
    });
    if (!res.ok) throw new Error("API " + res.status);
    return res.json();
  }
}

// identifier = summoner name OR PUUID
export async function apiGetRecap(identifier: string) {
  return callAPI({ action: "getRecap", summonerName: identifier }, "GET");
}

export async function apiSummarize(identifier: string) {
  return callAPI({ action: "summarize", summonerName: identifier }, "POST");
}

const API_BASE = import.meta.env.VITE_LAMBDA_URL || "";

if (!API_BASE) {
  console.warn("VITE_LAMBDA_URL is not set. Backend calls will fail.");
}

async function callAPI(
  params: Record<string, string>,
  method: "GET" | "POST" = "GET"
) {
  if (!API_BASE) throw new Error("VITE_LAMBDA_URL is not configured");

  const qs = new URLSearchParams(params).toString();
  const url = method === "GET" ? `${API_BASE}?${qs}` : API_BASE;

  const res = await fetch(url, {
    method,
    headers:
      method === "POST"
        ? { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" }
        : undefined,
    body: method === "POST" ? qs : undefined,
  });

  if (!res.ok) throw new Error("API " + res.status);
  return res.json();
}

// ===== Types =====
export type RecapOverview = {
  games_analyzed: number;
  wins: number;
  winrate: number;
  avg_kills: number;
  avg_deaths: number;
  avg_assists: number;
  kda: number;
  cs_per_min: number;
  favorite_champion: string;
};

export type RecentGame = {
  match_id: string;
  timestamp: number;
  queue_id: number;
  game_mode: string;
  game_duration: number;
  champion: string;
  role: string;
  kills: number;
  deaths: number;
  assists: number;
  kda: number;
  cs: number;
  cs_per_min: number;
  gold: number;
  win: boolean;
};

export type RecapResponse = {
  player_overview: RecapOverview;
  recent_games: RecentGame[];
};

export type SummarizeResponse = { summary: string };

// compare-lineup payload+response
export type LineupPlayer = {
  side: "BLUE" | "RED";
  role: string;       // Top/Jungle/Mid/ADC/Support
  champ: string;      // champion name
  k?: number; d?: number; a?: number;
  cs?: number; gold?: number;
  win?: boolean;
};

export type ComparePayload = {
  queue_id: number;
  duration_s: number;
  teams: LineupPlayer[];   // 10 entries
};

export type CompareResponse = {
  found: boolean;
  match_id?: string;
  distance?: number;       // 0.0 exact, >0 fuzzy
  summary?: string;        // Bedrock agent text
};

// ===== Calls =====
export async function apiGetRecap(
  gameName: string,
  tagLine: string,
  routingRegion: string,
  matchCount?: number
): Promise<RecapResponse> {
  const params: Record<string, string> = {
    action: "getRecap",
    gameName,
    tagLine,
    routingRegion,
  };
  if (matchCount) params.matchCount = String(matchCount);
  return callAPI(params);
}

export async function apiSummarize(
  gameName: string,
  tagLine: string,
  routingRegion: string,
  lane: string,
  matchCount?: number
): Promise<SummarizeResponse> {
  const params: Record<string, string> = {
    action: "summarize",
    gameName,
    tagLine,
    routingRegion,
    lane,
  };
  if (matchCount) params.matchCount = String(matchCount);
  return callAPI(params);
}

export async function apiCompareLineup(payload: ComparePayload): Promise<CompareResponse> {
  // POST to same Lambda with action=compareLineup and x-www-form-urlencoded body
  const params: Record<string, string> = {
    action: "compareLineup",
    payload: JSON.stringify(payload),
  };
  return callAPI(params, "POST");
}

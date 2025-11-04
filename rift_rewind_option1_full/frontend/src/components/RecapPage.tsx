import { useState } from "react";
import { apiGetRecap } from "../apiClient";

const REGION_OPTIONS = [
  { id: "na", label: "NA", routingRegion: "americas" },
  { id: "euw", label: "EUW", routingRegion: "europe" },
  { id: "eune", label: "EUNE", routingRegion: "europe" },
  { id: "kr", label: "KR", routingRegion: "asia" },
  { id: "br", label: "BR", routingRegion: "americas" },
  { id: "lan", label: "LAN", routingRegion: "americas" },
  { id: "las", label: "LAS", routingRegion: "americas" },
  { id: "oce", label: "OCE", routingRegion: "sea" },
  { id: "jp", label: "JP", routingRegion: "asia" },
];

type RecentGame = {
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

function formatDate(ts: number) {
  if (!ts) return "-";
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatTime(ts: number) {
  if (!ts) return "-";
  const d = new Date(ts);
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function formatDuration(seconds: number) {
  if (!seconds) return "-";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function RecapPage() {
  const [riotId, setRiotId] = useState("");
  const [regionId, setRegionId] = useState("na");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<any | null>(null);
  const [games, setGames] = useState<RecentGame[]>([]);

  async function handleLoadRecap() {
    setError(null);
    setOverview(null);
    setGames([]);

    const trimmed = riotId.trim();
    if (!trimmed || !trimmed.includes("#")) {
      setError("Enter Riot ID as GameName#TAG.");
      return;
    }

    const [namePart, tagPart] = trimmed.split("#");
    const gameName = namePart?.trim();
    const tagLine = tagPart?.trim();

    if (!gameName || !tagLine) {
      setError("Enter Riot ID as GameName#TAG.");
      return;
    }

    const selected =
      REGION_OPTIONS.find((r) => r.id === regionId) ?? REGION_OPTIONS[0];
    const routingRegion = selected.routingRegion;

    setLoading(true);
    try {
      const recap = await apiGetRecap(gameName, tagLine, routingRegion);
      setOverview(recap.player_overview);
      setGames(recap.recent_games || []);
    } catch (e: any) {
      setError(e?.message || "Backend error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header + controls */}
      <div>
        <h1 className="text-2xl font-bold text-white">Your Season Recap</h1>
        <p className="text-white/60 text-sm max-w-xl">
          Enter your Riot ID as <span className="font-mono">GameName#TAG</span>{" "}
          and region routing. We resolve your PUUID via the Riot Account API,
          pull recent matches, and show a clean breakdown of your last games.
        </p>

        <div className="flex flex-col sm:flex-row gap-2 mt-3">
          <input
            value={riotId}
            onChange={(e) => setRiotId(e.target.value)}
            placeholder="Riot ID (GameName#TAG)"
            className="flex-1 px-3 py-2 rounded-md bg-black/40 border border-white/20 text-sm text-white"
          />
          <select
            value={regionId}
            onChange={(e) => setRegionId(e.target.value)}
            className="px-3 py-2 rounded-md bg-black/40 border border-white/20 text-sm text-white w-28"
          >
            {REGION_OPTIONS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleLoadRecap}
            disabled={loading}
            className="px-4 py-2 rounded-md bg-[#C8AA6E] text-black text-sm font-semibold disabled:opacity-60"
          >
            {loading ? "Loading…" : "Load recap"}
          </button>
        </div>

        {error && (
          <div className="mt-3 text-sm text-red-300 bg-red-900/30 border border-red-500/40 rounded px-3 py-2">
            {error}
          </div>
        )}
      </div>

      {/* Season snapshot cards */}
      {overview && (
        <div className="grid sm:grid-cols-4 gap-4">
          <StatCard
            label="Games analyzed"
            value={overview.games_analyzed}
          />
          <StatCard label="Winrate" value={`${overview.winrate}%`} />
          <StatCard
            label="Avg K / D / A"
            value={`${overview.avg_kills} / ${overview.avg_deaths} / ${overview.avg_assists}`}
          />
          <StatCard
            label="Favorite champ"
            value={overview.favorite_champion}
          />
          <StatCard label="KDA" value={overview.kda} />
          <StatCard label="CS / min" value={overview.cs_per_min} />
        </div>
      )}

      {/* Recent games table */}
      {games.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-white">
              Last {games.length} games
            </h2>
            <span className="text-xs text-white/50">
              Green = wins, Red = losses
            </span>
          </div>
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/30 backdrop-blur">
            <table className="min-w-full text-xs text-left text-white/80">
              <thead className="bg-white/5 text-[11px] uppercase tracking-wide text-white/60">
                <tr>
                  <th className="px-3 py-2">Result</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Time</th>
                  <th className="px-3 py-2">Mode</th>
                  <th className="px-3 py-2">Champion</th>
                  <th className="px-3 py-2">Role</th>
                  <th className="px-3 py-2">K / D / A</th>
                  <th className="px-3 py-2">KDA</th>
                  <th className="px-3 py-2">CS</th>
                  <th className="px-3 py-2">CS / min</th>
                  <th className="px-3 py-2">Gold</th>
                  <th className="px-3 py-2">Length</th>
                </tr>
              </thead>
              <tbody>
                {games.map((g) => (
                  <tr
                    key={g.match_id}
                    className={`border-t border-white/5 ${
                      g.win ? "bg-emerald-500/5" : "bg-red-500/5"
                    } hover:bg-white/10 transition-colors`}
                  >
                    <td className="px-3 py-2 font-semibold">
                      <span
                        className={`px-2 py-1 rounded-full text-[11px] ${
                          g.win
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {g.win ? "Win" : "Loss"}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {formatDate(g.timestamp)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {formatTime(g.timestamp)}
                    </td>
                    <td className="px-3 py-2">{g.game_mode}</td>
                    <td className="px-3 py-2 font-semibold">
                      {g.champion}
                    </td>
                    <td className="px-3 py-2">{g.role || "-"}</td>
                    <td className="px-3 py-2">
                      {g.kills} / {g.deaths} / {g.assists}
                    </td>
                    <td className="px-3 py-2">{g.kda}</td>
                    <td className="px-3 py-2">{g.cs}</td>
                    <td className="px-3 py-2">{g.cs_per_min}</td>
                    <td className="px-3 py-2">
                      {g.gold.toLocaleString()}
                    </td>
                    <td className="px-3 py-2">
                      {formatDuration(g.game_duration)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: string | number;
};

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-xl bg-black/40 border border-white/10 px-4 py-3">
      <div className="text-[11px] uppercase tracking-wide text-white/50">
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold text-white">{value}</div>
    </div>
  );
}

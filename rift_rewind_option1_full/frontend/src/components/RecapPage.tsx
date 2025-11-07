import { useMemo, useState } from "react";
import { apiGetRecap, apiSummarize, apiCompareLineup } from "../apiClient";
import LineupCompareCard from "../components/LineupCompareCard";

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

const LANE_OPTIONS = [
  { id: "Top", label: "Top" },
  { id: "Jungle", label: "Jungle" },
  { id: "Mid", label: "Mid" },
  { id: "ADC", label: "ADC" },
  { id: "Support", label: "Support" },
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

type SelectionOverview = {
  games: number;
  wins: number;
  winrate: number;
  avg_kills: number;
  avg_deaths: number;
  avg_assists: number;
  kda: number;
  cs_per_min: number;
  favorite_champion: string;
};

function buildSelectionOverview(games: RecentGame[]): SelectionOverview | null {
  if (!games.length) return null;

  const gamesCount = games.length;
  let wins = 0;
  let kills = 0;
  let deaths = 0;
  let assists = 0;
  let csTotal = 0;
  let minutes = 0;
  const champs: Record<string, number> = {};

  for (const g of games) {
    if (g.win) wins += 1;
    kills += g.kills;
    deaths += g.deaths;
    assists += g.assists;
    csTotal += g.cs;
    minutes += g.game_duration > 0 ? g.game_duration / 60 : 0;

    const c = g.champion || "Unknown";
    champs[c] = (champs[c] || 0) + 1;
  }

  const winrate = (wins * 100) / gamesCount;
  const avgKills = kills / gamesCount;
  const avgDeaths = deaths / gamesCount;
  const avgAssists = assists / gamesCount;
  const kda = deaths > 0 ? (kills + assists) / deaths : kills + assists;
  const csPerMin = minutes > 0 ? csTotal / minutes : 0;

  let favorite = "Unknown";
  const entries = Object.entries(champs);
  if (entries.length) {
    favorite = entries.sort((a, b) => b[1] - a[1])[0][0];
  }

  return {
    games: gamesCount,
    wins,
    winrate: Number(winrate.toFixed(1)),
    avg_kills: Number(avgKills.toFixed(1)),
    avg_deaths: Number(avgDeaths.toFixed(1)),
    avg_assists: Number(avgAssists.toFixed(1)),
    kda: Number(kda.toFixed(2)),
    cs_per_min: Number(csPerMin.toFixed(2)),
    favorite_champion: favorite,
  };
}

export function RecapPage() {
  const [riotId, setRiotId] = useState("");
  const [regionId, setRegionId] = useState("na");
  const [laneId, setLaneId] = useState("Mid");
  const [matchCount, setMatchCount] = useState(10);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<any | null>(null);
  const [games, setGames] = useState<RecentGame[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [coachError, setCoachError] = useState<string | null>(null);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const selectedGames = useMemo(
    () => games.filter((g) => selectedIds.includes(g.match_id)),
    [games, selectedIds]
  );

  const selectionOverview = useMemo(
    () => buildSelectionOverview(selectedGames.length ? selectedGames : games),
    [selectedGames, games]
  );

  async function handleLoadRecap() {
    setError(null);
    setCoachError(null);
    setOverview(null);
    setGames([]);
    setSummary(null);
    setSelectedIds([]);

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

    const selectedRegion =
      REGION_OPTIONS.find((r) => r.id === regionId) ?? REGION_OPTIONS[0];
    const routingRegion = selectedRegion.routingRegion;

    const effectiveCount = Math.min(Math.max(matchCount || 10, 1), 10); // frontend cap 1–10

    setLoading(true);
    try {
      const recap = await apiGetRecap(
        gameName,
        tagLine,
        routingRegion,
        effectiveCount
      );
      const loadedGames: RecentGame[] = recap.recent_games || [];
      setOverview(recap.player_overview);
      setGames(loadedGames);
      setSelectedIds(loadedGames.map((g) => g.match_id));

      try {
        const coach = await apiSummarize(
          gameName,
          tagLine,
          routingRegion,
          laneId,
          effectiveCount
        );
        setSummary(coach.summary);
      } catch (e: any) {
        setCoachError("Coaching summary unavailable (AI backend error).");
      }
    } catch (e: any) {
      setError(e?.message || "Backend error");
    } finally {
      setLoading(false);
    }
  }

  function toggleSelect(matchId: string) {
    setSelectedIds((prev) =>
      prev.includes(matchId)
        ? prev.filter((id) => id !== matchId)
        : [...prev, matchId]
    );
  }

  function selectAll() {
    setSelectedIds(games.map((g) => g.match_id));
  }

  function clearSelection() {
    setSelectedIds([]);
  }

  // Demo builder: constructs a 10-player lineup from the loaded games and asks backend to find a same-lineup match in the 1Y dataset.
  async function runCompareLineupDemo() {
    if (!games.length) {
      setCoachError("Load games first.");
      return;
    }
    // Use first 10 rows to form two teams. Roles default to game.role if present, else MID.
    const mk = (g: RecentGame, side: "BLUE" | "RED") => ({
      side,
      role: g.role || "Mid",
      champ: g.champion,
      k: g.kills,
      d: g.deaths,
      a: g.assists,
      cs: g.cs,
      gold: g.gold,
      win: g.win,
    });

    const blue = games.slice(0, 5).map((g) => mk(g, "BLUE"));
    const red = games.slice(5, 10).map((g) => mk(g, "RED"));

    const current = {
      queue_id: games[0]?.queue_id ?? 420,
      duration_s: games[0]?.game_duration ?? 1800,
      teams: [...blue, ...red],
    };

    try {
      const res = await apiCompareLineup(current);
      if (res?.found && res?.summary) {
        setSummary(res.summary);
      } else if (res?.found === false) {
        setSummary("No exact lineup match found in the 1Y dataset.");
      } else {
        setSummary("Compare lineup returned no text.");
      }
    } catch (e: any) {
      setSummary("Compare lineup failed.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header + controls */}
      <div>
        <h1 className="text-2xl font-bold text-white">Your Season Recap</h1>
        <p className="text-white/60 text-sm max-w-xl">
          Enter your Riot ID as <span className="font-mono">GameName#TAG</span>, pick
          region and lane, and choose how many recent games to analyze. We hit
          the Riot Account + Match APIs then layer on lane-specific AI coaching.
          Match selection below lets you focus on the specific games you care
          about (without extra Riot calls).
        </p>

        <div className="flex flex-col lg:flex-row gap-2 mt-3 items-stretch">
          <input
            value={riotId}
            onChange={(e) => setRiotId(e.target.value)}
            placeholder="Riot ID (GameName#TAG)"
            className="flex-1 px-3 py-2 rounded-md bg-black/40 border border-white/20 text-sm text-white"
          />

          <select
            value={regionId}
            onChange={(e) => setRegionId(e.target.value)}
            className="px-3 py-2 rounded-md bg-black/40 border border-white/20 text-sm text-white w-24"
          >
            {REGION_OPTIONS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>

          <select
            value={laneId}
            onChange={(e) => setLaneId(e.target.value)}
            className="px-3 py-2 rounded-md bg-black/40 border border-white/20 text-sm text-white w-28"
          >
            {LANE_OPTIONS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>

          {/* Games to analyze */}
          <div className="flex flex-col justify-center bg-black/30 border border-white/20 rounded-md px-3 py-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-white/60 whitespace-nowrap">
                Games (1–10)
              </span>
              <input
                type="number"
                min={1}
                max={10}
                step={1}
                value={matchCount}
                onChange={(e) =>
                  setMatchCount(Number(e.target.value) || 10)
                }
                className="w-16 bg-transparent border border-white/20 rounded px-1 py-0.5 text-xs text-white text-center"
              />
            </div>
            <span className="text-[10px] text-white/35">
              Dev key limit: backend hard-caps to 10 to avoid 429s.
            </span>
          </div>

          <button
            onClick={handleLoadRecap}
            disabled={loading}
            className="px-4 py-2 rounded-md bg-[#C8AA6E] text-black text-sm font-semibold disabled:opacity-60"
          >
            {loading ? "Loading…" : "Load recap"}
          </button>

          <button
            onClick={runCompareLineupDemo}
            disabled={!games.length}
            className="px-4 py-2 rounded-md bg-white/10 border border-white/20 text-white text-sm font-semibold disabled:opacity-50"
            title="Compare current lineup against identical lineups in the 1-year dataset"
          >
            Compare lineup
          </button>
        </div>

        {error && (
          <div className="mt-3 text-sm text-red-300 bg-red-900/30 border border-red-500/40 rounded px-3 py-2">
            {error}
          </div>
        )}
      </div>

      {/* Season snapshot cards + AI coaching */}
      {overview && (
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Backend overview (last N games from Riot) */}
          <div className="lg:col-span-2 grid sm:grid-cols-3 gap-4">
            <StatCard
              label={`Backend window (last ${overview.games_analyzed} games)`}
              value={`${overview.winrate}% WR`}
              sub={`${overview.avg_kills}/${overview.avg_deaths}/${overview.avg_assists} • KDA ${overview.kda} • ${overview.cs_per_min} CS/min • Fav: ${overview.favorite_champion}`}
            />
            {/* Selection snapshot */}
            {selectionOverview && (
              <>
                <StatCard
                  label={`Selection (${selectionOverview.games} games)`}
                  value={`${selectionOverview.winrate}% WR`}
                  sub={`${selectionOverview.wins} wins • Fav: ${selectionOverview.favorite_champion}`}
                />
                <StatCard
                  label="Selection K/D/A"
                  value={`${selectionOverview.avg_kills}/${selectionOverview.avg_deaths}/${selectionOverview.avg_assists}`}
                  sub={`KDA ${selectionOverview.kda} • ${selectionOverview.cs_per_min} CS/min`}
                />
              </>
            )}
          </div>

          <div className="rounded-xl bg-black/40 border border-white/10 px-4 py-3 flex flex-col">
            <div className="text-[11px] uppercase tracking-wide text-white/50">
              Lane-specific coaching ({laneId})
            </div>
            <div className="mt-2 text-xs text-white/90 whitespace-pre-wrap max-h-48 overflow-y-auto">
              {summary
                ? summary
                : coachError ||
                  "AI coaching summary is based on the backend window of recent games."}
            </div>
          </div>
        </div>
      )}

      {/* Recent games table with selection controls */}
      {games.length > 0 && (
        <div className="mt-4">
          <div className="flex flex-wrap items-center justify-between mb-2 gap-2">
            <h2 className="text-lg font-semibold text-white">
              Last {games.length} games
            </h2>
            <div className="flex items-center gap-3 text-xs text-white/60">
              <span>Green = wins, Red = losses</span>
              <span>
                Selected{" "}
                <span className="font-semibold text-white">
                  {selectedIds.length || games.length}
                </span>{" "}
                game(s) for the selection snapshot.
              </span>
              <button
                type="button"
                onClick={selectAll}
                className="px-2 py-1 rounded border border-white/20 hover:bg-white/10"
              >
                Select all
              </button>
              <button
                type="button"
                onClick={clearSelection}
                className="px-2 py-1 rounded border border-white/20 hover:bg-white/10"
              >
                Clear
              </button>
            </div>
          </div>
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/30 backdrop-blur">
            <table className="min-w-full text-xs text-left text-white/80">
              <thead className="bg-white/5 text-[11px] uppercase tracking-wide text-white/60">
                <tr>
                  <th className="px-3 py-2">
                    <span className="sr-only">Select</span>
                  </th>
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
                {games.map((g) => {
                  const checked =
                    selectedIds.length === 0 ||
                    selectedIds.includes(g.match_id);
                  return (
                    <tr
                      key={g.match_id}
                      className={`border-t border-white/5 ${
                        g.win ? "bg-emerald-500/5" : "bg-red-500/5"
                      } hover:bg-white/10 transition-colors`}
                    >
                      <td className="px-3 py-2 align-middle">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleSelect(g.match_id)}
                          className="accent-[#C8AA6E]"
                        />
                      </td>
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
                      <td className="px-3 py-2 font-semibold">{g.champion}</td>
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
                  );
                })}
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
  sub?: string;
};

function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="rounded-xl bg-black/40 border border-white/10 px-4 py-3">
      <div className="text-[11px] uppercase tracking-wide text-white/50">
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold text-white">{value}</div>
      {sub && (
        <div className="mt-0.5 text-[11px] text-white/60 leading-snug">
          {sub}
        </div>
      )}
    </div>
  );
  
}

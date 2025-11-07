import { useState } from "react";
import { apiCompareLineup, ComparePayload, CompareResponse } from "../apiClient";

const ROLES = ["Top","Jungle","Mid","ADC","Support"] as const;
const SIDES = ["BLUE","RED"] as const;

export default function LineupCompareCard() {
  const [queueId, setQueueId] = useState(420);
  const [duration, setDuration] = useState(1800);
  const [teams, setTeams] = useState(() =>
    SIDES.flatMap((side) =>
      ROLES.map((role) => ({ side, role, champ: "" }))
    )
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompareResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function updateChamp(idx: number, value: string) {
    setTeams((prev) => prev.map((t, i) => (i === idx ? { ...t, champ: value } : t)));
  }

  async function onCompare() {
    setErr(null);
    setResult(null);
    if (teams.some((t) => !t.champ.trim())) {
      setErr("Fill all 10 champions.");
      return;
    }
    const payload: ComparePayload = { queue_id: queueId, duration_s: duration, teams };
    setLoading(true);
    try {
      const r = await apiCompareLineup(payload);
      setResult(r);
    } catch (e: any) {
      setErr(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl bg-black/40 border border-white/10 p-4 space-y-3 text-white">
      <div className="text-sm font-semibold">Compare to 1-year dataset</div>

      <div className="flex flex-wrap gap-3 text-xs">
        <label className="flex items-center gap-2">
          Queue:
          <input
            className="bg-black/30 border border-white/20 rounded px-2 py-1 w-24"
            type="number"
            value={queueId}
            onChange={(e) => setQueueId(Number(e.target.value) || 0)}
          />
        </label>
        <label className="flex items-center gap-2">
          Duration (s):
          <input
            className="bg-black/30 border border-white/20 rounded px-2 py-1 w-28"
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value) || 0)}
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {SIDES.map((side) => (
          <div key={side} className="border border-white/10 rounded-lg p-3">
            <div className="text-[11px] uppercase tracking-wide text-white/60 mb-2">
              {side}
            </div>
            <div className="space-y-2">
              {ROLES.map((role, rIdx) => {
                const idx = side === "BLUE" ? rIdx : 5 + rIdx;
                return (
                  <div key={role} className="flex items-center gap-2 text-xs">
                    <div className="w-16 text-white/70">{role}</div>
                    <input
                      placeholder="Champion"
                      className="flex-1 bg-black/30 border border-white/20 rounded px-2 py-1"
                      value={teams[idx].champ}
                      onChange={(e) => updateChamp(idx, e.target.value)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onCompare}
        disabled={loading}
        className="px-3 py-2 rounded-md bg-[#C8AA6E] text-black text-sm font-semibold disabled:opacity-60"
      >
        {loading ? "Comparing…" : "Compare lineup"}
      </button>

      {err && (
        <div className="text-xs text-red-300 bg-red-900/30 border border-red-500/40 rounded px-3 py-2">
          {err}
        </div>
      )}

      {result && (
        <div className="text-xs bg-black/30 border border-white/10 rounded p-3">
          {result.found ? (
            <>
              {result.match_id && (
                <div className="mb-1">
                  <span className="text-white/60">Exact match:</span>{" "}
                  <span className="font-mono">{result.match_id}</span>
                </div>
              )}
              {typeof result.distance === "number" && result.distance > 0 && (
                <div className="mb-1 text-white/80">
                  Closest historical comps (semantic):
                </div>
              )}
              {result.alternatives?.length ? (
                <ul className="list-disc pl-5 space-y-1">
                  {result.alternatives.map((a, i) => (
                    <li key={i}>
                      <span className="font-mono">{a.id}</span>
                      {typeof a.score === "number" && (
                        <span className="text-white/50"> · score {a.score.toFixed(3)}</span>
                      )}
                      {a.snippet && <div className="text-white/70">{a.snippet}</div>}
                    </li>
                  ))}
                </ul>
              ) : null}
              {result.summary && (
                <div className="mt-2 whitespace-pre-wrap">{result.summary}</div>
              )}
            </>
          ) : (
            <div>No similar lineup found in the index.</div>
          )}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { apiGetRecap, apiSummarize } from "./apiClient";

type BackendDemoPanelProps = {
  gameName: string;
  tagLine: string;
  routingRegion: string;
};

export function BackendDemoPanel({
  gameName,
  tagLine,
  routingRegion,
}: BackendDemoPanelProps) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [recap, setRecap] = useState<any | null>(null);
  const [coach, setCoach] = useState<any | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setErr(null);
      setRecap(null);
      setCoach(null);

      try {
        // Riot stats
        const r = await apiGetRecap(gameName, tagLine, routingRegion);

        // Lane-specific AI summary (hard-code lane for this debug panel)
        const s = await apiSummarize(
          gameName,
          tagLine,
          routingRegion,
          "Mid" // default lane for backend demo
        );

        if (cancelled) return;
        setRecap(r);
        setCoach(s);
      } catch (e: any) {
        if (cancelled) return;
        setErr(String(e?.message || e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [gameName, tagLine, routingRegion]);

  return (
    <div className="rounded-xl border border-white/10 bg-black/50 p-4 text-xs text-white/80 space-y-3">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-sm text-white">
          Backend demo panel
        </div>
        <div className="text-[11px] text-white/50">
          gameName: <span className="font-mono">{gameName}</span> · tag:{" "}
          <span className="font-mono">{tagLine}</span> · region:{" "}
          <span className="font-mono">{routingRegion}</span>
        </div>
      </div>

      {loading && (
        <div className="text-[11px] text-white/60">Loading from Lambda…</div>
      )}

      {err && (
        <div className="text-[11px] text-red-300 bg-red-900/30 border border-red-500/40 rounded px-2 py-1">
          Error: {err}
        </div>
      )}

      {recap && (
        <div>
          <div className="text-[11px] uppercase tracking-wide text-white/50 mb-1">
            Recap payload
          </div>
          <pre className="max-h-40 overflow-y-auto bg-black/40 rounded p-2">
            {JSON.stringify(recap, null, 2)}
          </pre>
        </div>
      )}

      {coach && (
        <div>
          <div className="text-[11px] uppercase tracking-wide text-white/50 mb-1">
            Coaching payload
          </div>
          <pre className="max-h-40 overflow-y-auto bg-black/40 rounded p-2">
            {JSON.stringify(coach, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

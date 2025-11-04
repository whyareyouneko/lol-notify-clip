import { useEffect, useState } from "react";
import { apiGetRecap, apiSummarize } from "./apiClient";

interface BackendDemoPanelProps {
  gameName: string;
  tagLine: string;
  routingRegion: string;
}

export function BackendDemoPanel({
  gameName,
  tagLine,
  routingRegion,
}: BackendDemoPanelProps) {
  const [recap, setRecap] = useState<any>(null);
  const [coach, setCoach] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setErr(null);
      setRecap(null);
      setCoach(null);

      try {
        const r = await apiGetRecap(gameName, tagLine, routingRegion);
        const s = await apiSummarize(gameName, tagLine, routingRegion);
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

  if (loading) {
    return (
      <div className="p-4 rounded-xl border border-white/20 bg-white/5 text-sm text-white/70">
        Loading recap from Riot + AWS…
      </div>
    );
  }

  if (err) {
    return (
      <div className="p-4 rounded-xl border border-red-500/40 bg-red-500/10 text-sm text-red-200">
        Backend error: {err}
      </div>
    );
  }

  if (!recap || !coach) return null;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <div className="text-lg font-semibold text-white mb-2">
          Season snapshot
        </div>
        <pre className="text-[11px] text-white/80 bg-black/40 p-2 rounded max-h-48 overflow-y-auto">
          {JSON.stringify(recap.player_overview, null, 2)}
        </pre>
        <div className="text-xs text-[#0AC8B9] mt-2 font-medium">
          Hidden gem: {recap.hidden_gem}
        </div>
      </div>
      <div>
        <div className="text-lg font-semibold text-white mb-2">
          Coach Summary (Bedrock)
        </div>
        <div className="text-xs whitespace-pre-wrap text-white/90 bg-black/40 p-2 rounded max-h-48 overflow-y-auto">
          {coach.summary}
        </div>
      </div>
    </div>
  );
}

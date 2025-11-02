import { useEffect, useState } from "react";
import { apiGetRecap, apiSummarize } from "./apiClient";

export function BackendDemoPanel({ puuid }: { puuid: string }) {
  const [recap, setRecap] = useState<any>(null);
  const [coach, setCoach] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await apiGetRecap(puuid);
        setRecap(r);
        const s = await apiSummarize(puuid);
        setCoach(s);
      } catch (e: any) {
        setErr(String(e));
      }
    })();
  }, [puuid]);

  if (err) return <div className='text-red-500'>Error: {err}</div>;
  if (!recap || !coach) return <div className='text-white/60'>Loading…</div>;

  return (
    <div className='p-4 rounded-xl border border-white/20 bg-white/5 text-sm space-y-4'>
      <div>
        <div className='text-lg font-semibold text-white mb-2'>Season Snapshot</div>
        <pre className='text-xs bg-black/40 p-2 rounded text-white/90 overflow-x-auto max-h-48'>
          {JSON.stringify(recap.player_overview, null, 2)}
        </pre>
        <div className='text-xs text-[#0AC8B9] mt-2 font-medium'>
          Hidden gem: {recap.hidden_gem}
        </div>
      </div>
      <div>
        <div className='text-lg font-semibold text-white mb-2'>Coach Summary (Bedrock)</div>
        <div className='text-xs whitespace-pre-wrap text-white/90 bg-black/40 p-2 rounded max-h-48 overflow-y-auto'>
          {coach.summary}
        </div>
      </div>
    </div>
  );
}

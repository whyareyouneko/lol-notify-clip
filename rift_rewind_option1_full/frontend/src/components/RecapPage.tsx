import { useState } from "react";
import { BackendDemoPanel } from "../BackendDemoPanel";

export function RecapPage() {
  const [input, setInput] = useState("");
  const [identifier, setIdentifier] = useState<string | null>(null);

  function loadPlayer() {
    const trimmed = input.trim();
    if (!trimmed) return;
    setIdentifier(trimmed);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Your Season Recap</h1>
        <p className="text-white/60 text-sm max-w-xl">
          Enter a summoner name or PUUID. We pull your recent match history using
          our backend Lambda and then call Amazon Bedrock to generate a coaching
          summary.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 mt-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Summoner name or PUUID"
            className="flex-1 px-3 py-2 rounded-md bg-black/40 border border-white/20 text-sm text-white"
          />
          <button
            onClick={loadPlayer}
            className="px-4 py-2 rounded-md bg-[#C8AA6E] text-black text-sm font-semibold"
          >
            Load recap
          </button>
        </div>
      </div>

      {identifier && <BackendDemoPanel identifier={identifier} />}
    </div>
  );
}

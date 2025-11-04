import { useState } from "react";
import { BackendDemoPanel } from "../BackendDemoPanel";

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

export function RecapPage() {
  const [input, setInput] = useState("");
  const [regionId, setRegionId] = useState("na");

  const [gameName, setGameName] = useState<string | null>(null);
  const [tagLine, setTagLine] = useState<string | null>(null);
  const [routingRegion, setRoutingRegion] = useState<string>("americas");

  function loadPlayer() {
    const trimmed = input.trim();
    if (!trimmed) return;

    if (!trimmed.includes("#")) {
      alert("Use Riot ID format: GameName#TAG");
      return;
    }

    const [namePart, tagPart] = trimmed.split("#");
    const name = namePart.trim();
    const tag = tagPart.trim();

    if (!name || !tag) {
      alert("Invalid Riot ID. Use format: GameName#TAG");
      return;
    }

    const selected =
      REGION_OPTIONS.find((r) => r.id === regionId) ?? REGION_OPTIONS[0];

    setGameName(name);
    setTagLine(tag);
    setRoutingRegion(selected.routingRegion);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Your Season Recap</h1>
        <p className="text-white/60 text-sm max-w-xl">
          Enter your Riot ID as <span className="font-mono">GameName#TAG</span>{" "}
          and pick a region routing. We resolve your PUUID via the Riot Account
          API, pull recent matches, and then use Amazon Bedrock to generate an
          honest season recap.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 mt-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
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
            onClick={loadPlayer}
            className="px-4 py-2 rounded-md bg-[#C8AA6E] text-black text-sm font-semibold"
          >
            Load recap
          </button>
        </div>
      </div>

      {gameName && tagLine && (
        <BackendDemoPanel
          gameName={gameName}
          tagLine={tagLine}
          routingRegion={routingRegion}
        />
      )}
    </div>
  );
}

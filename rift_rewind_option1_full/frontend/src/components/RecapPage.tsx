import { BackendDemoPanel } from "../BackendDemoPanel";

export function RecapPage() {
  // later you’ll pass the real player's puuid, or pull it from state
  const demoPuuid = "demo-puuid-here";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Your Season Recap</h1>
        <p className="text-white/60 text-sm max-w-xl">
          This page pulls your recent match history using our backend Lambda,
          and then calls Amazon Bedrock to generate a personalized coaching summary.
        </p>
      </div>

      <BackendDemoPanel puuid={demoPuuid} />
    </div>
  );
}

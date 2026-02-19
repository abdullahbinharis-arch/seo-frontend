"use client";

import { AgentRunner } from "@/components/AgentRunner";
import { useDashboard } from "@/components/DashboardContext";
import { RankTrackerSection } from "@/components/AuditResults";
import type { RankTrackerAgent } from "@/types";

export default function RankTrackerPage() {
  const { agentCache, setAgentResult } = useDashboard();
  const cached = agentCache.rank_tracker as RankTrackerAgent | undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">Local Rank Tracker</h1>
        <p className="text-sm text-zinc-400 mt-1">Current organic rank, map pack position, positions to page 1, and top 10 SERP snapshot.</p>
      </div>
      <AgentRunner<RankTrackerAgent>
        endpoint="/agents/rank-tracker"
        fields={["keyword", "url", "location"]}
        runLabel="Check Rankings"
        progressMessage="Checking Google rankings and map pack position…"
        cachedResult={cached}
        onResult={(data) => setAgentResult("rank_tracker", data)}
        renderResult={(data) => <RankTrackerSection data={data} />}
      />
    </div>
  );
}

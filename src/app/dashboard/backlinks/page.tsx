"use client";

import { AgentRunner } from "@/components/AgentRunner";
import { useDashboard } from "@/components/DashboardContext";
import { BacklinkSection } from "@/components/AuditResults";
import type { BacklinkAnalysisAgent } from "@/types";

export default function BacklinksPage() {
  const { agentCache, setAgentResult } = useDashboard();
  const cached = agentCache.backlink_analysis as BacklinkAnalysisAgent | undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">Backlink Profile</h1>
        <p className="text-sm text-zinc-400 mt-1">Domain authority, page authority, linking domains, spam score, and competitor backlink comparison.</p>
      </div>
      <AgentRunner<BacklinkAnalysisAgent>
        endpoint="/agents/backlink-analysis"
        fields={["url", "keyword", "location"]}
        runLabel="Analyse Backlinks"
        progressMessage="Fetching domain authority and backlink profile…"
        cachedResult={cached}
        onResult={(data) => setAgentResult("backlink_analysis", data)}
        renderResult={(data) => <BacklinkSection data={data} />}
      />
    </div>
  );
}

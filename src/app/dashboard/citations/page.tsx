"use client";

import { AgentRunner } from "@/components/AgentRunner";
import { useDashboard } from "@/components/DashboardContext";
import { CitationBuilderSection } from "@/components/AuditResults";
import type { CitationBuilderAgent } from "@/types";

export default function CitationsPage() {
  const { agentCache, setAgentResult } = useDashboard();
  const cached = agentCache.citation_builder as CitationBuilderAgent | undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">Citation Builder</h1>
        <p className="text-sm text-zinc-400 mt-1">Tier-1 to tier-3 citation opportunities, NAP template, consistency rules, and monthly submission plan.</p>
      </div>
      <AgentRunner<CitationBuilderAgent>
        endpoint="/agents/citation-builder"
        fields={["keyword", "url", "location", "businessName", "businessType"]}
        runLabel="Build Citation Plan"
        progressMessage="Finding citation opportunities from 57 directories…"
        cachedResult={cached}
        onResult={(data) => setAgentResult("citation_builder", data)}
        renderResult={(data) => <CitationBuilderSection data={data} />}
      />
    </div>
  );
}

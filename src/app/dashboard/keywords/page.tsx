"use client";

import { AgentRunner } from "@/components/AgentRunner";
import { useDashboard } from "@/components/DashboardContext";
import { KeywordSection } from "@/components/AuditResults";
import type { KeywordResearchAgent } from "@/types";

export default function KeywordsPage() {
  const { agentCache, setAgentResult } = useDashboard();
  const cached = agentCache.keyword_research as KeywordResearchAgent | undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">Keyword Research</h1>
        <p className="text-sm text-zinc-400 mt-1">High-intent keywords, long-tail opportunities, competitor gaps, and keyword clusters.</p>
      </div>
      <AgentRunner<KeywordResearchAgent>
        endpoint="/agents/keyword-research"
        fields={["keyword", "url", "location"]}
        runLabel="Research Keywords"
        progressMessage="Analysing competitors and mapping keyword intent…"
        cachedResult={cached}
        onResult={(data) => setAgentResult("keyword_research", data)}
        renderResult={(data) => (
          <KeywordSection
            data={data.recommendations}
            competitorsAnalyzed={data.competitors_analyzed ?? 0}
          />
        )}
      />
    </div>
  );
}

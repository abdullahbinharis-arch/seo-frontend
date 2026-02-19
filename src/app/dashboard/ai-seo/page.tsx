"use client";

import { AgentRunner } from "@/components/AgentRunner";
import { useDashboard } from "@/components/DashboardContext";
import { AiSeoSection } from "@/components/AuditResults";
import type { AiSeoAgent } from "@/types";

export default function AiSeoPage() {
  const { agentCache, setAgentResult } = useDashboard();
  const cached = agentCache.ai_seo as AiSeoAgent | undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">AI Visibility Scan</h1>
        <p className="text-sm text-zinc-400 mt-1">Likelihood of being cited by ChatGPT, Perplexity, and AI search — plus schema templates and FAQ content.</p>
      </div>
      <AgentRunner<AiSeoAgent>
        endpoint="/agents/ai-seo"
        fields={["keyword", "url", "location"]}
        runLabel="Run AI Visibility Scan"
        progressMessage="Analysing schema, E-E-A-T signals, and AI mention likelihood…"
        cachedResult={cached}
        onResult={(data) => setAgentResult("ai_seo", data)}
        renderResult={(data) => <AiSeoSection data={data} />}
      />
    </div>
  );
}

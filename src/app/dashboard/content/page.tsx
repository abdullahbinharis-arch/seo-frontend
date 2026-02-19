"use client";

import { AgentRunner } from "@/components/AgentRunner";
import { useDashboard } from "@/components/DashboardContext";
import { ContentRewriterSection } from "@/components/AuditResults";
import type { ContentRewriterAgent } from "@/types";

export default function ContentPage() {
  const { agentCache, setAgentResult } = useDashboard();
  const cached = agentCache.content_rewriter as ContentRewriterAgent | undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">Content Rewriter</h1>
        <p className="text-sm text-zinc-400 mt-1">Benchmark against top competitors and get a fully rewritten, keyword-optimised page.</p>
      </div>
      <AgentRunner<ContentRewriterAgent>
        endpoint="/agents/content-rewriter"
        fields={["keyword", "url", "location", "businessName", "businessType"]}
        runLabel="Rewrite Content"
        progressMessage="Analysing top-ranking pages and rewriting your content…"
        cachedResult={cached}
        onResult={(data) => setAgentResult("content_rewriter", data)}
        renderResult={(data) => <ContentRewriterSection data={data} />}
      />
    </div>
  );
}

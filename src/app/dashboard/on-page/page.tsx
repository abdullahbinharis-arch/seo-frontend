"use client";

import { AgentRunner } from "@/components/AgentRunner";
import { useDashboard } from "@/components/DashboardContext";
import { OnPageSection } from "@/components/AuditResults";
import type { OnPageSeoAgent } from "@/types";

export default function OnPagePage() {
  const { agentCache, setAgentResult } = useDashboard();
  const cached = agentCache.on_page_seo as OnPageSeoAgent | undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">On-Page Optimizer</h1>
        <p className="text-sm text-zinc-400 mt-1">Audit title, meta, H1, content structure, internal links — and get a competitor-benchmarked action plan.</p>
      </div>
      <AgentRunner<OnPageSeoAgent>
        endpoint="/agents/on-page-seo"
        fields={["keyword", "url", "location", "businessName", "businessType"]}
        runLabel="Analyse Page"
        progressMessage="Scraping page and comparing against top-ranking competitors…"
        cachedResult={cached}
        onResult={(data) => setAgentResult("on_page_seo", data)}
        renderResult={(data) => (
          <OnPageSection data={data.recommendations} pageScraped={data.page_scraped ?? false} />
        )}
      />
    </div>
  );
}

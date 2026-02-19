"use client";

import { AgentRunner } from "@/components/AgentRunner";
import { useDashboard } from "@/components/DashboardContext";
import { TechnicalSeoSection } from "@/components/TechnicalSeoSection";
import type { TechnicalSeoAgent } from "@/types";

export default function TechnicalPage() {
  const { agentCache, setAgentResult } = useDashboard();
  const cached = agentCache.technical_seo as TechnicalSeoAgent | undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">Technical SEO</h1>
        <p className="text-sm text-zinc-400 mt-1">Core Web Vitals, HTTPS, canonical tags, schema markup, broken links, robots.txt, and site-wide crawl issues.</p>
      </div>
      <AgentRunner<TechnicalSeoAgent>
        endpoint="/agents/technical-seo"
        fields={["url", "keyword", "location"]}
        runLabel="Run Technical Audit"
        progressMessage="Fetching PageSpeed data and auditing technical signals…"
        cachedResult={cached}
        onResult={(data) => setAgentResult("technical_seo", data)}
        renderResult={(data) => <TechnicalSeoSection data={data} />}
      />
    </div>
  );
}

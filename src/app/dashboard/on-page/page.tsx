"use client";

import { AgentRunner } from "@/components/AgentRunner";
import { useDashboard } from "@/components/DashboardContext";
import { OnPageSection } from "@/components/AuditResults";
import { SiteCrawlView } from "@/components/SiteCrawlView";
import type { OnPageSeoAgent } from "@/types";

export default function OnPagePage() {
  const { agentCache, setAgentResult, lastAudit } = useDashboard();
  const cached = agentCache.on_page_seo as OnPageSeoAgent | undefined;

  const hasCrawlData = !!(lastAudit?.site_crawl?.pages?.length);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">On-Page SEO</h1>
        <p className="text-sm text-zinc-400 mt-1">
          {hasCrawlData
            ? "Full-site crawl results — per-page scores, issues, service keywords, and schema recommendations."
            : "Audit title, meta, H1, content structure, internal links — and get a competitor-benchmarked action plan."}
        </p>
      </div>

      {/* Site crawl view from audit data */}
      {hasCrawlData && <SiteCrawlView />}

      {/* Standalone agent runner (always available) */}
      <AgentRunner<OnPageSeoAgent>
        endpoint="/agents/on-page-seo"
        fields={["keyword", "url", "location", "businessName", "businessType"]}
        runLabel="Analyse Single Page"
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

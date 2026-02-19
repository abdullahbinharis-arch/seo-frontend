"use client";

import { AgentRunner } from "@/components/AgentRunner";
import { useDashboard } from "@/components/DashboardContext";
import { LinkBuildingSection } from "@/components/AuditResults";
import type { LinkBuildingAgent } from "@/types";

export default function LinkBuildingPage() {
  const { agentCache, setAgentResult } = useDashboard();
  const cached = agentCache.link_building as LinkBuildingAgent | undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">Link Building Strategy</h1>
        <p className="text-sm text-zinc-400 mt-1">Quick wins, guest posts, resource pages, local directories, competitor gaps — with outreach email templates.</p>
      </div>
      <AgentRunner<LinkBuildingAgent>
        endpoint="/agents/link-building"
        fields={["keyword", "url", "location", "businessName", "businessType"]}
        runLabel="Find Link Opportunities"
        progressMessage="Identifying opportunities and writing outreach templates…"
        cachedResult={cached}
        onResult={(data) => setAgentResult("link_building", data)}
        renderResult={(data) => <LinkBuildingSection data={data} />}
      />
    </div>
  );
}

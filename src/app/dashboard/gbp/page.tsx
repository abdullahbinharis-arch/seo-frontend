"use client";

import { AgentRunner } from "@/components/AgentRunner";
import { useDashboard } from "@/components/DashboardContext";
import { GmbToolView } from "@/components/GmbPage";
import type { GbpAuditAgent } from "@/types";

export default function GbpPage() {
  const { agentCache, setAgentResult } = useDashboard();
  const cached = agentCache.gbp_audit as GbpAuditAgent | undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">GBP Audit &amp; Optimization</h1>
        <p className="text-sm text-zinc-400 mt-1">Google Business Profile completeness audit, map pack status, review strategy, and competitor insights.</p>
      </div>
      <AgentRunner<GbpAuditAgent>
        endpoint="/agents/gbp-audit"
        fields={["keyword", "url", "location", "businessName", "businessType"]}
        runLabel="Audit GBP"
        progressMessage="Checking map pack rankings and auditing your GBP profile…"
        cachedResult={cached}
        onResult={(data) => setAgentResult("gbp_audit", data)}
        renderResult={(data) => <GmbToolView data={data} />}
      />
    </div>
  );
}

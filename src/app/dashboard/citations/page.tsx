"use client";

import { useState } from "react";
import { AgentRunner } from "@/components/AgentRunner";
import { useDashboard } from "@/components/DashboardContext";
import { CitationBuilderSection } from "@/components/AuditResults";
import type { CitationBuilderAgent } from "@/types";

const DIRECTORIES = [
  { name: "Google Business Profile", icon: "G", tier: "Tier 1" },
  { name: "Yelp", icon: "Y", tier: "Tier 1" },
  { name: "Facebook", icon: "F", tier: "Tier 1" },
  { name: "Bing Places", icon: "B", tier: "Tier 1" },
  { name: "Apple Maps", icon: "A", tier: "Tier 1" },
  { name: "BBB", icon: "BBB", tier: "Tier 2" },
  { name: "Yellow Pages", icon: "YP", tier: "Tier 2" },
  { name: "Foursquare", icon: "4SQ", tier: "Tier 2" },
];

interface CitationEntry {
  directory: string;
  status: string;
  nap_consistent?: boolean;
  url?: string;
  da?: number;
}

export default function CitationsPage() {
  const { lastAudit, agentCache, setAgentResult } = useDashboard();
  const cached = agentCache.citation_builder as CitationBuilderAgent | undefined;

  // Build citation data from audit
  const gmbCitations = lastAudit?.gmb_data?.citations ?? [];
  const auditCitations: CitationEntry[] = gmbCitations.map((c) => ({
    directory: c.directory,
    status: c.status,
    nap_consistent: c.nap_match,
    da: c.da,
  }));

  // Match audit citations to known directories
  const rows = DIRECTORIES.map((dir) => {
    const match = auditCitations.find(
      (c) => c.directory?.toLowerCase().includes(dir.name.toLowerCase()) ||
             dir.name.toLowerCase().includes(c.directory?.toLowerCase() ?? "")
    );
    return {
      ...dir,
      status: match?.status ?? "unknown",
      napConsistent: match?.nap_consistent ?? null,
      url: match?.url ?? "",
    };
  });

  const listedCount = rows.filter((r) => r.status === "found" || r.status === "listed").length;
  const inconsistencies = rows.filter((r) => r.napConsistent === false).length;

  const statusBadge = (status: string) => {
    if (status === "found" || status === "listed") {
      return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400">Listed</span>;
    }
    if (status === "inconsistent") {
      return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400">Inconsistent</span>;
    }
    if (status === "missing" || status === "not_found") {
      return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400">Not Listed</span>;
    }
    return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/5 text-white">Unknown</span>;
  };

  const actionLabel = (status: string) => {
    if (status === "found" || status === "listed") return "Update";
    if (status === "inconsistent") return "Fix";
    return "Submit";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">Local Citation Builder</h1>
        <p className="text-sm text-white mt-1">
          Manage your business listings across top directories for consistent NAP data.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-emerald-500/[0.06] border border-emerald-500/15 rounded-2xl p-[18px]">
          <div className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider mb-1">Listed</div>
          <div className="text-[28px] font-bold font-display text-emerald-400">
            {listedCount}<span className="text-[16px] font-normal text-white">/{DIRECTORIES.length}</span>
          </div>
        </div>
        <div className="bg-amber-500/[0.06] border border-amber-500/15 rounded-2xl p-[18px]">
          <div className="text-[11px] text-amber-400 font-semibold uppercase tracking-wider mb-1">Inconsistencies</div>
          <div className="text-[28px] font-bold font-display text-amber-400">{inconsistencies}</div>
        </div>
        <div className="bg-blue-500/[0.06] border border-blue-500/15 rounded-2xl p-[18px]">
          <div className="text-[11px] text-blue-400 font-semibold uppercase tracking-wider mb-1">Directories</div>
          <div className="text-[28px] font-bold font-display text-blue-400">{DIRECTORIES.length}</div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-surface-2 border border-white/6 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/6">
          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
          <span className="text-[13px] font-semibold font-display text-white">Citation Directories</span>
        </div>
        <div className="divide-y divide-white/[0.03]">
          {rows.map((row) => (
            <div key={row.name} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                {row.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-medium text-white">{row.name}</div>
                <div className="text-[10px] text-white/40">{row.tier}</div>
              </div>
              <div className="flex items-center gap-3">
                {statusBadge(row.status)}
                {row.napConsistent !== null && (
                  <span className={`text-[10px] ${row.napConsistent ? "text-emerald-400" : "text-rose-400"}`}>
                    NAP {row.napConsistent ? "OK" : "Mismatch"}
                  </span>
                )}
                <button className="text-[11px] px-2.5 py-1 rounded-lg border border-white/8 text-white hover:text-emerald-400 hover:border-emerald-500/30 transition-colors">
                  {actionLabel(row.status)}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agent runner for full citation plan */}
      <AgentRunner<CitationBuilderAgent>
        endpoint="/agents/citation-builder"
        fields={["keyword", "url", "location", "businessName", "businessType"]}
        runLabel="Build Full Citation Plan"
        progressMessage="Finding citation opportunities from 57 directories..."
        cachedResult={cached}
        onResult={(data) => setAgentResult("citation_builder", data)}
        renderResult={(data) => <CitationBuilderSection data={data} />}
      />
    </div>
  );
}

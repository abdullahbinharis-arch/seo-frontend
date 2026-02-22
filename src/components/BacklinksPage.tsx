"use client";

import { useState } from "react";
import { useDashboard } from "@/components/DashboardContext";
import {
  StatRow,
  StatBox,
  Card,
  DataTable,
  Tag,
  EmptyState,
  CopyBtn,
  type Column,
} from "@/components/tool-ui";
import type { BacklinkData, BacklinkOpportunity } from "@/types";

/* ── Score color ─────────────────────────────────────────── */
function daColor(score: number): string {
  if (score >= 40) return "#10b981";
  if (score >= 20) return "#f59e0b";
  return "#f43f5e";
}

/* ── Main Component ──────────────────────────────────────── */
export function BacklinksToolView() {
  const { lastAudit } = useDashboard();
  const bd = lastAudit?.backlink_data as BacklinkData | undefined;

  if (!bd) return null;

  const da = bd.domain_authority ?? 0;
  const totalLinks = bd.total_backlinks ?? 0;
  const referringDomains = bd.referring_domains ?? 0;
  const opportunities = bd.opportunities ?? [];
  const currentBacklinks = bd.current_backlinks ?? [];

  return (
    <div className="animate-fadeIn">
      {/* ── Stat Row ────────────────────────────────────── */}
      <StatRow>
        <StatBox
          label="Domain Authority"
          value={da}
          suffix="/100"
          color={daColor(da)}
          progress={da}
          progressColor={daColor(da)}
        />
        <StatBox label="Total Backlinks" value={totalLinks.toLocaleString()} />
        <StatBox label="Referring Domains" value={referringDomains.toLocaleString()} />
        <StatBox
          label="Opportunities"
          value={opportunities.length || "—"}
          color={opportunities.length > 0 ? "#10b981" : undefined}
        />
      </StatRow>

      {/* ── Two-column layout ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Current Backlinks */}
        <Card title="Current Backlinks" dotColor="#3b82f6">
          {currentBacklinks.length > 0 ? (
            <DataTable
              columns={BACKLINK_COLUMNS}
              rows={currentBacklinks.map((bl) => ({
                source: (
                  <span className="text-zinc-300 text-[11px] truncate block max-w-[200px]">
                    {bl.source || "—"}
                  </span>
                ),
                da: <span className="font-mono text-[11px] text-zinc-400">{bl.da || "—"}</span>,
                type: (
                  <Tag variant={bl.type === "nofollow" ? "med" : "low"}>
                    {bl.type || "dofollow"}
                  </Tag>
                ),
                anchor: (
                  <span className="text-zinc-500 text-[11px] truncate block max-w-[150px]">
                    {bl.anchor || "—"}
                  </span>
                ),
              }))}
            />
          ) : (
            <div className="space-y-3">
              <DaInfo label="Domain Authority" value={da} max={100} />
              <DaInfo label="Dofollow" value={bd.dofollow ?? 0} max={totalLinks || 1} />
              <DaInfo label="Nofollow" value={bd.nofollow ?? 0} max={totalLinks || 1} />
              {bd.competitor_avg_da > 0 && (
                <div className="mt-3 pt-3 border-t border-white/6">
                  <div className="flex justify-between">
                    <span className="text-[11px] text-zinc-500">Competitor Avg DA</span>
                    <span className="text-[11px] font-mono text-zinc-300">{bd.competitor_avg_da}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Right: Link Opportunities */}
        <Card
          title="Link Opportunities"
          dotColor="#10b981"
          meta={opportunities.length > 0 ? `${opportunities.length} found` : undefined}
        >
          {opportunities.length > 0 ? (
            <OpportunityTable rows={opportunities} />
          ) : (
            <EmptyState message="No link opportunities found in this audit" />
          )}
        </Card>
      </div>
    </div>
  );
}

/* ── DA Info bar ─────────────────────────────────────────── */
function DaInfo({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-[11px] text-zinc-500">{label}</span>
        <span className="text-[11px] font-mono text-zinc-300">{value}</span>
      </div>
      <div className="h-1 rounded-full bg-white/6 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            backgroundColor: daColor(value),
          }}
        />
      </div>
    </div>
  );
}

/* ── Opportunity Table with expandable template ──────────── */
function OpportunityTable({ rows }: { rows: BacklinkOpportunity[] }) {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="grid grid-cols-[1fr_50px_70px_60px] gap-2 px-2.5 py-2 border-b border-white/6">
        <span className="text-[10px] uppercase tracking-wider text-zinc-500">Target</span>
        <span className="text-[10px] uppercase tracking-wider text-zinc-500 text-center">DA</span>
        <span className="text-[10px] uppercase tracking-wider text-zinc-500 text-center">Type</span>
        <span className="text-[10px] uppercase tracking-wider text-zinc-500 text-center">Effort</span>
      </div>
      {rows.map((opp, i) => (
        <div key={i}>
          <div
            className={`grid grid-cols-[1fr_50px_70px_60px] gap-2 px-2.5 py-2.5 border-b border-white/[0.03] hover:bg-white/[0.015] transition-colors ${
              opp.outreach_template ? "cursor-pointer" : ""
            }`}
            onClick={() => {
              if (opp.outreach_template) {
                setExpanded(expanded === i ? null : i);
              }
            }}
          >
            <span className="text-[12px] text-zinc-300 truncate">{opp.name}</span>
            <span className="text-[11px] font-mono text-zinc-400 text-center">
              {opp.expected_da ?? "—"}
            </span>
            <span className="text-center">
              <Tag variant="info">{opp.type}</Tag>
            </span>
            <span className="text-center">
              <Tag variant={effortVariant(opp.difficulty)}>{opp.difficulty}</Tag>
            </span>
          </div>
          {/* Expandable template */}
          {expanded === i && opp.outreach_template && (
            <div className="px-4 py-3 bg-surface-1 border-b border-white/6">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
                Outreach Template
              </p>
              <p className="text-[12px] font-semibold text-zinc-300 mb-1">
                {opp.outreach_template.subject}
              </p>
              <p className="text-[11px] text-zinc-400 whitespace-pre-wrap leading-relaxed">
                {opp.outreach_template.body}
              </p>
              <div className="mt-2 flex justify-end">
                <CopyBtn
                  text={`Subject: ${opp.outreach_template.subject}\n\n${opp.outreach_template.body}`}
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────────── */
function effortVariant(d: string): "low" | "med" | "high" {
  const dl = d?.toLowerCase() ?? "";
  if (dl === "easy" || dl === "low") return "low";
  if (dl === "medium" || dl === "moderate") return "med";
  return "high";
}

/* ── Column defs ─────────────────────────────────────────── */
const BACKLINK_COLUMNS: Column[] = [
  { key: "source", label: "Source" },
  { key: "da", label: "DA", mono: true, align: "center" },
  { key: "type", label: "Type", align: "center" },
  { key: "anchor", label: "Anchor" },
];

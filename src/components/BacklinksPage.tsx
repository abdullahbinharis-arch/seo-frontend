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
import type { BacklinkAnalysisAgent, LinkBuildingAgent, LinkBuildingOpportunity } from "@/types";

/* ── Score color ─────────────────────────────────────────── */
function daColor(score: number): string {
  if (score >= 40) return "#10b981";
  if (score >= 20) return "#f59e0b";
  return "#f43f5e";
}

/* ── Main Component ──────────────────────────────────────── */
export function BacklinksToolView({ data }: { data: BacklinkAnalysisAgent }) {
  const { agentCache } = useDashboard();
  const linkData = agentCache.link_building as LinkBuildingAgent | undefined;

  const analysis = data.analysis ?? {};
  const client = analysis.client ?? analysis;

  const da = client.domain_authority ?? 0;
  const totalLinks = client.links ?? analysis.total_backlinks ?? 0;
  const linkingDomains = client.linking_domains ?? 0;
  const totalOpps = linkData?.total_opportunities ?? null;

  /* Build opportunity rows from link building agent */
  const oppRows = buildOpportunityRows(linkData);

  /* Build current backlinks rows from analysis */
  const backlinkRows = buildBacklinkRows(analysis);

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
        <StatBox label="Referring Domains" value={linkingDomains.toLocaleString()} />
        <StatBox
          label="Opportunities"
          value={totalOpps ?? "—"}
          color={totalOpps ? "#10b981" : undefined}
        />
      </StatRow>

      {/* ── Two-column layout ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Current Backlinks / DA info */}
        <Card title="Current Backlinks" dotColor="#3b82f6">
          {backlinkRows.length > 0 ? (
            <DataTable columns={BACKLINK_COLUMNS} rows={backlinkRows} />
          ) : (
            <div className="space-y-3">
              <DaInfo label="Domain Authority" value={da} max={100} />
              <DaInfo
                label="Page Authority"
                value={client.page_authority ?? 0}
                max={100}
              />
              {client.spam_score !== undefined && (
                <DaInfo label="Spam Score" value={client.spam_score} max={100} />
              )}
              <p className="text-[10px] text-zinc-600 mt-2">
                Source: {client.data_source ?? "estimated"}
              </p>

              {/* Competitor comparison */}
              {analysis.competitors?.length > 0 && (
                <div className="mt-4">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">
                    Competitor Comparison
                  </p>
                  <DataTable
                    columns={COMP_COLUMNS}
                    rows={analysis.competitors.map(
                      (c: { url: string; domain_authority: number; page_authority: number }) => ({
                        url: (
                          <span className="text-zinc-400 text-[11px]">
                            {new URL(c.url).hostname}
                          </span>
                        ),
                        da: (
                          <span className="font-mono text-[11px]" style={{ color: daColor(c.domain_authority) }}>
                            {c.domain_authority}
                          </span>
                        ),
                        pa: (
                          <span className="font-mono text-[11px] text-zinc-400">
                            {c.page_authority}
                          </span>
                        ),
                      })
                    )}
                  />
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Right: Link Opportunities */}
        <Card
          title="Link Opportunities"
          dotColor="#10b981"
          meta={totalOpps ? `${totalOpps} found` : undefined}
        >
          {oppRows.length > 0 ? (
            <OpportunityTable rows={oppRows} />
          ) : (
            <EmptyState message="Run Link Building agent for opportunities" />
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
interface OppRow {
  opp: LinkBuildingOpportunity;
  type: string;
}

function OpportunityTable({ rows }: { rows: OppRow[] }) {
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
      {rows.map((row, i) => (
        <div key={i}>
          <div
            className={`grid grid-cols-[1fr_50px_70px_60px] gap-2 px-2.5 py-2.5 border-b border-white/[0.03] hover:bg-white/[0.015] transition-colors ${
              row.opp.outreach_template ? "cursor-pointer" : ""
            }`}
            onClick={() => {
              if (row.opp.outreach_template) {
                setExpanded(expanded === i ? null : i);
              }
            }}
          >
            <span className="text-[12px] text-zinc-300 truncate">{row.opp.name}</span>
            <span className="text-[11px] font-mono text-zinc-400 text-center">
              {row.opp.expected_da ?? "—"}
            </span>
            <span className="text-center">
              <Tag variant="info">{row.type}</Tag>
            </span>
            <span className="text-center">
              <Tag variant={effortVariant(row.opp.difficulty)}>{row.opp.difficulty}</Tag>
            </span>
          </div>
          {/* Expandable template */}
          {expanded === i && row.opp.outreach_template && (
            <div className="px-4 py-3 bg-surface-1 border-b border-white/6">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
                Outreach Template
              </p>
              <p className="text-[12px] font-semibold text-zinc-300 mb-1">
                {row.opp.outreach_template.subject}
              </p>
              <p className="text-[11px] text-zinc-400 whitespace-pre-wrap leading-relaxed">
                {row.opp.outreach_template.body}
              </p>
              <div className="mt-2 flex justify-end">
                <CopyBtn
                  text={`Subject: ${row.opp.outreach_template.subject}\n\n${row.opp.outreach_template.body}`}
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

/* eslint-disable @typescript-eslint/no-explicit-any */
function buildBacklinkRows(analysis: any): Record<string, React.ReactNode>[] {
  const backlinks = analysis.backlinks ?? analysis.top_backlinks ?? [];
  if (!Array.isArray(backlinks) || backlinks.length === 0) return [];

  return backlinks.slice(0, 15).map((bl: any) => ({
    source: (
      <span className="text-zinc-300 text-[11px] truncate block max-w-[200px]">
        {bl.source ?? bl.url ?? bl.domain ?? "—"}
      </span>
    ),
    da: <span className="font-mono text-[11px] text-zinc-400">{bl.da ?? bl.domain_authority ?? "—"}</span>,
    type: (
      <Tag variant={bl.type === "nofollow" ? "med" : "low"}>
        {bl.type ?? "dofollow"}
      </Tag>
    ),
    anchor: (
      <span className="text-zinc-500 text-[11px] truncate block max-w-[150px]">
        {bl.anchor ?? bl.anchor_text ?? "—"}
      </span>
    ),
  }));
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function buildOpportunityRows(linkData?: LinkBuildingAgent): OppRow[] {
  if (!linkData?.recommendations) return [];
  const recs = linkData.recommendations;
  const rows: OppRow[] = [];

  const add = (items: LinkBuildingOpportunity[] | undefined, type: string) => {
    for (const item of items ?? []) {
      rows.push({ opp: item, type });
    }
  };

  add(recs.quick_wins, "Quick Win");
  add(recs.guest_posting, "Guest Post");
  add(recs.resource_pages, "Resource");
  add(recs.local_opportunities, "Local");
  add(recs.competitor_gaps, "Gap");

  return rows.slice(0, 15);
}

/* ── Column defs ─────────────────────────────────────────── */
const BACKLINK_COLUMNS: Column[] = [
  { key: "source", label: "Source" },
  { key: "da", label: "DA", mono: true, align: "center" },
  { key: "type", label: "Type", align: "center" },
  { key: "anchor", label: "Anchor" },
];

const COMP_COLUMNS: Column[] = [
  { key: "url", label: "Competitor" },
  { key: "da", label: "DA", align: "center" },
  { key: "pa", label: "PA", align: "center" },
];

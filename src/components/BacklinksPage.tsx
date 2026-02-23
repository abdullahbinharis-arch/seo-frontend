"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useDashboard } from "@/components/DashboardContext";
import {
  StatRow,
  StatBox,
  Card,
  DataTable,
  Tag,
  BtnPrimary,
  BtnGhost,
  CopyBtn,
  SectionHead,
  type Column,
} from "@/components/tool-ui";
import type { BacklinkData, BacklinkOpportunity } from "@/types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/* ── Helpers ─────────────────────────────────────────────── */
function daColor(score: number): string {
  if (score >= 40) return "#10b981";
  if (score >= 20) return "#f59e0b";
  return "#f43f5e";
}

function effortVariant(d: string): "low" | "med" | "high" {
  const dl = d?.toLowerCase() ?? "";
  if (dl === "easy" || dl === "low") return "low";
  if (dl === "medium" || dl === "moderate") return "med";
  return "high";
}

function scoreColor(s: number): string {
  if (s >= 70) return "#10b981";
  if (s >= 40) return "#f59e0b";
  return "#f43f5e";
}

/* ── Types for manual features ───────────────────────────── */
interface LinkCheckResult {
  url: string;
  title: string;
  opportunity_score: number;
  site_type: string;
  estimated_da: number;
  link_strategy: string;
  approach: string;
  difficulty: string;
  pitch_angle: string;
  relevance: string;
}

interface OutreachResult {
  email_subject: string;
  email_body: string;
  follow_up: string;
}

/* ── Main Component ──────────────────────────────────────── */
export function BacklinksToolView() {
  const { lastAudit } = useDashboard();
  const { data: session } = useSession();
  const bd = lastAudit?.backlink_data as BacklinkData | undefined;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (session?.accessToken) headers.Authorization = `Bearer ${session.accessToken}`;

  const businessName = lastAudit?.business_name ?? "";
  const businessType = lastAudit?.business_type ?? "";
  const location = lastAudit?.location ?? "";
  const targetUrl = lastAudit?.target_url ?? "";

  /* Link opportunity checker state */
  const [checkUrl, setCheckUrl] = useState("");
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState("");
  const [checkResults, setCheckResults] = useState<LinkCheckResult[]>([]);

  /* Outreach generator state */
  const [outreachResults, setOutreachResults] = useState<Record<string, OutreachResult>>({});
  const [outreachLoading, setOutreachLoading] = useState<string | null>(null);

  /* Opportunity filter */
  const [oppFilter, setOppFilter] = useState<string>("all");

  const da = bd?.domain_authority ?? 0;
  const totalLinks = bd?.total_backlinks ?? 0;
  const referringDomains = bd?.referring_domains ?? 0;
  const opportunities = bd?.opportunities ?? [];
  const currentBacklinks = bd?.current_backlinks ?? [];
  const competitorAvgDa = bd?.competitor_avg_da ?? 0;

  /* Categorize opportunities */
  const filteredOpps =
    oppFilter === "all"
      ? opportunities
      : opportunities.filter((o) => {
          const t = (o.type || "").toLowerCase();
          if (oppFilter === "directory") return t.includes("directory") || t.includes("citation") || t.includes("profile");
          if (oppFilter === "guest") return t.includes("guest");
          if (oppFilter === "resource") return t.includes("resource");
          if (oppFilter === "local") return t.includes("local") || t.includes("sponsor") || t.includes("community");
          if (oppFilter === "competitor") return t.includes("competitor") || t.includes("gap");
          return true;
        });

  /* Check link opportunity */
  async function handleCheck() {
    const url = checkUrl.trim();
    if (!url) return;
    setChecking(true);
    setCheckError("");
    try {
      const res = await fetch(`${API}/api/check-link-opportunity`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          url,
          business_name: businessName,
          business_type: businessType,
          location,
          target_url: targetUrl,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: `Request failed (${res.status})` }));
        throw new Error(err.detail || `Request failed (${res.status})`);
      }
      const data: LinkCheckResult = await res.json();
      setCheckResults((prev) => [data, ...prev]);
      setCheckUrl("");
    } catch (err) {
      setCheckError(err instanceof Error ? err.message : "Check failed");
    } finally {
      setChecking(false);
    }
  }

  /* Generate outreach email */
  async function generateOutreach(targetSite: string, linkType: string, context?: string) {
    setOutreachLoading(targetSite);
    try {
      const res = await fetch(`${API}/api/generate-outreach`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          target_site: targetSite,
          link_type: linkType,
          business_name: businessName,
          business_type: businessType,
          location,
          target_url: targetUrl,
          context,
        }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data: OutreachResult = await res.json();
      setOutreachResults((prev) => ({ ...prev, [targetSite]: data }));
    } catch {
      /* ignore */
    } finally {
      setOutreachLoading(null);
    }
  }

  return (
    <div className="animate-fadeIn space-y-5">
      {/* ═══ SECTION 1: BACKLINK PROFILE ═════════════════ */}
      {bd && (
        <>
          {/* Stat Row */}
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
              label="Dofollow / Nofollow"
              value={`${bd.dofollow ?? 0} / ${bd.nofollow ?? 0}`}
            />
          </StatRow>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Current Backlinks Table */}
            <Card title="Current Backlinks" dotColor="#3b82f6" meta={`${currentBacklinks.length} links`}>
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
                      <Tag variant={bl.type === "nofollow" ? "high" : "low"}>
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
                  <DaBar label="Domain Authority" value={da} max={100} />
                  <DaBar label="Dofollow" value={bd.dofollow ?? 0} max={totalLinks || 1} />
                  <DaBar label="Nofollow" value={bd.nofollow ?? 0} max={totalLinks || 1} />
                </div>
              )}
            </Card>

            {/* Competitor DA Comparison */}
            <Card title="Competitor Comparison" dotColor="#f59e0b">
              <div className="space-y-4">
                {/* Your DA */}
                <DaCompareBar label="Your DA" value={da} max={Math.max(da, competitorAvgDa, 50)} color={daColor(da)} />
                {/* Competitor avg */}
                {competitorAvgDa > 0 && (
                  <DaCompareBar
                    label="Competitor Avg"
                    value={competitorAvgDa}
                    max={Math.max(da, competitorAvgDa, 50)}
                    color={daColor(competitorAvgDa)}
                  />
                )}
                {/* Gap assessment */}
                <div className="pt-3 border-t border-white/6">
                  {da >= competitorAvgDa ? (
                    <p className="text-[11px] text-emerald-400">
                      Your DA is {da - competitorAvgDa > 0 ? `${da - competitorAvgDa} points above` : "on par with"} competitor average. Focus on maintaining your lead.
                    </p>
                  ) : (
                    <p className="text-[11px] text-amber-400">
                      Your DA is {competitorAvgDa - da} points below competitor average. Link building is critical.
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </>
      )}

      {/* ═══ SECTION 2: LINK BUILDING OPPORTUNITIES ══════ */}
      {opportunities.length > 0 && (
        <>
          <SectionHead
            title="Link Building Opportunities"
            subtitle={`${opportunities.length} opportunities from your audit`}
          />

          {/* Filter row */}
          <div className="flex flex-wrap gap-1.5">
            {OPP_FILTERS.map((f) =>
              oppFilter === f.key ? (
                <BtnPrimary key={f.key} small onClick={() => setOppFilter(f.key)}>
                  {f.label}
                </BtnPrimary>
              ) : (
                <BtnGhost key={f.key} small onClick={() => setOppFilter(f.key)}>
                  {f.label}
                </BtnGhost>
              )
            )}
          </div>

          <Card
            title="Opportunities"
            dotColor="#10b981"
            meta={`${filteredOpps.length} of ${opportunities.length}`}
            noPadding
          >
            <OpportunityList
              rows={filteredOpps}
              outreachResults={outreachResults}
              outreachLoading={outreachLoading}
              onGenerateOutreach={generateOutreach}
            />
          </Card>
        </>
      )}

      {/* ═══ MANUAL LINK OPPORTUNITY CHECKER ═════════════ */}
      <SectionHead
        title="Link Opportunity Checker"
        subtitle="Enter any URL to analyze if you can earn a backlink from it"
      />
      <Card title="Check a Website" dotColor="#6366f1" meta="Manual">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={checkUrl}
            onChange={(e) => setCheckUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCheck()}
            placeholder="Enter website URL to check (e.g. https://example.com)"
            className="flex-1 bg-surface-1 border border-white/8 rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/40 transition-colors"
          />
          <BtnPrimary onClick={handleCheck} disabled={checking || !checkUrl.trim()}>
            {checking ? "Checking..." : "Check"}
          </BtnPrimary>
        </div>
        {checkError && (
          <p className="text-[11px] text-rose-400 mt-2">{checkError}</p>
        )}
      </Card>

      {/* Check results */}
      {checkResults.map((result, i) => (
        <LinkCheckCard
          key={`${result.url}-${i}`}
          result={result}
          outreachResult={outreachResults[result.url]}
          outreachLoading={outreachLoading === result.url}
          onGenerateOutreach={() =>
            generateOutreach(result.url, result.approach, result.pitch_angle)
          }
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════════════════ */

/* ── DA comparison bar ───────────────────────────────────── */
function DaBar({ label, value, max }: { label: string; value: number; max: number }) {
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
          style={{ width: `${pct}%`, backgroundColor: daColor(value) }}
        />
      </div>
    </div>
  );
}

function DaCompareBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-[12px] text-zinc-400 font-medium">{label}</span>
        <span className="text-[14px] font-bold font-mono" style={{ color }}>
          {value}
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-white/6 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

/* ── Opportunity list with outreach ──────────────────────── */
function OpportunityList({
  rows,
  outreachResults,
  outreachLoading,
  onGenerateOutreach,
}: {
  rows: BacklinkOpportunity[];
  outreachResults: Record<string, OutreachResult>;
  outreachLoading: string | null;
  onGenerateOutreach: (site: string, type: string, context?: string) => void;
}) {
  const [expanded, setExpanded] = useState<number | null>(null);

  if (rows.length === 0) {
    return <p className="text-[11px] text-zinc-600 py-4 text-center">No opportunities match this filter</p>;
  }

  return (
    <div>
      {/* Header */}
      <div className="grid grid-cols-[1fr_50px_80px_60px_80px] gap-2 px-4 py-2 border-b border-white/6">
        <span className="text-[10px] uppercase tracking-wider text-zinc-500">Target</span>
        <span className="text-[10px] uppercase tracking-wider text-zinc-500 text-center">DA</span>
        <span className="text-[10px] uppercase tracking-wider text-zinc-500 text-center">Type</span>
        <span className="text-[10px] uppercase tracking-wider text-zinc-500 text-center">Effort</span>
        <span className="text-[10px] uppercase tracking-wider text-zinc-500 text-center">Action</span>
      </div>

      {rows.map((opp, i) => {
        const isExpanded = expanded === i;
        const outreach = outreachResults[opp.name] || outreachResults[opp.url];
        const isLoadingOutreach = outreachLoading === opp.name || outreachLoading === opp.url;

        return (
          <div key={i}>
            <div
              className="grid grid-cols-[1fr_50px_80px_60px_80px] gap-2 px-4 py-2.5 border-b border-white/[0.03] hover:bg-white/[0.015] transition-colors cursor-pointer"
              onClick={() => setExpanded(isExpanded ? null : i)}
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
              <span className="text-center">
                {opp.outreach_template || outreach ? (
                  <Tag variant="low">Ready</Tag>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onGenerateOutreach(opp.url || opp.name, opp.type);
                    }}
                    disabled={isLoadingOutreach}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 disabled:opacity-50"
                  >
                    {isLoadingOutreach ? "..." : "Outreach"}
                  </button>
                )}
              </span>
            </div>

            {/* Expanded: show outreach template */}
            {isExpanded && (
              <div className="px-4 py-3 bg-surface-1 border-b border-white/6">
                {opp.outreach_template ? (
                  <>
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Outreach Template</p>
                    <p className="text-[12px] font-semibold text-zinc-300 mb-1">{opp.outreach_template.subject}</p>
                    <p className="text-[11px] text-zinc-400 whitespace-pre-wrap leading-relaxed">{opp.outreach_template.body}</p>
                    <div className="mt-2 flex justify-end">
                      <CopyBtn text={`Subject: ${opp.outreach_template.subject}\n\n${opp.outreach_template.body}`} />
                    </div>
                  </>
                ) : outreach ? (
                  <>
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Outreach Email</p>
                    <p className="text-[12px] font-semibold text-zinc-300 mb-1">{outreach.email_subject}</p>
                    <p className="text-[11px] text-zinc-400 whitespace-pre-wrap leading-relaxed">{outreach.email_body}</p>
                    {outreach.follow_up && (
                      <div className="mt-3 pt-3 border-t border-white/6">
                        <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Follow-up (5 days later)</p>
                        <p className="text-[11px] text-zinc-400 whitespace-pre-wrap leading-relaxed">{outreach.follow_up}</p>
                      </div>
                    )}
                    <div className="mt-2 flex justify-end">
                      <CopyBtn text={`Subject: ${outreach.email_subject}\n\n${outreach.email_body}\n\n---\nFollow-up:\n${outreach.follow_up}`} />
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    <p className="text-[11px] text-zinc-500">No outreach template yet.</p>
                    <BtnPrimary
                      small
                      onClick={() => onGenerateOutreach(opp.url || opp.name, opp.type)}
                      disabled={isLoadingOutreach}
                    >
                      {isLoadingOutreach ? "Generating..." : "Generate Outreach Email"}
                    </BtnPrimary>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Link Check Result Card ──────────────────────────────── */
function LinkCheckCard({
  result,
  outreachResult,
  outreachLoading,
  onGenerateOutreach,
}: {
  result: LinkCheckResult;
  outreachResult?: OutreachResult;
  outreachLoading: boolean;
  onGenerateOutreach: () => void;
}) {
  const [showOutreach, setShowOutreach] = useState(false);

  return (
    <div className="bg-surface-2 border border-white/6 rounded-xl overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className="text-[14px] font-semibold font-display text-white">
              {result.title || extractDomain(result.url)}
            </h4>
            <p className="text-[10px] text-zinc-500 mt-0.5">{result.url}</p>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-lg border"
              style={{
                backgroundColor: `${scoreColor(result.opportunity_score)}15`,
                borderColor: `${scoreColor(result.opportunity_score)}30`,
              }}
            >
              <span className="text-[10px] text-zinc-400">Score</span>
              <span
                className="text-[14px] font-bold font-mono"
                style={{ color: scoreColor(result.opportunity_score) }}
              >
                {result.opportunity_score}
              </span>
            </div>
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-lg border"
              style={{
                backgroundColor: `${daColor(result.estimated_da)}15`,
                borderColor: `${daColor(result.estimated_da)}30`,
              }}
            >
              <span className="text-[10px] text-zinc-400">DA</span>
              <span
                className="text-[14px] font-bold font-mono"
                style={{ color: daColor(result.estimated_da) }}
              >
                {result.estimated_da}
              </span>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          <Tag variant="info">{result.site_type}</Tag>
          <Tag variant={effortVariant(result.difficulty)}>{result.difficulty}</Tag>
          <Tag variant="med">{result.approach.replace(/-/g, " ")}</Tag>
        </div>

        {/* Strategy */}
        <p className="text-[11px] text-zinc-400 leading-relaxed mb-2">
          <span className="text-emerald-400 font-medium">Strategy: </span>
          {result.link_strategy}
        </p>

        {/* Relevance */}
        {result.relevance && (
          <p className="text-[11px] text-zinc-500 leading-relaxed mb-3">
            <span className="text-blue-400 font-medium">Relevance: </span>
            {result.relevance}
          </p>
        )}

        {/* Outreach button */}
        <div className="flex gap-2">
          {!outreachResult ? (
            <BtnPrimary small onClick={onGenerateOutreach} disabled={outreachLoading}>
              {outreachLoading ? "Generating..." : "Generate Outreach Email"}
            </BtnPrimary>
          ) : (
            <BtnGhost small onClick={() => setShowOutreach(!showOutreach)}>
              {showOutreach ? "Hide Email" : "View Outreach Email"}
            </BtnGhost>
          )}
        </div>
      </div>

      {/* Outreach email */}
      {showOutreach && outreachResult && (
        <div className="border-t border-white/6 p-4">
          <div className="flex items-start justify-between mb-1">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Outreach Email</p>
            <CopyBtn
              text={`Subject: ${outreachResult.email_subject}\n\n${outreachResult.email_body}\n\n---\nFollow-up:\n${outreachResult.follow_up}`}
            />
          </div>
          <p className="text-[12px] font-semibold text-zinc-300 mb-1">{outreachResult.email_subject}</p>
          <p className="text-[11px] text-zinc-400 whitespace-pre-wrap leading-relaxed">{outreachResult.email_body}</p>
          {outreachResult.follow_up && (
            <div className="mt-3 pt-3 border-t border-white/6">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Follow-up (5 days later)</p>
              <p className="text-[11px] text-zinc-400 whitespace-pre-wrap leading-relaxed">{outreachResult.follow_up}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Filter options ──────────────────────────────────────── */
const OPP_FILTERS = [
  { key: "all", label: "All" },
  { key: "directory", label: "Directories" },
  { key: "guest", label: "Guest Posts" },
  { key: "resource", label: "Resource Pages" },
  { key: "local", label: "Local" },
  { key: "competitor", label: "Competitor Gaps" },
] as const;

/* ── Column definitions ──────────────────────────────────── */
const BACKLINK_COLUMNS: Column[] = [
  { key: "source", label: "Source" },
  { key: "da", label: "DA", mono: true, align: "center" },
  { key: "type", label: "Type", align: "center" },
  { key: "anchor", label: "Anchor" },
];

/* ── Utility ─────────────────────────────────────────────── */
function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

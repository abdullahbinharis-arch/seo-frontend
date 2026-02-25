"use client";

import { useState } from "react";
import { useDashboard } from "@/components/DashboardContext";
import {
  StatRow,
  StatBox,
  Card,
  DataTable,
  Tag,
  BtnPrimary,
  BtnGhost,
  SectionHead,
  type Column,
} from "@/components/tool-ui";
import type {
  KeywordGap,
  CompetitorGapResult,
  CompetitorGapKeyword,
} from "@/types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/* ── Helpers ──────────────────────────────────────────── */
function diffColor(d: number): string {
  if (d < 35) return "#10b981";
  if (d < 60) return "#f59e0b";
  return "#f43f5e";
}

function diffVariant(d: number): "low" | "med" | "high" {
  if (d < 35) return "low";
  if (d < 60) return "med";
  return "high";
}

function diffLabel(d: number): string {
  if (d < 35) return "Low";
  if (d < 60) return "Medium";
  return "High";
}

function intentVariant(intent: string): "high" | "med" | "low" | "info" {
  const il = intent.toLowerCase();
  if (il === "transactional" || il === "commercial") return "low";
  if (il === "informational") return "info";
  return "med";
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function daColor(da: number): string {
  if (da >= 60) return "#10b981";
  if (da >= 30) return "#f59e0b";
  return "#f43f5e";
}

/* ── Competitor Result Card ───────────────────────────── */
function CompetitorCard({ result }: { result: CompetitorGapResult }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-surface-2 border border-white/6 rounded-xl overflow-hidden hover:border-white/10 transition-colors">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className="text-[14px] font-semibold font-display text-white">
              {extractDomain(result.competitor_url)}
            </h4>
            {result.competitor_title && (
              <p className="text-[11px] text-white mt-0.5 truncate max-w-md">
                {result.competitor_title}
              </p>
            )}
          </div>
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border"
            style={{
              backgroundColor: `${daColor(result.estimated_da)}15`,
              borderColor: `${daColor(result.estimated_da)}30`,
            }}
          >
            <span className="text-[10px] uppercase tracking-wide text-white">DA</span>
            <span
              className="text-[14px] font-bold font-mono"
              style={{ color: daColor(result.estimated_da) }}
            >
              {result.estimated_da}
            </span>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[11px] text-white">
            Keywords: <span className="text-zinc-200 font-mono">{result.keywords_found}</span>
          </span>
          <span className="text-[11px] text-white">
            Gaps: <span className="text-amber-400 font-mono">{result.gaps?.length ?? 0}</span>
          </span>
          <span className="text-[11px] text-white">
            Overlap: <span className="text-emerald-400 font-mono">{result.overlap_keywords?.length ?? 0}</span>
          </span>
        </div>

        {/* Summary */}
        <p className="text-[11px] text-white leading-relaxed">{result.summary}</p>

        {/* Overlap keywords */}
        {(result.overlap_keywords?.length ?? 0) > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {result.overlap_keywords.map((kw) => (
              <span
                key={kw}
                className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md"
              >
                {kw}
              </span>
            ))}
          </div>
        )}

        {/* Expand toggle */}
        {(result.gaps?.length ?? 0) > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            {expanded
              ? "Hide gap keywords"
              : `View ${result.gaps.length} gap keywords`}
          </button>
        )}
      </div>

      {/* Expandable gap table */}
      {expanded && result.gaps?.length > 0 && (
        <div className="border-t border-white/6 px-4 pb-4">
          <DataTable
            columns={COMP_GAP_COLUMNS}
            rows={result.gaps.map((g: CompetitorGapKeyword) => ({
              keyword: <span className="text-zinc-200 font-medium">{g.keyword}</span>,
              volume: (
                <span className="font-mono text-[11px] text-white">
                  {g.volume_estimate?.toLocaleString() ?? "—"}
                </span>
              ),
              difficulty: (
                <Tag variant={diffVariant(g.difficulty_estimate)}>
                  {diffLabel(g.difficulty_estimate)}
                </Tag>
              ),
              position: (
                <Tag variant={g.competitor_position === "strong" ? "high" : g.competitor_position === "moderate" ? "med" : "low"}>
                  {g.competitor_position}
                </Tag>
              ),
              opportunity: (
                <span className="text-[10px] text-amber-400">{g.opportunity}</span>
              ),
              intent: (
                <Tag variant={intentVariant(g.intent)}>{g.intent}</Tag>
              ),
            }))}
          />
        </div>
      )}
    </div>
  );
}

/* ── Filter constants ─────────────────────────────────── */
const FILTERS = [
  { key: "all", label: "All" },
  { key: "easy", label: "Easy Wins" },
  { key: "blog", label: "Blog Topics" },
  { key: "service", label: "Service Pages" },
  { key: "create", label: "Create Page" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

function matchesFilter(opp: string, filter: FilterKey): boolean {
  if (filter === "all") return true;
  const low = opp.toLowerCase();
  if (filter === "easy") return low.includes("optimize") || low.includes("quick") || low.includes("easy");
  if (filter === "blog") return low.includes("blog");
  if (filter === "service") return low.includes("service");
  if (filter === "create") return low.includes("create");
  return true;
}

/* ── Main Component ──────────────────────────────────── */
export function KeywordGapView() {
  const { lastAudit } = useDashboard();

  // Competitor analysis state
  const [competitorUrl, setCompetitorUrl] = useState("");
  const [analysing, setAnalysing] = useState(false);
  const [analysisError, setAnalysisError] = useState("");
  const [results, setResults] = useState<CompetitorGapResult[]>([]);

  // Audit gap filter state
  const [filter, setFilter] = useState<FilterKey>("all");

  // Audit data
  const gaps = (lastAudit?.keyword_data?.keyword_gaps ?? []) as KeywordGap[];
  const contentGaps =
    lastAudit?.agents?.keyword_research?.recommendations?.content_gap_opportunities ?? [];

  // Filtered gaps
  const filteredGaps =
    filter === "all" ? gaps : gaps.filter((g) => matchesFilter(g.opportunity, filter));

  // Stats
  const avgVol =
    gaps.length > 0
      ? Math.round(gaps.reduce((s, g) => s + (g.volume ?? 0), 0) / gaps.length)
      : 0;
  const avgDiff =
    gaps.length > 0
      ? Math.round(gaps.reduce((s, g) => s + (g.difficulty ?? 0), 0) / gaps.length)
      : 0;
  const topOpp =
    gaps.length > 0
      ? gaps.reduce((best, g) => {
          const score = (g.volume ?? 0) / Math.max(g.difficulty ?? 1, 1);
          const bestScore = (best.volume ?? 0) / Math.max(best.difficulty ?? 1, 1);
          return score > bestScore ? g : best;
        }, gaps[0]).keyword
      : "—";

  /* Competitor analysis handler */
  async function handleAnalyse() {
    const url = competitorUrl.trim();
    if (!url) return;
    setAnalysing(true);
    setAnalysisError("");
    try {
      const res = await fetch(`${API}/api/keyword-gap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          competitor_url: url,
          target_url: lastAudit?.target_url ?? "",
          keyword: lastAudit?.keyword ?? "",
          location: lastAudit?.location ?? "",
          business_type: lastAudit?.business_type ?? "local business",
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: `Request failed (${res.status})` }));
        throw new Error(err.detail || `Request failed (${res.status})`);
      }
      const data: CompetitorGapResult = await res.json();
      if (data.competitor_url) {
        setResults((prev) => [data, ...prev]);
        setCompetitorUrl("");
      }
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setAnalysing(false);
    }
  }

  return (
    <div className="animate-fadeIn space-y-5">
      {/* ── 1. Competitor Analysis Input ─────────────────── */}
      <Card
        title="Competitor Analysis"
        dotColor="#6366f1"
        meta="Compare any competitor"
      >
        {lastAudit?.target_url && (
          <p className="text-[11px] text-white mb-3">
            Comparing against:{" "}
            <span className="text-white">{extractDomain(lastAudit.target_url)}</span>
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={competitorUrl}
            onChange={(e) => setCompetitorUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAnalyse()}
            placeholder="Enter competitor URL to compare (e.g. https://competitor.com)"
            className="flex-1 bg-surface-1 border border-white/8 rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-white focus:outline-none focus:border-emerald-500/40 transition-colors"
          />
          <BtnPrimary
            onClick={handleAnalyse}
            disabled={analysing || !competitorUrl.trim()}
          >
            {analysing ? "Analysing..." : "Analyse"}
          </BtnPrimary>
        </div>

        {analysisError && (
          <p className="text-[11px] text-rose-400 mt-2">{analysisError}</p>
        )}
      </Card>

      {/* ── 2. Competitor Result Cards ───────────────────── */}
      {results.length > 0 && (
        <>
          <SectionHead
            title="Competitor Results"
            subtitle={`${results.length} competitor${results.length !== 1 ? "s" : ""} analysed`}
          />
          <div className="space-y-3">
            {results.map((r, i) => (
              <CompetitorCard key={`${r.competitor_url}-${i}`} result={r} />
            ))}
          </div>
        </>
      )}

      {/* ── From here: audit-based data only ─────────────── */}
      {gaps.length > 0 && (
        <>
          {/* ── 3. Stat Row ──────────────────────────────────── */}
          <StatRow>
            <StatBox label="Total Gaps" value={gaps.length} color="#f59e0b" />
            <StatBox
              label="Avg Volume"
              value={avgVol.toLocaleString()}
            />
            <StatBox
              label="Avg Difficulty"
              value={avgDiff}
              suffix="/100"
              color={diffColor(avgDiff)}
              progress={avgDiff}
              progressColor={diffColor(avgDiff)}
            />
            <StatBox label="Top Opportunity" value={truncate(topOpp, 20)} />
          </StatRow>

          {/* ── 4. Gap Keywords Table ────────────────────────── */}
          <SectionHead
            title="Keyword Gaps"
            subtitle="Keywords your competitors rank for that you should target"
          />

          {/* Filter row */}
          <div className="flex flex-wrap gap-1.5 mb-1">
            {FILTERS.map((f) => {
              const active = filter === f.key;
              return active ? (
                <BtnPrimary key={f.key} small onClick={() => setFilter(f.key)}>
                  {f.label}
                </BtnPrimary>
              ) : (
                <BtnGhost key={f.key} small onClick={() => setFilter(f.key)}>
                  {f.label}
                </BtnGhost>
              );
            })}
          </div>

          <Card
            title="Gap Keywords"
            dotColor="#f59e0b"
            meta={`${filteredGaps.length} of ${gaps.length}`}
          >
            <DataTable
              columns={AUDIT_GAP_COLUMNS}
              rows={filteredGaps.map((g) => ({
                keyword: <span className="text-zinc-200 font-medium">{g.keyword}</span>,
                volume: (
                  <span className="font-mono text-[11px] text-white">
                    {g.volume?.toLocaleString() ?? "—"}
                  </span>
                ),
                difficulty: (
                  <Tag variant={diffVariant(g.difficulty)}>
                    {diffLabel(g.difficulty)}
                  </Tag>
                ),
                opportunity: (
                  <span className="text-[10px] text-amber-400">{g.opportunity}</span>
                ),
              }))}
            />
          </Card>
        </>
      )}

      {/* ── 5. Content Gap Opportunities ──────────────────── */}
      {contentGaps.length > 0 && (
        <>
          <SectionHead
            title="Content Gap Opportunities"
            subtitle="Topics to create content around for maximum impact"
          />
          <Card title="Content Gaps" dotColor="#8b5cf6">
            <ul className="space-y-2">
              {contentGaps.map((gap: string, i: number) => (
                <li key={i} className="flex gap-3 text-[12px] text-white">
                  <span className="text-emerald-400 font-bold shrink-0 mt-0.5">
                    {i + 1}.
                  </span>
                  <span>{gap}</span>
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}

/* ── Column Definitions ──────────────────────────────── */
const AUDIT_GAP_COLUMNS: Column[] = [
  { key: "keyword", label: "Keyword" },
  { key: "volume", label: "Volume", align: "right" },
  { key: "difficulty", label: "Difficulty", align: "center" },
  { key: "opportunity", label: "Opportunity", align: "center" },
];

const COMP_GAP_COLUMNS: Column[] = [
  { key: "keyword", label: "Keyword" },
  { key: "volume", label: "Volume", align: "right" },
  { key: "difficulty", label: "Difficulty", align: "center" },
  { key: "position", label: "Position", align: "center" },
  { key: "opportunity", label: "Opportunity", align: "center" },
  { key: "intent", label: "Intent", align: "center" },
];

/* ── Utility ─────────────────────────────────────────── */
function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max) + "..." : s;
}

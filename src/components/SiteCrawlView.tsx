"use client";

import { useState } from "react";
import { useDashboard } from "@/components/DashboardContext";
import {
  StatRow,
  StatBox,
  Card,
  DataTable,
  Tag,
  SectionHead,
  CopyBtn,
  type Column,
} from "@/components/tool-ui";
import type {
  SiteCrawl,
  SiteCrawlPage,
  PageAnalysis,
  ServiceKeywordTarget,
  SiteAggregate,
} from "@/types";

/* ── Helpers ──────────────────────────────────────────────── */

function scoreColor(s: number): string {
  if (s >= 70) return "#10b981";
  if (s >= 40) return "#f59e0b";
  return "#f43f5e";
}

function scoreVariant(s: number): "low" | "med" | "high" {
  if (s >= 70) return "low";
  if (s >= 40) return "med";
  return "high";
}

function ratingVariant(r: string): "low" | "med" | "high" {
  if (r === "good") return "low";
  if (r === "needs_improvement") return "med";
  return "high";
}

function ratingLabel(r: string): string {
  if (r === "good") return "Good";
  if (r === "needs_improvement") return "Needs Work";
  return "Poor";
}

function extractPath(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}

/* ── Page Analysis Expand ────────────────────────────────── */

function PageAnalysisDetail({ analysis }: { analysis: PageAnalysis }) {
  return (
    <div className="space-y-3">
      {/* Title Analysis */}
      <div className="bg-surface-1 border border-white/[0.04] rounded-lg p-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Title Tag</span>
          <Tag variant={ratingVariant(analysis.title_analysis?.rating ?? "poor")}>
            {ratingLabel(analysis.title_analysis?.rating ?? "poor")}
          </Tag>
        </div>
        <p className="text-[12px] text-zinc-300 mb-1">{analysis.title_analysis?.current || "—"}</p>
        <div className="flex gap-3 text-[10px] text-zinc-500">
          <span>Length: {analysis.title_analysis?.length ?? 0}</span>
          <span>Keyword: {analysis.title_analysis?.has_keyword ? "Yes" : "No"}</span>
          <span>Location: {analysis.title_analysis?.has_location ? "Yes" : "No"}</span>
        </div>
        {analysis.recommended_title && (
          <div className="mt-2 flex items-start gap-2">
            <span className="text-[10px] text-emerald-400 shrink-0">Suggested:</span>
            <span className="text-[11px] text-zinc-300 flex-1">{analysis.recommended_title}</span>
            <CopyBtn text={analysis.recommended_title} />
          </div>
        )}
      </div>

      {/* Meta Analysis */}
      <div className="bg-surface-1 border border-white/[0.04] rounded-lg p-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Meta Description</span>
          <Tag variant={ratingVariant(analysis.meta_analysis?.rating ?? "poor")}>
            {ratingLabel(analysis.meta_analysis?.rating ?? "poor")}
          </Tag>
        </div>
        <p className="text-[12px] text-zinc-300 mb-1">{analysis.meta_analysis?.current || "—"}</p>
        <div className="flex gap-3 text-[10px] text-zinc-500">
          <span>Length: {analysis.meta_analysis?.length ?? 0}</span>
          <span>Keyword: {analysis.meta_analysis?.has_keyword ? "Yes" : "No"}</span>
          <span>CTA: {analysis.meta_analysis?.has_cta ? "Yes" : "No"}</span>
        </div>
        {analysis.recommended_meta && (
          <div className="mt-2 flex items-start gap-2">
            <span className="text-[10px] text-emerald-400 shrink-0">Suggested:</span>
            <span className="text-[11px] text-zinc-300 flex-1">{analysis.recommended_meta}</span>
            <CopyBtn text={analysis.recommended_meta} />
          </div>
        )}
      </div>

      {/* Issues */}
      {analysis.issues?.length > 0 && (
        <div className="bg-surface-1 border border-white/[0.04] rounded-lg p-3">
          <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Issues Found</div>
          <div className="flex flex-col gap-1">
            {analysis.issues.map((issue, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                <span className="text-[11px] text-zinc-400 leading-relaxed">{issue}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Keywords + Content Rec */}
      <div className="flex flex-col sm:flex-row gap-3">
        {analysis.recommended_keywords?.length > 0 && (
          <div className="flex-1 bg-surface-1 border border-white/[0.04] rounded-lg p-3">
            <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Target Keywords</div>
            <div className="flex flex-wrap gap-1">
              {analysis.recommended_keywords.map((kw) => (
                <span key={kw} className="text-[10px] px-2 py-[3px] rounded-md bg-emerald-500/10 text-emerald-400 font-medium">
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}
        {analysis.content_recommendation && (
          <div className="flex-1 bg-surface-1 border border-white/[0.04] rounded-lg p-3">
            <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Content Recommendation</div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">{analysis.content_recommendation}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Service Keywords Section ────────────────────────────── */

function ServiceKeywordsSection({ data }: { data: Record<string, ServiceKeywordTarget> }) {
  const entries = Object.entries(data);
  if (entries.length === 0) return null;

  return (
    <>
      <SectionHead
        title="Service Keyword Targets"
        subtitle={`${entries.length} service${entries.length !== 1 ? "s" : ""} mapped to keywords`}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {entries.map(([service, target]) => (
          <div key={service} className="bg-surface-2 border border-white/6 rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-[13px] font-semibold font-display text-white">{service}</h4>
              {target.has_dedicated_page ? (
                <Tag variant="found">Has Page</Tag>
              ) : (
                <Tag variant="missing">No Page</Tag>
              )}
            </div>
            <div className="text-[11px] text-zinc-400 mb-2">
              Primary: <span className="text-zinc-200 font-medium">{target.primary}</span>
            </div>
            {target.current_page && (
              <div className="text-[10px] text-zinc-500 mb-2">
                Current page: <span className="text-zinc-400 font-mono">{extractPath(target.current_page)}</span>
              </div>
            )}
            {target.related.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {target.related.map((r) => (
                  <span key={r} className="text-[9px] px-2 py-0.5 rounded-md bg-white/[0.04] text-zinc-500">{r}</span>
                ))}
              </div>
            )}
            <p className="text-[10px] text-emerald-400/70 leading-relaxed">{target.recommendation}</p>
          </div>
        ))}
      </div>
    </>
  );
}

/* ── Schema Recommendations Section ──────────────────────── */

function SchemaSection({ data }: { data: Record<string, string[]> }) {
  const entries = Object.entries(data);
  if (entries.length === 0) return null;

  return (
    <>
      <SectionHead
        title="Schema Recommendations"
        subtitle="Recommended structured data per page"
      />
      <Card title="Schema Markup" dotColor="#6366f1" meta={`${entries.length} pages`}>
        <DataTable
          columns={SCHEMA_COLUMNS}
          rows={entries.map(([path, schemas]) => ({
            page: <span className="text-zinc-300 font-mono text-[11px]">{path}</span>,
            schemas: (
              <div className="flex flex-wrap gap-1">
                {schemas.map((s) => (
                  <span key={s} className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-medium">
                    {s}
                  </span>
                ))}
              </div>
            ),
          }))}
        />
      </Card>
    </>
  );
}

/* ── Main Component ──────────────────────────────────────── */

export function SiteCrawlView() {
  const { lastAudit } = useDashboard();

  const siteCrawl = lastAudit?.site_crawl as SiteCrawl | undefined;
  const perPage = lastAudit?.per_page_analysis as Record<string, PageAnalysis> | undefined;
  const serviceKw = lastAudit?.service_keywords as Record<string, ServiceKeywordTarget> | undefined;
  const schemaRecs = lastAudit?.schema_recommendations as Record<string, string[]> | undefined;
  const aggregate = lastAudit?.site_aggregate as SiteAggregate | undefined;

  const [expandedPage, setExpandedPage] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("All");

  if (!siteCrawl || !siteCrawl.pages || siteCrawl.pages.length === 0) {
    return null;
  }

  const pages = siteCrawl.pages;
  const avgScore = Math.round(pages.reduce((sum, p) => sum + (p.score || 0), 0) / pages.length);
  const totalIssues = pages.reduce((sum, p) => sum + (p.issues_count || 0), 0);

  // Page type filter options
  const pageTypes = ["All", ...new Set(pages.map((p) => p.type).filter(Boolean))];
  const filteredPages = typeFilter === "All" ? pages : pages.filter((p) => p.type === typeFilter);

  function togglePage(url: string) {
    setExpandedPage((prev) => (prev === url ? null : url));
  }

  return (
    <div className="space-y-5">
      {/* ── Stats ────────────────────────────────────────── */}
      <SectionHead title="Site Crawl Results" subtitle="Full-site SEO analysis from your latest audit" />

      <StatRow>
        <StatBox label="Pages Found" value={siteCrawl.pages_found} />
        <StatBox label="Pages Analyzed" value={siteCrawl.pages_analyzed} />
        <StatBox
          label="Avg Page Score"
          value={avgScore}
          suffix="/100"
          color={scoreColor(avgScore)}
          progress={avgScore}
          progressColor={scoreColor(avgScore)}
        />
        <StatBox label="Total Issues" value={totalIssues} color="#f43f5e" />
      </StatRow>

      {aggregate && (
        <StatRow>
          <StatBox label="Avg Word Count" value={aggregate.avg_word_count} />
          <StatBox label="Thin Content" value={aggregate.thin_content_count} color="#f59e0b" />
          <StatBox label="Missing Meta" value={aggregate.missing_meta_description} color="#f59e0b" />
          <StatBox
            label="Coverage Score"
            value={aggregate.coverage_score}
            suffix="/100"
            color={scoreColor(aggregate.coverage_score)}
            progress={aggregate.coverage_score}
            progressColor={scoreColor(aggregate.coverage_score)}
          />
        </StatRow>
      )}

      {/* ── Pages Table ─────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        {pageTypes.map((type) => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-all ${
              typeFilter === type
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-white/[0.04] text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {type}
            {type !== "All" && (
              <span className="ml-1 text-[9px] opacity-60">
                ({pages.filter((p) => p.type === type).length})
              </span>
            )}
          </button>
        ))}
      </div>

      <Card
        title="All Pages"
        dotColor="#10b981"
        meta={`${filteredPages.length} of ${pages.length} pages`}
        noPadding
      >
        <div className="divide-y divide-white/[0.03]">
          {filteredPages.map((page) => {
            const path = extractPath(page.url);
            const analysis = perPage?.[path.replace(/\/$/, "") || "/"];
            const isExpanded = expandedPage === page.url;

            return (
              <div key={page.url}>
                <button
                  onClick={() => analysis && togglePage(page.url)}
                  className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${
                    analysis ? "hover:bg-white/[0.02] cursor-pointer" : "cursor-default"
                  } ${isExpanded ? "bg-white/[0.02]" : ""}`}
                >
                  {/* Score */}
                  <span
                    className="text-[12px] font-mono font-bold w-8 shrink-0 text-center"
                    style={{ color: scoreColor(page.score) }}
                  >
                    {page.score || "—"}
                  </span>

                  {/* URL + title */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[12px] text-zinc-300 font-mono truncate">{path}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-500 shrink-0">
                        {page.type}
                      </span>
                    </div>
                    {page.title && (
                      <span className="text-[10px] text-zinc-500 truncate block">{page.title}</span>
                    )}
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] text-zinc-600">{page.word_count}w</span>
                    {page.issues_count > 0 && (
                      <Tag variant={page.issues_count >= 3 ? "high" : "med"}>
                        {page.issues_count} issue{page.issues_count !== 1 ? "s" : ""}
                      </Tag>
                    )}
                    {analysis && (
                      <svg
                        className={`w-3 h-3 text-zinc-600 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                </button>

                {/* Expanded analysis */}
                {isExpanded && analysis && (
                  <div className="px-4 pb-4">
                    <PageAnalysisDetail analysis={analysis} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── Service Keywords ─────────────────────────────── */}
      {serviceKw && Object.keys(serviceKw).length > 0 && (
        <ServiceKeywordsSection data={serviceKw} />
      )}

      {/* ── Schema Recommendations ───────────────────────── */}
      {schemaRecs && Object.keys(schemaRecs).length > 0 && (
        <SchemaSection data={schemaRecs} />
      )}
    </div>
  );
}

/* ── Column definitions ──────────────────────────────────── */

const SCHEMA_COLUMNS: Column[] = [
  { key: "page", label: "Page" },
  { key: "schemas", label: "Recommended Schemas" },
];

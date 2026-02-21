"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import type {
  AuditResult,
  CrawledPage,
  SiteAggregate,
  HighIntentKeyword,
  Citation,
  LinkOpportunity,
  InternalLink,
  LocalPackEntry,
  GbpCheckItem,
  CitationRecommendation,
  LinkBuildingOpportunity,
} from "@/types";

// ── Root results component ────────────────────────────────────────────

export function AuditResults({ data }: { data: AuditResult }) {
  const [showJson, setShowJson] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const { data: session } = useSession();

  async function handleDownloadPdf() {
    setDownloading(true);
    setPdfError("");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
      const res = await fetch(`${apiUrl}/audits/${data.audit_id}/export`, {
        method: "POST",
        headers: {
          ...(session?.accessToken
            ? { Authorization: `Bearer ${session.accessToken}` }
            : {}),
        },
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `localrank-audit-${data.audit_id?.slice(0, 8)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setPdfError("PDF download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  const kw       = data.agents?.keyword_research?.recommendations;
  const op       = data.agents?.on_page_seo?.recommendations;
  const local    = data.agents?.local_seo?.recommendations;
  const rankData = data.agents?.rank_tracker;
  const gbpData  = data.agents?.gbp_audit;
  const citData  = data.agents?.citation_builder;
  const blData   = data.agents?.backlink_analysis;
  const lbData   = data.agents?.link_building;
  const aiData   = data.agents?.ai_seo;
  const rwData   = data.agents?.content_rewriter;

  // Build section nav entries from available data
  const sections: Array<{ id: string; label: string }> = [];
  if (typeof data.local_seo_score === "number") sections.push({ id: "sec-score", label: "Score" });
  if (data.site_aggregate && data.site_aggregate.pages_crawled > 0) sections.push({ id: "sec-crawl", label: "Site Crawl" });
  if (rankData) sections.push({ id: "sec-rankings", label: "Rankings" });
  if (data.summary?.quick_wins?.length > 0) sections.push({ id: "sec-quickwins", label: "Quick Wins" });
  if (kw) sections.push({ id: "sec-keywords", label: "Keywords" });
  if (op) sections.push({ id: "sec-onpage", label: "On-Page" });
  if (local) sections.push({ id: "sec-local", label: "Local SEO" });
  if (gbpData) sections.push({ id: "sec-gbp", label: "GBP" });
  if (citData) sections.push({ id: "sec-citations", label: "Citations" });
  if (blData) sections.push({ id: "sec-backlinks", label: "Backlinks" });
  if (lbData) sections.push({ id: "sec-linkbuilding", label: "Link Building" });
  if (aiData) sections.push({ id: "sec-aiseo", label: "AI SEO" });
  if (rwData) sections.push({ id: "sec-rewriter", label: "Content" });

  return (
    <div className="space-y-6">
      {/* Audit complete banner */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 rounded-full p-1 shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-white">Audit complete</p>
            <p className="text-sm text-emerald-400">
              {data.agents_executed} agents · {data.execution_time_seconds?.toFixed(1)}s · Est. cost ${data.summary?.estimated_api_cost?.toFixed(3)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-zinc-500 font-mono hidden sm:block">#{data.audit_id?.slice(0, 8)}</span>
          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="btn-secondary flex items-center gap-2 text-xs font-medium text-zinc-300 px-3 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading ? (
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            )}
            {downloading ? "Generating…" : "Download PDF"}
          </button>
        </div>
      </div>

      {/* PDF error banner (replaces alert) */}
      {pdfError && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="flex-1">{pdfError}</span>
          <button onClick={() => setPdfError("")} className="shrink-0 text-red-400 hover:text-red-300 transition-colors" aria-label="Dismiss">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Sticky section nav */}
      {sections.length > 3 && (
        <nav className="sticky top-0 z-40 bg-[#09090b]/90 backdrop-blur-md border-b border-white/5 -mx-6 px-6 py-2 overflow-x-auto scrollbar-none">
          <div className="flex gap-2">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="shrink-0 text-xs font-medium text-zinc-500 hover:text-white px-3 py-1.5 rounded-full border border-white/6 hover:border-emerald-500/20 transition-all"
              >
                {s.label}
              </a>
            ))}
          </div>
        </nav>
      )}

      {/* Local SEO Score */}
      {typeof data.local_seo_score === "number" && (
        <div id="sec-score" className="scroll-mt-14">
          <LocalSeoScoreCard
            score={data.local_seo_score}
            businessName={data.business_name}
            businessType={data.business_type}
          />
        </div>
      )}

      {/* Site Crawl — only shown when domain mode was used */}
      {data.site_aggregate && data.site_aggregate.pages_crawled > 0 && (
        <div id="sec-crawl" className="scroll-mt-14">
          <SiteCrawlSection
            aggregate={data.site_aggregate}
            pages={data.pages_crawled ?? []}
          />
        </div>
      )}

      {/* Rank Tracker */}
      {rankData && (
        <div id="sec-rankings" className="scroll-mt-14">
          <RankTrackerSection data={rankData} />
        </div>
      )}

      {/* Quick Wins */}
      {data.summary?.quick_wins?.length > 0 && (
        <div id="sec-quickwins" className="scroll-mt-14">
          <Card title="Quick Wins" icon="⚡" badgeColor="blue">
            <ul className="space-y-2">
              {data.summary.quick_wins.map((win, i) => (
                <li key={i} className="flex gap-3 text-zinc-300 text-sm">
                  <span className="text-[#6ee7b7] font-bold shrink-0 mt-0.5">→</span>
                  <span>{win}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {/* Keyword Research */}
      {kw && (
        <div id="sec-keywords" className="scroll-mt-14">
          <KeywordSection data={kw} competitorsAnalyzed={data.agents.keyword_research.competitors_analyzed} />
        </div>
      )}

      {/* On-Page SEO */}
      {op && (
        <div id="sec-onpage" className="scroll-mt-14">
          <OnPageSection data={op} pageScraped={data.agents.on_page_seo.page_scraped} />
        </div>
      )}

      {/* Local SEO */}
      {local && (
        <div id="sec-local" className="scroll-mt-14">
          <LocalSection data={local} />
        </div>
      )}

      {/* GBP Audit */}
      {gbpData && (
        <div id="sec-gbp" className="scroll-mt-14">
          <GbpAuditSection data={gbpData} />
        </div>
      )}

      {/* Citation Builder */}
      {citData && (
        <div id="sec-citations" className="scroll-mt-14">
          <CitationBuilderSection data={citData} />
        </div>
      )}

      {/* Backlink Analysis */}
      {blData && (
        <div id="sec-backlinks" className="scroll-mt-14">
          <BacklinkSection data={blData} />
        </div>
      )}

      {/* Link Building */}
      {lbData && (
        <div id="sec-linkbuilding" className="scroll-mt-14">
          <LinkBuildingSection data={lbData} />
        </div>
      )}

      {/* AI SEO */}
      {aiData && (
        <div id="sec-aiseo" className="scroll-mt-14">
          <AiSeoSection data={aiData} />
        </div>
      )}

      {/* Content Rewriter */}
      {rwData && (
        <div id="sec-rewriter" className="scroll-mt-14">
          <ContentRewriterSection data={rwData} />
        </div>
      )}

      {/* Raw JSON — dev only */}
      {process.env.NODE_ENV === "development" && (
        <div className="glass rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowJson((v) => !v)}
            className="w-full flex items-center justify-between px-6 py-4 text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors"
          >
            <span>View raw JSON</span>
            <svg
              className={`w-4 h-4 transition-transform ${showJson ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showJson && (
            <pre className="bg-[#09090b] text-zinc-300 p-6 text-xs overflow-auto max-h-[32rem] leading-relaxed border-t border-white/5">
              {JSON.stringify(data, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

// ── Site Crawl section ────────────────────────────────────────────────

export function SiteCrawlSection({
  aggregate,
  pages,
}: {
  aggregate: SiteAggregate;
  pages: CrawledPage[];
}) {
  const [showPages, setShowPages] = useState(false);

  const stats = [
    { label: "Pages crawled", value: aggregate.pages_crawled, color: "text-blue-400" },
    { label: "Avg word count", value: aggregate.avg_word_count, color: "text-zinc-200" },
    { label: "Thin pages", value: aggregate.thin_content_count, color: aggregate.thin_content_count > 0 ? "text-amber-400" : "text-emerald-400" },
    { label: "Coverage score", value: `${aggregate.coverage_score}/100`, color: aggregate.coverage_score >= 80 ? "text-emerald-400" : aggregate.coverage_score >= 50 ? "text-amber-400" : "text-red-400" },
  ];

  return (
    <Card title="Site-Wide Crawl" icon="🕷️" badgeColor="blue">
      {/* Stat tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {stats.map((s) => (
          <div key={s.label} className="bg-white/5 rounded-xl p-3 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-zinc-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Missing meta bar */}
      {aggregate.pages_crawled > 0 && (
        <div className="space-y-2 mb-4">
          {[
            { label: "Missing title tags", count: aggregate.missing_title },
            { label: "Missing meta descriptions", count: aggregate.missing_meta_description },
            { label: "Missing H1s", count: aggregate.missing_h1 },
          ].map(({ label, count }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="text-xs text-zinc-400 w-44 shrink-0">{label}</span>
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${count > 0 ? "bg-red-500" : "bg-emerald-500"}`}
                  style={{ width: `${(count / aggregate.pages_crawled) * 100}%` }}
                />
              </div>
              <span className={`text-xs font-medium w-8 text-right ${count > 0 ? "text-red-400" : "text-emerald-400"}`}>
                {count}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Per-page breakdown toggle */}
      {pages.length > 0 && (
        <div>
          <button
            onClick={() => setShowPages((v) => !v)}
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            {showPages ? "Hide" : "Show"} per-page breakdown ({pages.length} pages)
            <svg className={`w-3 h-3 transition-transform ${showPages ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showPages && (
            <div className="mt-3 space-y-2">
              {pages.map((page, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-3">
                  <div className="flex items-start justify-between gap-2">
                    <a
                      href={page.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:underline font-mono break-all"
                    >
                      {page.url}
                    </a>
                    <span className="text-xs text-zinc-500 shrink-0">{page.word_count} words</span>
                  </div>
                  {page.title && (
                    <p className="text-xs text-zinc-300 mt-1 truncate">{page.title}</p>
                  )}
                  {page.issues.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {page.issues.map((issue, j) => (
                        <span key={j} className="text-[10px] bg-red-500/15 text-red-400 px-2 py-0.5 rounded-full">
                          {issue}
                        </span>
                      ))}
                    </div>
                  )}
                  {page.issues.length === 0 && (
                    <span className="text-[10px] text-emerald-400 mt-1 block">No issues found</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}


// ── Rank Tracker section ──────────────────────────────────────────────

export function RankTrackerSection({ data }: { data: NonNullable<AuditResult["agents"]["rank_tracker"]> }) {
  const r = data.rankings;

  function healthColor(h: string) {
    if (h === "excellent") return "text-emerald-400";
    if (h === "good") return "text-blue-400";
    if (h === "improving") return "text-yellow-400";
    if (h === "needs_work") return "text-orange-400";
    return "text-zinc-500";
  }

  function rankLabel(rank: number | null, type: "organic" | "map") {
    if (!rank) return type === "map" ? "Not in pack" : "Not in top 20";
    return `#${rank}`;
  }

  return (
    <Card title="Rankings" icon="📊" badge={`Live snapshot`} badgeColor="slate">
      {/* Rank tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <RankTile
          label="Organic Rank"
          value={rankLabel(r.organic_rank, "organic")}
          sub={r.organic_health.replace(/_/g, " ")}
          color={healthColor(r.organic_health)}
        />
        <RankTile
          label="Map Pack"
          value={rankLabel(r.map_pack_rank, "map")}
          sub={r.map_pack_health.replace(/_/g, " ")}
          color={healthColor(r.map_pack_health)}
        />
        <RankTile
          label="To Page 1"
          value={r.positions_to_page_1 === 0 ? "✓ On P1" : `${r.positions_to_page_1} positions`}
          sub={r.in_top_10 ? "already top 10" : "to close"}
          color={r.in_top_10 ? "text-emerald-400" : "text-zinc-400"}
        />
        <RankTile
          label="SERP Features"
          value={data.serp_features.length.toString()}
          sub={data.serp_features.join(", ") || "none detected"}
          color="text-zinc-400"
        />
      </div>

      {/* Local pack */}
      {data.local_pack.length > 0 && (
        <div className="mb-4">
          <SectionHeading>Map Pack — Top 3</SectionHeading>
          <div className="space-y-2">
            {data.local_pack.map((e: LocalPackEntry) => (
              <div key={e.rank} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 border border-white/5">
                <span className="text-lg font-black text-zinc-500 w-5 shrink-0">#{e.rank}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{e.title}</p>
                  <p className="text-xs text-zinc-500 truncate">{e.address}</p>
                </div>
                {e.rating && (
                  <span className="text-xs text-amber-400 shrink-0">
                    {e.rating}★ ({e.reviews?.toLocaleString()})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top organic */}
      {data.top_10_organic.length > 0 && (
        <div>
          <SectionHeading>Top Organic Competitors</SectionHeading>
          <div className="space-y-1.5">
            {data.top_10_organic.slice(0, 5).map((r) => (
              <div key={r.rank} className="flex items-center gap-3 text-sm">
                <span className="text-xs text-zinc-600 font-mono w-5 shrink-0">#{r.rank}</span>
                <span className="text-zinc-300 truncate flex-1">{r.title}</span>
                <span className="text-xs text-zinc-600 truncate max-w-[180px] hidden sm:block">{r.url.replace(/^https?:\/\/(www\.)?/, "")}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function RankTile({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/5 text-center">
      <p className="text-xs text-zinc-500 mb-1">{label}</p>
      <p className={`text-xl font-black ${color}`}>{value}</p>
      <p className="text-xs text-zinc-600 mt-0.5 capitalize truncate">{sub}</p>
    </div>
  );
}

// ── GBP Audit section ─────────────────────────────────────────────────

export function GbpAuditSection({ data }: { data: NonNullable<AuditResult["agents"]["gbp_audit"]> }) {
  const a = data.analysis;
  if (!a) return null;

  const score = a.gbp_score ?? 0;
  const scoreColor = score >= 70 ? "text-emerald-400" : score >= 40 ? "text-yellow-400" : "text-red-400";
  const barColor   = score >= 70 ? "bg-emerald-500" : score >= 40 ? "bg-yellow-400"   : "bg-red-500";

  const checkColors: Record<string, string> = {
    pass:    "text-emerald-400",
    warn:    "text-yellow-400",
    fail:    "text-red-400",
    unknown: "text-zinc-500",
  };
  const checkIcons: Record<string, string> = {
    pass: "✓", warn: "⚠", fail: "✕", unknown: "?",
  };

  return (
    <Card
      title="GBP Audit"
      icon="🗺️"
      badge={a.map_pack_status?.in_pack ? `In pack #${a.map_pack_status.current_rank}` : "Not in pack"}
      badgeColor={a.map_pack_status?.in_pack ? "green" : "amber"}
    >
      {/* Score bar */}
      <div className="mb-6">
        <div className="flex items-end justify-between mb-2">
          <p className="text-sm text-zinc-400">GBP Optimisation Score</p>
          <span className={`text-3xl font-black ${scoreColor}`}>{score}<span className="text-lg font-normal text-zinc-600">/100</span></span>
        </div>
        <div className="bg-white/10 rounded-full h-2 overflow-hidden">
          <div className={`h-2 rounded-full ${barColor} transition-all duration-500`} style={{ width: `${score}%` }} />
        </div>
        {a.summary && (
          <p className="text-xs text-zinc-500 mt-2">After fixes: <span className="text-zinc-300">{a.summary.score_after_fixes}/100</span> · Timeline: <span className="text-zinc-300">{a.summary.estimated_pack_entry_timeline}</span></p>
        )}
      </div>

      {/* Completeness checklist */}
      {a.completeness_audit && Object.keys(a.completeness_audit).length > 0 && (
        <div className="mb-6">
          <SectionHeading>Profile Completeness</SectionHeading>
          <div className="grid md:grid-cols-2 gap-2">
            {Object.entries(a.completeness_audit).map(([key, val]) => {
              const item = val as GbpCheckItem;
              return (
                <div key={key} className="flex items-start gap-2 bg-white/5 rounded-lg px-3 py-2.5 border border-white/5">
                  <span className={`text-sm font-bold shrink-0 mt-0.5 ${checkColors[item.status] ?? "text-zinc-500"}`}>
                    {checkIcons[item.status] ?? "?"}
                  </span>
                  <div>
                    <p className="text-xs font-medium text-zinc-300 capitalize">{key.replace(/_/g, " ")}</p>
                    <p className="text-xs text-zinc-500">{item.note}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Priority actions */}
      {a.priority_actions?.length > 0 && (
        <div className="mb-6">
          <SectionHeading>Priority Actions</SectionHeading>
          <div className="space-y-3">
            {a.priority_actions.map((action, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <ImpactBadge impact={action.impact} />
                  <EffortBadge effort={action.effort} />
                  <p className="text-sm font-semibold text-white flex-1">{action.action}</p>
                </div>
                <p className="text-xs text-zinc-500 mb-1">{action.reason}</p>
                {action.how_to && (
                  <p className="text-xs text-[#6ee7b7]/70 border-l-2 border-[#6ee7b7]/30 pl-3">{action.how_to}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review strategy */}
      {a.review_strategy && (
        <div className="mb-6">
          <SectionHeading>Review Strategy</SectionHeading>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
            <p className="text-sm text-emerald-300 mb-2">{a.review_strategy.recommended_target}</p>
            {a.review_strategy.acquisition_tactics?.length > 0 && (
              <ul className="space-y-1">
                {a.review_strategy.acquisition_tactics.map((t: string, i: number) => (
                  <li key={i} className="text-xs text-zinc-400 flex gap-2"><span className="text-[#6ee7b7]">→</span>{t}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Competitor insights */}
      {a.competitor_insights && (
        <div>
          <SectionHeading>Competitor Insights</SectionHeading>
          <div className="grid md:grid-cols-2 gap-3">
            {a.competitor_insights.what_competitors_do_better?.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <p className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-2">They do better</p>
                <ul className="space-y-1">
                  {a.competitor_insights.what_competitors_do_better.map((s: string, i: number) => (
                    <li key={i} className="text-xs text-zinc-400">· {s}</li>
                  ))}
                </ul>
              </div>
            )}
            {a.competitor_insights.gaps_to_exploit?.length > 0 && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wide mb-2">Gaps to exploit</p>
                <ul className="space-y-1">
                  {a.competitor_insights.gaps_to_exploit.map((s: string, i: number) => (
                    <li key={i} className="text-xs text-zinc-400">· {s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

// ── Citation Builder section ───────────────────────────────────────────

export function CitationBuilderSection({ data }: { data: NonNullable<AuditResult["agents"]["citation_builder"]> }) {
  const [showNap, setShowNap] = useState(false);
  const plan = data.plan;
  if (!plan) return null;

  const recs = plan.recommendations ?? {};
  const tier1 = recs.tier_1_critical ?? [];
  const tier2 = recs.tier_2_important ?? [];
  const tier3 = recs.tier_3_supplemental ?? [];
  const summary = plan.summary;

  return (
    <Card
      title="Citation Builder"
      icon="📋"
      badge={`${summary?.total_recommended ?? tier1.length + tier2.length + tier3.length} citations`}
      badgeColor="blue"
    >
      {/* Summary row */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <CitStat label="Tier 1" value={summary.tier_1_count} color="text-red-400" />
          <CitStat label="Tier 2" value={summary.tier_2_count} color="text-orange-400" />
          <CitStat label="Tier 3" value={summary.tier_3_count} color="text-zinc-400" />
          <CitStat label="DA Impact" value={summary.estimated_da_impact ?? "—"} color="text-emerald-400" isText />
        </div>
      )}

      <CitationTierList title="Tier 1 — Critical (submit first)" items={tier1} accentClass="border-red-500/30 bg-red-500/5" labelClass="text-red-400" />
      <CitationTierList title="Tier 2 — Important" items={tier2} accentClass="border-orange-500/30 bg-orange-500/5" labelClass="text-orange-400" />
      {tier3.length > 0 && (
        <CitationTierList title="Tier 3 — Supplemental" items={tier3} accentClass="border-white/10 bg-white/5" labelClass="text-zinc-400" />
      )}

      {/* NAP consistency rules */}
      {plan.consistency_rules?.length > 0 && (
        <div className="mb-4">
          <SectionHeading>NAP Consistency Rules</SectionHeading>
          <ul className="space-y-1.5">
            {plan.consistency_rules.map((rule: string, i: number) => (
              <li key={i} className="text-xs text-zinc-400 flex gap-2">
                <span className="text-[#6ee7b7] shrink-0">→</span>{rule}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* NAP template */}
      {plan.nap_template && (
        <div>
          <button
            onClick={() => setShowNap(v => !v)}
            className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 mb-2"
          >
            <svg className={`w-3.5 h-3.5 transition-transform ${showNap ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
            {showNap ? "Hide" : "Show"} NAP template (copy for all submissions)
          </button>
          {showNap && (
            <div className="bg-[#09090b] border border-white/10 rounded-xl p-4 text-xs text-zinc-300 font-mono leading-relaxed space-y-1">
              <p><span className="text-zinc-500">Name: </span>{plan.nap_template.business_name}</p>
              <p><span className="text-zinc-500">Address: </span>{plan.nap_template.address}</p>
              <p><span className="text-zinc-500">Phone: </span>{plan.nap_template.phone}</p>
              <p><span className="text-zinc-500">Website: </span>{plan.nap_template.website}</p>
              <p><span className="text-zinc-500">Categories: </span>{plan.nap_template.categories?.join(", ")}</p>
              {plan.nap_template.description && (
                <div className="mt-2 pt-2 border-t border-white/10 font-sans text-zinc-400 leading-relaxed">
                  {plan.nap_template.description}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function CitStat({ label, value, color, isText }: { label: string; value: number | string; color: string; isText?: boolean }) {
  return (
    <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-center">
      <p className="text-xs text-zinc-500 mb-1">{label}</p>
      <p className={`${isText ? "text-xs leading-tight" : "text-xl font-black"} ${color}`}>{value}</p>
    </div>
  );
}

function CitationTierList({ title, items, accentClass, labelClass }: {
  title: string;
  items: CitationRecommendation[];
  accentClass: string;
  labelClass: string;
}) {
  if (!items.length) return null;
  return (
    <div className="mb-5">
      <SectionHeading>{title}</SectionHeading>
      <div className="space-y-2">
        {items.map((c: CitationRecommendation, i: number) => (
          <div key={i} className={`border rounded-xl px-4 py-3 ${accentClass}`}>
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <p className="text-sm font-semibold text-white">{c.name}</p>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-zinc-500 font-mono">DA:{c.da}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.free ? "bg-emerald-500/15 text-emerald-400" : "bg-zinc-500/15 text-zinc-400"}`}>
                  {c.free ? "FREE" : "PAID"}
                </span>
              </div>
            </div>
            {c.reason && <p className="text-xs text-zinc-500 mb-1">{c.reason}</p>}
            {c.submit_url && (
              <a href={c.submit_url} target="_blank" rel="noopener noreferrer" className={`text-xs font-medium ${labelClass} hover:underline`}>
                Submit listing →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Backlink Analysis section ─────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function BacklinkSection({ data }: { data: any }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = data?.analysis as any;
  if (!a) return null;

  const client = a.client ?? {};
  const isVerified = client.data_source === "verified";
  const da = client.domain_authority ?? 0;
  const pa = client.page_authority ?? 0;

  return (
    <Card
      title="Backlink Analysis"
      icon="🔗"
      badge={isVerified ? "Moz verified" : "AI estimated"}
      badgeColor={isVerified ? "green" : "slate"}
    >
      {/* DA / PA tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <RankTile label="Domain Authority" value={String(da)} sub={isVerified ? "verified" : "estimated"} color={da >= 50 ? "text-emerald-400" : da >= 30 ? "text-yellow-400" : "text-red-400"} />
        <RankTile label="Page Authority" value={String(pa)} sub={isVerified ? "verified" : "estimated"} color={pa >= 40 ? "text-emerald-400" : pa >= 20 ? "text-yellow-400" : "text-red-400"} />
        {client.linking_domains != null && (
          <RankTile label="Linking Domains" value={client.linking_domains.toLocaleString()} sub="unique root domains" color="text-zinc-300" />
        )}
        {client.spam_score != null && (
          <RankTile label="Spam Score" value={`${client.spam_score}%`} sub={client.spam_score < 5 ? "healthy" : "review needed"} color={client.spam_score < 5 ? "text-emerald-400" : "text-red-400"} />
        )}
      </div>

      {/* Competitor comparison */}
      {a.competitors?.length > 0 && (
        <div className="mb-6">
          <SectionHeading>Competitor Comparison</SectionHeading>
          <div className="space-y-2">
            {a.competitors.map((comp: { url: string; domain_authority: number; page_authority: number; data_source: string }, i: number) => {
              const cDa = comp.domain_authority ?? 0;
              const gap = cDa - da;
              return (
                <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 border border-white/5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-300 truncate">{comp.url.replace(/^https?:\/\/(www\.)?/, "")}</p>
                    <p className="text-xs text-zinc-500">DA:{cDa} · PA:{comp.page_authority}</p>
                  </div>
                  <span className={`text-xs font-semibold shrink-0 ${gap > 0 ? "text-red-400" : "text-emerald-400"}`}>
                    {gap > 0 ? `+${gap} ahead` : gap < 0 ? `${gap} behind` : "tied"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Issues */}
      {a.top_issues?.length > 0 && (
        <div className="mb-6">
          <SectionHeading>Top Issues</SectionHeading>
          <ul className="space-y-1.5">
            {a.top_issues.map((issue: string, i: number) => (
              <li key={i} className="flex gap-2 text-sm text-red-400">
                <span className="shrink-0 mt-0.5">✕</span>{issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Quick wins */}
      {a.quick_wins?.length > 0 && (
        <div>
          <SectionHeading>Quick Wins</SectionHeading>
          <ul className="space-y-1.5">
            {a.quick_wins.map((win: string, i: number) => (
              <li key={i} className="flex gap-2 text-sm text-zinc-300">
                <span className="text-[#6ee7b7] shrink-0 mt-0.5">→</span>{win}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

// ── Link Building section ─────────────────────────────────────────────

const LB_CATEGORIES: Array<{ key: keyof NonNullable<AuditResult["agents"]["link_building"]>["recommendations"]; label: string; icon: string }> = [
  { key: "quick_wins",         label: "Quick Wins",          icon: "⚡" },
  { key: "guest_posting",      label: "Guest Posting",       icon: "✍️" },
  { key: "resource_pages",     label: "Resource Pages",      icon: "📚" },
  { key: "local_opportunities",label: "Local Opportunities", icon: "🏙️" },
  { key: "competitor_gaps",    label: "Competitor Gaps",     icon: "🎯" },
];

export function LinkBuildingSection({ data }: { data: NonNullable<AuditResult["agents"]["link_building"]> }) {
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  const recs = data.recommendations;
  const summary = recs.summary;

  return (
    <Card title="Link Building" icon="🔗" badge={`${data.total_opportunities} opportunities`} badgeColor="blue">
      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <RankTile label="Total" value={String(summary.total_opportunities)} sub="opportunities" color="text-zinc-300" />
          <RankTile label="DA Gain (3mo)" value={summary.estimated_da_gain_3mo} sub="estimated" color="text-emerald-400" />
          <RankTile label="Monthly Target" value={`${summary.monthly_link_target} links`} sub="per month" color="text-blue-400" />
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <p className="text-xs text-zinc-500 mb-1">Priority Order</p>
            <ol className="space-y-0.5">
              {summary.priority_order?.slice(0, 3).map((cat: string, i: number) => (
                <li key={i} className="text-xs text-zinc-400 capitalize">{i + 1}. {cat.replace(/_/g, " ")}</li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* Categories */}
      {LB_CATEGORIES.map(({ key, label, icon }) => {
        const items = (recs[key] as LinkBuildingOpportunity[]) ?? [];
        if (!items.length) return null;
        return (
          <div key={key} className="mb-6">
            <SectionHeading>{icon} {label} ({items.length})</SectionHeading>
            <div className="space-y-2">
              {items.map((item: LinkBuildingOpportunity, i: number) => {
                const tid = `${key}-${i}`;
                const isOpen = expandedTemplate === tid;
                return (
                  <div key={i} className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                    <div className="px-4 py-3">
                      <div className="flex items-start gap-2 mb-1">
                        <p className="text-sm font-semibold text-white flex-1">{item.name}</p>
                        <span className="text-xs bg-white/10 text-zinc-400 px-2 py-0.5 rounded-full shrink-0">DA {item.expected_da}</span>
                        <EffortBadge effort={item.difficulty} />
                      </div>
                      <p className="text-xs text-zinc-500 mb-2">
                        {item.reason ?? item.topic_idea ?? item.angle ?? ""}
                      </p>
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline mr-3">
                          {item.url.replace(/^https?:\/\/(www\.)?/, "").slice(0, 50)}
                        </a>
                      )}
                      {item.outreach_template && (
                        <button
                          onClick={() => setExpandedTemplate(isOpen ? null : tid)}
                          className="text-xs text-[#6ee7b7] hover:underline"
                        >
                          {isOpen ? "Hide template" : "View outreach template"}
                        </button>
                      )}
                    </div>
                    {isOpen && item.outreach_template && (
                      <div className="border-t border-white/5 px-4 pb-4 pt-3 bg-[#09090b]/60">
                        <p className="text-xs font-medium text-zinc-500 mb-1">Subject:</p>
                        <p className="text-xs text-zinc-300 font-mono mb-3 bg-white/5 px-3 py-2 rounded-lg">{item.outreach_template.subject}</p>
                        <p className="text-xs font-medium text-zinc-500 mb-1">Body:</p>
                        <pre className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap bg-white/5 px-3 py-2 rounded-lg">{item.outreach_template.body}</pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </Card>
  );
}

// ── AI SEO section ────────────────────────────────────────────────────

export function AiSeoSection({ data }: { data: NonNullable<AuditResult["agents"]["ai_seo"]> }) {
  const [expandedSchema, setExpandedSchema] = useState<number | null>(null);
  const [showAllFaq, setShowAllFaq] = useState(false);
  const a = data.analysis;
  if (!a) return null;

  const score = a.ai_visibility_score ?? 0;
  const scoreColor = score >= 70 ? "text-emerald-400" : score >= 40 ? "text-yellow-400" : "text-red-400";
  const barColor   = score >= 70 ? "bg-emerald-500" : score >= 40 ? "bg-yellow-400"   : "bg-red-500";

  const likelihoodColors: Record<string, string> = {
    low: "bg-red-500/15 text-red-400",
    medium: "bg-yellow-500/15 text-yellow-400",
    high: "bg-emerald-500/15 text-emerald-400",
  };

  const signals = data.signals_collected;

  return (
    <Card
      title="AI SEO Visibility"
      icon="🤖"
      badge={`Score: ${score}/100`}
      badgeColor={score >= 70 ? "green" : score >= 40 ? "amber" : "red"}
    >
      {/* Score + likelihood */}
      <div className="flex items-start gap-4 mb-5">
        <div className="flex-1">
          <div className="flex items-end justify-between mb-2">
            <p className="text-sm text-zinc-400">AI Visibility Score</p>
            <span className={`text-3xl font-black ${scoreColor}`}>{score}<span className="text-lg font-normal text-zinc-600">/100</span></span>
          </div>
          <div className="bg-white/10 rounded-full h-2 overflow-hidden">
            <div className={`h-2 rounded-full ${barColor} transition-all duration-500`} style={{ width: `${score}%` }} />
          </div>
          {a.summary && (
            <p className="text-xs text-zinc-500 mt-1">After fixes: {a.summary.estimated_score_after_fixes}/100 · {a.summary.time_to_implement}</p>
          )}
        </div>
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full capitalize shrink-0 ${likelihoodColors[a.ai_mention_likelihood] ?? "bg-white/10 text-zinc-400"}`}>
          {a.ai_mention_likelihood} likelihood
        </span>
      </div>

      {/* Score breakdown */}
      {a.score_breakdown && (
        <div className="mb-6">
          <SectionHeading>Score Breakdown</SectionHeading>
          <div className="space-y-2">
            {Object.entries(a.score_breakdown).map(([dim, val]) => {
              const max = dim === "schema_markup" ? 25 : dim === "eeat_signals" ? 25 : dim === "faq_content" ? 20 : dim === "content_depth" ? 20 : 10;
              const pct = Math.round(((val as number) / max) * 100);
              return (
                <div key={dim} className="flex items-center gap-3">
                  <p className="text-xs text-zinc-500 w-36 capitalize shrink-0">{dim.replace(/_/g, " ")}</p>
                  <div className="flex-1 bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div className="h-1.5 rounded-full bg-[#6ee7b7]" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-zinc-400 w-12 text-right tabular-nums">{val as number}/{max}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI answer preview */}
      {a.ai_answer_preview && (
        <div className="mb-6">
          <SectionHeading>AI Answer Preview</SectionHeading>
          <div className="bg-[#09090b] border border-white/10 rounded-xl p-4 text-sm text-zinc-300 leading-relaxed italic">
            &ldquo;{a.ai_answer_preview}&rdquo;
          </div>
        </div>
      )}

      {/* Current gaps */}
      {a.current_gaps?.length > 0 && (
        <div className="mb-6">
          <SectionHeading>Current Gaps</SectionHeading>
          <ul className="space-y-1.5">
            {a.current_gaps.map((gap: string, i: number) => (
              <li key={i} className="flex gap-2 text-sm text-red-400">
                <span className="shrink-0 mt-0.5">✕</span>{gap}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Schema signals */}
      {(signals.schema_types_found.length > 0 || signals.schema_types_missing.length > 0) && (
        <div className="mb-6">
          <SectionHeading>Schema Markup</SectionHeading>
          <div className="grid md:grid-cols-2 gap-2">
            {signals.schema_types_found.length > 0 && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                <p className="text-xs font-medium text-emerald-400 mb-1.5">Found ({signals.schema_types_found.length})</p>
                <div className="flex flex-wrap gap-1">
                  {signals.schema_types_found.map((s: string, i: number) => (
                    <span key={i} className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {signals.schema_types_missing.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <p className="text-xs font-medium text-red-400 mb-1.5">Missing ({signals.schema_types_missing.length})</p>
                <div className="flex flex-wrap gap-1">
                  {signals.schema_types_missing.map((s: string, i: number) => (
                    <span key={i} className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Priority actions */}
      {a.priority_actions?.length > 0 && (
        <div className="mb-6">
          <SectionHeading>Priority Actions</SectionHeading>
          <div className="space-y-3">
            {a.priority_actions.map((action: { action: string; impact: string; effort: string; why: string; how: string }, i: number) => (
              <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <ImpactBadge impact={action.impact} />
                  <EffortBadge effort={action.effort} />
                  <p className="text-sm font-semibold text-white flex-1">{action.action}</p>
                </div>
                <p className="text-xs text-zinc-500 mb-1">{action.why}</p>
                <p className="text-xs text-[#6ee7b7]/70 border-l-2 border-[#6ee7b7]/30 pl-3">{action.how}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schema templates */}
      {a.schema_templates?.length > 0 && (
        <div className="mb-6">
          <SectionHeading>Schema Templates (ready to paste)</SectionHeading>
          <div className="space-y-2">
            {a.schema_templates.map((tmpl: { type: string; priority: string; description: string; json_ld: string }, i: number) => (
              <div key={i} className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                <button
                  onClick={() => setExpandedSchema(expandedSchema === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={tmpl.priority} />
                    <p className="text-sm font-semibold text-white">{tmpl.type}</p>
                  </div>
                  <svg className={`w-4 h-4 text-zinc-500 transition-transform ${expandedSchema === i ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedSchema === i && (
                  <div className="border-t border-white/5 p-4 bg-[#09090b]/60">
                    <p className="text-xs text-zinc-400 mb-3">{tmpl.description}</p>
                    <pre className="text-xs text-zinc-300 bg-white/5 p-3 rounded-lg overflow-auto max-h-64 leading-relaxed whitespace-pre-wrap">{
                      (() => { try { return JSON.stringify(JSON.parse(tmpl.json_ld), null, 2); } catch { return tmpl.json_ld; } })()
                    }</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ content */}
      {a.faq_content?.length > 0 && (
        <div>
          <SectionHeading>FAQ Content (AI-optimised)</SectionHeading>
          <div className="space-y-3">
            {(showAllFaq ? a.faq_content : a.faq_content.slice(0, 4)).map(
              (faq: { question: string; answer: string; ai_intent: string }, i: number) => (
                <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm font-semibold text-white">{faq.question}</p>
                    <span className="text-xs bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded-full shrink-0 capitalize">{faq.ai_intent?.replace(/-/g, " ")}</span>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">{faq.answer}</p>
                </div>
              )
            )}
          </div>
          {a.faq_content.length > 4 && (
            <button onClick={() => setShowAllFaq(v => !v)} className="mt-3 text-xs text-zinc-500 hover:text-zinc-300 underline">
              {showAllFaq ? "Show less" : `Show ${a.faq_content.length - 4} more Q&As`}
            </button>
          )}
        </div>
      )}
    </Card>
  );
}

// ── Content Rewriter section ──────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ContentRewriterSection({ data }: { data: any }) {
  const [showContent, setShowContent] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const analysis = data?.analysis as any;
  const content  = data?.rewritten_content as string | undefined;
  const wc       = data?.word_count as number | undefined;

  return (
    <Card title="Content Rewriter" icon="✍️" badge={wc ? `${wc.toLocaleString()} words` : undefined} badgeColor="blue">
      {/* Benchmark */}
      {analysis?.benchmark && (
        <div className="mb-5">
          <SectionHeading>Content Benchmark</SectionHeading>
          <div className="grid grid-cols-3 gap-3">
            <RankTile label="Current" value={String(analysis.benchmark.current_word_count ?? 0)} sub="words" color="text-red-400" />
            <RankTile label="Competitor Avg" value={String(analysis.benchmark.avg_competitor_word_count ?? 0)} sub="words" color="text-zinc-400" />
            <RankTile label="Target" value={String(analysis.benchmark.target_word_count ?? 0)} sub="words" color="text-emerald-400" />
          </div>
        </div>
      )}

      {/* SEO template */}
      {analysis?.seo_template && (
        <div className="mb-5">
          <SectionHeading>SEO Template</SectionHeading>
          <div className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-2 text-sm">
            {analysis.seo_template.primary_keyword && (
              <p><span className="text-zinc-500">Primary: </span><span className="text-white">{analysis.seo_template.primary_keyword}</span></p>
            )}
            {analysis.seo_template.keyword_density_target && (
              <p><span className="text-zinc-500">Density target: </span><span className="text-white">{analysis.seo_template.keyword_density_target}</span></p>
            )}
            {analysis.seo_template.lsi_keywords?.length > 0 && (
              <div>
                <p className="text-zinc-500 mb-1.5">LSI keywords:</p>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.seo_template.lsi_keywords.map((k: string, i: number) => (
                    <span key={i} className="text-xs bg-blue-500/15 text-blue-300 px-2 py-0.5 rounded-full">{k}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick wins from analysis */}
      {analysis?.quick_wins?.length > 0 && (
        <div className="mb-5">
          <SectionHeading>Quick Wins</SectionHeading>
          <ul className="space-y-1.5">
            {analysis.quick_wins.map((w: string, i: number) => (
              <li key={i} className="text-sm text-zinc-300 flex gap-2"><span className="text-[#6ee7b7] shrink-0">→</span>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Rewritten content */}
      {content && (
        <div>
          <button
            onClick={() => setShowContent(v => !v)}
            className="flex items-center gap-2 text-sm font-medium text-[#6ee7b7] hover:text-[#a7f3d0] mb-3"
          >
            <svg className={`w-4 h-4 transition-transform ${showContent ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
            {showContent ? "Hide" : "Show"} rewritten content ({wc?.toLocaleString()} words)
          </button>
          {showContent && (
            <div className="bg-[#09090b] border border-white/10 rounded-xl p-5 text-sm text-zinc-300 leading-relaxed max-h-[32rem] overflow-y-auto whitespace-pre-wrap font-sans">
              {content}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

// ── Keyword Research section ──────────────────────────────────────────

export function KeywordSection({
  data,
  competitorsAnalyzed,
}: {
  data: ReturnType<typeof getKw>;
  competitorsAnalyzed: number;
}) {
  return (
    <Card title="Keyword Research" icon="🔍" badge={`${competitorsAnalyzed} competitors analysed`}>
      {data.high_intent_keywords?.length > 0 && (
        <div className="mb-6">
          <SectionHeading>High-Intent Keywords</SectionHeading>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs text-zinc-500 uppercase tracking-wide">
                  <th className="pb-2 font-medium">Keyword</th>
                  <th className="pb-2 font-medium">Intent</th>
                  <th className="pb-2 font-medium text-right">Searches/mo</th>
                  <th className="pb-2 font-medium text-right">Difficulty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.high_intent_keywords.slice(0, 10).map((k: HighIntentKeyword, i: number) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="py-2.5 font-medium text-white">{k.keyword}</td>
                    <td className="py-2.5"><IntentBadge intent={k.intent} /></td>
                    <td className="py-2.5 text-right text-zinc-400 tabular-nums">
                      {k.estimated_monthly_searches?.toLocaleString() ?? "—"}
                    </td>
                    <td className="py-2.5 text-right"><DifficultyBadge difficulty={k.difficulty} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data.long_tail_keywords?.length > 0 && (
        <div className="mb-6">
          <SectionHeading>Long-Tail Opportunities</SectionHeading>
          <div className="flex flex-wrap gap-2">
            {data.long_tail_keywords.map((lt: string, i: number) => (
              <span key={i} className="bg-blue-500/10 text-blue-300 border border-blue-500/20 text-xs font-medium px-3 py-1.5 rounded-full">{lt}</span>
            ))}
          </div>
        </div>
      )}

      {data.keyword_clusters?.length > 0 && (
        <div className="mb-6">
          <SectionHeading>Keyword Clusters</SectionHeading>
          <div className="grid md:grid-cols-2 gap-3">
            {data.keyword_clusters.map((c: { theme: string; keywords: string[] }, i: number) => (
              <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/5">
                <p className="font-semibold text-white text-sm mb-2">{c.theme}</p>
                <p className="text-xs text-zinc-500 leading-relaxed">{c.keywords?.join(" · ")}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.competitor_keywords_we_miss?.length > 0 && (
        <div className="mb-6">
          <SectionHeading>Competitor Keyword Gaps</SectionHeading>
          <div className="flex flex-wrap gap-2">
            {data.competitor_keywords_we_miss.map((kw: string, i: number) => (
              <span key={i} className="bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-medium px-3 py-1.5 rounded-full">{kw}</span>
            ))}
          </div>
        </div>
      )}

      {data.recommendation && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-300 leading-relaxed">
          {data.recommendation}
        </div>
      )}
    </Card>
  );
}

// ── On-Page SEO section ───────────────────────────────────────────────

export function OnPageSection({
  data,
  pageScraped,
}: {
  data: ReturnType<typeof getOp>;
  pageScraped: boolean;
}) {
  const current = data.current_analysis;
  const recs    = data.recommendations;

  return (
    <Card
      title="On-Page SEO"
      icon="📄"
      badge={pageScraped ? `Score: ${current?.seo_score ?? "?"}/10` : "Page not scraped"}
      badgeColor={
        !pageScraped ? "slate"
        : (current?.seo_score ?? 0) >= 7 ? "green"
        : (current?.seo_score ?? 0) >= 4 ? "amber"
        : "red"
      }
    >
      {current?.issues_found?.length > 0 && (
        <div className="mb-6">
          <SectionHeading>Issues Found</SectionHeading>
          <ul className="space-y-1.5">
            {current.issues_found.map((issue: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-red-400">
                <span className="text-red-500 shrink-0 mt-0.5">✕</span>
                {issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {recs && (
        <div className="mb-6 space-y-4">
          <SectionHeading>Recommended Meta Tags</SectionHeading>
          {recs.meta_title && <MetaField label="Title tag" value={recs.meta_title} charLimit={60} />}
          {recs.meta_description && <MetaField label="Meta description" value={recs.meta_description} charLimit={160} />}
          {recs.h1 && <MetaField label="H1" value={recs.h1} />}
          {recs.target_word_count && (
            <div className="flex items-center justify-between bg-white/5 rounded-xl p-4 border border-white/5">
              <span className="text-sm font-medium text-zinc-400">Target word count</span>
              <span className="text-lg font-bold text-white">
                {recs.target_word_count.toLocaleString()} words
                {current?.word_count > 0 && (
                  <span className="text-sm font-normal text-zinc-500 ml-2">(currently {current.word_count.toLocaleString()})</span>
                )}
              </span>
            </div>
          )}
        </div>
      )}

      {data.priority_actions?.length > 0 && (
        <div className="mb-6">
          <SectionHeading>Priority Actions</SectionHeading>
          <ol className="space-y-2">
            {data.priority_actions.map((action: string, i: number) => (
              <li key={i} className="flex gap-3 items-start text-sm text-zinc-300">
                <span className="shrink-0 w-6 h-6 rounded-full bg-orange-500/15 text-orange-400 text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                {action}
              </li>
            ))}
          </ol>
        </div>
      )}

      {recs?.heading_structure?.length > 0 && (
        <div className="mb-6">
          <SectionHeading>Suggested Heading Structure</SectionHeading>
          <div className="space-y-1">
            {recs.heading_structure.map((h: string, i: number) => {
              const level  = h.startsWith("H2") ? "pl-0" : h.startsWith("H3") ? "pl-5" : "pl-10";
              const weight = h.startsWith("H2") ? "font-semibold" : "font-normal";
              return <p key={i} className={`text-sm text-zinc-400 ${level} ${weight}`}>{h}</p>;
            })}
          </div>
        </div>
      )}

      {data.internal_links?.length > 0 && (
        <div>
          <SectionHeading>Internal Links to Add</SectionHeading>
          <div className="space-y-2">
            {data.internal_links.map((link: InternalLink, i: number) => (
              <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/5">
                <p className="text-sm font-medium text-white">
                  <span className="text-[#6ee7b7]">&ldquo;{link.anchor_text}&rdquo;</span>
                  <span className="text-zinc-500 mx-2">→</span>
                  <code className="text-zinc-400 text-xs bg-white/10 px-1.5 py-0.5 rounded">{link.target_path}</code>
                </p>
                <p className="text-xs text-zinc-500 mt-1">{link.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

// ── Local SEO section ─────────────────────────────────────────────────

export function LocalSection({ data }: { data: ReturnType<typeof getLocal> }) {
  return (
    <Card title="Local SEO" icon="📍">
      {data.quick_wins?.length > 0 && (
        <div className="mb-6">
          <SectionHeading>Quick Wins</SectionHeading>
          <ul className="space-y-2">
            {data.quick_wins.map((win: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                <span className="text-[#6ee7b7] font-bold shrink-0 mt-0.5">✓</span>
                {win}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.gbp_optimization && (
        <div className="mb-6">
          <SectionHeading>Google Business Profile</SectionHeading>
          <div className="grid md:grid-cols-2 gap-4">
            {data.gbp_optimization.priority_attributes?.length > 0 && (
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Priority Attributes</p>
                <ul className="space-y-1">
                  {data.gbp_optimization.priority_attributes.map((attr: string, i: number) => (
                    <li key={i} className="text-sm text-zinc-300">· {attr}</li>
                  ))}
                </ul>
              </div>
            )}
            {data.gbp_optimization.categories?.length > 0 && (
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Recommended Categories</p>
                <ul className="space-y-1">
                  {data.gbp_optimization.categories.map((cat: string, i: number) => (
                    <li key={i} className="text-sm text-zinc-300">· {cat}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {data.gbp_optimization.photo_strategy && (
            <div className="mt-3 bg-white/5 rounded-xl p-4 border border-white/5 text-sm text-zinc-300">
              <span className="font-medium text-white">Photo strategy: </span>
              {data.gbp_optimization.photo_strategy}
            </div>
          )}
          {data.gbp_optimization.review_strategy && (
            <div className="mt-3 bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20 text-sm text-emerald-300">
              <span className="font-medium">Review target: </span>
              {data.gbp_optimization.review_strategy.target_reviews_per_month} reviews/month
            </div>
          )}
        </div>
      )}

      {data.citations?.length > 0 && (
        <div className="mb-6">
          <SectionHeading>Citations to Build</SectionHeading>
          <div className="grid md:grid-cols-2 gap-2">
            {data.citations.map((c: Citation, i: number) => (
              <div key={i} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 border border-white/5">
                <div>
                  <p className="text-sm font-medium text-white">{c.site}</p>
                  <p className="text-xs text-zinc-500 capitalize">{c.category}</p>
                </div>
                <PriorityBadge priority={c.priority} />
              </div>
            ))}
          </div>
        </div>
      )}

      {data.link_opportunities?.length > 0 && (
        <div className="mb-6">
          <SectionHeading>Link Building Opportunities</SectionHeading>
          <div className="space-y-3">
            {data.link_opportunities.map((opp: LinkOpportunity, i: number) => (
              <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/5">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold text-white">{opp.name}</p>
                  <span className="text-xs bg-white/10 text-zinc-400 px-2 py-0.5 rounded-full shrink-0 capitalize">{opp.link_type}</span>
                </div>
                <p className="text-xs text-zinc-500 mb-2">{opp.reason}</p>
                {opp.outreach_template && (
                  <p className="text-xs text-[#6ee7b7]/80 italic border-l-2 border-[#6ee7b7]/30 pl-3">{opp.outreach_template}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.local_content_strategy && (
        <div className="mb-6">
          <SectionHeading>Content Strategy</SectionHeading>
          <div className="grid md:grid-cols-2 gap-4">
            {data.local_content_strategy.blog_topics?.length > 0 && (
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Blog Topics</p>
                <ul className="space-y-1.5">
                  {data.local_content_strategy.blog_topics.map((t: string, i: number) => (
                    <li key={i} className="text-sm text-zinc-300">· {t}</li>
                  ))}
                </ul>
              </div>
            )}
            {data.local_content_strategy.service_area_pages?.length > 0 && (
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Service Area Pages</p>
                <ul className="space-y-1.5">
                  {data.local_content_strategy.service_area_pages.map((p: string, i: number) => (
                    <li key={i} className="text-sm text-zinc-300">· {p}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {data.estimated_impact && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-300 leading-relaxed">
          <span className="font-semibold">Estimated impact: </span>
          {data.estimated_impact}
        </div>
      )}
    </Card>
  );
}

// ── Shared primitive components ───────────────────────────────────────

export function Card({
  title,
  icon,
  badge,
  badgeColor = "slate",
  children,
}: {
  title: string;
  icon: string;
  badge?: string;
  badgeColor?: "slate" | "green" | "amber" | "red" | "blue";
  children: React.ReactNode;
}) {
  const badgeColors: Record<string, string> = {
    slate: "bg-white/10 text-zinc-400",
    green: "bg-emerald-500/15 text-emerald-400",
    amber: "bg-amber-500/15 text-amber-400",
    red:   "bg-red-500/15 text-red-400",
    blue:  "bg-blue-500/15 text-blue-400",
  };

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <span>{icon}</span>
          {title}
        </h3>
        {badge && (
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${badgeColors[badgeColor]}`}>
            {badge}
          </span>
        )}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">
      {children}
    </h4>
  );
}

function MetaField({ label, value, charLimit }: { label: string; value: string; charLimit?: number }) {
  const over = charLimit && value.length > charLimit;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-medium text-zinc-500">{label}</p>
        {charLimit && (
          <p className={`text-xs tabular-nums ${over ? "text-red-400" : "text-zinc-500"}`}>
            {value.length}/{charLimit}
          </p>
        )}
      </div>
      <div className={`bg-white/5 border-l-4 ${over ? "border-red-500" : "border-[#6ee7b7]/50"} rounded-r-xl px-4 py-3`}>
        <p className="text-sm text-zinc-300 font-mono leading-relaxed">{value}</p>
      </div>
    </div>
  );
}

function IntentBadge({ intent }: { intent: string }) {
  const colors: Record<string, string> = {
    transactional: "bg-emerald-500/15 text-emerald-400",
    commercial:    "bg-blue-500/15 text-blue-400",
    informational: "bg-white/10 text-zinc-400",
    navigational:  "bg-purple-500/15 text-purple-400",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${colors[intent] ?? "bg-white/10 text-zinc-400"}`}>
      {intent}
    </span>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const colors: Record<string, string> = {
    low:    "text-emerald-400",
    medium: "text-amber-400",
    high:   "text-red-400",
  };
  return (
    <span className={`text-xs font-semibold capitalize ${colors[difficulty] ?? "text-zinc-500"}`}>
      {difficulty}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    critical: "bg-red-500/15 text-red-400",
    high:     "bg-orange-500/15 text-orange-400",
    medium:   "bg-yellow-500/15 text-yellow-400",
    low:      "bg-white/10 text-zinc-500",
  };
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize shrink-0 ${styles[priority] ?? styles.low}`}>
      {priority}
    </span>
  );
}

export function ImpactBadge({ impact }: { impact: string }) {
  const styles: Record<string, string> = {
    high:   "bg-red-500/15 text-red-400",
    medium: "bg-yellow-500/15 text-yellow-400",
    low:    "bg-white/10 text-zinc-500",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize shrink-0 ${styles[impact] ?? styles.low}`}>
      {impact} impact
    </span>
  );
}

function EffortBadge({ effort }: { effort: string }) {
  const styles: Record<string, string> = {
    easy:   "bg-emerald-500/15 text-emerald-400",
    medium: "bg-blue-500/15 text-blue-400",
    hard:   "bg-purple-500/15 text-purple-400",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize shrink-0 ${styles[effort] ?? styles.medium}`}>
      {effort}
    </span>
  );
}

// tiny type-helpers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getKw(d: any) { return d; }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getOp(d: any) { return d; }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getLocal(d: any) { return d; }

// ── Local SEO Score card ──────────────────────────────────────────────

export function LocalSeoScoreCard({
  score,
  businessName,
  businessType,
}: {
  score: number;
  businessName?: string;
  businessType?: string;
}) {
  const clamped = Math.max(0, Math.min(100, score));
  const isGood  = clamped >= 70;
  const isOk    = clamped >= 40;

  const colorBar   = isGood ? "bg-emerald-500"             : isOk ? "bg-yellow-400"             : "bg-red-500";
  const colorScore = isGood ? "text-emerald-400"           : isOk ? "text-yellow-400"           : "text-red-400";
  const colorBg    = isGood ? "bg-emerald-500/10 border-emerald-500/20" : isOk ? "bg-yellow-500/10 border-yellow-500/20" : "bg-red-500/10 border-red-500/20";
  const label = isGood ? "Good" : isOk ? "Needs Work" : "Poor";
  const hint  = isGood
    ? "Your local presence is strong. Focus on maintaining and growing from here."
    : isOk
    ? "You have a foundation — targeted improvements will move you into the Map Pack."
    : "Significant local SEO gaps found. Follow the recommendations below to improve quickly.";

  return (
    <div className={`rounded-2xl border p-6 ${colorBg}`}>
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="text-lg font-bold text-white font-display">Local SEO Score</h2>
          {(businessName || businessType) && (
            <p className="text-sm text-zinc-400 mt-0.5">
              {[businessName, businessType && `(${businessType})`].filter(Boolean).join(" ")}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <span className={`text-6xl font-black leading-none ${colorScore}`}>{clamped}</span>
          <span className="text-zinc-500 text-lg font-semibold">/100</span>
        </div>
      </div>

      <div className="bg-white/10 rounded-full h-3 mb-3 overflow-hidden">
        <div className={`h-3 rounded-full ${colorBar} transition-all duration-500`} style={{ width: `${clamped}%` }} />
      </div>

      <div className="flex justify-between text-xs text-zinc-500 mb-4">
        <span>0 — Poor</span>
        <span className={`font-semibold ${colorScore}`}>{label}</span>
        <span>100 — Excellent</span>
      </div>

      <p className="text-sm text-zinc-400">{hint}</p>
    </div>
  );
}

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
  CopyBtn,
  type Column,
} from "@/components/tool-ui";
import type {
  ContentData,
  SchemaResult,
  SchemaItem,
  CrawledPage,
  SeoContentResult,
  SeoRuleScore,
  SeoScoreCard,
} from "@/types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/* ── Schema type options ──────────────────────────────── */
const SCHEMA_TYPES = [
  "LocalBusiness",
  "Service",
  "FAQPage",
  "BreadcrumbList",
  "AggregateRating",
  "Organization",
] as const;

/* ── Content type options ─────────────────────────────── */
const CONTENT_TYPES = [
  { value: "homepage", label: "Homepage", icon: "H" },
  { value: "service", label: "Service Page", icon: "S" },
  { value: "area", label: "Area Page", icon: "A" },
  { value: "outrank", label: "Competitor Outrank", icon: "O" },
] as const;

/* ── Rule display names ──────────────────────────────── */
const RULE_LABELS: Record<string, string> = {
  content_length: "Content Length",
  keyword_placement: "Keyword Placement",
  keyword_frequency: "Keyword Frequency",
  heading_structure: "Heading Structure",
  first_paragraph: "First Paragraph",
  topical_completeness: "Topical Completeness",
  readability: "Readability",
  transition_words: "Transition Words",
  internal_linking: "Internal Linking",
  image_optimization: "Image Optimization",
  eeat_signals: "E-E-A-T Signals",
  faq_section: "FAQ Section",
  cta_placement: "CTA Placement",
  local_seo: "Local SEO Signals",
  conversion: "Conversion Elements",
};

/* ── Progress step type ──────────────────────────────── */
type EngineStep = "competitors" | "generating" | "scoring" | "done" | "fixing";

/* ── Tabs ─────────────────────────────────────────────── */
type Tab = "content" | "schema";


/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════ */

export function ContentWriterPage() {
  const { lastAudit } = useDashboard();
  const { data: session } = useSession();

  const cd = lastAudit?.content_data as ContentData | undefined;

  /* ── Tab state ─────────────────────────────────────── */
  const [activeTab, setActiveTab] = useState<Tab>("content");

  /* ── Content Generator form state ──────────────────── */
  const [contentType, setContentType] = useState<string>("homepage");
  const [targetKeyword, setTargetKeyword] = useState("");
  const [yourUrl, setYourUrl] = useState("");
  const [competitorUrl, setCompetitorUrl] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [targetCity, setTargetCity] = useState("");

  /* ── SEO Engine state ──────────────────────────────── */
  const [seoResult, setSeoResult] = useState<SeoContentResult | null>(null);
  const [seoLoading, setSeoLoading] = useState(false);
  const [engineStep, setEngineStep] = useState<EngineStep | null>(null);
  const [fixLoading, setFixLoading] = useState(false);
  const [expandedRules, setExpandedRules] = useState<Record<string, boolean>>({});

  /* ── Schema state ──────────────────────────────────── */
  const [schemaResults, setSchemaResults] = useState<Record<string, SchemaItem[]>>({});
  const [schemaLoading, setSchemaLoading] = useState<string | null>(null);

  /* ── Audit data ────────────────────────────────────── */
  const keyword = lastAudit?.keyword ?? "";
  const businessName = lastAudit?.business_name ?? "";
  const businessType = lastAudit?.business_type ?? "";
  const location = lastAudit?.location ?? "";
  const targetUrl = lastAudit?.target_url ?? "";

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (session?.accessToken) headers.Authorization = `Bearer ${session.accessToken}`;

  const wordCount = cd?.homepage_words ?? 0;
  const rewrites = cd?.pages_to_rewrite ?? [];
  const areaPages = cd?.service_areas ?? [];
  const faqItems = cd?.faq_suggestions ?? [];
  const crawledPages = (lastAudit?.pages_crawled ?? []) as CrawledPage[];

  const schemaTemplates =
    lastAudit?.agents?.ai_seo?.analysis?.schema_templates ?? [];


  /* ── Generate SEO Content ──────────────────────────── */
  async function handleGenerate() {
    const kw = targetKeyword.trim() || keyword;
    const url = yourUrl.trim() || targetUrl;
    if (!kw) return;

    setSeoLoading(true);
    setSeoResult(null);
    setEngineStep("competitors");

    try {
      const stepTimer = setTimeout(() => setEngineStep("generating"), 4000);
      const stepTimer2 = setTimeout(() => setEngineStep("scoring"), 12000);

      const body: Record<string, unknown> = {
        content_type: contentType === "outrank" ? "custom" : contentType,
        target_keyword: kw,
        secondary_keywords: [],
        business_name: businessName,
        business_type: businessType,
        location,
        target_url: url,
      };

      if (contentType === "service" && serviceName.trim()) {
        body.service_name = serviceName.trim();
      }
      if (contentType === "area" && targetCity.trim()) {
        body.target_city = targetCity.trim();
        body.service_name = serviceName.trim() || businessType;
        body.target_keyword = `${serviceName.trim() || businessType} ${targetCity.trim()}`.toLowerCase();
      }
      if (contentType === "outrank" && competitorUrl.trim()) {
        body.competitor_url = competitorUrl.trim();
      }

      const endpoint = contentType === "outrank"
        ? `${API}/api/outrank-competitor`
        : `${API}/api/content/generate`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(
          contentType === "outrank"
            ? {
                competitor_url: competitorUrl.trim(),
                keyword: kw,
                your_url: url,
                business_name: businessName,
                business_type: businessType,
                location,
              }
            : body
        ),
      });

      clearTimeout(stepTimer);
      clearTimeout(stepTimer2);

      if (!res.ok) throw new Error("Generation failed");

      if (contentType === "outrank") {
        // Outrank returns different shape — wrap into SeoContentResult-like structure
        const data = await res.json();
        setEngineStep("done");
        setSeoResult({
          content: {
            meta_title: data.meta_title ?? "",
            meta_description: data.meta_description ?? "",
            url_slug: "",
            content: data.generated_content ?? "",
            word_count: data.word_count ?? 0,
            primary_keyword_count: 0,
            images: [],
            internal_links: (data.internal_links ?? []).map((l: { anchor: string; target: string }) => ({
              anchor: l.anchor,
              url: l.target,
            })),
            external_links: [],
            faqs: [],
            semantic_keywords_used: [],
          },
          seo_score: {
            total_score: 0,
            max_score: 100,
            percentage: 0,
            grade: "—",
            rules: {},
          },
          competitor_analysis: {
            avg_words: data.competitor_analysis?.word_count ?? 0,
            target_words: data.word_count ?? 0,
            competitors_analyzed: 1,
            gap_topics: data.competitor_analysis?.weaknesses ?? [],
          },
          meta: {
            generation_time_seconds: 0,
            model: "claude",
            auto_fixed: false,
          },
        });
      } else {
        const data: SeoContentResult = await res.json();
        setEngineStep("done");
        setSeoResult(data);

        const failed: Record<string, boolean> = {};
        if (data.seo_score?.rules) {
          for (const [rule, info] of Object.entries(data.seo_score.rules)) {
            if (info.status === "fail") failed[rule] = true;
          }
        }
        setExpandedRules(failed);
      }
    } catch {
      setEngineStep(null);
      setSeoResult(null);
    } finally {
      setSeoLoading(false);
    }
  }

  /* ── Fix issues ────────────────────────────────────── */
  async function handleFixIssues() {
    if (!seoResult) return;
    setFixLoading(true);
    setEngineStep("fixing");
    try {
      const res = await fetch(`${API}/api/content/generate`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          content_type: "custom",
          target_keyword: targetKeyword.trim() || keyword,
          secondary_keywords: [],
          business_name: businessName,
          business_type: businessType,
          location,
          target_url: yourUrl.trim() || targetUrl,
        }),
      });
      if (!res.ok) throw new Error("Fix failed");
      const data: SeoContentResult = await res.json();
      setEngineStep("done");
      setSeoResult(data);
      const failed: Record<string, boolean> = {};
      if (data.seo_score?.rules) {
        for (const [rule, info] of Object.entries(data.seo_score.rules)) {
          if (info.status === "fail") failed[rule] = true;
        }
      }
      setExpandedRules(failed);
    } catch {
      setEngineStep("done");
    } finally {
      setFixLoading(false);
    }
  }

  /* ── Generate schema ───────────────────────────────── */
  async function generateSchema(pageKey: string, pageUrl: string, types: string[]) {
    setSchemaLoading(pageKey);
    try {
      const res = await fetch(`${API}/api/generate-schema`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          page_url: pageUrl,
          schema_types: types,
          business_name: businessName,
          business_type: businessType,
          location,
          keyword,
        }),
      });
      if (!res.ok) throw new Error("Schema generation failed");
      const data: SchemaResult = await res.json();
      setSchemaResults((prev) => ({ ...prev, [pageKey]: data.schemas ?? [] }));
    } catch {
      setSchemaResults((prev) => ({ ...prev, [pageKey]: [] }));
    } finally {
      setSchemaLoading(null);
    }
  }

  /* ── Helpers ───────────────────────────────────────── */
  function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  }

  /* ═══ RENDER ═══════════════════════════════════════════ */
  return (
    <div className="animate-fadeIn space-y-2">
      {/* ── Tab Bar ────────────────────────────────────── */}
      <div className="flex gap-1 p-1 bg-surface-2 border border-white/6 rounded-xl">
        {(
          [
            { key: "content" as Tab, label: "Smart Content Generator", icon: contentIcon },
            { key: "schema" as Tab, label: "Schema Generator", icon: schemaIcon },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[10px] text-[13px] font-medium transition-all ${
              activeTab === tab.key
                ? "bg-white/[0.06] text-white shadow-sm"
                : "text-white hover:text-white"
            }`}
          >
            <span className="w-4 h-4" dangerouslySetInnerHTML={{ __html: tab.icon }} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════
          TAB 1: SMART CONTENT GENERATOR
         ══════════════════════════════════════════════════ */}
      {activeTab === "content" && (
        <>
          {/* Stat row from audit */}
          {cd && (
            <StatRow>
              <StatBox
                label="Homepage Words"
                value={wordCount.toLocaleString()}
                accent="emerald"
              />
              <StatBox
                label="Pages to Rewrite"
                value={rewrites.length || "0"}
                accent="blue"
              />
              <StatBox
                label="Area Pages Needed"
                value={areaPages.length}
                accent="amber"
              />
              <StatBox
                label="FAQ Suggestions"
                value={faqItems.length}
                accent="violet"
              />
            </StatRow>
          )}

          {/* ── Input Form Card ──────────────────────────── */}
          <div className="bg-surface-2 border border-white/6 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/6">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-[13px] font-semibold font-display text-white">
                  Generate SEO Content
                </span>
              </div>
              <span className="text-[10px] text-white">15-Rule Engine + Competitor Analysis</span>
            </div>

            <div className="p-5 space-y-4">
              {/* Content type selector */}
              <div>
                <label className="text-[10px] uppercase tracking-wider text-white block mb-2">
                  Content Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CONTENT_TYPES.map((ct) => (
                    <button
                      key={ct.value}
                      onClick={() => setContentType(ct.value)}
                      className={`relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-[10px] border text-left transition-all ${
                        contentType === ct.value
                          ? "bg-emerald-500/[0.08] border-emerald-500/30 text-emerald-400"
                          : "bg-white/[0.02] border-white/6 text-white hover:border-white/12 hover:text-zinc-200"
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-[12px] font-bold font-display shrink-0 ${
                          contentType === ct.value
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-white/5 text-white"
                        }`}
                      >
                        {ct.icon}
                      </span>
                      <span className="text-[12px] font-medium">{ct.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Input fields — Row 1: Keyword + URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-white block mb-1.5">
                    Target Keyword
                  </label>
                  <input
                    type="text"
                    value={targetKeyword}
                    onChange={(e) => setTargetKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                    placeholder={keyword || "e.g. kitchen remodeler toronto"}
                    className="w-full bg-white/[0.03] border border-white/6 rounded-[10px] px-3.5 py-2.5 text-[13px] text-white placeholder:text-white focus:outline-none focus:border-emerald-500/40 focus:bg-emerald-500/[0.02] transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-white block mb-1.5">
                    Your URL
                  </label>
                  <input
                    type="text"
                    value={yourUrl}
                    onChange={(e) => setYourUrl(e.target.value)}
                    placeholder={targetUrl || "https://yourbusiness.com"}
                    className="w-full bg-white/[0.03] border border-white/6 rounded-[10px] px-3.5 py-2.5 text-[13px] text-white placeholder:text-white focus:outline-none focus:border-emerald-500/40 focus:bg-emerald-500/[0.02] transition-all"
                  />
                </div>
              </div>

              {/* Conditional fields based on content type */}
              {contentType === "outrank" && (
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-white block mb-1.5">
                    Competitor URL to Outrank
                  </label>
                  <input
                    type="text"
                    value={competitorUrl}
                    onChange={(e) => setCompetitorUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                    placeholder="https://competitor.com/their-page"
                    className="w-full bg-white/[0.03] border border-white/6 rounded-[10px] px-3.5 py-2.5 text-[13px] text-white placeholder:text-white focus:outline-none focus:border-emerald-500/40 focus:bg-emerald-500/[0.02] transition-all"
                  />
                </div>
              )}

              {(contentType === "service" || contentType === "area") && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-white block mb-1.5">
                      Service Name
                    </label>
                    <input
                      type="text"
                      value={serviceName}
                      onChange={(e) => setServiceName(e.target.value)}
                      placeholder={businessType || "e.g. Kitchen Renovation"}
                      className="w-full bg-white/[0.03] border border-white/6 rounded-[10px] px-3.5 py-2.5 text-[13px] text-white placeholder:text-white focus:outline-none focus:border-emerald-500/40 focus:bg-emerald-500/[0.02] transition-all"
                    />
                  </div>
                  {contentType === "area" && (
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-white block mb-1.5">
                        Target City
                      </label>
                      <input
                        type="text"
                        value={targetCity}
                        onChange={(e) => setTargetCity(e.target.value)}
                        placeholder="e.g. North York"
                        className="w-full bg-white/[0.03] border border-white/6 rounded-[10px] px-3.5 py-2.5 text-[13px] text-white placeholder:text-white focus:outline-none focus:border-emerald-500/40 focus:bg-emerald-500/[0.02] transition-all"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Quick-pick area pages from audit */}
              {contentType === "area" && areaPages.length > 0 && (
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-white block mb-1.5">
                    Suggested Areas
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {areaPages.map((area, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setTargetCity(area.city);
                          setTargetKeyword(`${businessType} ${area.city}`.toLowerCase());
                        }}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                          targetCity === area.city
                            ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                            : "bg-white/[0.02] border-white/8 text-white hover:text-white hover:border-white/12"
                        }`}
                      >
                        {area.city}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Generate button + progress */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex-1">
                  {seoLoading && engineStep && <EngineProgress step={engineStep} />}
                </div>
                <BtnPrimary
                  onClick={handleGenerate}
                  disabled={seoLoading || (contentType === "outrank" && !competitorUrl.trim())}
                >
                  {seoLoading ? "Generating..." : "Generate Content"}
                </BtnPrimary>
              </div>
            </div>
          </div>

          {/* ── Two-Panel Result ──────────────────────────── */}
          {seoResult && (
            <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-3">
              {/* LEFT: Content Preview */}
              <ContentPreview
                result={seoResult}
                onCopyHtml={() => navigator.clipboard.writeText(seoResult.content.content)}
                onCopyText={() => navigator.clipboard.writeText(stripHtml(seoResult.content.content))}
              />
              {/* RIGHT: Score Card */}
              {seoResult.seo_score.percentage > 0 ? (
                <SeoScoreCardPanel
                  scoreCard={seoResult.seo_score}
                  competitorAnalysis={seoResult.competitor_analysis}
                  meta={seoResult.meta}
                  expandedRules={expandedRules}
                  onToggleRule={(rule) =>
                    setExpandedRules((prev) => ({ ...prev, [rule]: !prev[rule] }))
                  }
                  onFixIssues={handleFixIssues}
                  fixLoading={fixLoading}
                />
              ) : (
                /* Outrank result — competitor analysis panel instead of score card */
                <CompetitorAnalysisPanel analysis={seoResult.competitor_analysis} />
              )}
            </div>
          )}

          {/* ── Crawled Pages Table (from audit) ─────────── */}
          {crawledPages.length > 0 && (
            <CrawledPagesSection
              crawledPages={crawledPages}
              keyword={keyword}
              targetUrl={targetUrl}
              businessName={businessName}
              businessType={businessType}
              location={location}
              headers={headers}
            />
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════
          TAB 2: SCHEMA GENERATOR
         ══════════════════════════════════════════════════ */}
      {activeTab === "schema" && (
        <>
          {/* Recommended schemas from audit */}
          {schemaTemplates.length > 0 && (
            <Card
              title="Recommended Schemas"
              dotColor="#f59e0b"
              meta={`${schemaTemplates.length} from audit`}
            >
              <div className="space-y-3">
                {schemaTemplates.map(
                  (
                    tpl: { type: string; priority: string; description: string; json_ld: string },
                    i: number
                  ) => (
                    <div
                      key={i}
                      className="bg-surface-1 border border-white/6 rounded-lg p-3"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <span className="text-[13px] font-semibold text-white font-display">
                            {tpl.type}
                          </span>
                          <p className="text-[10px] text-white mt-0.5">{tpl.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Tag variant={tpl.priority === "high" ? "high" : tpl.priority === "medium" ? "med" : "low"}>
                            {tpl.priority}
                          </Tag>
                          {tpl.json_ld && <CopyBtn text={tpl.json_ld} />}
                        </div>
                      </div>
                      {tpl.json_ld && (
                        <pre className="mt-2 p-2 bg-black/30 rounded text-[10px] text-emerald-400 font-mono overflow-x-auto max-h-[120px] overflow-y-auto">
                          {tpl.json_ld}
                        </pre>
                      )}
                    </div>
                  )
                )}
              </div>
            </Card>
          )}

          {/* Manual schema generator */}
          <SchemaGeneratorCard
            schemaResults={schemaResults}
            schemaLoading={schemaLoading}
            onGenerate={generateSchema}
            targetUrl={targetUrl}
          />

          {/* Crawled pages with schema generation */}
          {crawledPages.length > 0 && (
            <Card
              title="Generate Schema Per Page"
              dotColor="#8b5cf6"
              meta={`${crawledPages.length} pages`}
              noPadding
            >
              <DataTable
                columns={SCHEMA_PAGE_COLUMNS}
                rows={crawledPages.slice(0, 15).map((page, i) => {
                  const key = `schema-page-${i}`;
                  const results = schemaResults[key];
                  return {
                    url: (
                      <span className="text-white text-[11px] truncate max-w-[200px] block">
                        {page.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                      </span>
                    ),
                    title: (
                      <span className="text-white text-[11px] truncate max-w-[180px] block">
                        {page.title || "\u2014"}
                      </span>
                    ),
                    action: results ? (
                      <div className="flex items-center gap-1.5">
                        <Tag variant="low">{results.length} schemas</Tag>
                        <CopyBtn
                          text={results.map((s) => formatJsonLd(s.json_ld)).join("\n\n")}
                        />
                      </div>
                    ) : (
                      <BtnPrimary
                        small
                        onClick={() =>
                          generateSchema(key, page.url, ["LocalBusiness", "FAQPage", "BreadcrumbList"])
                        }
                        disabled={schemaLoading === key}
                      >
                        {schemaLoading === key ? "..." : "Generate"}
                      </BtnPrimary>
                    ),
                  };
                })}
              />

              {/* Inline schema results */}
              {crawledPages.slice(0, 15).map((page, i) => {
                const key = `schema-page-${i}`;
                const results = schemaResults[key];
                if (!results || results.length === 0) return null;
                return (
                  <div key={key} className="px-4 pb-3">
                    <p className="text-[11px] text-white font-medium mb-2 mt-2">
                      {page.url.replace(/^https?:\/\//, "")}
                    </p>
                    <div className="space-y-2">
                      {results.map((schema, j) => (
                        <div key={j} className="bg-surface-1 border border-white/6 rounded-lg p-2.5">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-semibold text-white font-display">{schema.type}</span>
                            <CopyBtn text={schema.json_ld} />
                          </div>
                          <pre className="p-2 bg-black/30 rounded text-[10px] text-emerald-400 font-mono overflow-x-auto max-h-[100px] overflow-y-auto">
                            {formatJsonLd(schema.json_ld)}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </Card>
          )}
        </>
      )}
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════ */

/* ── Tab Icons (SVG strings) ──────────────────────────── */
const contentIcon = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 3h12M2 7h8M2 11h10M2 15h6"/></svg>`;
const schemaIcon = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 1h10v4H3zM1 11h6v4H1zM9 11h6v4H9zM8 5v3M4 8v3M12 8v3"/></svg>`;


/* ── Engine Progress Stepper ──────────────────────────── */

const STEPS: { key: EngineStep; label: string }[] = [
  { key: "competitors", label: "Analyzing competitors..." },
  { key: "generating", label: "Generating content..." },
  { key: "scoring", label: "Scoring SEO quality..." },
  { key: "done", label: "Done!" },
];

function EngineProgress({ step }: { step: EngineStep }) {
  const currentIdx = step === "fixing"
    ? 2
    : STEPS.findIndex((s) => s.key === step);

  return (
    <div className="flex items-center gap-3">
      {STEPS.map((s, i) => {
        const isDone = i < currentIdx || step === "done";
        const isActive = i === currentIdx && step !== "done";
        return (
          <div key={s.key} className="flex items-center gap-1.5">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
                isDone
                  ? "bg-emerald-500/20 text-emerald-400"
                  : isActive
                  ? "bg-amber-500/20 text-amber-400 animate-pulse"
                  : "bg-white/5 text-white"
              }`}
            >
              {isDone ? "\u2713" : i + 1}
            </span>
            <span
              className={`text-[11px] hidden sm:inline ${
                isDone
                  ? "text-emerald-400"
                  : isActive
                  ? "text-amber-400"
                  : "text-white"
              }`}
            >
              {step === "fixing" && i === currentIdx ? "Fixing issues..." : s.label}
            </span>
            {i < STEPS.length - 1 && (
              <span className="w-4 h-px bg-white/10 mx-1 hidden sm:inline-block" />
            )}
          </div>
        );
      })}
    </div>
  );
}


/* ── Content Preview Panel ─────────────────────────────── */

function ContentPreview({
  result,
  onCopyHtml,
  onCopyText,
}: {
  result: SeoContentResult;
  onCopyHtml: () => void;
  onCopyText: () => void;
}) {
  const c = result.content;
  const [copied, setCopied] = useState<"html" | "text" | null>(null);

  function handleCopy(type: "html" | "text") {
    if (type === "html") onCopyHtml();
    else onCopyText();
    setCopied(type);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="bg-surface-2 border border-white/6 rounded-xl overflow-hidden">
      {/* Meta fields */}
      <div className="p-4 border-b border-white/6">
        <div className="space-y-2">
          {c.meta_title && (
            <div>
              <label className="text-[10px] uppercase tracking-wider text-white block mb-0.5">Meta Title</label>
              <div className="bg-surface-1 border border-white/8 rounded-lg px-3 py-1.5 text-[12px] text-blue-400">
                {c.meta_title}
              </div>
            </div>
          )}
          {c.meta_description && (
            <div>
              <label className="text-[10px] uppercase tracking-wider text-white block mb-0.5">Meta Description</label>
              <div className="bg-surface-1 border border-white/8 rounded-lg px-3 py-1.5 text-[11px] text-white">
                {c.meta_description}
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            {c.url_slug && (
              <div>
                <label className="text-[10px] uppercase tracking-wider text-white block mb-0.5">URL Slug</label>
                <span className="text-[11px] text-emerald-400 font-mono">{c.url_slug}</span>
              </div>
            )}
            {c.word_count > 0 && (
              <div>
                <label className="text-[10px] uppercase tracking-wider text-white block mb-0.5">Words</label>
                <span className="text-[11px] text-white font-mono">{c.word_count}</span>
              </div>
            )}
            {c.primary_keyword_count > 0 && (
              <div>
                <label className="text-[10px] uppercase tracking-wider text-white block mb-0.5">Keywords</label>
                <span className="text-[11px] text-white font-mono">{c.primary_keyword_count}x</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content body */}
      <div className="p-4">
        <div
          className="prose prose-sm prose-invert max-w-none text-[12px] leading-relaxed max-h-[500px] overflow-y-auto
            [&_h1]:text-[16px] [&_h1]:font-bold [&_h1]:font-display [&_h1]:text-white [&_h1]:mb-2 [&_h1]:mt-0
            [&_h2]:text-[14px] [&_h2]:font-semibold [&_h2]:font-display [&_h2]:text-zinc-200 [&_h2]:mb-1.5 [&_h2]:mt-4
            [&_h3]:text-[13px] [&_h3]:font-medium [&_h3]:text-white [&_h3]:mb-1 [&_h3]:mt-3
            [&_p]:text-white [&_p]:mb-2
            [&_ul]:text-white [&_li]:mb-0.5
            [&_strong]:text-zinc-200"
          dangerouslySetInnerHTML={{ __html: c.content }}
        />
      </div>

      {/* Images */}
      {c.images?.length > 0 && (
        <div className="px-4 pb-3">
          <p className="text-[10px] uppercase tracking-wider text-white mb-1.5">Image Suggestions</p>
          <div className="flex flex-wrap gap-1.5">
            {c.images.map((img, i) => (
              <span
                key={i}
                className="text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded-md"
                title={`${img.filename} — ${img.placement}`}
              >
                {img.alt}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Internal links */}
      {c.internal_links?.length > 0 && (
        <div className="px-4 pb-3">
          <p className="text-[10px] uppercase tracking-wider text-white mb-1.5">Internal Links</p>
          <div className="space-y-1">
            {c.internal_links.map((link, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px]">
                <span className="text-emerald-400">{link.anchor}</span>
                <span className="text-white">&rarr;</span>
                <span className="text-white font-mono">{link.url}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQs */}
      {c.faqs?.length > 0 && (
        <div className="px-4 pb-3">
          <p className="text-[10px] uppercase tracking-wider text-white mb-1.5">FAQs ({c.faqs.length})</p>
          <div className="space-y-2">
            {c.faqs.map((faq, i) => (
              <div key={i} className="bg-surface-1 border border-white/6 rounded-lg p-2.5">
                <p className="text-[11px] text-zinc-200 font-medium">{faq.question}</p>
                <p className="text-[10px] text-white mt-1 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Semantic keywords */}
      {c.semantic_keywords_used?.length > 0 && (
        <div className="px-4 pb-3">
          <p className="text-[10px] uppercase tracking-wider text-white mb-1.5">Semantic Keywords Used</p>
          <div className="flex flex-wrap gap-1">
            {c.semantic_keywords_used.map((kw, i) => (
              <span key={i} className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Copy buttons */}
      <div className="px-4 pb-4 flex gap-2 justify-end">
        <button
          onClick={() => handleCopy("html")}
          className="text-[11px] px-3 py-1.5 rounded-lg bg-surface-1 border border-white/8 text-white hover:text-white transition-colors"
        >
          {copied === "html" ? "Copied!" : "Copy HTML"}
        </button>
        <button
          onClick={() => handleCopy("text")}
          className="text-[11px] px-3 py-1.5 rounded-lg bg-surface-1 border border-white/8 text-white hover:text-white transition-colors"
        >
          {copied === "text" ? "Copied!" : "Copy Text"}
        </button>
      </div>
    </div>
  );
}


/* ── SEO Score Card Panel ──────────────────────────────── */

function SeoScoreCardPanel({
  scoreCard,
  competitorAnalysis,
  meta,
  expandedRules,
  onToggleRule,
  onFixIssues,
  fixLoading,
}: {
  scoreCard: SeoScoreCard;
  competitorAnalysis: SeoContentResult["competitor_analysis"];
  meta: SeoContentResult["meta"];
  expandedRules: Record<string, boolean>;
  onToggleRule: (rule: string) => void;
  onFixIssues: () => void;
  fixLoading: boolean;
}) {
  const pct = scoreCard.percentage;
  const color = pct >= 80 ? "#10b981" : pct >= 60 ? "#f59e0b" : "#f43f5e";
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="bg-surface-2 border border-white/6 rounded-xl overflow-hidden">
      {/* Score circle */}
      <div className="p-5 flex flex-col items-center border-b border-white/6">
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle cx="60" cy="60" r="54" fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="8" />
            <circle
              cx="60" cy="60" r="54" fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[28px] font-bold font-display text-white">{pct}</span>
            <span className="text-[10px] text-white">/ 100</span>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[18px] font-bold font-display" style={{ color }}>
            {scoreCard.grade}
          </span>
          <span className="text-[11px] text-white">
            {scoreCard.total_score}/{scoreCard.max_score} points
          </span>
        </div>
      </div>

      {/* Competitor info */}
      <div className="px-4 py-2 border-b border-white/6 flex gap-4 text-[10px] text-white">
        <span>Competitors: <span className="text-white font-mono">{competitorAnalysis.competitors_analyzed}</span></span>
        <span>Avg words: <span className="text-white font-mono">{competitorAnalysis.avg_words}</span></span>
        <span>Target: <span className="text-white font-mono">{competitorAnalysis.target_words}</span></span>
      </div>

      {/* Rules list */}
      <div className="divide-y divide-white/[0.03]">
        {Object.entries(scoreCard.rules).map(([rule, info]) => (
          <RuleRow
            key={rule}
            rule={rule}
            info={info}
            expanded={!!expandedRules[rule]}
            onToggle={() => onToggleRule(rule)}
          />
        ))}
      </div>

      {/* Meta + Fix button */}
      <div className="p-4 border-t border-white/6">
        <div className="flex items-center justify-between mb-2 text-[10px] text-white">
          <span>{meta.generation_time_seconds}s generation time</span>
          {meta.auto_fixed && <Tag variant="info">Auto-fixed</Tag>}
        </div>
        {pct < 80 && (
          <BtnPrimary onClick={onFixIssues} disabled={fixLoading}>
            {fixLoading ? "Fixing..." : "Fix Issues"}
          </BtnPrimary>
        )}
      </div>

      {/* Gap topics */}
      {competitorAnalysis.gap_topics?.length > 0 && (
        <div className="px-4 pb-4">
          <p className="text-[10px] uppercase tracking-wider text-white mb-1.5">Competitor Gaps</p>
          <div className="flex flex-wrap gap-1">
            {competitorAnalysis.gap_topics.map((t, i) => (
              <span key={i} className="text-[9px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


/* ── Rule Row ──────────────────────────────────────────── */

function RuleRow({
  rule,
  info,
  expanded,
  onToggle,
}: {
  rule: string;
  info: SeoRuleScore;
  expanded: boolean;
  onToggle: () => void;
}) {
  const dotColor =
    info.status === "pass" ? "#10b981" : info.status === "warn" ? "#f59e0b" : "#f43f5e";

  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full px-4 py-2 flex items-center gap-2 hover:bg-white/[0.02] transition-colors text-left"
      >
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: dotColor }}
        />
        <span className={`flex-1 text-[11px] ${info.status === "fail" ? "text-zinc-200 font-medium" : "text-white"}`}>
          {RULE_LABELS[rule] || rule}
        </span>
        <span className="text-[11px] font-mono text-white">
          {info.score}/{info.max}
        </span>
        <svg
          className={`w-3 h-3 text-white transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && (
        <div className="px-4 pb-2 pl-8">
          <p className="text-[10px] text-white leading-relaxed">{info.detail}</p>
          {info.positions && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {Object.entries(info.positions).map(([pos, ok]) => (
                <span
                  key={pos}
                  className={`text-[9px] px-1.5 py-0.5 rounded ${
                    ok
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                      : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                  }`}
                >
                  {pos.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


/* ── Competitor Analysis Panel (for outrank mode) ──────── */

function CompetitorAnalysisPanel({
  analysis,
}: {
  analysis: SeoContentResult["competitor_analysis"];
}) {
  return (
    <div className="bg-surface-2 border border-white/6 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/6">
        <span className="text-[13px] font-semibold font-display text-white">Competitor Analysis</span>
      </div>
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface-1 border border-white/6 rounded-lg p-3">
            <span className="text-[10px] uppercase tracking-wider text-white block mb-1">
              Competitor Words
            </span>
            <span className="text-[20px] font-bold font-display text-white">
              {analysis.avg_words.toLocaleString()}
            </span>
          </div>
          <div className="bg-surface-1 border border-white/6 rounded-lg p-3">
            <span className="text-[10px] uppercase tracking-wider text-white block mb-1">
              Your Target
            </span>
            <span className="text-[20px] font-bold font-display text-emerald-400">
              {analysis.target_words.toLocaleString()}
            </span>
          </div>
        </div>

        {analysis.gap_topics?.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-wider text-white mb-2">
              Weaknesses to Exploit
            </p>
            <div className="space-y-1.5">
              {analysis.gap_topics.map((topic, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px]">
                  <span className="text-rose-400 shrink-0 mt-0.5">-</span>
                  <span className="text-white">{topic}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


/* ── Crawled Pages Section ────────────────────────────── */

function CrawledPagesSection({
  crawledPages,
  keyword,
  targetUrl,
  businessName,
  businessType,
  location,
  headers,
}: {
  crawledPages: CrawledPage[];
  keyword: string;
  targetUrl: string;
  businessName: string;
  businessType: string;
  location: string;
  headers: Record<string, string>;
}) {
  const [generated, setGenerated] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<string | null>(null);

  async function generateRewrite(key: string, context: string) {
    setLoading(key);
    try {
      const res = await fetch(`${API}/api/generate-content`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          page_type: "page_rewrite",
          keyword,
          target_url: targetUrl,
          business_name: businessName,
          business_type: businessType,
          location,
          context,
        }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();
      const content = data.content ?? "";
      const meta = data.meta_title
        ? `\n\n---\nMeta Title: ${data.meta_title}\nMeta Description: ${data.meta_description}\nWord Count: ${data.word_count}`
        : "";
      setGenerated((prev) => ({ ...prev, [key]: content + meta }));
    } catch {
      setGenerated((prev) => ({ ...prev, [key]: "Failed to generate. Try again." }));
    } finally {
      setLoading(null);
    }
  }

  return (
    <>
      <div className="flex items-end justify-between mb-3 mt-6">
        <div>
          <h3 className="text-[15px] font-semibold font-display text-white">Page Rewrites</h3>
          <p className="text-[11px] text-white mt-0.5">{crawledPages.length} crawled pages — generate optimized rewrites</p>
        </div>
      </div>
      <Card title="Crawled Pages" dotColor="#10b981" meta={`${crawledPages.length} pages`} noPadding>
        <DataTable
          columns={PAGE_COLUMNS}
          rows={crawledPages.map((page, i) => {
            const key = `page-${i}`;
            const content = generated[key];
            const issues = page.issues?.length ?? 0;
            return {
              url: (
                <span className="text-white text-[11px] truncate max-w-[200px] block">
                  {page.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </span>
              ),
              title: (
                <span className="text-white text-[11px] truncate max-w-[180px] block">
                  {page.title || "\u2014"}
                </span>
              ),
              words: (
                <span className="font-mono text-[11px] text-white">{page.word_count}</span>
              ),
              issues: issues > 0 ? (
                <Tag variant="high">{issues} issues</Tag>
              ) : (
                <Tag variant="low">OK</Tag>
              ),
              action: !content ? (
                <BtnPrimary
                  small
                  onClick={() =>
                    generateRewrite(
                      key,
                      `Page: ${page.url}\nTitle: ${page.title}\nH1: ${page.h1}\nIssues: ${page.issues?.join(", ") ?? "none"}`
                    )
                  }
                  disabled={loading === key}
                >
                  {loading === key ? "..." : "Rewrite"}
                </BtnPrimary>
              ) : (
                <CopyBtn text={content} />
              ),
            };
          })}
        />
      </Card>

      {crawledPages.map((_, i) => {
        const key = `page-${i}`;
        const content = generated[key];
        if (!content) return null;
        return (
          <Card key={key} title={`Rewrite: ${crawledPages[i].title || crawledPages[i].url}`} dotColor="#10b981">
            <div className="text-[11px] text-white whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto">
              {content}
            </div>
            <div className="mt-2 flex justify-end">
              <CopyBtn text={content} />
            </div>
          </Card>
        );
      })}
    </>
  );
}


/* ── Schema Generator Card (manual) ───────────────────── */

function SchemaGeneratorCard({
  schemaResults,
  schemaLoading,
  onGenerate,
  targetUrl,
}: {
  schemaResults: Record<string, SchemaItem[]>;
  schemaLoading: string | null;
  onGenerate: (key: string, url: string, types: string[]) => void;
  targetUrl: string;
}) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["LocalBusiness", "FAQPage"]);
  const [pageUrl, setPageUrl] = useState(targetUrl);

  function toggleType(t: string) {
    setSelectedTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  const key = `manual-${pageUrl || "homepage"}`;
  const results = schemaResults[key];

  return (
    <Card title="Generate Custom Schema" dotColor="#8b5cf6" meta="JSON-LD">
      <div className="space-y-3">
        <input
          type="text"
          value={pageUrl}
          onChange={(e) => setPageUrl(e.target.value)}
          placeholder="Page URL (leave empty for homepage)"
          className="w-full bg-white/[0.03] border border-white/6 rounded-[10px] px-3.5 py-2.5 text-[13px] text-white placeholder:text-white focus:outline-none focus:border-emerald-500/40 focus:bg-emerald-500/[0.02] transition-all"
        />
        <div className="flex flex-wrap gap-1.5">
          {SCHEMA_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => toggleType(t)}
              className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                selectedTypes.includes(t)
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                  : "bg-white/[0.02] border-white/8 text-white hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex justify-end">
          <BtnPrimary
            small
            onClick={() => onGenerate(key, pageUrl, selectedTypes)}
            disabled={schemaLoading === key || selectedTypes.length === 0}
          >
            {schemaLoading === key ? "Generating..." : "Generate Schema"}
          </BtnPrimary>
        </div>
      </div>

      {results && results.length > 0 && (
        <div className="mt-4 space-y-3">
          {results.map((schema, i) => (
            <div key={i} className="bg-surface-1 border border-white/6 rounded-lg p-3">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <span className="text-[12px] font-semibold text-white font-display">{schema.type}</span>
                  {schema.description && (
                    <p className="text-[10px] text-white mt-0.5">{schema.description}</p>
                  )}
                </div>
                <CopyBtn text={schema.json_ld} />
              </div>
              <pre className="mt-2 p-2 bg-black/30 rounded text-[10px] text-emerald-400 font-mono overflow-x-auto max-h-[150px] overflow-y-auto">
                {formatJsonLd(schema.json_ld)}
              </pre>
            </div>
          ))}
        </div>
      )}

      {results && results.length === 0 && (
        <p className="mt-3 text-[11px] text-white">No schemas generated. Try again.</p>
      )}
    </Card>
  );
}


/* ── Column definitions ──────────────────────────────── */

const PAGE_COLUMNS: Column[] = [
  { key: "url", label: "URL" },
  { key: "title", label: "Title" },
  { key: "words", label: "Words", align: "right" },
  { key: "issues", label: "Status", align: "center" },
  { key: "action", label: "", align: "center" },
];

const SCHEMA_PAGE_COLUMNS: Column[] = [
  { key: "url", label: "URL" },
  { key: "title", label: "Title" },
  { key: "action", label: "", align: "right" },
];

/* ── Utility ─────────────────────────────────────────── */
function formatJsonLd(jsonStr: string): string {
  try {
    return JSON.stringify(JSON.parse(jsonStr), null, 2);
  } catch {
    return jsonStr;
  }
}

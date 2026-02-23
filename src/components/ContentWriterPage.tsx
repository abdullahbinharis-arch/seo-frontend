"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useDashboard } from "@/components/DashboardContext";
import {
  StatRow,
  StatBox,
  SectionHead,
  Card,
  ContentCard,
  DataTable,
  Tag,
  BtnPrimary,
  BtnGhost,
  CopyBtn,
  type Column,
} from "@/components/tool-ui";
import type {
  ContentData,
  SchemaResult,
  SchemaItem,
  OutrankResult,
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

/* ── Main Component ──────────────────────────────────────── */
export function ContentWriterPage() {
  const { lastAudit } = useDashboard();
  const { data: session } = useSession();

  const cd = lastAudit?.content_data as ContentData | undefined;

  /* Content generation state (legacy) */
  const [generated, setGenerated] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [faqAnswers, setFaqAnswers] = useState<Record<number, string>>({});
  const [faqLoading, setFaqLoading] = useState<number | null>(null);

  /* Schema state */
  const [schemaResults, setSchemaResults] = useState<Record<string, SchemaItem[]>>({});
  const [schemaLoading, setSchemaLoading] = useState<string | null>(null);

  /* Outrank state */
  const [outrankUrl, setOutrankUrl] = useState("");
  const [outrankKeyword, setOutrankKeyword] = useState("");
  const [outrankLoading, setOutrankLoading] = useState(false);
  const [outrankError, setOutrankError] = useState("");
  const [outrankResults, setOutrankResults] = useState<OutrankResult[]>([]);
  const [outrankExpanded, setOutrankExpanded] = useState<Record<number, boolean>>({});

  /* SEO Engine state */
  const [seoResult, setSeoResult] = useState<SeoContentResult | null>(null);
  const [seoLoading, setSeoLoading] = useState<string | null>(null);
  const [engineStep, setEngineStep] = useState<EngineStep | null>(null);
  const [fixLoading, setFixLoading] = useState(false);
  const [expandedRules, setExpandedRules] = useState<Record<string, boolean>>({});

  const keyword = lastAudit?.keyword ?? "";
  const businessName = lastAudit?.business_name ?? "";
  const businessType = lastAudit?.business_type ?? "";
  const location = lastAudit?.location ?? "";
  const targetUrl = lastAudit?.target_url ?? "";

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (session?.accessToken) headers.Authorization = `Bearer ${session.accessToken}`;

  /* ── Data from flat section ──────────────────────────── */
  const wordCount = cd?.homepage_words ?? 0;
  const rewrites = cd?.pages_to_rewrite ?? [];
  const areaPages = cd?.service_areas ?? [];
  const faqItems = cd?.faq_suggestions ?? [];
  const blogTopics = cd?.blog_topics ?? [];
  const crawledPages = (lastAudit?.pages_crawled ?? []) as CrawledPage[];

  /* Schema data from AI SEO agent */
  const schemaTemplates =
    lastAudit?.agents?.ai_seo?.analysis?.schema_templates ?? [];

  /* ── SEO Engine: Generate content ────────────────────── */
  async function generateSeoContent(
    key: string,
    contentType: string,
    opts?: { serviceName?: string; targetCity?: string; targetKeyword?: string }
  ) {
    setSeoLoading(key);
    setSeoResult(null);
    setEngineStep("competitors");
    try {
      // Simulate progress steps (the backend does it all in one call)
      const stepTimer = setTimeout(() => setEngineStep("generating"), 4000);
      const stepTimer2 = setTimeout(() => setEngineStep("scoring"), 12000);

      const res = await fetch(`${API}/api/content/generate`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          content_type: contentType,
          target_keyword: opts?.targetKeyword || keyword,
          secondary_keywords: [],
          service_name: opts?.serviceName,
          target_city: opts?.targetCity,
          business_name: businessName,
          business_type: businessType,
          location,
          target_url: targetUrl,
        }),
      });

      clearTimeout(stepTimer);
      clearTimeout(stepTimer2);

      if (!res.ok) throw new Error("Generation failed");
      const data: SeoContentResult = await res.json();
      setEngineStep("done");
      setSeoResult(data);

      // Auto-expand failed rules
      const failed: Record<string, boolean> = {};
      if (data.seo_score?.rules) {
        for (const [rule, info] of Object.entries(data.seo_score.rules)) {
          if (info.status === "fail") failed[rule] = true;
        }
      }
      setExpandedRules(failed);
    } catch {
      setEngineStep(null);
      setSeoResult(null);
    } finally {
      setSeoLoading(null);
    }
  }

  /* ── SEO Engine: Fix issues ──────────────────────────── */
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
          target_keyword: keyword,
          secondary_keywords: [],
          business_name: businessName,
          business_type: businessType,
          location,
          target_url: targetUrl,
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

  /* ── Legacy: Generate content ────────────────────────── */
  async function generateContent(key: string, pageType: string, context?: string) {
    setLoading(key);
    try {
      const res = await fetch(`${API}/api/generate-content`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          page_type: pageType,
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

  /* ── Generate FAQ answer ───────────────────────────── */
  async function generateFaqAnswer(idx: number, question: string) {
    setFaqLoading(idx);
    try {
      const res = await fetch(`${API}/api/generate-content`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          page_type: "faq_answer",
          keyword,
          target_url: targetUrl,
          business_name: businessName,
          business_type: businessType,
          location,
          context: question,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setFaqAnswers((prev) => ({ ...prev, [idx]: data.content ?? "" }));
    } catch {
      setFaqAnswers((prev) => ({ ...prev, [idx]: "Failed to generate answer." }));
    } finally {
      setFaqLoading(null);
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

  /* ── Outrank competitor ────────────────────────────── */
  async function handleOutrank() {
    const url = outrankUrl.trim();
    const kw = outrankKeyword.trim() || keyword;
    if (!url || !kw) return;
    setOutrankLoading(true);
    setOutrankError("");
    try {
      const res = await fetch(`${API}/api/outrank-competitor`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          competitor_url: url,
          keyword: kw,
          your_url: targetUrl,
          business_name: businessName,
          business_type: businessType,
          location,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: `Request failed (${res.status})` }));
        throw new Error(err.detail || `Request failed (${res.status})`);
      }
      const data: OutrankResult = await res.json();
      setOutrankResults((prev) => [data, ...prev]);
      setOutrankUrl("");
      setOutrankKeyword("");
    } catch (err) {
      setOutrankError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setOutrankLoading(false);
    }
  }

  /* ── Helper: strip HTML tags for plain text copy ───── */
  function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  }

  return (
    <div className="animate-fadeIn space-y-2">
      {/* ── Stat Row (audit data only) ─────────────────── */}
      {cd && (
        <StatRow>
          <StatBox
            label="Homepage Words"
            value={wordCount.toLocaleString()}
            color={wordCount >= 800 ? "#10b981" : wordCount >= 300 ? "#f59e0b" : "#f43f5e"}
          />
          <StatBox
            label="Pages to Rewrite"
            value={rewrites.length || "0"}
            color={rewrites.length > 0 ? "#f59e0b" : "#10b981"}
          />
          <StatBox
            label="Area Pages Needed"
            value={areaPages.length}
            color={areaPages.length > 0 ? "#3b82f6" : "#10b981"}
          />
          <StatBox
            label="FAQ Suggestions"
            value={faqItems.length}
            color="#8b5cf6"
          />
        </StatRow>
      )}

      {/* ═══ 1. SEO CONTENT ENGINE ═════════════════════════ */}
      <SectionHead
        title="SEO Content Engine"
        subtitle="15-rule AI content generation with competitor analysis and scoring"
      />

      {/* Engine controls */}
      <Card title="Generate SEO Content" dotColor="#10b981" meta="15-Rule Engine">
        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <BtnPrimary
            onClick={() => generateSeoContent("engine-homepage", "homepage")}
            disabled={!!seoLoading}
          >
            {seoLoading === "engine-homepage" ? "Generating..." : "Homepage"}
          </BtnPrimary>
          {areaPages.slice(0, 3).map((area, i) => (
            <BtnPrimary
              key={i}
              small
              onClick={() =>
                generateSeoContent(`engine-area-${i}`, "area", {
                  targetCity: area.city,
                  serviceName: businessType,
                  targetKeyword: `${businessType} ${area.city}`.toLowerCase(),
                })
              }
              disabled={!!seoLoading}
            >
              {seoLoading === `engine-area-${i}` ? "..." : area.city}
            </BtnPrimary>
          ))}
        </div>

        {/* Multi-step progress */}
        {seoLoading && engineStep && (
          <EngineProgress step={engineStep} />
        )}
      </Card>

      {/* SEO Engine Result: Two-panel layout */}
      {seoResult && (
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-3">
          {/* LEFT: Content Preview */}
          <ContentPreview
            result={seoResult}
            onCopyHtml={() => {
              navigator.clipboard.writeText(seoResult.content.content);
            }}
            onCopyText={() => {
              navigator.clipboard.writeText(stripHtml(seoResult.content.content));
            }}
          />
          {/* RIGHT: Score Card */}
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
        </div>
      )}

      {/* ═══ 2. PAGE CONTENT GENERATOR ════════════════════ */}
      {crawledPages.length > 0 && (
        <>
          <SectionHead
            title="Page Content Generator"
            subtitle={`${crawledPages.length} crawled pages — generate optimized rewrites`}
          />
          <Card
            title="Crawled Pages"
            dotColor="#10b981"
            meta={`${crawledPages.length} pages`}
            noPadding
          >
            <DataTable
              columns={PAGE_COLUMNS}
              rows={crawledPages.map((page, i) => {
                const key = `page-${i}`;
                const content = generated[key];
                const issues = page.issues?.length ?? 0;
                return {
                  url: (
                    <span className="text-zinc-300 text-[11px] truncate max-w-[200px] block">
                      {page.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                    </span>
                  ),
                  title: (
                    <span className="text-zinc-400 text-[11px] truncate max-w-[180px] block">
                      {page.title || "\u2014"}
                    </span>
                  ),
                  words: (
                    <span className="font-mono text-[11px] text-zinc-400">
                      {page.word_count}
                    </span>
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
                        generateContent(
                          key,
                          "page_rewrite",
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

          {/* Show generated page content inline */}
          {crawledPages.map((_, i) => {
            const key = `page-${i}`;
            const content = generated[key];
            if (!content) return null;
            return (
              <Card key={key} title={`Rewrite: ${crawledPages[i].title || crawledPages[i].url}`} dotColor="#10b981">
                <div className="text-[11px] text-zinc-400 whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto">
                  {content}
                </div>
                <div className="mt-2 flex justify-end">
                  <CopyBtn text={content} />
                </div>
              </Card>
            );
          })}
        </>
      )}

      {/* ═══ PAGE REWRITES (from content_data) ═══════════ */}
      {rewrites.length > 0 && crawledPages.length === 0 && (
        <>
          <SectionHead
            title="Page Rewrites Needed"
            subtitle="Pages identified with thin or underoptimised content"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rewrites.map((rewrite, i) => {
              const key = `rewrite-${i}`;
              const content = generated[key];
              return (
                <ContentCard
                  key={i}
                  title={rewrite.title}
                  description={rewrite.issue}
                  tag={<Tag variant={rewrite.priority === "high" ? "high" : "med"}>{rewrite.priority}</Tag>}
                  meta={
                    !content ? (
                      <BtnPrimary
                        small
                        onClick={() => generateContent(key, "page_rewrite", rewrite.issue)}
                        disabled={loading === key}
                      >
                        {loading === key ? "Generating..." : "Generate Rewrite"}
                      </BtnPrimary>
                    ) : (
                      <CopyBtn text={content} />
                    )
                  }
                >
                  {content && (
                    <div className="mt-2 p-3 bg-surface-2 rounded-lg border border-white/[0.03] text-[11px] text-zinc-400 whitespace-pre-wrap leading-relaxed max-h-[200px] overflow-y-auto">
                      {content}
                    </div>
                  )}
                </ContentCard>
              );
            })}
          </div>
        </>
      )}

      {/* ═══ 3. SERVICE PAGE GENERATOR ════════════════════ */}
      {areaPages.length > 0 && (
        <>
          <SectionHead
            title="Service Area Pages"
            subtitle={`${areaPages.length} area pages recommended for local coverage`}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {areaPages.map((area, i) => {
              const key = `area-${i}`;
              const content = generated[key];
              return (
                <ContentCard
                  key={i}
                  title={area.title}
                  description={`SEO-optimized service page for ${area.city}`}
                  tag={<Tag variant="info">Area Page</Tag>}
                  meta={
                    !content ? (
                      <BtnPrimary
                        small
                        onClick={() => generateContent(key, "service_area_page", area.city)}
                        disabled={loading === key}
                      >
                        {loading === key ? "Generating..." : "Generate"}
                      </BtnPrimary>
                    ) : (
                      <CopyBtn text={content} />
                    )
                  }
                >
                  {content && (
                    <div className="mt-2 p-3 bg-surface-2 rounded-lg border border-white/[0.03] text-[11px] text-zinc-400 whitespace-pre-wrap leading-relaxed max-h-[200px] overflow-y-auto">
                      {content}
                    </div>
                  )}
                </ContentCard>
              );
            })}
          </div>
        </>
      )}

      {/* ═══ 4. SCHEMA GENERATOR ═════════════════════════ */}
      <SectionHead
        title="Schema Generator"
        subtitle="Generate JSON-LD structured data for your pages"
      />

      {/* Schema from audit (AI SEO agent templates) */}
      {schemaTemplates.length > 0 ? (
        <Card
          title="Recommended Schemas"
          dotColor="#f59e0b"
          meta={`${schemaTemplates.length} recommended`}
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
                      <p className="text-[10px] text-zinc-500 mt-0.5">{tpl.description}</p>
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
      ) : (
        <SchemaGeneratorCard
          schemaResults={schemaResults}
          schemaLoading={schemaLoading}
          onGenerate={generateSchema}
          targetUrl={targetUrl}
        />
      )}

      {/* Always show manual schema generator */}
      {schemaTemplates.length > 0 && (
        <SchemaGeneratorCard
          schemaResults={schemaResults}
          schemaLoading={schemaLoading}
          onGenerate={generateSchema}
          targetUrl={targetUrl}
        />
      )}

      {/* ═══ 5. COMPETITOR OUTRANK ═══════════════════════ */}
      <SectionHead
        title="Competitor Outrank"
        subtitle="Analyse a competitor page and generate content to beat it"
      />
      <Card title="Outrank a Competitor" dotColor="#f43f5e" meta="AI-powered">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={outrankUrl}
              onChange={(e) => setOutrankUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleOutrank()}
              placeholder="Competitor URL to outrank (e.g. https://competitor.com/service)"
              className="flex-1 bg-surface-1 border border-white/8 rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/40 transition-colors"
            />
            <input
              type="text"
              value={outrankKeyword}
              onChange={(e) => setOutrankKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleOutrank()}
              placeholder={keyword ? `Keyword (default: ${keyword})` : "Target keyword"}
              className="sm:w-56 bg-surface-1 border border-white/8 rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/40 transition-colors"
            />
          </div>
          <div className="flex justify-end">
            <BtnPrimary
              onClick={handleOutrank}
              disabled={outrankLoading || !outrankUrl.trim()}
            >
              {outrankLoading ? "Analysing..." : "Outrank"}
            </BtnPrimary>
          </div>
        </div>
        {outrankError && (
          <p className="text-[11px] text-rose-400 mt-2">{outrankError}</p>
        )}
      </Card>

      {/* Outrank results */}
      {outrankResults.map((result, i) => (
        <OutrankResultCard
          key={i}
          result={result}
          expanded={!!outrankExpanded[i]}
          onToggle={() =>
            setOutrankExpanded((prev) => ({ ...prev, [i]: !prev[i] }))
          }
        />
      ))}

      {/* ═══ FAQ GENERATOR ══════════════════════════════ */}
      {faqItems.length > 0 && (
        <>
          <SectionHead
            title="FAQ Section Generator"
            subtitle="Questions sourced from AI overviews and People Also Ask"
            action={
              <BtnGhost
                small
                onClick={async () => {
                  for (let i = 0; i < faqItems.length; i++) {
                    if (!faqAnswers[i]) {
                      await generateFaqAnswer(i, faqItems[i].question);
                    }
                  }
                }}
                disabled={faqLoading !== null}
              >
                Generate All
              </BtnGhost>
            }
          />
          <Card title="FAQ Questions" dotColor="#22d3ee" noPadding>
            <div>
              {faqItems.map((faq, i) => (
                <div key={i} className="px-4 py-3 border-b border-white/[0.03] last:border-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-[12px] text-zinc-300 font-medium">{faq.question}</p>
                      {faq.source && (
                        <span className="text-[10px] text-zinc-600 mt-0.5 block">{faq.source}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Tag variant="info">AI</Tag>
                      {!faqAnswers[i] ? (
                        <button
                          onClick={() => generateFaqAnswer(i, faq.question)}
                          disabled={faqLoading === i}
                          className="text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-50"
                        >
                          {faqLoading === i ? "..." : "Generate"}
                        </button>
                      ) : (
                        <CopyBtn text={faqAnswers[i]} />
                      )}
                    </div>
                  </div>
                  {faqAnswers[i] && (
                    <div className="mt-2 p-2.5 bg-surface-1 rounded-lg text-[11px] text-zinc-400 leading-relaxed">
                      {faqAnswers[i]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {/* ═══ BLOG TOPIC SUGGESTIONS ════════════════════ */}
      {blogTopics.length > 0 && (
        <>
          <SectionHead
            title="Blog Topic Suggestions"
            subtitle="Content gaps identified from competitor and keyword analysis"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {blogTopics.map((topic, i) => {
              const key = `blog-${i}`;
              const content = generated[key];
              return (
                <ContentCard
                  key={i}
                  title={topic.title}
                  description={`Blog article targeting "${topic.keyword || keyword}"`}
                  tag={<Tag variant="med">Blog</Tag>}
                  meta={
                    !content ? (
                      <BtnPrimary
                        small
                        onClick={() => generateContent(key, "blog_article", topic.title)}
                        disabled={loading === key}
                      >
                        {loading === key ? "Generating..." : "Generate Article"}
                      </BtnPrimary>
                    ) : (
                      <CopyBtn text={content} />
                    )
                  }
                >
                  {content && (
                    <div className="mt-2 p-3 bg-surface-2 rounded-lg border border-white/[0.03] text-[11px] text-zinc-400 whitespace-pre-wrap leading-relaxed max-h-[200px] overflow-y-auto">
                      {content}
                    </div>
                  )}
                </ContentCard>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}


/* ═══════════════════════════════════════════════════════ */
/* ── Engine Progress Stepper ───────────────────────────── */
/* ═══════════════════════════════════════════════════════ */

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
    <div className="flex items-center gap-3 py-2">
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
                  : "bg-white/5 text-zinc-600"
              }`}
            >
              {isDone ? "\u2713" : i + 1}
            </span>
            <span
              className={`text-[11px] ${
                isDone
                  ? "text-emerald-400"
                  : isActive
                  ? "text-amber-400"
                  : "text-zinc-600"
              }`}
            >
              {step === "fixing" && i === currentIdx ? "Fixing issues..." : s.label}
            </span>
            {i < STEPS.length - 1 && (
              <span className="w-4 h-px bg-white/10 mx-1" />
            )}
          </div>
        );
      })}
    </div>
  );
}


/* ═══════════════════════════════════════════════════════ */
/* ── Content Preview Panel ─────────────────────────────── */
/* ═══════════════════════════════════════════════════════ */

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
          <div>
            <label className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-0.5">Meta Title</label>
            <div className="bg-surface-1 border border-white/8 rounded-lg px-3 py-1.5 text-[12px] text-blue-400">
              {c.meta_title}
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-0.5">Meta Description</label>
            <div className="bg-surface-1 border border-white/8 rounded-lg px-3 py-1.5 text-[11px] text-zinc-300">
              {c.meta_description}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-0.5">URL Slug</label>
              <span className="text-[11px] text-emerald-400 font-mono">{c.url_slug}</span>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-0.5">Words</label>
              <span className="text-[11px] text-zinc-300 font-mono">{c.word_count}</span>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-0.5">Keywords</label>
              <span className="text-[11px] text-zinc-300 font-mono">{c.primary_keyword_count}x</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content body */}
      <div className="p-4">
        <div
          className="prose prose-sm prose-invert max-w-none text-[12px] leading-relaxed max-h-[500px] overflow-y-auto
            [&_h1]:text-[16px] [&_h1]:font-bold [&_h1]:font-display [&_h1]:text-white [&_h1]:mb-2 [&_h1]:mt-0
            [&_h2]:text-[14px] [&_h2]:font-semibold [&_h2]:font-display [&_h2]:text-zinc-200 [&_h2]:mb-1.5 [&_h2]:mt-4
            [&_h3]:text-[13px] [&_h3]:font-medium [&_h3]:text-zinc-300 [&_h3]:mb-1 [&_h3]:mt-3
            [&_p]:text-zinc-400 [&_p]:mb-2
            [&_ul]:text-zinc-400 [&_li]:mb-0.5
            [&_strong]:text-zinc-200"
          dangerouslySetInnerHTML={{ __html: c.content }}
        />
      </div>

      {/* Images */}
      {c.images?.length > 0 && (
        <div className="px-4 pb-3">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1.5">Image Suggestions</p>
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
          <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1.5">Internal Links</p>
          <div className="space-y-1">
            {c.internal_links.map((link, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px]">
                <span className="text-emerald-400">{link.anchor}</span>
                <span className="text-zinc-600">&rarr;</span>
                <span className="text-zinc-500 font-mono">{link.url}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQs */}
      {c.faqs?.length > 0 && (
        <div className="px-4 pb-3">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1.5">FAQs ({c.faqs.length})</p>
          <div className="space-y-2">
            {c.faqs.map((faq, i) => (
              <div key={i} className="bg-surface-1 border border-white/6 rounded-lg p-2.5">
                <p className="text-[11px] text-zinc-200 font-medium">{faq.question}</p>
                <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Semantic keywords */}
      {c.semantic_keywords_used?.length > 0 && (
        <div className="px-4 pb-3">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1.5">Semantic Keywords Used</p>
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
          className="text-[11px] px-3 py-1.5 rounded-lg bg-surface-1 border border-white/8 text-zinc-400 hover:text-white transition-colors"
        >
          {copied === "html" ? "Copied!" : "Copy HTML"}
        </button>
        <button
          onClick={() => handleCopy("text")}
          className="text-[11px] px-3 py-1.5 rounded-lg bg-surface-1 border border-white/8 text-zinc-400 hover:text-white transition-colors"
        >
          {copied === "text" ? "Copied!" : "Copy Text"}
        </button>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════ */
/* ── SEO Score Card Panel ──────────────────────────────── */
/* ═══════════════════════════════════════════════════════ */

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
            <span className="text-[10px] text-zinc-500">/ 100</span>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span
            className="text-[18px] font-bold font-display"
            style={{ color }}
          >
            {scoreCard.grade}
          </span>
          <span className="text-[11px] text-zinc-500">
            {scoreCard.total_score}/{scoreCard.max_score} points
          </span>
        </div>
      </div>

      {/* Competitor info */}
      <div className="px-4 py-2 border-b border-white/6 flex gap-4 text-[10px] text-zinc-500">
        <span>Competitors: <span className="text-zinc-300 font-mono">{competitorAnalysis.competitors_analyzed}</span></span>
        <span>Avg words: <span className="text-zinc-300 font-mono">{competitorAnalysis.avg_words}</span></span>
        <span>Target: <span className="text-zinc-300 font-mono">{competitorAnalysis.target_words}</span></span>
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
        <div className="flex items-center justify-between mb-2 text-[10px] text-zinc-500">
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
          <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1.5">Competitor Gaps</p>
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


/* ═══════════════════════════════════════════════════════ */
/* ── Rule Row ──────────────────────────────────────────── */
/* ═══════════════════════════════════════════════════════ */

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
        <span className={`flex-1 text-[11px] ${info.status === "fail" ? "text-zinc-200 font-medium" : "text-zinc-400"}`}>
          {RULE_LABELS[rule] || rule}
        </span>
        <span className="text-[11px] font-mono text-zinc-500">
          {info.score}/{info.max}
        </span>
        <svg
          className={`w-3 h-3 text-zinc-600 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && (
        <div className="px-4 pb-2 pl-8">
          <p className="text-[10px] text-zinc-500 leading-relaxed">{info.detail}</p>
          {/* Keyword placement positions */}
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


/* ═══════════════════════════════════════════════════════ */
/* ── Schema Generator Card (manual) ──────────────────── */
/* ═══════════════════════════════════════════════════════ */

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
    <Card title="Generate Schema" dotColor="#8b5cf6" meta="Custom">
      <div className="space-y-3">
        <input
          type="text"
          value={pageUrl}
          onChange={(e) => setPageUrl(e.target.value)}
          placeholder="Page URL (leave empty for homepage)"
          className="w-full bg-surface-1 border border-white/8 rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/40 transition-colors"
        />
        <div className="flex flex-wrap gap-1.5">
          {SCHEMA_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => toggleType(t)}
              className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                selectedTypes.includes(t)
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                  : "bg-surface-1 border-white/8 text-zinc-500 hover:text-zinc-300"
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

      {/* Schema output */}
      {results && results.length > 0 && (
        <div className="mt-4 space-y-3">
          {results.map((schema, i) => (
            <div
              key={i}
              className="bg-surface-1 border border-white/6 rounded-lg p-3"
            >
              <div className="flex items-start justify-between mb-1">
                <div>
                  <span className="text-[12px] font-semibold text-white font-display">
                    {schema.type}
                  </span>
                  {schema.description && (
                    <p className="text-[10px] text-zinc-500 mt-0.5">{schema.description}</p>
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
        <p className="mt-3 text-[11px] text-zinc-500">No schemas generated. Try again.</p>
      )}
    </Card>
  );
}


/* ═══════════════════════════════════════════════════════ */
/* ── Outrank Result Card ─────────────────────────────── */
/* ═══════════════════════════════════════════════════════ */

function OutrankResultCard({
  result,
  expanded,
  onToggle,
}: {
  result: OutrankResult;
  expanded: boolean;
  onToggle: () => void;
}) {
  const analysis = result.competitor_analysis;

  return (
    <div className="bg-surface-2 border border-white/6 rounded-xl overflow-hidden">
      {/* Header — competitor analysis summary */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h4 className="text-[14px] font-semibold font-display text-white">
            {analysis.title || "Competitor Analysis"}
          </h4>
          <Tag variant="high">
            {analysis.word_count.toLocaleString()} words
          </Tag>
        </div>

        {/* Strengths & weaknesses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          {analysis.strengths.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Strengths</p>
              <ul className="space-y-1">
                {analysis.strengths.map((s, i) => (
                  <li key={i} className="text-[11px] text-zinc-400 flex gap-1.5">
                    <span className="text-emerald-400 shrink-0">+</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {analysis.weaknesses.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Weaknesses</p>
              <ul className="space-y-1">
                {analysis.weaknesses.map((w, i) => (
                  <li key={i} className="text-[11px] text-zinc-400 flex gap-1.5">
                    <span className="text-rose-400 shrink-0">-</span> {w}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Keywords targeted */}
        {analysis.keywords_targeted.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {analysis.keywords_targeted.map((kw) => (
              <span
                key={kw}
                className="text-[9px] bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded-md"
              >
                {kw}
              </span>
            ))}
          </div>
        )}

        {/* Strategy */}
        {result.outrank_strategy && (
          <p className="text-[11px] text-zinc-500 leading-relaxed mb-3">
            <span className="text-emerald-400 font-medium">Strategy: </span>
            {result.outrank_strategy}
          </p>
        )}

        {/* Meta tags */}
        {result.meta_title && (
          <div className="bg-surface-1 border border-white/6 rounded-lg p-2.5 mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500">Meta Tags</span>
              <CopyBtn text={`Title: ${result.meta_title}\nDescription: ${result.meta_description}`} />
            </div>
            <p className="text-[12px] text-blue-400 font-medium">{result.meta_title}</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">{result.meta_description}</p>
          </div>
        )}

        {/* Schema + internal links row */}
        <div className="flex flex-wrap gap-3 text-[11px] text-zinc-400">
          {result.word_count > 0 && (
            <span>Words: <span className="text-zinc-200 font-mono">{result.word_count.toLocaleString()}</span></span>
          )}
          {result.schema_recommendation && (
            <span>Schema: <span className="text-zinc-200">{result.schema_recommendation}</span></span>
          )}
          {result.internal_links?.length > 0 && (
            <span>Internal links: <span className="text-zinc-200 font-mono">{result.internal_links.length}</span></span>
          )}
        </div>

        {/* Toggle content */}
        {result.generated_content && (
          <button
            onClick={onToggle}
            className="mt-3 text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            {expanded ? "Hide generated content" : "View generated content"}
          </button>
        )}
      </div>

      {/* Expandable content */}
      {expanded && result.generated_content && (
        <div className="border-t border-white/6 p-4">
          <div className="flex justify-end mb-2">
            <CopyBtn text={result.generated_content} />
          </div>
          <div className="text-[11px] text-zinc-400 whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto">
            {result.generated_content}
          </div>

          {/* Internal links table */}
          {result.internal_links?.length > 0 && (
            <div className="mt-4">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">Suggested Internal Links</p>
              <DataTable
                columns={LINK_COLUMNS}
                rows={result.internal_links.map((link) => ({
                  anchor: <span className="text-emerald-400 text-[11px]">{link.anchor}</span>,
                  target: <span className="text-zinc-300 text-[11px]">{link.target}</span>,
                  reason: <span className="text-zinc-500 text-[11px]">{link.reason}</span>,
                }))}
              />
            </div>
          )}
        </div>
      )}
    </div>
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

const LINK_COLUMNS: Column[] = [
  { key: "anchor", label: "Anchor Text" },
  { key: "target", label: "Target Page" },
  { key: "reason", label: "Reason" },
];

/* ── Utility ─────────────────────────────────────────── */
function formatJsonLd(jsonStr: string): string {
  try {
    return JSON.stringify(JSON.parse(jsonStr), null, 2);
  } catch {
    return jsonStr;
  }
}

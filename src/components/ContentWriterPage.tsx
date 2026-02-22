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
  Tag,
  BtnPrimary,
  BtnGhost,
  CopyBtn,
} from "@/components/tool-ui";
import type {
  OnPageSeoAgent,
  KeywordResearchAgent,
  LocalSeoAgent,
  AiSeoAgent,
} from "@/types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/* ── Main Component ──────────────────────────────────────── */
export function ContentWriterPage() {
  const { lastAudit, agentCache } = useDashboard();
  const { data: session } = useSession();

  const onPageData = agentCache.on_page_seo as OnPageSeoAgent | undefined;
  const keywordData = agentCache.keyword_research as KeywordResearchAgent | undefined;
  const localData = agentCache.local_seo as LocalSeoAgent | undefined;
  const aiSeoData = agentCache.ai_seo as AiSeoAgent | undefined;

  /* Generation state */
  const [generated, setGenerated] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [faqAnswers, setFaqAnswers] = useState<Record<number, string>>({});
  const [faqLoading, setFaqLoading] = useState<number | null>(null);

  const keyword = lastAudit?.keyword ?? "";
  const businessName = lastAudit?.business_name ?? "";
  const businessType = lastAudit?.business_type ?? "";
  const location = lastAudit?.location ?? "";
  const targetUrl = lastAudit?.target_url ?? "";

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (session?.accessToken) headers.Authorization = `Bearer ${session.accessToken}`;

  /* ── Stat data ─────────────────────────────────────── */
  const wordCount = onPageData?.recommendations?.current_analysis?.word_count ?? 0;
  const areaPages = localData?.recommendations?.local_content_strategy?.service_area_pages ?? [];
  const blogTopics = keywordData?.recommendations?.content_gap_opportunities ?? [];
  const faqItems = aiSeoData?.analysis?.faq_content ?? [];

  // Issues with thin content
  const issues = onPageData?.recommendations?.current_analysis?.issues_found ?? [];
  const thinIssues = issues.filter(
    (iss) => iss.toLowerCase().includes("word count") || iss.toLowerCase().includes("thin")
  );

  /* ── Generate content ──────────────────────────────── */
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

  return (
    <div className="animate-fadeIn space-y-2">
      {/* ── Stat Row ────────────────────────────────────── */}
      <StatRow>
        <StatBox
          label="Homepage Words"
          value={wordCount.toLocaleString()}
          color={wordCount >= 800 ? "#10b981" : wordCount >= 300 ? "#f59e0b" : "#f43f5e"}
        />
        <StatBox
          label="Pages to Rewrite"
          value={thinIssues.length || "0"}
          color={thinIssues.length > 0 ? "#f59e0b" : "#10b981"}
        />
        <StatBox
          label="Area Pages Needed"
          value={areaPages.length}
          color={areaPages.length > 0 ? "#3b82f6" : "#10b981"}
        />
        <StatBox
          label="Blog Posts Suggested"
          value={blogTopics.length}
          color="#8b5cf6"
        />
      </StatRow>

      {/* ═══ PAGE REWRITES ══════════════════════════════ */}
      <SectionHead
        title="Page Rewrites Needed"
        subtitle="Pages identified with thin or underoptimised content"
      />
      {thinIssues.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {thinIssues.map((issue, i) => {
            const key = `rewrite-${i}`;
            const content = generated[key];
            return (
              <ContentCard
                key={i}
                title="Homepage Rewrite"
                description={issue}
                tag={<Tag variant="high">Priority</Tag>}
                meta={
                  !content ? (
                    <BtnPrimary
                      small
                      onClick={() => generateContent(key, "page_rewrite", issue)}
                      disabled={loading === key}
                    >
                      {loading === key ? "Generating…" : "Generate Rewrite"}
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
      ) : (
        <div className="bg-surface-2 border border-white/6 rounded-[14px] p-6 text-center">
          <p className="text-[12px] text-zinc-500">No thin content issues found — great job!</p>
        </div>
      )}

      {/* ═══ SERVICE AREA PAGES ═════════════════════════ */}
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
                  title={area}
                  description={`SEO-optimized service page for ${area}`}
                  tag={<Tag variant="info">Area Page</Tag>}
                  meta={
                    !content ? (
                      <BtnPrimary
                        small
                        onClick={() => generateContent(key, "service_area_page", area)}
                        disabled={loading === key}
                      >
                        {loading === key ? "Generating…" : "Generate"}
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
                      {faq.ai_intent && (
                        <span className="text-[10px] text-zinc-600 mt-0.5 block">{faq.ai_intent}</span>
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
                          {faqLoading === i ? "…" : "Generate"}
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
                  title={topic}
                  description={`Blog article targeting content gap for "${keyword}"`}
                  tag={<Tag variant="med">Blog</Tag>}
                  meta={
                    !content ? (
                      <BtnPrimary
                        small
                        onClick={() => generateContent(key, "blog_article", topic)}
                        disabled={loading === key}
                      >
                        {loading === key ? "Generating…" : "Generate Article"}
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

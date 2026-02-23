"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useDashboard } from "@/components/DashboardContext";
import {
  SectionHead,
  Card,
  ContentCard,
  Tag,
  BtnPrimary,
  BtnGhost,
  CopyBtn,
  ExpandableContent,
} from "@/components/tool-ui";
import type { CalendarWeek, CalendarPost, ContentData } from "@/types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/* ── Tab definitions ──────────────────────────────────── */
const TABS = [
  { key: "blog", label: "Blog Posts" },
  { key: "gmb", label: "GMB Posts" },
  { key: "social", label: "Social Media" },
  { key: "guest", label: "Guest Posts" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

/* ── Social platforms ─────────────────────────────────── */
const SOCIAL_PLATFORMS = ["instagram", "facebook", "linkedin", "twitter"] as const;
type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

const PLATFORM_COLORS: Record<SocialPlatform, string> = {
  instagram: "#e1306c",
  facebook: "#1877f2",
  linkedin: "#0a66c2",
  twitter: "#1da1f2",
};

/* ── Guest post platforms ─────────────────────────────── */
const GUEST_PLATFORMS = [
  { key: "medium", label: "Medium" },
  { key: "linkedin", label: "LinkedIn Articles" },
  { key: "blogger", label: "Blogger" },
  { key: "tumblr", label: "Tumblr" },
  { key: "industry", label: "Industry Site" },
] as const;

/* ── Social result type ──────────────────────────────── */
interface SocialResult {
  content: string;
  hashtags?: string[];
  post_idea?: string;
  best_time?: string;
  cta?: string;
  thread?: string[];
}

/* ── Main Component ──────────────────────────────────── */
export function PostCreatorPage() {
  const { lastAudit } = useDashboard();
  const { data: session } = useSession();

  const keyword = lastAudit?.keyword ?? "";
  const businessName = lastAudit?.business_name ?? "";
  const businessType = lastAudit?.business_type ?? "";
  const location = lastAudit?.location ?? "";
  const targetUrl = lastAudit?.target_url ?? "";

  const [activeTab, setActiveTab] = useState<TabKey>("blog");

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (session?.accessToken) headers.Authorization = `Bearer ${session.accessToken}`;

  /* ── Blog state ────────────────────────────────────── */
  const cd = lastAudit?.content_data as ContentData | undefined;
  const blogTopics = cd?.blog_topics ?? [];
  const [blogGenerated, setBlogGenerated] = useState<Record<string, string>>({});
  const [blogLoading, setBlogLoading] = useState<string | null>(null);
  const [customBlogTopic, setCustomBlogTopic] = useState("");
  const [customBlogWords, setCustomBlogWords] = useState("1500");

  /* ── GMB state ─────────────────────────────────────── */
  const auditCalendar = lastAudit?.post_calendar as CalendarWeek[] | undefined;
  const [calendar, setCalendar] = useState<CalendarWeek[] | null>(
    auditCalendar && auditCalendar.length > 0 ? auditCalendar : null
  );
  const [calLoading, setCalLoading] = useState(false);
  const [gmbGenerated, setGmbGenerated] = useState<Record<string, string>>({});
  const [gmbLoading, setGmbLoading] = useState<string | null>(null);

  /* ── Social state ──────────────────────────────────── */
  const [socialPlatform, setSocialPlatform] = useState<SocialPlatform>("instagram");
  const [socialTopic, setSocialTopic] = useState("");
  const [socialResults, setSocialResults] = useState<Record<string, SocialResult>>({});
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [allPlatformsLoading, setAllPlatformsLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [allPlatformsResult, setAllPlatformsResult] = useState<Record<string, any> | null>(null);

  /* ── Guest state ───────────────────────────────────── */
  const [guestPlatform, setGuestPlatform] = useState("medium");
  const [guestTopic, setGuestTopic] = useState("");
  const [guestResults, setGuestResults] = useState<
    Array<{ platform: string; content: string; title?: string; author_bio?: string; word_count?: number }>
  >([]);
  const [guestLoading, setGuestLoading] = useState(false);

  /* ── Review state ──────────────────────────────────── */
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewResponse, setReviewResponse] = useState<string | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  /* ══════════════════════════════════════════════════════
     Handlers
     ══════════════════════════════════════════════════════ */

  async function generateBlog(key: string, topic: string, wordTarget: number = 1500) {
    setBlogLoading(key);
    try {
      const res = await fetch(`${API}/api/generate-blog`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          topic,
          keyword,
          business_name: businessName,
          business_type: businessType,
          location,
          word_target: wordTarget,
        }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();
      const content = data.content ?? "";
      const meta = data.meta_title
        ? `\n\n---\nMeta Title: ${data.meta_title}\nMeta Description: ${data.meta_description}\nWord Count: ${data.word_count}`
        : "";
      setBlogGenerated((prev) => ({ ...prev, [key]: content + meta }));
    } catch {
      setBlogGenerated((prev) => ({ ...prev, [key]: "Failed to generate. Try again." }));
    } finally {
      setBlogLoading(null);
    }
  }

  async function generateCalendar() {
    setCalLoading(true);
    try {
      const res = await fetch(`${API}/api/generate-calendar`, {
        method: "POST",
        headers,
        body: JSON.stringify({ keyword, business_name: businessName, business_type: businessType, location }),
      });
      if (!res.ok) throw new Error("Calendar generation failed");
      const data = await res.json();
      setCalendar(data.weeks ?? []);
    } catch {
      setCalendar(null);
    } finally {
      setCalLoading(false);
    }
  }

  async function generateGmbPost(weekIdx: number, postIdx: number, post: CalendarPost) {
    const key = `${weekIdx}-${postIdx}`;
    setGmbLoading(key);
    try {
      const res = await fetch(`${API}/api/generate-post`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          topic: post.title,
          post_type: post.type,
          keyword,
          business_name: businessName,
          business_type: businessType,
          location,
        }),
      });
      if (!res.ok) throw new Error("Post generation failed");
      const data = await res.json();
      setGmbGenerated((prev) => ({
        ...prev,
        [key]: data.content + (data.hashtags?.length ? `\n\n${data.hashtags.join(" ")}` : ""),
      }));
    } catch {
      setGmbGenerated((prev) => ({ ...prev, [key]: "Failed to generate. Try again." }));
    } finally {
      setGmbLoading(null);
    }
  }

  async function generateSocialPost(platform: SocialPlatform, topic: string) {
    const key = `${platform}-${topic}`;
    setSocialLoading(key);
    try {
      const res = await fetch(`${API}/api/generate-social-post`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          topic,
          platform,
          keyword,
          business_name: businessName,
          business_type: businessType,
          location,
        }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data: SocialResult = await res.json();
      setSocialResults((prev) => ({ ...prev, [key]: data }));
    } catch {
      setSocialResults((prev) => ({ ...prev, [key]: { content: "Failed to generate. Try again." } }));
    } finally {
      setSocialLoading(null);
    }
  }

  async function generateAllPlatforms() {
    if (!socialTopic.trim()) return;
    setAllPlatformsLoading(true);
    setAllPlatformsResult(null);
    try {
      const res = await fetch(`${API}/api/generate-social-all`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          topic: socialTopic.trim(),
          keyword,
          business_name: businessName,
          business_type: businessType,
          location,
        }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();
      setAllPlatformsResult(data);
    } catch {
      setAllPlatformsResult(null);
    } finally {
      setAllPlatformsLoading(false);
    }
  }

  async function generateGuestPost() {
    if (!guestTopic.trim()) return;
    setGuestLoading(true);
    try {
      const res = await fetch(`${API}/api/generate-guest-post`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          topic: guestTopic.trim(),
          platform: guestPlatform,
          keyword,
          business_name: businessName,
          business_type: businessType,
          location,
          target_url: targetUrl,
        }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();
      setGuestResults((prev) => [
        {
          platform: guestPlatform,
          content: data.content ?? "",
          title: data.title,
          author_bio: data.author_bio,
          word_count: data.word_count,
        },
        ...prev,
      ]);
      setGuestTopic("");
    } catch {
      /* ignore */
    } finally {
      setGuestLoading(false);
    }
  }

  async function generateReviewResponse() {
    if (!reviewText.trim()) return;
    setReviewLoading(true);
    setReviewResponse(null);
    try {
      const res = await fetch(`${API}/api/generate-review-response`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          review_text: reviewText,
          rating: reviewRating,
          business_name: businessName,
          business_type: businessType,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setReviewResponse(data.response);
    } catch {
      setReviewResponse("Failed to generate response. Please try again.");
    } finally {
      setReviewLoading(false);
    }
  }

  /* ══════════════════════════════════════════════════════
     Render
     ══════════════════════════════════════════════════════ */
  return (
    <div className="animate-fadeIn space-y-5">
      {/* ── Tab Navigation ───────────────────────────────── */}
      <div className="flex gap-1 p-1 bg-surface-2 border border-white/6 rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-[12px] font-medium transition-all ${
              activeTab === tab.key
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                : "text-zinc-500 hover:text-zinc-300 border border-transparent"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══ TAB 1: BLOG POSTS ═══════════════════════════ */}
      {activeTab === "blog" && (
        <>
          {/* Custom blog generator */}
          <Card title="Custom Blog Post" dotColor="#8b5cf6" meta="Generate any topic">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={customBlogTopic}
                onChange={(e) => setCustomBlogTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && customBlogTopic.trim() && generateBlog("custom", customBlogTopic.trim(), parseInt(customBlogWords) || 1500)}
                placeholder="Enter blog topic or keyword..."
                className="flex-1 bg-surface-1 border border-white/8 rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/40 transition-colors"
              />
              <input
                type="number"
                value={customBlogWords}
                onChange={(e) => setCustomBlogWords(e.target.value)}
                placeholder="Words"
                className="w-24 bg-surface-1 border border-white/8 rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/40 transition-colors"
              />
              <BtnPrimary
                onClick={() => generateBlog("custom", customBlogTopic.trim(), parseInt(customBlogWords) || 1500)}
                disabled={blogLoading === "custom" || !customBlogTopic.trim()}
              >
                {blogLoading === "custom" ? "Generating..." : "Generate"}
              </BtnPrimary>
            </div>
            {blogGenerated["custom"] && (
              <div className="mt-3">
                <div className="flex justify-end mb-1">
                  <CopyBtn text={blogGenerated["custom"]} />
                </div>
                <div className="p-3 bg-surface-1 rounded-lg border border-white/[0.03] text-[11px] text-zinc-400 whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto">
                  {blogGenerated["custom"]}
                </div>
              </div>
            )}
          </Card>

          {/* Blog topics from audit */}
          {blogTopics.length > 0 && (
            <>
              <SectionHead
                title="Blog Topics from Audit"
                subtitle="Content gaps identified from keyword and competitor analysis"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {blogTopics.map((topic, i) => {
                  const key = `blog-${i}`;
                  const content = blogGenerated[key];
                  return (
                    <ContentCard
                      key={i}
                      title={topic.title}
                      description={`Target: "${topic.keyword || keyword}"`}
                      tag={<Tag variant="info">{topic.intent || "blog"}</Tag>}
                      meta={
                        !content ? (
                          <BtnPrimary
                            small
                            onClick={() => generateBlog(key, topic.title)}
                            disabled={blogLoading === key}
                          >
                            {blogLoading === key ? "Generating..." : "Generate Article"}
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
        </>
      )}

      {/* ═══ TAB 2: GMB POSTS ════════════════════════════ */}
      {activeTab === "gmb" && (
        <>
          <SectionHead
            title="4-Week Content Calendar"
            subtitle={`Tailored for ${businessName || "your business"} · ${keyword}`}
            action={
              calendar ? (
                <BtnGhost small onClick={generateCalendar} disabled={calLoading}>
                  {calLoading ? "Regenerating..." : "Regenerate"}
                </BtnGhost>
              ) : undefined
            }
          />

          {!calendar ? (
            <div className="text-center py-10 bg-surface-2 border border-white/6 rounded-[14px]">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
              </div>
              <p className="text-[13px] text-zinc-400 mb-4">
                Generate a 4-week content calendar with GBP posts, social media posts, and blog intros
              </p>
              <BtnPrimary onClick={generateCalendar} disabled={calLoading}>
                {calLoading ? "Generating Calendar..." : "Generate Calendar"}
              </BtnPrimary>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {calendar.map((week, wi) => (
                <div
                  key={wi}
                  className="bg-surface-1 border border-white/6 rounded-[10px] p-3.5 hover:border-white/12 transition-colors"
                >
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2.5">
                    {week.label}
                  </div>
                  <div className="space-y-0">
                    {week.posts.map((post, pi) => {
                      const key = `${wi}-${pi}`;
                      const generated = gmbGenerated[key];
                      const isLoading = gmbLoading === key;
                      return (
                        <div key={pi} className="py-2.5 border-b border-white/[0.03] last:border-0">
                          <div className="text-[9px] uppercase text-zinc-600 mb-0.5">{post.type}</div>
                          <div className="text-[11px] font-medium text-zinc-300 leading-snug mb-1.5">
                            {post.title}
                          </div>
                          {!generated ? (
                            <button
                              onClick={() => generateGmbPost(wi, pi, post)}
                              disabled={isLoading}
                              className="text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-50"
                            >
                              {isLoading ? "Generating..." : "Generate"}
                            </button>
                          ) : (
                            <div className="mt-1">
                              <div className="text-[11px] text-zinc-400 whitespace-pre-wrap leading-relaxed bg-surface-2 rounded-lg p-2.5 border border-white/[0.03]">
                                {generated}
                              </div>
                              <div className="flex justify-end mt-1">
                                <CopyBtn text={generated} />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ═══ TAB 3: SOCIAL MEDIA ═════════════════════════ */}
      {activeTab === "social" && (
        <>
          {/* Platform sub-tabs */}
          <div className="flex gap-1.5 flex-wrap">
            {SOCIAL_PLATFORMS.map((p) => (
              <button
                key={p}
                onClick={() => setSocialPlatform(p)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all border ${
                  socialPlatform === p
                    ? "text-white border-white/20"
                    : "text-zinc-500 border-transparent hover:text-zinc-300"
                }`}
                style={
                  socialPlatform === p
                    ? { backgroundColor: `${PLATFORM_COLORS[p]}20`, borderColor: `${PLATFORM_COLORS[p]}40` }
                    : undefined
                }
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          {/* Single platform generator */}
          <Card
            title={`${socialPlatform.charAt(0).toUpperCase() + socialPlatform.slice(1)} Post`}
            dotColor={PLATFORM_COLORS[socialPlatform]}
            meta="Single platform"
          >
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={socialTopic}
                onChange={(e) => setSocialTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && socialTopic.trim() && generateSocialPost(socialPlatform, socialTopic.trim())}
                placeholder="Enter post topic..."
                className="flex-1 bg-surface-1 border border-white/8 rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/40 transition-colors"
              />
              <BtnPrimary
                onClick={() => generateSocialPost(socialPlatform, socialTopic.trim())}
                disabled={!!socialLoading || !socialTopic.trim()}
              >
                {socialLoading ? "Generating..." : "Generate"}
              </BtnPrimary>
              <BtnGhost
                onClick={generateAllPlatforms}
                disabled={allPlatformsLoading || !socialTopic.trim()}
              >
                {allPlatformsLoading ? "Generating..." : "All Platforms"}
              </BtnGhost>
            </div>

            {/* Single platform result */}
            {(() => {
              const key = `${socialPlatform}-${socialTopic.trim()}`;
              const result = socialResults[key];
              if (!result) return null;
              return <SocialResultCard result={result} platform={socialPlatform} />;
            })()}
          </Card>

          {/* All platforms result */}
          {allPlatformsResult && (
            <>
              <SectionHead title="All Platforms" subtitle="Generated from one topic" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SOCIAL_PLATFORMS.map((p) => {
                  const data = allPlatformsResult[p];
                  if (!data) return null;
                  return (
                    <div key={p} className="bg-surface-2 border border-white/6 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: PLATFORM_COLORS[p] }}
                        />
                        <span className="text-[13px] font-semibold font-display text-white">
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </span>
                        <CopyBtn text={data.content + (data.hashtags?.length ? `\n\n${data.hashtags.join(" ")}` : "")} />
                      </div>
                      <div className="text-[11px] text-zinc-400 whitespace-pre-wrap leading-relaxed max-h-[200px] overflow-y-auto">
                        {data.content}
                      </div>
                      {data.hashtags?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {data.hashtags.slice(0, 15).map((h: string) => (
                            <span key={h} className="text-[9px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                              {h}
                            </span>
                          ))}
                          {data.hashtags.length > 15 && (
                            <span className="text-[9px] text-zinc-500">+{data.hashtags.length - 15} more</span>
                          )}
                        </div>
                      )}
                      {data.thread?.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Thread</span>
                          {data.thread.map((tweet: string, ti: number) => (
                            <div key={ti} className="text-[10px] text-zinc-400 bg-surface-1 p-2 rounded border border-white/[0.03]">
                              {ti + 1}. {tweet}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Previous single results */}
          {Object.entries(socialResults).length > 0 && (
            <>
              <SectionHead title="Previous Results" subtitle="Generated social posts" />
              <div className="space-y-3">
                {Object.entries(socialResults).map(([key, result]) => {
                  const platform = key.split("-")[0] as SocialPlatform;
                  return (
                    <div key={key} className="bg-surface-2 border border-white/6 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: PLATFORM_COLORS[platform] ?? "#6366f1" }}
                        />
                        <span className="text-[12px] font-semibold text-white font-display">
                          {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </span>
                        <span className="text-[10px] text-zinc-500">{key.split("-").slice(1).join("-")}</span>
                        <CopyBtn text={result.content + (result.hashtags?.length ? `\n\n${result.hashtags.join(" ")}` : "")} />
                      </div>
                      <div className="text-[11px] text-zinc-400 whitespace-pre-wrap leading-relaxed">
                        {result.content}
                      </div>
                      {result.hashtags && result.hashtags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {result.hashtags.map((h) => (
                            <span key={h} className="text-[9px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                              {h}
                            </span>
                          ))}
                        </div>
                      )}
                      {result.post_idea && (
                        <p className="mt-2 text-[10px] text-zinc-500">
                          <span className="text-emerald-400">Idea:</span> {result.post_idea}
                        </p>
                      )}
                      {result.best_time && (
                        <p className="text-[10px] text-zinc-500">
                          <span className="text-amber-400">Best time:</span> {result.best_time}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      {/* ═══ TAB 4: GUEST POSTS ══════════════════════════ */}
      {activeTab === "guest" && (
        <>
          <Card title="Guest Post Generator" dotColor="#f59e0b" meta="Link building">
            {/* Platform selector */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {GUEST_PLATFORMS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setGuestPlatform(p.key)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all border ${
                    guestPlatform === p.key
                      ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                      : "bg-surface-1 border-white/8 text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={guestTopic}
                onChange={(e) => setGuestTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && guestTopic.trim() && generateGuestPost()}
                placeholder={`Topic for ${GUEST_PLATFORMS.find((p) => p.key === guestPlatform)?.label ?? "guest"} article...`}
                className="flex-1 bg-surface-1 border border-white/8 rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/40 transition-colors"
              />
              <BtnPrimary
                onClick={generateGuestPost}
                disabled={guestLoading || !guestTopic.trim()}
              >
                {guestLoading ? "Generating..." : "Generate Guest Post"}
              </BtnPrimary>
            </div>
          </Card>

          {/* Guest post results */}
          {guestResults.map((result, i) => (
            <GuestPostCard key={i} result={result} />
          ))}
        </>
      )}

      {/* ═══ REVIEW RESPONSE GENERATOR (always visible) ═══ */}
      <SectionHead
        title="Review Response Generator"
        subtitle="Paste a customer review and get a professional response"
      />
      <div className="bg-surface-2 border border-white/6 rounded-[14px] p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-500">Rating:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setReviewRating(star)}
                  className={`text-lg transition-colors ${
                    star <= reviewRating ? "text-amber-400" : "text-zinc-700"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Paste a customer review here..."
            rows={3}
            className="w-full px-3 py-2.5 rounded-lg border border-white/6 bg-surface-1 text-[12px] text-zinc-300 outline-none focus:border-emerald-500/40 placeholder:text-zinc-600 transition-colors resize-none"
          />
          <BtnPrimary
            onClick={generateReviewResponse}
            disabled={reviewLoading || !reviewText.trim()}
            small
          >
            {reviewLoading ? "Generating..." : "Generate Response"}
          </BtnPrimary>
        </div>
        <ExpandableContent
          content={reviewResponse ?? ""}
          visible={!!reviewResponse}
        />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Sub-components
   ══════════════════════════════════════════════════════════ */

function SocialResultCard({ result, platform }: { result: SocialResult; platform: SocialPlatform }) {
  return (
    <div className="mt-3 p-3 bg-surface-1 rounded-lg border border-white/[0.03]">
      <div className="flex justify-end mb-1">
        <CopyBtn text={result.content + (result.hashtags?.length ? `\n\n${result.hashtags.join(" ")}` : "")} />
      </div>
      <div className="text-[11px] text-zinc-400 whitespace-pre-wrap leading-relaxed">
        {result.content}
      </div>
      {result.hashtags && result.hashtags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {result.hashtags.map((h) => (
            <span key={h} className="text-[9px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
              {h}
            </span>
          ))}
        </div>
      )}
      {result.post_idea && (
        <p className="mt-2 text-[10px] text-zinc-500">
          <span className="text-emerald-400">Post idea:</span> {result.post_idea}
        </p>
      )}
      {result.best_time && (
        <p className="text-[10px] text-zinc-500">
          <span className="text-amber-400">Best time:</span> {result.best_time}
        </p>
      )}
      {result.cta && (
        <p className="text-[10px] text-zinc-500">
          <span className="text-rose-400">CTA:</span> {result.cta}
        </p>
      )}
      {platform === "twitter" && result.thread && result.thread.length > 0 && (
        <div className="mt-2 space-y-1">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Thread</span>
          {result.thread.map((tweet, ti) => (
            <div key={ti} className="text-[10px] text-zinc-400 bg-surface-2 p-2 rounded border border-white/[0.03]">
              {ti + 1}. {tweet}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GuestPostCard({
  result,
}: {
  result: { platform: string; content: string; title?: string; author_bio?: string; word_count?: number };
}) {
  const [expanded, setExpanded] = useState(false);
  const platformLabel = GUEST_PLATFORMS.find((p) => p.key === result.platform)?.label ?? result.platform;

  return (
    <div className="bg-surface-2 border border-white/6 rounded-xl overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className="text-[14px] font-semibold font-display text-white">
              {result.title || "Guest Post"}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <Tag variant="med">{platformLabel}</Tag>
              {result.word_count ? (
                <span className="text-[10px] text-zinc-500">
                  {result.word_count.toLocaleString()} words
                </span>
              ) : null}
            </div>
          </div>
          <CopyBtn text={result.content + (result.author_bio ? `\n\n---\nAuthor Bio: ${result.author_bio}` : "")} />
        </div>

        {result.author_bio && (
          <div className="bg-surface-1 border border-white/6 rounded-lg p-2.5 mt-2">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500">Author Bio</span>
            <p className="text-[11px] text-zinc-400 mt-0.5">{result.author_bio}</p>
          </div>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          {expanded ? "Hide content" : "View full article"}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-white/6 p-4">
          <div className="text-[11px] text-zinc-400 whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto">
            {result.content}
          </div>
        </div>
      )}
    </div>
  );
}

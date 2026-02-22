"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useDashboard } from "@/components/DashboardContext";
import {
  SectionHead,
  BtnPrimary,
  BtnGhost,
  CopyBtn,
  ExpandableContent,
  EmptyState,
} from "@/components/tool-ui";

/* ── Types ───────────────────────────────────────────────── */
interface CalendarPost {
  type: string;
  title: string;
}

interface CalendarWeek {
  label: string;
  posts: CalendarPost[];
}

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/* ── Main Component ──────────────────────────────────────── */
export function PostCreatorPage() {
  const { lastAudit, agentCache } = useDashboard();
  const { data: session } = useSession();

  const keyword = lastAudit?.keyword ?? "";
  const businessName = lastAudit?.business_name ?? "";
  const businessType = lastAudit?.business_type ?? "";
  const location = lastAudit?.location ?? "";

  /* Calendar state */
  const [calendar, setCalendar] = useState<CalendarWeek[] | null>(null);
  const [calLoading, setCalLoading] = useState(false);

  /* Per-post generated content */
  const [generatedPosts, setGeneratedPosts] = useState<Record<string, string>>({});
  const [postLoading, setPostLoading] = useState<string | null>(null);

  /* Review response state */
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewResponse, setReviewResponse] = useState<string | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (session?.accessToken) headers.Authorization = `Bearer ${session.accessToken}`;

  /* ── Generate Calendar ─────────────────────────────── */
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

  /* ── Generate single post ──────────────────────────── */
  async function generatePost(weekIdx: number, postIdx: number, post: CalendarPost) {
    const key = `${weekIdx}-${postIdx}`;
    setPostLoading(key);
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
      setGeneratedPosts((prev) => ({
        ...prev,
        [key]: data.content + (data.hashtags?.length ? `\n\n${data.hashtags.join(" ")}` : ""),
      }));
    } catch {
      setGeneratedPosts((prev) => ({ ...prev, [key]: "Failed to generate. Try again." }));
    } finally {
      setPostLoading(null);
    }
  }

  /* ── Generate review response ──────────────────────── */
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

  /* ── No audit? ─────────────────────────────────────── */
  if (!lastAudit) {
    return <EmptyState message="Run a full audit first to unlock the Post Creator" />;
  }

  return (
    <div className="animate-fadeIn space-y-2">
      {/* ═══ CONTENT CALENDAR ═══════════════════════════ */}
      <SectionHead
        title="4-Week Content Calendar"
        subtitle={`Tailored for ${businessName || "your business"} · ${keyword}`}
        action={
          calendar ? (
            <BtnGhost small onClick={generateCalendar} disabled={calLoading}>
              {calLoading ? "Regenerating…" : "Regenerate"}
            </BtnGhost>
          ) : undefined
        }
      />

      {!calendar ? (
        /* CTA state */
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
            {calLoading ? "Generating Calendar…" : "Generate Calendar"}
          </BtnPrimary>
        </div>
      ) : (
        /* Calendar grid */
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
                  const generated = generatedPosts[key];
                  const isLoading = postLoading === key;
                  return (
                    <div key={pi} className="py-2.5 border-b border-white/[0.03] last:border-0">
                      <div className="text-[9px] uppercase text-zinc-600 mb-0.5">{post.type}</div>
                      <div className="text-[11px] font-medium text-zinc-300 leading-snug mb-1.5">
                        {post.title}
                      </div>
                      {!generated ? (
                        <button
                          onClick={() => generatePost(wi, pi, post)}
                          disabled={isLoading}
                          className="text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-50"
                        >
                          {isLoading ? "Generating…" : "Generate →"}
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

      {/* ═══ REVIEW RESPONSE GENERATOR ══════════════════ */}
      <SectionHead
        title="Review Response Generator"
        subtitle="Paste a customer review and get a professional response"
      />
      <div className="bg-surface-2 border border-white/6 rounded-[14px] p-4">
        <div className="space-y-3">
          {/* Rating selector */}
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

          {/* Review text input */}
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Paste a customer review here…"
            rows={3}
            className="w-full px-3 py-2.5 rounded-lg border border-white/6 bg-surface-1 text-[12px] text-zinc-300 outline-none focus:border-emerald-500/40 placeholder:text-zinc-600 transition-colors resize-none"
          />

          <BtnPrimary
            onClick={generateReviewResponse}
            disabled={reviewLoading || !reviewText.trim()}
            small
          >
            {reviewLoading ? "Generating…" : "Generate Response"}
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

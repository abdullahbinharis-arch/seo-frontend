"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useDashboard } from "@/components/DashboardContext";
import { ToolPage } from "@/components/ToolPage";

export default function PostCreatorPage() {
  const { lastAudit } = useDashboard();
  const { data: session } = useSession();
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const keyword = lastAudit?.keyword ?? "";
  const businessName = lastAudit?.business_name ?? "";

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
      const res = await fetch(`${apiUrl}/agents/content-rewriter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.accessToken
            ? { Authorization: `Bearer ${session.accessToken}` }
            : {}),
        },
        body: JSON.stringify({
          keyword: topic,
          target_url: lastAudit?.target_url ?? "https://example.com",
          location: lastAudit?.location ?? "Toronto, Canada",
          business_name: businessName,
          business_type: lastAudit?.business_type ?? "",
        }),
      });

      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();
      setResult(data.rewritten_content ?? "Content generated successfully.");
    } catch {
      setResult("Failed to generate content. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const auditContext = lastAudit
    ? `From your audit: ${keyword} · ${businessName}`
    : undefined;

  return (
    <div>
      <ToolPage
        icon={
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9" />
          </svg>
        }
        iconBg="rgba(16,185,129,0.1)"
        title="Post Creator"
        description="Generate AI-powered posts for your Google Business Profile, social media, and blog. Optimized for your audit keywords and local audience."
        features={[
          "GBP Posts",
          "Social Media Posts",
          "Blog Intros",
          "Review Responses",
          "Monthly Calendar",
        ]}
        auditContext={auditContext}
      >
        <form onSubmit={handleGenerate} className="flex gap-2 max-w-[500px] mx-auto mb-4">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="What do you want to post about?"
            disabled={loading}
            className="flex-1 px-[14px] py-[9px] rounded-lg border border-white/6 bg-zinc-900 text-white text-[13px] outline-none focus:border-emerald-500 placeholder:text-zinc-600 transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="px-[14px] py-[9px] rounded-lg text-xs font-medium bg-gradient-to-br from-emerald-600 to-emerald-500 text-white hover:-translate-y-px hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50"
          >
            {loading ? "Generating…" : "Generate"}
          </button>
        </form>
      </ToolPage>

      {/* Generated content */}
      {result && (
        <div className="max-w-2xl mx-auto mt-6 p-5 bg-zinc-900 border border-white/6 rounded-xl">
          <div className="text-xs font-semibold text-emerald-400 mb-2">Generated Content</div>
          <div className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
            {result}
          </div>
        </div>
      )}
    </div>
  );
}

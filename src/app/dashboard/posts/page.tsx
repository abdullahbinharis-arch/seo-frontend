"use client";

import { useDashboard } from "@/components/DashboardContext";
import { PostCreatorPage } from "@/components/PostCreatorPage";
import { EmptyState } from "@/components/dashboard/EmptyState";

export default function PostsPage() {
  const { lastAudit } = useDashboard();

  if (!lastAudit) {
    return (
      <EmptyState
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9" />
          </svg>
        }
        title="No Content Calendar Yet"
        description="Run your first audit and we'll generate a <strong>4-week content calendar</strong> with GBP posts, social content, and blog topics — all based on your keywords and business type."
        previewLabels={["GBP Posts", "Social", "Blog Ideas"]}
        note="AI generates ready-to-post content in one click"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">Post Creator</h1>
        <p className="text-sm text-zinc-400 mt-1">Generate AI-powered posts for Google Business Profile, social media, and blog. Includes a content calendar and review response generator.</p>
      </div>
      <PostCreatorPage />
    </div>
  );
}

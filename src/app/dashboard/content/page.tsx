"use client";

import { useDashboard } from "@/components/DashboardContext";
import { ContentWriterPage } from "@/components/ContentWriterPage";
import { EmptyState } from "@/components/dashboard/EmptyState";

export default function ContentPage() {
  const { lastAudit } = useDashboard();

  if (!lastAudit) {
    return (
      <EmptyState
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        }
        title="No Content Analysis Yet"
        description="Run your first audit to get <strong>page rewrite recommendations</strong>, service area page suggestions, FAQ generators, and blog topics — all optimized for your target keywords."
        previewLabels={["Pages", "Area Pages", "Blog Ideas"]}
        note="Generates SEO-optimized content in seconds"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">Content Writer</h1>
        <p className="text-sm text-zinc-400 mt-1">AI-powered content generation — page rewrites, service area pages, FAQ answers, and blog articles.</p>
      </div>
      <ContentWriterPage />
    </div>
  );
}

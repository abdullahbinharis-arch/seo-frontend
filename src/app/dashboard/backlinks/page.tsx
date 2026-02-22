"use client";

import { useDashboard } from "@/components/DashboardContext";
import { BacklinksToolView } from "@/components/BacklinksPage";
import { EmptyState } from "@/components/dashboard/EmptyState";

export default function BacklinksPage() {
  const { lastAudit } = useDashboard();

  if (!lastAudit?.backlink_data) {
    return (
      <EmptyState
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
          </svg>
        }
        title="No Backlink Data Yet"
        description="Run your first audit to analyze your <strong>domain authority</strong>, discover your current backlinks, and get a list of link-building opportunities ranked by impact."
        previewLabels={["DA Score", "Backlinks", "Opportunities"]}
        note="Includes competitor backlink comparison"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">Backlink Profile</h1>
        <p className="text-sm text-zinc-400 mt-1">Domain authority, page authority, linking domains, spam score, and competitor backlink comparison.</p>
      </div>
      <BacklinksToolView />
    </div>
  );
}

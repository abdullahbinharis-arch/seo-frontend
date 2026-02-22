"use client";

import { useDashboard } from "@/components/DashboardContext";
import { GmbToolView } from "@/components/GmbPage";
import { EmptyState } from "@/components/dashboard/EmptyState";

export default function GbpPage() {
  const { lastAudit } = useDashboard();

  if (!lastAudit?.gmb_data) {
    return (
      <EmptyState
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        }
        title="No GBP Data Yet"
        description="Run your first audit to see your <strong>Google Business Profile score</strong>, NAP consistency, citation status, review insights, and a complete optimization checklist."
        previewLabels={["GBP Score", "Reviews", "Citations"]}
        note="Takes ~60 seconds · No credit card required"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">GBP Audit &amp; Optimization</h1>
        <p className="text-sm text-zinc-400 mt-1">Google Business Profile completeness audit, map pack status, review strategy, and competitor insights.</p>
      </div>
      <GmbToolView />
    </div>
  );
}

"use client";

import { useDashboard } from "@/components/DashboardContext";
import { KeywordsToolView } from "@/components/KeywordsPage";
import { ToolEmptyState } from "@/components/ToolEmptyState";
import type { KeywordResearchAgent } from "@/types";

export default function KeywordsPage() {
  const { agentCache } = useDashboard();
  const data = agentCache.keyword_research as KeywordResearchAgent | undefined;

  if (!data) {
    return (
      <ToolEmptyState
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        }
        title="No Keywords Detected Yet"
        description="Run your first audit and we'll <strong>auto-detect your primary keyword</strong>, find secondary opportunities, check your rankings, and identify competitor keyword gaps."
        previewLabels={["Primary KW", "Tracked", "KW Gaps"]}
        note="Keywords auto-detected from your website content"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">Keyword Research</h1>
        <p className="text-sm text-zinc-400 mt-1">High-intent keywords, long-tail opportunities, competitor gaps, and keyword clusters.</p>
      </div>
      <KeywordsToolView data={data} />
    </div>
  );
}

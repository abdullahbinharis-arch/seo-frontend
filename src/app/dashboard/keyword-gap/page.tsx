"use client";

import { KeywordGapView } from "@/components/KeywordGapPage";

export default function KeywordGapPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">Keyword Gap Analysis</h1>
        <p className="text-sm text-white mt-1">Compare competitors, find keyword gaps, and uncover content opportunities.</p>
      </div>
      <KeywordGapView />
    </div>
  );
}

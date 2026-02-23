"use client";

import { KeywordsToolView } from "@/components/KeywordsPage";

export default function KeywordsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">Keyword Research</h1>
        <p className="text-sm text-zinc-400 mt-1">Research keywords, view service-grouped targets, and find competitor gaps.</p>
      </div>
      <KeywordsToolView />
    </div>
  );
}

"use client";

import { BacklinksToolView } from "@/components/BacklinksPage";

export default function BacklinksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">Backlinks & Link Building</h1>
        <p className="text-sm text-white mt-1">Domain authority, backlink profile, link building opportunities, and outreach email generator.</p>
      </div>
      <BacklinksToolView />
    </div>
  );
}

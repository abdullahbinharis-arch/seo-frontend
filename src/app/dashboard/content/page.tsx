"use client";

import { ContentWriterPage } from "@/components/ContentWriterPage";

export default function ContentPage() {
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

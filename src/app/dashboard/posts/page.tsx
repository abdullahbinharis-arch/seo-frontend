"use client";

import { Suspense } from "react";
import { PostCreatorPage } from "@/components/PostCreatorPage";

export default function PostsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">Post Generator</h1>
        <p className="text-sm text-zinc-400 mt-1">Generate blog articles, GMB posts, social media content, and guest posts — all optimized for your keywords.</p>
      </div>
      <Suspense fallback={<div className="text-zinc-500 text-sm">Loading...</div>}>
        <PostCreatorPage />
      </Suspense>
    </div>
  );
}

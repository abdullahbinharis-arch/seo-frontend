"use client";

import { PostCreatorPage } from "@/components/PostCreatorPage";

export default function PostsPage() {
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

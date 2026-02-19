"use client";

import { useState } from "react";
import { AgentRunner } from "@/components/AgentRunner";
import { useDashboard } from "@/components/DashboardContext";
import { Card } from "@/components/AuditResults";
import type { BlogWriterAgent } from "@/types";

function BlogResultSection({ data }: { data: BlogWriterAgent }) {
  const [showFull, setShowFull] = useState(false);
  const brief = data.brief ?? {};

  return (
    <div className="space-y-4">
      <Card title="Blog Brief" icon="📋">
        <dl className="grid sm:grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <dt className="text-xs text-zinc-500 mb-0.5">Title</dt>
            <dd className="text-zinc-200 font-medium">{brief.title ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500 mb-0.5">Target word count</dt>
            <dd className="text-zinc-200 font-medium">{brief.target_word_count ?? "—"} words</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-zinc-500 mb-0.5">Meta description</dt>
            <dd className="text-zinc-300">{brief.meta_description ?? "—"}</dd>
          </div>
        </dl>

        {(brief.h2_sections ?? []).length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">H2 Sections</p>
            <ol className="space-y-1">
              {brief.h2_sections.map((h: string, i: number) => (
                <li key={i} className="text-sm text-zinc-300 flex gap-2">
                  <span className="text-zinc-600 font-mono shrink-0">{i + 1}.</span>{h}
                </li>
              ))}
            </ol>
          </div>
        )}

        {(brief.lsi_keywords ?? []).length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {brief.lsi_keywords.map((kw: string, i: number) => (
              <span key={i} className="bg-blue-500/10 text-blue-400 text-xs px-2.5 py-1 rounded-lg">{kw}</span>
            ))}
          </div>
        )}
      </Card>

      {data.rewritten_content && (
        <Card title={`Blog Post (${data.word_count ?? 0} words)`} icon="✍️">
          <div
            className={`text-sm text-zinc-300 leading-relaxed overflow-hidden transition-all ${showFull ? "" : "max-h-64"}`}
            style={{ whiteSpace: "pre-wrap" }}
          >
            {data.rewritten_content}
          </div>
          <button
            onClick={() => setShowFull((v) => !v)}
            className="mt-4 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
          >
            {showFull ? "Collapse" : "Read full post"}
          </button>
        </Card>
      )}
    </div>
  );
}

export default function BlogPage() {
  const { agentCache, setAgentResult } = useDashboard();
  const cached = agentCache.blog_writer as BlogWriterAgent | undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">Blog Writer</h1>
        <p className="text-sm text-zinc-400 mt-1">Generate a fully SEO-optimised, locally targeted long-form blog post targeting your keyword.</p>
      </div>
      <AgentRunner<BlogWriterAgent>
        endpoint="/agents/blog-writer"
        fields={["keyword", "url", "location", "businessName", "businessType"]}
        runLabel="Generate Blog Post"
        progressMessage="Writing a high-quality SEO blog post (~45s)…"
        cachedResult={cached}
        onResult={(data) => setAgentResult("blog_writer", data)}
        renderResult={(data) => <BlogResultSection data={data} />}
      />
    </div>
  );
}

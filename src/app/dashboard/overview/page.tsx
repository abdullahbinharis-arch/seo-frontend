"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useDashboard } from "@/components/DashboardContext";
import { AuditForm } from "@/components/AuditForm";
import type { AuditResult } from "@/types";

// ── Score helpers ──────────────────────────────────────────────────────

interface Scores {
  websiteSeo: number | null;
  backlinkScore: number | null;
  localSeo: number | null;
  aiSeo: number | null;
  overall: number | null;
}

function extractScores(audit: AuditResult): Scores {
  // on_page seo_score is 0–10 → normalise to 0–100
  const onPageRaw = audit.agents?.on_page_seo?.recommendations?.current_analysis?.seo_score ?? null;
  const websiteSeo = onPageRaw != null ? Math.round((onPageRaw / 10) * 100) : null;

  // domain_authority from backlink analysis (already 0–100)
  const bl = audit.agents?.backlink_analysis?.analysis as Record<string, unknown> | undefined;
  const backlinkScore = typeof bl?.domain_authority === "number" ? bl.domain_authority : null;

  // local_seo_score top-level or inside local_seo agent
  const localSeo =
    typeof audit.local_seo_score === "number"
      ? audit.local_seo_score
      : typeof audit.agents?.local_seo?.recommendations?.local_seo_score === "number"
        ? audit.agents.local_seo.recommendations.local_seo_score
        : null;

  // ai_visibility_score (0–100)
  const aiSeo = audit.agents?.ai_seo?.analysis?.ai_visibility_score ?? null;

  // Weighted overall — skips pillars that are null
  const components = (
    [
      { score: websiteSeo, weight: 0.35 },
      { score: backlinkScore, weight: 0.20 },
      { score: localSeo, weight: 0.30 },
      { score: aiSeo, weight: 0.15 },
    ] as Array<{ score: number | null; weight: number }>
  ).filter((c): c is { score: number; weight: number } => c.score != null);

  let overall: number | null = null;
  if (components.length > 0) {
    const totalWeight = components.reduce((s, c) => s + c.weight, 0);
    overall = Math.round(components.reduce((s, c) => s + c.score * c.weight, 0) / totalWeight);
  }

  return { websiteSeo, backlinkScore, localSeo, aiSeo, overall };
}

// ── Quick-win helpers ──────────────────────────────────────────────────

interface QuickWinItem {
  text: string;
  href: string;
  label: string;
}

function extractQuickWins(audit: AuditResult): QuickWinItem[] {
  const wins: QuickWinItem[] = [];

  for (const w of audit.agents?.on_page_seo?.recommendations?.priority_actions ?? []) {
    if (typeof w === "string") wins.push({ text: w, href: "/dashboard/on-page", label: "On-Page SEO" });
  }
  for (const w of audit.agents?.local_seo?.recommendations?.quick_wins ?? []) {
    if (typeof w === "string") wins.push({ text: w, href: "/dashboard/gbp", label: "Local SEO" });
  }
  for (const w of (audit.agents?.gbp_audit?.analysis?.priority_actions ?? []) as Array<{ action?: string }>) {
    if (w?.action) wins.push({ text: w.action, href: "/dashboard/gbp", label: "GBP Audit" });
  }
  for (const w of (audit.agents?.ai_seo?.analysis?.priority_actions ?? []) as Array<{ action?: string }>) {
    if (w?.action) wins.push({ text: w.action, href: "/dashboard/ai-seo", label: "AI Visibility" });
  }
  for (const w of audit.agents?.technical_seo?.recommendations?.priority_actions ?? []) {
    if (typeof w === "string") wins.push({ text: w, href: "/dashboard/technical", label: "Technical SEO" });
  }
  // Summary quick wins as supplemental fill
  for (const w of audit.summary?.quick_wins ?? []) {
    if (typeof w === "string") wins.push({ text: w, href: "/dashboard/audit", label: "Full Audit" });
  }

  // Deduplicate by first 45 characters
  const seen = new Set<string>();
  return wins.filter((w) => {
    const key = w.text.trim().slice(0, 45).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 5);
}

// ── Colour helper ──────────────────────────────────────────────────────

function scoreColor(score: number | null): string {
  if (score == null) return "#3f3f46";
  if (score >= 75) return "#6ee7b7";
  if (score >= 50) return "#fbbf24";
  return "#f87171";
}

// ── Score ring ─────────────────────────────────────────────────────────

function ScoreRing({ score, size = 56 }: { score: number | null; size?: number }) {
  const pct = score ?? 0;
  const color = scoreColor(score);
  const inner = Math.round(size * 0.7);
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0"
      style={{
        width: size,
        height: size,
        background: score != null
          ? `conic-gradient(${color} ${pct}%, #27272a ${pct}%)`
          : "#27272a",
      }}
    >
      <div
        className="rounded-full bg-[#09090b] flex items-center justify-center font-bold"
        style={{ width: inner, height: inner, color, fontSize: size > 64 ? 18 : 12 }}
      >
        {score ?? "—"}
      </div>
    </div>
  );
}

// ── Pillar card ────────────────────────────────────────────────────────

function PillarCard({
  title, icon, description, score, href, cta,
}: {
  title: string;
  icon: string;
  description: string;
  score: number | null;
  href: string;
  cta: string;
}) {
  const color = scoreColor(score);
  return (
    <div className="glass rounded-2xl p-5 flex flex-col gap-4 hover:bg-white/5 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
            {icon} {title}
          </p>
          <p className="text-xs text-zinc-500 leading-relaxed">{description}</p>
        </div>
        <ScoreRing score={score} size={52} />
      </div>
      <div className="flex items-center justify-between">
        {score != null && (
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ color, backgroundColor: `${color}18` }}
          >
            {score >= 75 ? "Good" : score >= 50 ? "Needs work" : "Critical"}
          </span>
        )}
        {score == null && <span className="text-xs text-zinc-600">No data</span>}
        <Link href={href} className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
          {cta}
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

// ── Overall score banner ───────────────────────────────────────────────

function OverallBanner({ score }: { score: number | null }) {
  const color = scoreColor(score);
  const label = score == null ? "—" : score >= 75 ? "Strong" : score >= 50 ? "Average" : "Needs Attention";
  return (
    <div className="glass rounded-2xl p-6 flex items-center gap-6">
      <ScoreRing score={score} size={80} />
      <div className="flex-1">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Overall LocalRank Score</p>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold" style={{ color }}>
            {score ?? "—"}
          </span>
          {score != null && <span className="text-lg text-zinc-500">/100</span>}
        </div>
        <p className="text-xs text-zinc-500 mt-1">
          {score != null
            ? `${label} — weighted average across all four pillars`
            : "Run a full audit to calculate your score"}
        </p>
      </div>
      <Link
        href="/dashboard/audit"
        className="btn-primary text-white font-semibold px-5 py-2.5 rounded-xl text-sm shrink-0 hidden sm:block"
      >
        New Audit
      </Link>
    </div>
  );
}

// ── Quick wins ─────────────────────────────────────────────────────────

function QuickWinsSectionFull({ wins }: { wins: QuickWinItem[] }) {
  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="text-sm font-semibold text-zinc-300 mb-5 flex items-center gap-2">
        <span className="text-amber-400">⚡</span> Top 5 Quick Wins
      </h2>
      <div className="space-y-2">
        {wins.map((win, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl px-4 py-3 bg-white/3 hover:bg-white/5 transition-colors">
            <span className="text-zinc-600 font-mono text-xs shrink-0 w-4">{i + 1}.</span>
            <span className="text-sm text-zinc-300 flex-1 leading-snug">{win.text}</span>
            <Link
              href={win.href}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 shrink-0 whitespace-nowrap flex items-center gap-1 border border-emerald-500/30 hover:border-emerald-400 px-3 py-1.5 rounded-lg transition-colors"
            >
              Fix this →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Recent audits ──────────────────────────────────────────────────────

interface AuditRow {
  id: string;
  keyword: string;
  target_url: string;
  location: string;
  created_at: string;
  execution_time: number | null;
}

function RecentAuditsSection({ rows }: { rows: AuditRow[] }) {
  if (rows.length === 0) return null;
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <h2 className="text-sm font-semibold text-zinc-300">Recent Audits</h2>
        <Link href="/dashboard/history" className="text-xs text-emerald-400 hover:text-emerald-300 font-medium">
          View all →
        </Link>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-zinc-600 uppercase tracking-wider border-b border-white/5">
            <th className="px-6 py-3 font-medium">Keyword</th>
            <th className="px-6 py-3 font-medium hidden sm:table-cell">URL</th>
            <th className="px-6 py-3 font-medium hidden md:table-cell">Location</th>
            <th className="px-6 py-3 font-medium text-right">Date</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.id}
              className={`border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors ${i % 2 === 1 ? "bg-white/[0.01]" : ""}`}
            >
              <td className="px-6 py-3 text-zinc-200 font-medium">{row.keyword}</td>
              <td className="px-6 py-3 text-zinc-500 hidden sm:table-cell">
                <span className="truncate max-w-40 block text-xs">
                  {row.target_url.replace(/^https?:\/\//, "")}
                </span>
              </td>
              <td className="px-6 py-3 text-zinc-500 text-xs hidden md:table-cell">{row.location}</td>
              <td className="px-6 py-3 text-right">
                <span className="text-zinc-600 text-xs font-mono">
                  {new Date(row.created_at).toLocaleDateString("en-CA", {
                    month: "short", day: "numeric",
                  })}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────────────

function EmptyState({ onComplete }: { onComplete: (r: AuditResult) => void }) {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="glass rounded-2xl p-8 sm:p-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white font-display mb-2">Run your first audit</h2>
          <p className="text-sm text-zinc-400 max-w-md mx-auto">
            Get your LocalRank Score, keyword opportunities, technical issues, and a full action plan — in under 60 seconds.
          </p>
        </div>

        {/* Pillar preview tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-left max-w-2xl mx-auto">
          {[
            { icon: "🌐", title: "Website SEO", desc: "Keywords · on-page · technical" },
            { icon: "📍", title: "Local SEO", desc: "GBP · citations · map pack" },
            { icon: "🔗", title: "Backlinks", desc: "DA score · link gaps" },
            { icon: "🤖", title: "AI Visibility", desc: "ChatGPT · Perplexity · AI search" },
          ].map((p) => (
            <div key={p.title} className="bg-white/3 rounded-xl p-3">
              <p className="text-xs font-semibold text-zinc-300 mb-0.5">{p.icon} {p.title}</p>
              <p className="text-xs text-zinc-600">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Embedded audit form */}
      <AuditForm onComplete={onComplete} />
    </div>
  );
}

// ── Overview page ──────────────────────────────────────────────────────

export default function OverviewPage() {
  const { lastAudit, setLastAudit } = useDashboard();
  const { data: session } = useSession();
  const [recentAudits, setRecentAudits] = useState<AuditRow[]>([]);

  // Fetch recent audits regardless of session state
  useEffect(() => {
    async function load() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
        const headers: Record<string, string> = {};
        const token = (session as { accessToken?: string } | null)?.accessToken;
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch(`${apiUrl}/audits?limit=5`, { headers });
        if (res.ok) {
          const data = await res.json();
          setRecentAudits(data.audits ?? data ?? []);
        }
      } catch { /* recent audits are supplemental — fail silently */ }
    }
    load();
  }, [session]);

  if (!lastAudit) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-1">Your SEO command centre.</p>
        </div>
        <EmptyState onComplete={setLastAudit} />
        <RecentAuditsSection rows={recentAudits} />
      </div>
    );
  }

  const scores = extractScores(lastAudit);
  const quickWins = extractQuickWins(lastAudit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Last audit:{" "}
            <span className="text-zinc-300 font-medium">{lastAudit.keyword}</span>
            {" · "}
            <span className="text-zinc-400">{lastAudit.target_url.replace(/^https?:\/\//, "")}</span>
            {" · "}
            <span className="text-zinc-600 text-xs">
              {new Date(lastAudit.timestamp).toLocaleDateString("en-CA", {
                month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
              })}
            </span>
          </p>
        </div>
        <Link
          href="/dashboard/audit"
          className="btn-primary text-white font-semibold px-4 py-2 rounded-xl text-sm shrink-0"
        >
          + New Audit
        </Link>
      </div>

      {/* 4 Pillar cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <PillarCard
          title="Website SEO"
          icon="🌐"
          score={scores.websiteSeo}
          description="On-page quality, keyword targeting, and technical health"
          href="/dashboard/on-page"
          cta="View details"
        />
        <PillarCard
          title="Backlinks"
          icon="🔗"
          score={scores.backlinkScore}
          description="Domain authority, linking domains, and link-building opportunities"
          href="/dashboard/backlinks"
          cta="View details"
        />
        <PillarCard
          title="Local SEO"
          icon="📍"
          score={scores.localSeo}
          description="GBP completeness, citations, map pack ranking, NAP consistency"
          href="/dashboard/gbp"
          cta="View details"
        />
        <PillarCard
          title="AI Visibility"
          icon="🤖"
          score={scores.aiSeo}
          description="How often ChatGPT, Perplexity, and AI search mention your business"
          href="/dashboard/ai-seo"
          cta="View details"
        />
      </div>

      {/* Overall LocalRank score */}
      <OverallBanner score={scores.overall} />

      {/* Quick wins */}
      {quickWins.length > 0 && <QuickWinsSectionFull wins={quickWins} />}

      {/* Recent audits */}
      <RecentAuditsSection rows={recentAudits} />
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useDashboard } from "@/components/DashboardContext";
import { AuditForm } from "@/components/AuditForm";
import type { AuditResult, QuickWin, ImprovementStep, AuditScores } from "@/types";

// ── Types ────────────────────────────────────────────────────────────────

type TabKey = "overall" | "website_seo" | "backlinks" | "local_seo" | "ai_seo";

// ── Score helpers ────────────────────────────────────────────────────────

function scoreStroke(score: number): string {
  if (score >= 70) return "#10b981";
  if (score >= 40) return "#f59e0b";
  return "#f43f5e";
}

function scoreTextColor(score: number): string {
  if (score >= 70) return "#6ee7b7";
  if (score >= 40) return "#fbbf24";
  return "#fb7185";
}

function scoreLabel(score: number): string {
  if (score >= 70) return "Good";
  if (score >= 40) return "Needs Work";
  return "Critical";
}

// SVG ring exactly matching the reference HTML
function ScoreRing({ score, large }: { score: number; large?: boolean }) {
  const r = 42;
  const circ = 2 * Math.PI * r; // ≈ 264
  const offset = circ * (1 - score / 100);
  const dim = large ? 68 : 56;
  const sw = large ? 6 : 5;
  const fs = large ? 22 : 17;
  const color = scoreStroke(score);

  return (
    <div className="relative shrink-0" style={{ width: dim, height: dim }}>
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 100 100"
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={sw} />
        <circle
          cx="50" cy="50" r={r} fill="none"
          stroke={color} strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center font-display font-bold"
        style={{ fontSize: fs, color }}
      >
        {score}
      </div>
    </div>
  );
}

// ── Pillar config ────────────────────────────────────────────────────────

const PILLAR_CFG = {
  website_seo: {
    label: "Website SEO",
    href: "/dashboard/on-page",
    iconBg: "bg-cyan-400/12",
    borderActive: "border-cyan-400/25",
    cardIcon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
      </svg>
    ),
    pillarIcon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
      </svg>
    ),
  },
  backlinks: {
    label: "Backlinks",
    href: "/dashboard/backlinks",
    iconBg: "bg-rose-500/10",
    borderActive: "border-rose-500/20",
    cardIcon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fb7185" strokeWidth="2">
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
      </svg>
    ),
    pillarIcon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fb7185" strokeWidth="2">
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
  local_seo: {
    label: "Local SEO",
    href: "/dashboard/gbp",
    iconBg: "bg-amber-500/10",
    borderActive: "border-amber-500/20",
    cardIcon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    pillarIcon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  ai_seo: {
    label: "AI SEO",
    href: "/dashboard/ai-seo",
    iconBg: "bg-violet-500/10",
    borderActive: "border-violet-500/20",
    cardIcon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2">
        <path d="M12 2a4 4 0 014 4c0 1.95-2 4-4 6-2-2-4-4.05-4-6a4 4 0 014-4z" />
        <path d="M12 12v10" />
      </svg>
    ),
    pillarIcon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2">
        <path d="M12 2a4 4 0 014 4c0 1.95-2 4-4 6-2-2-4-4.05-4-6a4 4 0 014-4z" />
        <path d="M12 12v10" /><path d="M8 22h8" />
      </svg>
    ),
  },
} as const;

// ── Tag style helpers ────────────────────────────────────────────────────

function priorityTagStyle(priority: string): React.CSSProperties {
  if (priority === "high") return { background: "rgba(244,63,94,0.1)", color: "#fb7185" };
  if (priority === "medium") return { background: "rgba(245,158,11,0.1)", color: "#fbbf24" };
  return { background: "rgba(16,185,129,0.1)", color: "#6ee7b7" };
}

function priorityLabel(priority: string): string {
  if (priority === "high") return "High Impact";
  if (priority === "medium") return "Medium";
  return "Growth";
}

function pillarTagStyle(pillar: string): React.CSSProperties {
  switch (pillar) {
    case "website_seo": return { background: "rgba(34,211,238,0.1)", color: "#22d3ee" };
    case "backlinks":   return { background: "rgba(244,63,94,0.08)", color: "#fca5a5" };
    case "local_seo":   return { background: "rgba(245,158,11,0.08)", color: "#fbbf24" };
    case "ai_seo":      return { background: "rgba(139,92,246,0.08)", color: "#c4b5fd" };
    default:            return { background: "rgba(255,255,255,0.06)", color: "#a1a1aa" };
  }
}

function pillarTagLabel(pillar: string): string {
  switch (pillar) {
    case "website_seo": return "Website SEO";
    case "backlinks":   return "Backlinks";
    case "local_seo":   return "Local SEO";
    case "ai_seo":      return "AI SEO";
    default:            return pillar;
  }
}

// ── Score strip ──────────────────────────────────────────────────────────

function ScoreStrip({
  scores,
  activeTab,
  onTabChange,
}: {
  scores: AuditScores;
  activeTab: TabKey;
  onTabChange: (t: TabKey) => void;
}) {
  return (
    <div className="flex gap-3 mb-7 flex-wrap">
      {/* Overall card */}
      <div
        onClick={() => onTabChange("overall")}
        className={`flex-1 min-w-[170px] rounded-2xl p-[18px] cursor-pointer transition-all relative
          bg-gradient-to-br from-emerald-500/6 to-blue-500/4
          hover:border-emerald-500/20 hover:-translate-y-0.5
          ${activeTab === "overall" ? "border border-emerald-500/25" : "border border-white/6"}`}
      >
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wider">Overall Score</span>
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
          </div>
        </div>
        <div className="flex items-center gap-3.5">
          <ScoreRing score={scores.overall} large />
          <div className="text-[11.5px] text-zinc-500 leading-snug">
            {scoreLabel(scores.overall)}
            <div className="text-[10.5px] mt-0.5">Weighted avg of 4 pillars</div>
          </div>
        </div>
        {activeTab === "overall" && (
          <div className="absolute -bottom-[7px] left-1/2 w-3.5 h-3.5 bg-[#09090b] border-r border-b border-white/6 -translate-x-1/2 rotate-45 z-[2]" />
        )}
      </div>

      {/* Pillar cards */}
      {(["website_seo", "backlinks", "local_seo", "ai_seo"] as const).map((key) => {
        const cfg = PILLAR_CFG[key];
        const score = scores[key];
        const isActive = activeTab === key;
        return (
          <div
            key={key}
            onClick={() => onTabChange(key)}
            className={`flex-1 min-w-[160px] bg-zinc-900 rounded-2xl p-[18px] cursor-pointer transition-all relative
              hover:border-emerald-500/20 hover:-translate-y-0.5
              ${isActive ? `border ${cfg.borderActive}` : "border border-white/6"}`}
          >
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wider">{cfg.label}</span>
              <div className={`w-7 h-7 rounded-lg ${cfg.iconBg} flex items-center justify-center`}>
                {cfg.cardIcon}
              </div>
            </div>
            <div className="flex items-center gap-3.5">
              <ScoreRing score={score} />
              <div className="text-[11.5px] text-zinc-500 leading-snug">
                <span style={{ color: scoreTextColor(score), fontWeight: 600 }}>{scoreLabel(score)}</span>
                <div className="text-[10.5px] mt-0.5">{score} / 100</div>
              </div>
            </div>
            {isActive && (
              <div className="absolute -bottom-[7px] left-1/2 w-3.5 h-3.5 bg-[#09090b] border-r border-b border-white/6 -translate-x-1/2 rotate-45 z-[2]" />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Quick wins section ───────────────────────────────────────────────────

function QuickWinsSection({ wins }: { wins: QuickWin[] }) {
  return (
    <div className="animate-fadeIn border border-white/6 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3.5 px-[22px] py-[18px] bg-gradient-to-br from-emerald-500/8 to-blue-500/5">
        <div className="w-[42px] h-[42px] rounded-xl bg-emerald-500/12 flex items-center justify-center shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth="2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>
        <div>
          <div className="font-display font-semibold text-[17px]">Top 10 Quick Wins</div>
          <div className="text-xs text-zinc-500 mt-0.5">
            Highest-impact actions sorted by expected ranking improvement. Do these first.
          </div>
        </div>
      </div>

      {/* Win list */}
      <div className="p-[22px] bg-[#0f0f12]">
        <div className="flex flex-col gap-1">
          {wins.map((win) => (
            <div
              key={win.rank}
              className="flex items-start gap-3 px-3.5 py-3 bg-white/4 border border-white/4 rounded-[10px]"
            >
              <div className="w-[22px] h-[22px] rounded-md shrink-0 flex items-center justify-center font-mono text-[10px] font-semibold bg-zinc-800 text-zinc-400">
                {win.rank}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium leading-snug">{win.title}</div>
                {win.description && (
                  <div className="text-[12px] text-zinc-500 mt-1 leading-relaxed">{win.description}</div>
                )}
                {win.impact && (
                  <div className="text-[11px] text-zinc-500 mt-1">
                    {win.impact}{win.time_estimate ? ` · ${win.time_estimate}` : ""}
                  </div>
                )}
                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 5,
                    textTransform: "uppercase", letterSpacing: "0.04em",
                    ...priorityTagStyle(win.priority),
                  }}>
                    {priorityLabel(win.priority)}
                  </span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 5,
                    textTransform: "uppercase", letterSpacing: "0.04em",
                    ...pillarTagStyle(win.pillar),
                  }}>
                    {pillarTagLabel(win.pillar)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Pillar detail section ────────────────────────────────────────────────

function PillarSection({
  pillarKey,
  data,
}: {
  pillarKey: keyof typeof PILLAR_CFG;
  data: { score: number; title: string; subtitle: string; steps: ImprovementStep[] };
}) {
  const cfg = PILLAR_CFG[pillarKey];

  return (
    <div className="animate-fadeIn border border-white/6 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3.5 px-[22px] py-[18px] bg-zinc-900">
        <div className={`w-[42px] h-[42px] rounded-xl ${cfg.iconBg} flex items-center justify-center shrink-0`}>
          {cfg.pillarIcon}
        </div>
        <div className="flex-1">
          <div className="font-display font-semibold text-[17px]">{data.title}</div>
          <div className="text-xs text-zinc-500 mt-0.5">{data.subtitle}</div>
        </div>
        <div className="font-display font-bold text-[34px]" style={{ color: scoreTextColor(data.score) }}>
          {data.score}<span className="text-lg font-normal text-zinc-600">/100</span>
        </div>
      </div>

      {/* Steps */}
      <div className="p-[22px] bg-[#0f0f12] border-t border-white/6">
        <div className="flex items-center justify-between mb-3.5">
          <div className="font-display font-semibold text-sm">
            Improvement Steps
          </div>
          <Link
            href={cfg.href}
            className="text-xs text-zinc-500 hover:text-emerald-400 transition-colors flex items-center gap-1"
          >
            View details
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        {data.steps.map((step, i) => (
          <div
            key={step.rank}
            className="flex gap-3 py-3.5"
            style={{
              borderBottom: i < data.steps.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none",
            }}
          >
            <div className="w-[26px] h-[26px] rounded-lg shrink-0 flex items-center justify-center font-mono text-[11px] font-semibold bg-white/4"
              style={{
                color: step.priority === "high" ? "#fb7185" : step.priority === "medium" ? "#fbbf24" : "#6ee7b7",
              }}
            >
              {step.rank}
            </div>
            <div className="flex-1">
              <div className="text-[13.5px] font-medium leading-snug mb-1">{step.title}</div>
              <div className="text-xs text-zinc-500 leading-relaxed">{step.description}</div>
              <div className="flex gap-1.5 mt-1.5 flex-wrap">
                {step.category && (
                  <span className="text-[11px] py-0.5 px-[7px] rounded-[5px] bg-white/4 text-zinc-500 font-medium">
                    {step.category}
                  </span>
                )}
                {step.priority && (
                  <span className="text-[11px] py-0.5 px-[7px] rounded-[5px] font-semibold" style={priorityTagStyle(step.priority)}>
                    {step.priority === "high" ? "High Impact" : step.priority === "medium" ? "Medium Impact" : "Maintenance"}
                  </span>
                )}
                {step.time_estimate && (
                  <span className="text-[11px] py-0.5 px-[7px] rounded-[5px] bg-white/4 text-zinc-500 font-medium">
                    {step.time_estimate}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Audit meta bar ───────────────────────────────────────────────────────

function AuditMetaBar({ audit }: { audit: AuditResult }) {
  const date = new Date(audit.timestamp).toLocaleDateString("en-CA", {
    month: "short", day: "numeric", year: "numeric",
  });
  const displayUrl = audit.target_url.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <div className="flex items-center justify-between pb-5 flex-wrap gap-3">
      <div>
        <h1 className="font-display font-semibold text-xl mb-1">
          {audit.business_name || displayUrl}
        </h1>
        <p className="text-xs text-zinc-500">
          {displayUrl} · {audit.keyword} · {audit.location} · {date}
        </p>
      </div>
      <Link
        href="/dashboard/audit"
        className="px-4 py-[7px] rounded-lg text-xs font-medium border border-white/10 text-zinc-400 hover:border-emerald-500/20 hover:text-zinc-200 transition-all"
      >
        Re-run Audit
      </Link>
    </div>
  );
}

// ── Empty state ──────────────────────────────────────────────────────────

function EmptyState({ onComplete }: { onComplete: (r: AuditResult) => void }) {
  return (
    <div className="space-y-6">
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-left max-w-2xl mx-auto">
          {[
            { title: "Website SEO", desc: "Keywords · on-page · technical" },
            { title: "Local SEO", desc: "GBP · citations · map pack" },
            { title: "Backlinks", desc: "DA score · link gaps" },
            { title: "AI Visibility", desc: "ChatGPT · Perplexity · AI search" },
          ].map((p) => (
            <div key={p.title} className="bg-white/3 rounded-xl p-3">
              <p className="text-xs font-semibold text-zinc-300 mb-0.5">{p.title}</p>
              <p className="text-xs text-zinc-600">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <AuditForm onComplete={onComplete} embedded />
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────

export default function OverviewPage() {
  const { lastAudit, setLastAudit } = useDashboard();
  const [activeTab, setActiveTab] = useState<TabKey>("overall");

  if (!lastAudit) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-1">Your SEO command centre.</p>
        </div>
        <EmptyState onComplete={setLastAudit} />
      </div>
    );
  }

  // Use backend-computed scores when available; fall back gracefully
  const scores: AuditScores = lastAudit.scores ?? {
    overall: lastAudit.local_seo_score ?? 0,
    website_seo: lastAudit.agents?.on_page_seo?.recommendations?.current_analysis?.seo_score ?? 0,
    backlinks: 0,
    local_seo: lastAudit.agents?.local_seo?.recommendations?.local_seo_score ?? 0,
    ai_seo: lastAudit.agents?.ai_seo?.analysis?.ai_visibility_score ?? 0,
  };

  const quickWins: QuickWin[] = lastAudit.quick_wins ?? [];
  const pillars = lastAudit.pillars;

  return (
    <div>
      <AuditMetaBar audit={lastAudit} />

      <ScoreStrip scores={scores} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Overall: Quick wins */}
      {activeTab === "overall" && (
        quickWins.length > 0 ? (
          <QuickWinsSection wins={quickWins} />
        ) : (
          <div className="animate-fadeIn py-16 text-center text-zinc-500 text-sm">
            No quick wins available. Run a new audit to see your action plan.
          </div>
        )
      )}

      {/* Pillar tabs */}
      {activeTab === "website_seo" && (
        pillars?.website_seo
          ? <PillarSection pillarKey="website_seo" data={pillars.website_seo} />
          : <NoData />
      )}
      {activeTab === "backlinks" && (
        pillars?.backlinks
          ? <PillarSection pillarKey="backlinks" data={pillars.backlinks} />
          : <NoData />
      )}
      {activeTab === "local_seo" && (
        pillars?.local_seo
          ? <PillarSection pillarKey="local_seo" data={pillars.local_seo} />
          : <NoData />
      )}
      {activeTab === "ai_seo" && (
        pillars?.ai_seo
          ? <PillarSection pillarKey="ai_seo" data={pillars.ai_seo} />
          : <NoData />
      )}
    </div>
  );
}

function NoData() {
  return (
    <div className="animate-fadeIn py-16 text-center text-zinc-500 text-sm">
      Run a new audit to see detailed improvement steps for this pillar.
    </div>
  );
}

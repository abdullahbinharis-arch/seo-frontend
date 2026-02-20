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
    <div style={{ position: "relative", width: dim, height: dim, flexShrink: 0 }}>
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
        style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Outfit', var(--font-display, sans-serif)",
          fontWeight: 700, fontSize: fs, color,
        }}
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
    iconBg: "rgba(34,211,238,0.12)",
    glow: "rgba(34,211,238,0.25)",
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
    iconBg: "rgba(244,63,94,0.1)",
    glow: "rgba(244,63,94,0.2)",
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
    iconBg: "rgba(245,158,11,0.1)",
    glow: "rgba(245,158,11,0.2)",
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
    iconBg: "rgba(139,92,246,0.1)",
    glow: "rgba(139,92,246,0.2)",
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

function winNumStyle(rank: number): React.CSSProperties {
  if (rank <= 3) return { background: "rgba(244,63,94,0.1)", color: "#fb7185" };
  if (rank <= 6) return { background: "rgba(245,158,11,0.1)", color: "#fbbf24" };
  return { background: "rgba(16,185,129,0.1)", color: "#6ee7b7" };
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
  const arrow: React.CSSProperties = {
    position: "absolute", bottom: -7, left: "50%",
    width: 14, height: 14,
    background: "#09090b",
    border: "1px solid rgba(255,255,255,0.06)",
    borderTop: "none", borderLeft: "none",
    transform: "translateX(-50%) rotate(45deg)",
    zIndex: 2,
  };

  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
      {/* Overall card */}
      <div
        onClick={() => onTabChange("overall")}
        style={{
          flex: 1, minWidth: 170,
          background: "linear-gradient(135deg, rgba(16,185,129,0.06), rgba(59,130,246,0.04))",
          border: `1px solid ${activeTab === "overall" ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.06)"}`,
          borderRadius: 16, padding: 18, cursor: "pointer",
          transition: "all 0.3s", position: "relative", overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 11, color: "#71717a", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Overall Score</span>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <ScoreRing score={scores.overall} large />
          <div style={{ fontSize: 11.5, color: "#71717a", lineHeight: 1.45 }}>
            {scoreLabel(scores.overall)}
            <div style={{ fontSize: 10.5, marginTop: 2 }}>Weighted avg of 4 pillars</div>
          </div>
        </div>
        {activeTab === "overall" && <div style={arrow} />}
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
            style={{
              flex: 1, minWidth: 160,
              background: "#18181b",
              border: `1px solid ${isActive ? cfg.glow : "rgba(255,255,255,0.06)"}`,
              borderRadius: 16, padding: 18, cursor: "pointer",
              transition: "all 0.3s", position: "relative", overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 11, color: "#71717a", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{cfg.label}</span>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: cfg.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {cfg.cardIcon}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <ScoreRing score={score} />
              <div style={{ fontSize: 11.5, color: "#71717a", lineHeight: 1.45 }}>
                <span style={{ color: scoreTextColor(score), fontWeight: 600 }}>{scoreLabel(score)}</span>
                <div style={{ fontSize: 10.5, marginTop: 2 }}>{score} / 100</div>
              </div>
            </div>
            {isActive && <div style={arrow} />}
          </div>
        );
      })}
    </div>
  );
}

// ── Quick wins section ───────────────────────────────────────────────────

function QuickWinsSection({ wins }: { wins: QuickWin[] }) {
  return (
    <div style={{ border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 14, padding: "18px 22px",
        background: "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(59,130,246,0.05))",
      }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(16,185,129,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth="2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-display, 'Outfit', sans-serif)", fontWeight: 600, fontSize: 17 }}>Top 10 Quick Wins</div>
          <div style={{ fontSize: 12, color: "#71717a", marginTop: 3 }}>
            Highest-impact actions sorted by expected ranking improvement. Do these first.
          </div>
        </div>
      </div>

      {/* Win list */}
      <div style={{ padding: 22, background: "#0f0f12" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {wins.map((win) => (
            <div
              key={win.rank}
              style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                padding: "12px 14px", background: "rgba(255,255,255,0.02)", borderRadius: 10,
              }}
            >
              <div style={{
                width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "monospace", fontSize: 10, fontWeight: 600,
                ...winNumStyle(win.rank),
              }}>
                {win.rank}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.45 }}>{win.title}</div>
                {win.impact && (
                  <div style={{ fontSize: 11, color: "#71717a", marginTop: 3 }}>
                    {win.impact}{win.time_estimate ? ` · ${win.time_estimate}` : ""}
                  </div>
                )}
                <div style={{ display: "flex", gap: 6, marginTop: 5, flexWrap: "wrap" }}>
                  <span style={{
                    fontSize: 9, fontWeight: 600, padding: "2px 7px", borderRadius: 5,
                    textTransform: "uppercase", letterSpacing: "0.04em",
                    ...priorityTagStyle(win.priority),
                  }}>
                    {priorityLabel(win.priority)}
                  </span>
                  <span style={{
                    fontSize: 9, fontWeight: 600, padding: "2px 7px", borderRadius: 5,
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
    <div style={{ border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 22px", background: "#18181b" }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: cfg.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {cfg.pillarIcon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "var(--font-display, 'Outfit', sans-serif)", fontWeight: 600, fontSize: 17 }}>{data.title}</div>
          <div style={{ fontSize: 12, color: "#71717a", marginTop: 3 }}>{data.subtitle}</div>
        </div>
        <div style={{
          fontFamily: "var(--font-display, 'Outfit', sans-serif)",
          fontWeight: 700, fontSize: 34,
          color: scoreTextColor(data.score),
        }}>
          {data.score}
        </div>
      </div>

      {/* Steps */}
      <div style={{ padding: 22, background: "#0f0f12", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontFamily: "var(--font-display, 'Outfit', sans-serif)", fontWeight: 600, fontSize: 14, marginBottom: 14 }}>
          Improvement Steps
        </div>
        {data.steps.map((step, i) => (
          <div
            key={step.rank}
            style={{
              display: "flex", gap: 12, padding: "14px 0",
              borderBottom: i < data.steps.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none",
            }}
          >
            <div style={{
              width: 26, height: 26, borderRadius: 8, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "monospace", fontSize: 11, fontWeight: 600,
              background: "rgba(255,255,255,0.04)",
              color: step.priority === "high" ? "#fb7185" : step.priority === "medium" ? "#fbbf24" : "#6ee7b7",
            }}>
              {step.rank}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 500, lineHeight: 1.4, marginBottom: 4 }}>{step.title}</div>
              <div style={{ fontSize: 12, color: "#71717a", lineHeight: 1.55 }}>{step.description}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                {step.category && (
                  <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 5, background: "rgba(255,255,255,0.04)", color: "#71717a", fontWeight: 500 }}>
                    {step.category}
                  </span>
                )}
                {step.priority && (
                  <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 5, fontWeight: 600, ...priorityTagStyle(step.priority) }}>
                    {step.priority === "high" ? "High Impact" : step.priority === "medium" ? "Medium Impact" : "Maintenance"}
                  </span>
                )}
                {step.time_estimate && (
                  <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 5, background: "rgba(255,255,255,0.04)", color: "#71717a", fontWeight: 500 }}>
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
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 20, flexWrap: "wrap", gap: 12 }}>
      <div>
        <h1 style={{ fontFamily: "var(--font-display, 'Outfit', sans-serif)", fontWeight: 600, fontSize: 20, marginBottom: 4 }}>
          {audit.business_name || displayUrl}
        </h1>
        <p style={{ fontSize: 12, color: "#71717a" }}>
          {displayUrl} · {audit.keyword} · {audit.location} · {date}
        </p>
      </div>
      <Link
        href="/dashboard/audit"
        style={{
          padding: "7px 16px", borderRadius: 8, fontSize: 12, fontWeight: 500,
          background: "transparent", border: "1px solid rgba(255,255,255,0.10)",
          color: "#a1a1aa", textDecoration: "none",
        }}
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
      <AuditForm onComplete={onComplete} />
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
          <div style={{ padding: "60px 0", textAlign: "center", color: "#71717a", fontSize: 14 }}>
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
    <div style={{ padding: "60px 0", textAlign: "center", color: "#71717a", fontSize: 14 }}>
      Run a new audit to see detailed improvement steps for this pillar.
    </div>
  );
}

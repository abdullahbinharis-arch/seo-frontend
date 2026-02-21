"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useDashboard } from "@/components/DashboardContext";
import { COUNTRIES } from "@/data/countries";
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

// ── Particles seed (stable across re-renders) ──────────────────────────

function makeParticles(count: number) {
  const particles: Array<{
    left: number;
    bottom: number;
    size: number;
    color: string;
    dur: number;
    delay: number;
  }> = [];
  const colors = ["#6ee7b7", "#3b82f6", "#8b5cf6"];
  for (let i = 0; i < count; i++) {
    particles.push({
      left: Math.round(Math.random() * 100),
      bottom: Math.round(Math.random() * 40),
      size: 1 + Math.random() * 2,
      color: colors[i % colors.length],
      dur: 6 + Math.random() * 8,
      delay: Math.random() * 10,
    });
  }
  return particles;
}

const STAGE_MESSAGES: Array<{ after: number; message: string }> = [
  { after: 0,   message: "Scanning website structure..." },
  { after: 8,   message: "Detecting business type and keywords..." },
  { after: 20,  message: "Finding local competitors on Google..." },
  { after: 35,  message: "Analyzing keyword opportunities..." },
  { after: 50,  message: "Auditing on-page SEO signals..." },
  { after: 65,  message: "Checking backlink profile..." },
  { after: 80,  message: "Analyzing Google Business Profile..." },
  { after: 100, message: "Scoring AI search visibility..." },
  { after: 120, message: "Building local SEO strategy..." },
  { after: 145, message: "Calculating your LocalRank Score..." },
  { after: 170, message: "Almost done — finalizing report..." },
];

// ── Empty state ──────────────────────────────────────────────────────────

function EmptyState({ onComplete }: { onComplete: (r: AuditResult) => void }) {
  const { data: session } = useSession();
  const [businessName, setBusinessName] = useState("");
  const [url, setUrl]                   = useState("");
  const [country, setCountry]           = useState("Canada");
  const [city, setCity]                 = useState("");
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [stage, setStage]               = useState("");

  const particles = useMemo(() => makeParticles(30), []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!businessName.trim() || !url.trim() || !country || !city.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");
    setStage(STAGE_MESSAGES[0].message);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
      const location = `${city.trim()}, ${country}`;

      const kickoffRes = await fetch(`${apiUrl}/workflow/seo-audit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.accessToken
            ? { Authorization: `Bearer ${session.accessToken}` }
            : {}),
        },
        body: JSON.stringify({
          target_url: url.trim(),
          location,
          business_name: businessName.trim(),
        }),
      });

      if (!kickoffRes.ok) {
        const body = await kickoffRes.json().catch(() => null);
        throw new Error(body?.detail ?? `Server error ${kickoffRes.status}`);
      }

      const { audit_id } = await kickoffRes.json();
      if (!audit_id) throw new Error("No audit_id returned from server");

      const startedAt = Date.now();
      const POLL_INTERVAL = 3000;
      const MAX_WAIT = 240000;

      while (Date.now() - startedAt < MAX_WAIT) {
        await new Promise((r) => setTimeout(r, POLL_INTERVAL));
        const elapsed = Math.round((Date.now() - startedAt) / 1000);

        const stageMsg = [...STAGE_MESSAGES].reverse().find((s) => elapsed >= s.after);
        if (stageMsg) setStage(stageMsg.message);

        const pollRes = await fetch(`${apiUrl}/audits/${audit_id}/status`);
        if (!pollRes.ok) continue;

        const data = await pollRes.json();
        if (data.status === "failed") throw new Error("Audit failed — please try again");
        if (data.status !== "processing") {
          onComplete(data as AuditResult);
          return;
        }
      }

      throw new Error("Audit timed out — please try again");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setStage("");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] relative overflow-hidden">
      {/* ── Ambient orbs ── */}
      <div className="empty-orb" style={{ width: 500, height: 500, background: "#6ee7b7", top: "-10%", left: "-5%" }} />
      <div className="empty-orb" style={{ width: 450, height: 450, background: "#3b82f6", bottom: "-8%", right: "-3%", animationDelay: "-7s" }} />
      <div className="empty-orb" style={{ width: 350, height: 350, background: "#8b5cf6", top: "30%", right: "10%", animationDelay: "-13s" }} />

      {/* ── Grid background ── */}
      <div className="absolute inset-0 empty-grid-bg" />

      {/* ── Floating particles ── */}
      {particles.map((p, i) => (
        <div
          key={i}
          className="empty-particle"
          style={{
            left: `${p.left}%`,
            bottom: `${p.bottom}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      {/* ── Form card ── */}
      <div
        className="empty-card relative z-10 w-full"
        style={{ maxWidth: 780, padding: "40px 48px 36px" }}
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-7">
          <div
            className="empty-icon-pulse flex items-center justify-center rounded-2xl mb-4"
            style={{
              width: 48,
              height: 48,
              background: "linear-gradient(135deg, #059669, #10b981)",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="font-display font-bold text-white" style={{ fontSize: 22 }}>
            Run Your First Audit
          </h2>
          <p className="text-zinc-500 mt-1" style={{ fontSize: 13 }}>
            Paste your website and we&apos;ll analyze everything
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div
            className="grid gap-[14px]"
            style={{ gridTemplateColumns: "1fr 1fr" }}
          >
            {/* Business Name */}
            <FieldGroup
              icon={<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>}
              label="Business Name"
            >
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Arch Kitchen Cabinets"
                disabled={loading}
                className="empty-field"
              />
            </FieldGroup>

            {/* Website URL */}
            <FieldGroup
              icon={<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>}
              label="Website URL"
            >
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://yourbusiness.com"
                disabled={loading}
                className="empty-field"
              />
            </FieldGroup>

            {/* Country */}
            <FieldGroup
              icon={<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>}
              label="Country"
            >
              <div className="relative">
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  disabled={loading}
                  className="empty-field empty-select"
                >
                  <option value="">Select country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c} style={{ background: "#18181b" }}>{c}</option>
                  ))}
                </select>
                <svg className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </FieldGroup>

            {/* City */}
            <FieldGroup
              icon={<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>}
              label="City"
            >
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Toronto"
                disabled={loading}
                className="empty-field"
              />
            </FieldGroup>

            {/* Submit button — full width */}
            <div style={{ gridColumn: "1 / -1" }}>
              <button
                type="submit"
                disabled={loading}
                className="empty-btn w-full flex items-center justify-center gap-2.5 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  padding: "14px 24px",
                  borderRadius: 14,
                  fontSize: 15,
                  fontFamily: "'DM Sans', var(--font-geist-sans), sans-serif",
                  fontWeight: 600,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                Run Free Audit
              </button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 mt-4" style={{ fontSize: 12 }}>
          <span className="text-zinc-500">Takes about 60 seconds</span>
          <span className="w-1 h-1 rounded-full bg-emerald-500 shrink-0" />
          <span className="text-zinc-500">No credit card required</span>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm flex-1">{error}</p>
            <button onClick={() => setError("")} className="shrink-0 text-red-400 hover:text-red-300">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-3xl" style={{ background: "rgba(9,9,11,0.85)", backdropFilter: "blur(4px)" }}>
            <div className="empty-spinner mb-4" />
            <p className="font-display font-medium text-white" style={{ fontSize: 14 }}>
              {stage || "Analyzing your business..."}
            </p>
            <p className="text-zinc-500 mt-1.5" style={{ fontSize: 11 }}>
              Scanning website &middot; Detecting keywords &middot; Checking rankings
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function FieldGroup({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-zinc-500">{icon}</span>
        <span
          className="text-zinc-500 font-semibold uppercase tracking-wider"
          style={{ fontSize: 11 }}
        >
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────

export default function OverviewPage() {
  const { lastAudit, setLastAudit } = useDashboard();
  const [activeTab, setActiveTab] = useState<TabKey>("overall");

  if (!lastAudit) {
    return <EmptyState onComplete={setLastAudit} />;
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

"use client";

import { useState } from "react";
import { Card } from "./AuditResults";

// ── TechnicalSeoSection ───────────────────────────────────────────────
// Displays results from /agents/technical-seo

function ScoreTile({ label, value, sub, color }: {
  label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div className="bg-white/5 rounded-xl p-4 text-center">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-zinc-400 mt-0.5 font-medium">{label}</div>
      {sub && <div className="text-[10px] text-zinc-600 mt-0.5">{sub}</div>}
    </div>
  );
}

function Check({ label, value }: { label: string; value: unknown }) {
  const pass    = !!value && value !== "NOT FOUND" && value !== false;
  const strShow = typeof value === "string" && value !== "NOT FOUND" ? value : null;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${pass ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
        {pass ? "✓" : "✗"}
      </span>
      <span className="text-zinc-400">{label}</span>
      {strShow && (
        <span className="text-zinc-500 text-xs truncate max-w-48">{strShow}</span>
      )}
    </div>
  );
}

export function TechnicalSeoSection({ data }: { data: any }) {
  const [showSignals, setShowSignals] = useState(false);

  if (!data) return null;

  const recs = data.recommendations ?? {};
  const psi  = data.pagespeed ?? {};
  const mob  = psi.mobile  ?? {};
  const desk = psi.desktop ?? {};
  const sig  = data.signals ?? {};
  const agg  = data.crawl_aggregate ?? {};

  const score = recs.overall_score ?? recs.technical_score ?? mob.performance_score ?? "—";

  const scoreColor =
    typeof score === "number"
      ? score >= 80 ? "text-emerald-400"
      : score >= 50 ? "text-amber-400"
      : "text-red-400"
      : "text-zinc-400";

  return (
    <Card title="Technical SEO" icon="⚙️" badgeColor="blue">
      {/* Score tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <ScoreTile label="Overall Score" value={typeof score === "number" ? `${score}/100` : score} color={scoreColor} />
        <ScoreTile
          label="Mobile Speed"
          value={mob.performance_score != null ? mob.performance_score : "—"}
          sub={mob.lcp ? `LCP ${mob.lcp}` : undefined}
          color={
            mob.performance_score >= 80 ? "text-emerald-400"
            : mob.performance_score >= 50 ? "text-amber-400"
            : "text-red-400"
          }
        />
        <ScoreTile
          label="Desktop Speed"
          value={desk.performance_score != null ? desk.performance_score : "—"}
          sub={desk.lcp ? `LCP ${desk.lcp}` : undefined}
          color={
            desk.performance_score >= 80 ? "text-emerald-400"
            : desk.performance_score >= 50 ? "text-amber-400"
            : "text-red-400"
          }
        />
        {agg.pages_crawled > 0 ? (
          <ScoreTile label="Site Coverage" value={`${agg.coverage_score ?? 0}/100`} sub={`${agg.pages_crawled} pages`} color="text-blue-400" />
        ) : (
          <ScoreTile label="Broken Links" value={sig.broken_links?.broken_count ?? 0} color={sig.broken_links?.broken_count > 0 ? "text-red-400" : "text-emerald-400"} />
        )}
      </div>

      {/* Priority actions */}
      {(recs.priority_actions ?? recs.issues ?? []).length > 0 && (
        <div className="mb-5">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Priority Actions</h3>
          <ul className="space-y-2">
            {(recs.priority_actions ?? recs.issues ?? []).map((action: string, i: number) => (
              <li key={i} className="flex gap-3 text-sm text-zinc-300">
                <span className="text-emerald-400 font-bold shrink-0 mt-0.5">→</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Core signals checklist */}
      {sig.success && (
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Technical Checklist</h3>
          <div className="grid sm:grid-cols-2 gap-2">
            <Check label="HTTPS" value={sig.https} />
            <Check label="Viewport meta" value={sig.viewport} />
            <Check label="Canonical tag" value={sig.canonical} />
            <Check label="Robots.txt" value={sig.robots_txt?.exists} />
            <Check label="XML Sitemap" value={sig.sitemap_xml?.exists} />
            <Check label="OG tags" value={Object.keys(sig.og_tags ?? {}).length > 0} />
            <Check label="Schema markup" value={(sig.schemas ?? []).length > 0} />
            <Check label="No render-blocking scripts" value={(sig.render_blocking_scripts ?? 0) === 0} />
          </div>
        </div>
      )}

      {/* PageSpeed opportunities */}
      {(mob.opportunities ?? []).length > 0 && (
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Speed Opportunities</h3>
          <ul className="space-y-1.5">
            {(mob.opportunities ?? []).slice(0, 6).map((opp: any, i: number) => (
              <li key={i} className="flex items-center justify-between gap-4 text-sm">
                <span className="text-zinc-300">{opp.title}</span>
                <span className="text-amber-400 text-xs shrink-0 font-mono">~{opp.savings_ms}ms</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Raw signals toggle */}
      {sig.success && (
        <button
          onClick={() => setShowSignals((v) => !v)}
          className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 mt-1"
        >
          {showSignals ? "Hide" : "Show"} raw signals
          <svg className={`w-3 h-3 transition-transform ${showSignals ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}
      {showSignals && (
        <pre className="mt-3 text-[11px] text-zinc-400 bg-black/30 rounded-xl p-4 overflow-auto max-h-72 leading-relaxed">
          {JSON.stringify(sig, null, 2)}
        </pre>
      )}
    </Card>
  );
}

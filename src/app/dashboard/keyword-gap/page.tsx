"use client";

import Link from "next/link";
import { useDashboard } from "@/components/DashboardContext";
import { KeywordSection } from "@/components/AuditResults";

export default function KeywordGapPage() {
  const { lastAudit } = useDashboard();
  const kw = lastAudit?.agents?.keyword_research?.recommendations;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">Keyword Gap Analysis</h1>
        <p className="text-sm text-zinc-400 mt-1">Keywords your competitors rank for that you don&apos;t — your biggest growth opportunity.</p>
      </div>

      {!kw ? (
        <div className="glass rounded-2xl p-8 text-center space-y-4">
          <p className="text-zinc-400">No keyword data yet. Run a full audit first to see your keyword gaps.</p>
          <Link href="/dashboard/audit" className="btn-primary inline-flex items-center gap-2 text-white font-semibold px-5 py-2.5 rounded-xl text-sm">
            Run Full Audit
          </Link>
        </div>
      ) : (
        <>
          {/* Competitor gaps */}
          {(kw.competitor_keywords_we_miss?.length ?? 0) > 0 && (
            <div className="glass rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
                <span className="text-red-400">⚠</span> Keywords Competitors Rank For (You Don&apos;t)
              </h2>
              <div className="flex flex-wrap gap-2">
                {kw.competitor_keywords_we_miss.map((kwd: string, i: number) => (
                  <span key={i} className="bg-red-500/10 text-red-400 text-xs px-3 py-1.5 rounded-lg font-medium border border-red-500/20">
                    {kwd}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Content gaps */}
          {(kw.content_gap_opportunities?.length ?? 0) > 0 && (
            <div className="glass rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
                <span className="text-amber-400">💡</span> Content Gap Opportunities
              </h2>
              <ul className="space-y-2">
                {kw.content_gap_opportunities.map((gap: string, i: number) => (
                  <li key={i} className="flex gap-3 text-sm text-zinc-300">
                    <span className="text-emerald-400 font-bold shrink-0 mt-0.5">→</span>
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Full keyword section */}
          <KeywordSection data={kw} competitorsAnalyzed={lastAudit!.agents.keyword_research.competitors_analyzed ?? 0} />
        </>
      )}
    </div>
  );
}

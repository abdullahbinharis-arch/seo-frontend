"use client";

import { useState } from "react";
import type {
  AuditResult,
  HighIntentKeyword,
  Citation,
  LinkOpportunity,
  InternalLink,
} from "@/types";

// ── Root results component ───────────────────────────────────────────

export function AuditResults({ data }: { data: AuditResult }) {
  const [showJson, setShowJson] = useState(false);

  const kw    = data.agents?.keyword_research?.recommendations;
  const op    = data.agents?.on_page_seo?.recommendations;
  const local = data.agents?.local_seo?.recommendations;

  return (
    <div className="space-y-6">
      {/* Audit complete banner */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 rounded-full p-1 shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-white">Audit complete</p>
            <p className="text-sm text-emerald-400">
              {data.agents_executed} agents · {data.execution_time_seconds?.toFixed(1)}s · Est. cost ${data.summary?.estimated_api_cost?.toFixed(3)}
            </p>
          </div>
        </div>
        <div className="text-right text-xs text-zinc-500 font-mono">
          #{data.audit_id?.slice(0, 8)}
        </div>
      </div>

      {/* Local SEO Score */}
      {typeof data.local_seo_score === "number" && (
        <LocalSeoScoreCard
          score={data.local_seo_score}
          businessName={data.business_name}
          businessType={data.business_type}
        />
      )}

      {/* Quick Wins */}
      {data.summary?.quick_wins?.length > 0 && (
        <Card title="Quick Wins" icon="⚡" badgeColor="blue">
          <ul className="space-y-2">
            {data.summary.quick_wins.map((win, i) => (
              <li key={i} className="flex gap-3 text-zinc-300 text-sm">
                <span className="text-[#6ee7b7] font-bold shrink-0 mt-0.5">→</span>
                <span>{win}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Keyword Research */}
      {kw && <KeywordSection data={kw} competitorsAnalyzed={data.agents.keyword_research.competitors_analyzed} />}

      {/* On-Page SEO */}
      {op && <OnPageSection data={op} pageScraped={data.agents.on_page_seo.page_scraped} />}

      {/* Local SEO */}
      {local && <LocalSection data={local} />}

      {/* Raw JSON */}
      <div className="glass rounded-2xl overflow-hidden">
        <button
          onClick={() => setShowJson((v) => !v)}
          className="w-full flex items-center justify-between px-6 py-4 text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors"
        >
          <span>View raw JSON</span>
          <svg
            className={`w-4 h-4 transition-transform ${showJson ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showJson && (
          <pre className="bg-[#09090b] text-zinc-300 p-6 text-xs overflow-auto max-h-[32rem] leading-relaxed border-t border-white/5">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

// ── Keyword Research section ─────────────────────────────────────────

function KeywordSection({
  data,
  competitorsAnalyzed,
}: {
  data: ReturnType<typeof getKw>;
  competitorsAnalyzed: number;
}) {
  return (
    <Card title="Keyword Research" icon="🔍" badge={`${competitorsAnalyzed} competitors analysed`}>
      {/* High-intent keyword table */}
      {data.high_intent_keywords?.length > 0 && (
        <div className="mb-6">
          <SectionHeading>High-Intent Keywords</SectionHeading>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs text-zinc-500 uppercase tracking-wide">
                  <th className="pb-2 font-medium">Keyword</th>
                  <th className="pb-2 font-medium">Intent</th>
                  <th className="pb-2 font-medium text-right">Searches/mo</th>
                  <th className="pb-2 font-medium text-right">Difficulty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.high_intent_keywords.slice(0, 10).map((k: HighIntentKeyword, i: number) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="py-2.5 font-medium text-white">{k.keyword}</td>
                    <td className="py-2.5">
                      <IntentBadge intent={k.intent} />
                    </td>
                    <td className="py-2.5 text-right text-zinc-400 tabular-nums">
                      {k.estimated_monthly_searches?.toLocaleString() ?? "—"}
                    </td>
                    <td className="py-2.5 text-right">
                      <DifficultyBadge difficulty={k.difficulty} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Long-tail */}
      {data.long_tail_keywords?.length > 0 && (
        <div className="mb-6">
          <SectionHeading>Long-Tail Opportunities</SectionHeading>
          <div className="flex flex-wrap gap-2">
            {data.long_tail_keywords.map((lt: string, i: number) => (
              <span key={i} className="bg-blue-500/10 text-blue-300 border border-blue-500/20 text-xs font-medium px-3 py-1.5 rounded-full">
                {lt}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Clusters */}
      {data.keyword_clusters?.length > 0 && (
        <div className="mb-6">
          <SectionHeading>Keyword Clusters</SectionHeading>
          <div className="grid md:grid-cols-2 gap-3">
            {data.keyword_clusters.map((c: { theme: string; keywords: string[] }, i: number) => (
              <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/5">
                <p className="font-semibold text-white text-sm mb-2">{c.theme}</p>
                <p className="text-xs text-zinc-500 leading-relaxed">{c.keywords?.join(" · ")}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Competitor gaps */}
      {data.competitor_keywords_we_miss?.length > 0 && (
        <div className="mb-6">
          <SectionHeading>Competitor Keyword Gaps</SectionHeading>
          <div className="flex flex-wrap gap-2">
            {data.competitor_keywords_we_miss.map((kw: string, i: number) => (
              <span key={i} className="bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-medium px-3 py-1.5 rounded-full">
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Strategy summary */}
      {data.recommendation && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-300 leading-relaxed">
          {data.recommendation}
        </div>
      )}
    </Card>
  );
}

// ── On-Page SEO section ──────────────────────────────────────────────

function OnPageSection({
  data,
  pageScraped,
}: {
  data: ReturnType<typeof getOp>;
  pageScraped: boolean;
}) {
  const current = data.current_analysis;
  const recs    = data.recommendations;

  return (
    <Card
      title="On-Page SEO"
      icon="📄"
      badge={pageScraped ? `Score: ${current?.seo_score ?? "?"}/10` : "Page not scraped"}
      badgeColor={
        !pageScraped ? "slate"
        : (current?.seo_score ?? 0) >= 7 ? "green"
        : (current?.seo_score ?? 0) >= 4 ? "amber"
        : "red"
      }
    >
      {/* Current issues */}
      {current?.issues_found?.length > 0 && (
        <div className="mb-6">
          <SectionHeading>Issues Found</SectionHeading>
          <ul className="space-y-1.5">
            {current.issues_found.map((issue: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-red-400">
                <span className="text-red-500 shrink-0 mt-0.5">✕</span>
                {issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommended meta */}
      {recs && (
        <div className="mb-6 space-y-4">
          <SectionHeading>Recommended Meta Tags</SectionHeading>
          {recs.meta_title && (
            <MetaField label="Title tag" value={recs.meta_title} charLimit={60} />
          )}
          {recs.meta_description && (
            <MetaField label="Meta description" value={recs.meta_description} charLimit={160} />
          )}
          {recs.h1 && (
            <MetaField label="H1" value={recs.h1} />
          )}
          {recs.target_word_count && (
            <div className="flex items-center justify-between bg-white/5 rounded-xl p-4 border border-white/5">
              <span className="text-sm font-medium text-zinc-400">Target word count</span>
              <span className="text-lg font-bold text-white">
                {recs.target_word_count.toLocaleString()} words
                {current?.word_count > 0 && (
                  <span className="text-sm font-normal text-zinc-500 ml-2">
                    (currently {current.word_count.toLocaleString()})
                  </span>
                )}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Priority actions */}
      {data.priority_actions?.length > 0 && (
        <div className="mb-6">
          <SectionHeading>Priority Actions</SectionHeading>
          <ol className="space-y-2">
            {data.priority_actions.map((action: string, i: number) => (
              <li key={i} className="flex gap-3 items-start text-sm text-zinc-300">
                <span className="shrink-0 w-6 h-6 rounded-full bg-orange-500/15 text-orange-400 text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                {action}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Suggested heading structure */}
      {recs?.heading_structure?.length > 0 && (
        <div className="mb-6">
          <SectionHeading>Suggested Heading Structure</SectionHeading>
          <div className="space-y-1">
            {recs.heading_structure.map((h: string, i: number) => {
              const level = h.startsWith("H2") ? "pl-0" : h.startsWith("H3") ? "pl-5" : "pl-10";
              const weight = h.startsWith("H2") ? "font-semibold" : "font-normal";
              return (
                <p key={i} className={`text-sm text-zinc-400 ${level} ${weight}`}>
                  {h}
                </p>
              );
            })}
          </div>
        </div>
      )}

      {/* Internal links */}
      {data.internal_links?.length > 0 && (
        <div>
          <SectionHeading>Internal Links to Add</SectionHeading>
          <div className="space-y-2">
            {data.internal_links.map((link: InternalLink, i: number) => (
              <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/5">
                <p className="text-sm font-medium text-white">
                  <span className="text-[#6ee7b7]">&ldquo;{link.anchor_text}&rdquo;</span>
                  <span className="text-zinc-500 mx-2">→</span>
                  <code className="text-zinc-400 text-xs bg-white/10 px-1.5 py-0.5 rounded">
                    {link.target_path}
                  </code>
                </p>
                <p className="text-xs text-zinc-500 mt-1">{link.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

// ── Local SEO section ────────────────────────────────────────────────

function LocalSection({ data }: { data: ReturnType<typeof getLocal> }) {
  return (
    <Card title="Local SEO" icon="📍">
      {/* Quick wins */}
      {data.quick_wins?.length > 0 && (
        <div className="mb-6">
          <SectionHeading>Quick Wins</SectionHeading>
          <ul className="space-y-2">
            {data.quick_wins.map((win: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                <span className="text-[#6ee7b7] font-bold shrink-0 mt-0.5">✓</span>
                {win}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* GBP */}
      {data.gbp_optimization && (
        <div className="mb-6">
          <SectionHeading>Google Business Profile</SectionHeading>
          <div className="grid md:grid-cols-2 gap-4">
            {data.gbp_optimization.priority_attributes?.length > 0 && (
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Priority Attributes</p>
                <ul className="space-y-1">
                  {data.gbp_optimization.priority_attributes.map((attr: string, i: number) => (
                    <li key={i} className="text-sm text-zinc-300">· {attr}</li>
                  ))}
                </ul>
              </div>
            )}
            {data.gbp_optimization.categories?.length > 0 && (
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Recommended Categories</p>
                <ul className="space-y-1">
                  {data.gbp_optimization.categories.map((cat: string, i: number) => (
                    <li key={i} className="text-sm text-zinc-300">· {cat}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {data.gbp_optimization.photo_strategy && (
            <div className="mt-3 bg-white/5 rounded-xl p-4 border border-white/5 text-sm text-zinc-300">
              <span className="font-medium text-white">Photo strategy: </span>
              {data.gbp_optimization.photo_strategy}
            </div>
          )}

          {data.gbp_optimization.review_strategy && (
            <div className="mt-3 bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20 text-sm text-emerald-300">
              <span className="font-medium">Review target: </span>
              {data.gbp_optimization.review_strategy.target_reviews_per_month} reviews/month
            </div>
          )}
        </div>
      )}

      {/* Citations */}
      {data.citations?.length > 0 && (
        <div className="mb-6">
          <SectionHeading>Citations to Build</SectionHeading>
          <div className="grid md:grid-cols-2 gap-2">
            {data.citations.map((c: Citation, i: number) => (
              <div
                key={i}
                className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 border border-white/5"
              >
                <div>
                  <p className="text-sm font-medium text-white">{c.site}</p>
                  <p className="text-xs text-zinc-500 capitalize">{c.category}</p>
                </div>
                <PriorityBadge priority={c.priority} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Link opportunities */}
      {data.link_opportunities?.length > 0 && (
        <div className="mb-6">
          <SectionHeading>Link Building Opportunities</SectionHeading>
          <div className="space-y-3">
            {data.link_opportunities.map((opp: LinkOpportunity, i: number) => (
              <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/5">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold text-white">{opp.name}</p>
                  <span className="text-xs bg-white/10 text-zinc-400 px-2 py-0.5 rounded-full shrink-0 capitalize">
                    {opp.link_type}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mb-2">{opp.reason}</p>
                {opp.outreach_template && (
                  <p className="text-xs text-[#6ee7b7]/80 italic border-l-2 border-[#6ee7b7]/30 pl-3">
                    {opp.outreach_template}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content strategy */}
      {data.local_content_strategy && (
        <div className="mb-6">
          <SectionHeading>Content Strategy</SectionHeading>
          <div className="grid md:grid-cols-2 gap-4">
            {data.local_content_strategy.blog_topics?.length > 0 && (
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Blog Topics</p>
                <ul className="space-y-1.5">
                  {data.local_content_strategy.blog_topics.map((t: string, i: number) => (
                    <li key={i} className="text-sm text-zinc-300">· {t}</li>
                  ))}
                </ul>
              </div>
            )}
            {data.local_content_strategy.service_area_pages?.length > 0 && (
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Service Area Pages</p>
                <ul className="space-y-1.5">
                  {data.local_content_strategy.service_area_pages.map((p: string, i: number) => (
                    <li key={i} className="text-sm text-zinc-300">· {p}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Estimated impact */}
      {data.estimated_impact && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-300 leading-relaxed">
          <span className="font-semibold">Estimated impact: </span>
          {data.estimated_impact}
        </div>
      )}
    </Card>
  );
}

// ── Shared helper components ─────────────────────────────────────────

function Card({
  title,
  icon,
  badge,
  badgeColor = "slate",
  children,
}: {
  title: string;
  icon: string;
  badge?: string;
  badgeColor?: "slate" | "green" | "amber" | "red" | "blue";
  children: React.ReactNode;
}) {
  const badgeColors: Record<string, string> = {
    slate: "bg-white/10 text-zinc-400",
    green: "bg-emerald-500/15 text-emerald-400",
    amber: "bg-amber-500/15 text-amber-400",
    red:   "bg-red-500/15 text-red-400",
    blue:  "bg-blue-500/15 text-blue-400",
  };

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <span>{icon}</span>
          {title}
        </h3>
        {badge && (
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${badgeColors[badgeColor]}`}>
            {badge}
          </span>
        )}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">
      {children}
    </h4>
  );
}

function MetaField({
  label,
  value,
  charLimit,
}: {
  label: string;
  value: string;
  charLimit?: number;
}) {
  const over = charLimit && value.length > charLimit;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-medium text-zinc-500">{label}</p>
        {charLimit && (
          <p className={`text-xs tabular-nums ${over ? "text-red-400" : "text-zinc-500"}`}>
            {value.length}/{charLimit}
          </p>
        )}
      </div>
      <div className={`bg-white/5 border-l-4 ${over ? "border-red-500" : "border-[#6ee7b7]/50"} rounded-r-xl px-4 py-3`}>
        <p className="text-sm text-zinc-300 font-mono leading-relaxed">{value}</p>
      </div>
    </div>
  );
}

function IntentBadge({ intent }: { intent: string }) {
  const colors: Record<string, string> = {
    transactional: "bg-emerald-500/15 text-emerald-400",
    commercial:    "bg-blue-500/15 text-blue-400",
    informational: "bg-white/10 text-zinc-400",
    navigational:  "bg-purple-500/15 text-purple-400",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${colors[intent] ?? "bg-white/10 text-zinc-400"}`}>
      {intent}
    </span>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const colors: Record<string, string> = {
    low:    "text-emerald-400",
    medium: "text-amber-400",
    high:   "text-red-400",
  };
  return (
    <span className={`text-xs font-semibold capitalize ${colors[difficulty] ?? "text-zinc-500"}`}>
      {difficulty}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    critical: "bg-red-500/15 text-red-400",
    high:     "bg-orange-500/15 text-orange-400",
    medium:   "bg-yellow-500/15 text-yellow-400",
    low:      "bg-white/10 text-zinc-500",
  };
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize shrink-0 ${styles[priority] ?? styles.low}`}>
      {priority}
    </span>
  );
}

// tiny type-helpers so TS is happy with the loose API data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getKw(d: any) { return d; }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getOp(d: any) { return d; }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getLocal(d: any) { return d; }

// ── Local SEO Score card ─────────────────────────────────────────────

function LocalSeoScoreCard({
  score,
  businessName,
  businessType,
}: {
  score: number;
  businessName?: string;
  businessType?: string;
}) {
  const clamped = Math.max(0, Math.min(100, score));
  const isGood  = clamped >= 70;
  const isOk    = clamped >= 40;

  const colorBar   = isGood ? "bg-emerald-500"       : isOk ? "bg-yellow-400"       : "bg-red-500";
  const colorScore = isGood ? "text-emerald-400"     : isOk ? "text-yellow-400"     : "text-red-400";
  const colorBg    = isGood
    ? "bg-emerald-500/10 border-emerald-500/20"
    : isOk
    ? "bg-yellow-500/10 border-yellow-500/20"
    : "bg-red-500/10 border-red-500/20";
  const label = isGood ? "Good" : isOk ? "Needs Work" : "Poor";
  const hint  = isGood
    ? "Your local presence is strong. Focus on maintaining and growing from here."
    : isOk
    ? "You have a foundation — targeted improvements will move you into the Map Pack."
    : "Significant local SEO gaps found. Follow the recommendations below to improve quickly.";

  return (
    <div className={`rounded-2xl border p-6 ${colorBg}`}>
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="text-lg font-bold text-white font-display">Local SEO Score</h2>
          {(businessName || businessType) && (
            <p className="text-sm text-zinc-400 mt-0.5">
              {[businessName, businessType && `(${businessType})`].filter(Boolean).join(" ")}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <span className={`text-6xl font-black leading-none ${colorScore}`}>{clamped}</span>
          <span className="text-zinc-500 text-lg font-semibold">/100</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white/10 rounded-full h-3 mb-3 overflow-hidden">
        <div
          className={`h-3 rounded-full ${colorBar} transition-all duration-500`}
          style={{ width: `${clamped}%` }}
        />
      </div>

      {/* Scale labels */}
      <div className="flex justify-between text-xs text-zinc-500 mb-4">
        <span>0 — Poor</span>
        <span className={`font-semibold ${colorScore}`}>{label}</span>
        <span>100 — Excellent</span>
      </div>

      <p className="text-sm text-zinc-400">{hint}</p>
    </div>
  );
}

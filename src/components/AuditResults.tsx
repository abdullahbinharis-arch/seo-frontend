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
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 rounded-full p-1">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-emerald-900">Audit complete</p>
            <p className="text-sm text-emerald-600">
              {data.agents_executed} agents · {data.execution_time_seconds?.toFixed(1)}s · Est. cost ${data.summary?.estimated_api_cost?.toFixed(3)}
            </p>
          </div>
        </div>
        <div className="text-right text-xs text-emerald-500 font-mono">
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
              <li key={i} className="flex gap-3 text-slate-700 text-sm">
                <span className="text-blue-500 font-bold shrink-0 mt-0.5">→</span>
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
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <button
          onClick={() => setShowJson((v) => !v)}
          className="w-full flex items-center justify-between px-6 py-4 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
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
          <pre className="bg-slate-900 text-slate-100 p-6 text-xs overflow-auto max-h-[32rem] leading-relaxed">
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
                <tr className="border-b border-slate-100 text-left text-xs text-slate-400 uppercase tracking-wide">
                  <th className="pb-2 font-medium">Keyword</th>
                  <th className="pb-2 font-medium">Intent</th>
                  <th className="pb-2 font-medium text-right">Searches/mo</th>
                  <th className="pb-2 font-medium text-right">Difficulty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.high_intent_keywords.slice(0, 10).map((k: HighIntentKeyword, i: number) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 font-medium text-slate-800">{k.keyword}</td>
                    <td className="py-2.5">
                      <IntentBadge intent={k.intent} />
                    </td>
                    <td className="py-2.5 text-right text-slate-600 tabular-nums">
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
              <span key={i} className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full">
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
              <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="font-semibold text-slate-800 text-sm mb-2">{c.theme}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{c.keywords?.join(" · ")}</p>
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
              <span key={i} className="bg-amber-50 text-amber-700 text-xs font-medium px-3 py-1.5 rounded-full border border-amber-100">
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Strategy summary */}
      {data.recommendation && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800 leading-relaxed">
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
              <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                <span className="text-red-400 shrink-0 mt-0.5">✕</span>
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
            <div className="flex items-center justify-between bg-slate-50 rounded-xl p-4 border border-slate-100">
              <span className="text-sm font-medium text-slate-600">Target word count</span>
              <span className="text-lg font-bold text-slate-900">
                {recs.target_word_count.toLocaleString()} words
                {current?.word_count > 0 && (
                  <span className="text-sm font-normal text-slate-400 ml-2">
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
              <li key={i} className="flex gap-3 items-start text-sm text-slate-700">
                <span className="shrink-0 w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center mt-0.5">
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
                <p key={i} className={`text-sm text-slate-600 ${level} ${weight}`}>
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
              <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-sm font-medium text-slate-800">
                  <span className="text-blue-600">"{link.anchor_text}"</span>
                  <span className="text-slate-400 mx-2">→</span>
                  <code className="text-slate-600 text-xs bg-slate-100 px-1.5 py-0.5 rounded">
                    {link.target_path}
                  </code>
                </p>
                <p className="text-xs text-slate-500 mt-1">{link.reason}</p>
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
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
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
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Priority Attributes</p>
                <ul className="space-y-1">
                  {data.gbp_optimization.priority_attributes.map((attr: string, i: number) => (
                    <li key={i} className="text-sm text-slate-700">· {attr}</li>
                  ))}
                </ul>
              </div>
            )}
            {data.gbp_optimization.categories?.length > 0 && (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Recommended Categories</p>
                <ul className="space-y-1">
                  {data.gbp_optimization.categories.map((cat: string, i: number) => (
                    <li key={i} className="text-sm text-slate-700">· {cat}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {data.gbp_optimization.photo_strategy && (
            <div className="mt-3 bg-slate-50 rounded-xl p-4 border border-slate-100 text-sm text-slate-600">
              <span className="font-medium text-slate-700">Photo strategy: </span>
              {data.gbp_optimization.photo_strategy}
            </div>
          )}

          {data.gbp_optimization.review_strategy && (
            <div className="mt-3 bg-emerald-50 rounded-xl p-4 border border-emerald-100 text-sm text-emerald-800">
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
                className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-slate-100"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">{c.site}</p>
                  <p className="text-xs text-slate-400 capitalize">{c.category}</p>
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
              <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold text-slate-800">{opp.name}</p>
                  <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full shrink-0 capitalize">
                    {opp.link_type}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-2">{opp.reason}</p>
                {opp.outreach_template && (
                  <p className="text-xs text-blue-600 italic border-l-2 border-blue-200 pl-3">
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
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Blog Topics</p>
                <ul className="space-y-1.5">
                  {data.local_content_strategy.blog_topics.map((t: string, i: number) => (
                    <li key={i} className="text-sm text-slate-700">· {t}</li>
                  ))}
                </ul>
              </div>
            )}
            {data.local_content_strategy.service_area_pages?.length > 0 && (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Service Area Pages</p>
                <ul className="space-y-1.5">
                  {data.local_content_strategy.service_area_pages.map((p: string, i: number) => (
                    <li key={i} className="text-sm text-slate-700">· {p}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Estimated impact */}
      {data.estimated_impact && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800 leading-relaxed">
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
    slate: "bg-slate-100 text-slate-600",
    green: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    red:   "bg-red-100 text-red-700",
    blue:  "bg-blue-100 text-blue-700",
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
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
    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
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
        <p className="text-xs font-medium text-slate-500">{label}</p>
        {charLimit && (
          <p className={`text-xs tabular-nums ${over ? "text-red-500" : "text-slate-400"}`}>
            {value.length}/{charLimit}
          </p>
        )}
      </div>
      <div className={`bg-slate-50 border-l-4 ${over ? "border-red-400" : "border-blue-400"} rounded-r-xl px-4 py-3`}>
        <p className="text-sm text-slate-800 font-mono leading-relaxed">{value}</p>
      </div>
    </div>
  );
}

function IntentBadge({ intent }: { intent: string }) {
  const colors: Record<string, string> = {
    transactional: "bg-green-100 text-green-700",
    commercial:    "bg-blue-100 text-blue-700",
    informational: "bg-slate-100 text-slate-600",
    navigational:  "bg-purple-100 text-purple-700",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${colors[intent] ?? "bg-slate-100 text-slate-600"}`}>
      {intent}
    </span>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const colors: Record<string, string> = {
    low:    "text-emerald-600",
    medium: "text-amber-600",
    high:   "text-red-600",
  };
  return (
    <span className={`text-xs font-semibold capitalize ${colors[difficulty] ?? "text-slate-500"}`}>
      {difficulty}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    critical: "bg-red-100 text-red-700",
    high:     "bg-orange-100 text-orange-700",
    medium:   "bg-yellow-100 text-yellow-700",
    low:      "bg-slate-100 text-slate-500",
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
  const isGood   = clamped >= 70;
  const isOk     = clamped >= 40;

  const colorBar   = isGood ? "bg-green-500"  : isOk ? "bg-yellow-400"  : "bg-red-500";
  const colorScore = isGood ? "text-green-600" : isOk ? "text-yellow-500" : "text-red-600";
  const colorBg    = isGood ? "bg-green-50 border-green-200" : isOk ? "bg-yellow-50 border-yellow-200" : "bg-red-50 border-red-200";
  const label      = isGood ? "Good"          : isOk ? "Needs Work"     : "Poor";
  const hint       = isGood
    ? "Your local presence is strong. Focus on maintaining and growing from here."
    : isOk
    ? "You have a foundation — targeted improvements will move you into the Map Pack."
    : "Significant local SEO gaps found. Follow the recommendations below to improve quickly.";

  return (
    <div className={`rounded-2xl border p-6 ${colorBg}`}>
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Local SEO Score</h2>
          {(businessName || businessType) && (
            <p className="text-sm text-slate-500 mt-0.5">
              {[businessName, businessType && `(${businessType})`].filter(Boolean).join(" ")}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <span className={`text-6xl font-black leading-none ${colorScore}`}>{clamped}</span>
          <span className="text-slate-400 text-lg font-semibold">/100</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white/60 rounded-full h-3 mb-3 overflow-hidden">
        <div
          className={`h-3 rounded-full ${colorBar} transition-all duration-500`}
          style={{ width: `${clamped}%` }}
        />
      </div>

      {/* Scale labels */}
      <div className="flex justify-between text-xs text-slate-400 mb-4">
        <span>0 — Poor</span>
        <span className={`font-semibold ${colorScore}`}>{label}</span>
        <span>100 — Excellent</span>
      </div>

      <p className="text-sm text-slate-600">{hint}</p>
    </div>
  );
}

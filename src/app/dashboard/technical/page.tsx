"use client";

import { useState, useEffect, useCallback } from "react";
import { AgentRunner } from "@/components/AgentRunner";
import { useDashboard } from "@/components/DashboardContext";
import { TechnicalSeoSection } from "@/components/TechnicalSeoSection";
import type { TechnicalSeoAgent } from "@/types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ── Types ───────────────────────────────────────────────────────────────

interface TechCategory {
  name: string;
  icon: string;
  count: number;
  severity: string;
  items: Record<string, unknown>[];
}

interface TechSeoData {
  summary: { errors: number; warnings: number; passed: number };
  categories: TechCategory[];
}

// ── Icon map ────────────────────────────────────────────────────────────

function CategoryIcon({ icon }: { icon: string }) {
  const map: Record<string, React.ReactNode> = {
    "link-slash": (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
        <line x1="2" y1="2" x2="22" y2="22" />
      </svg>
    ),
    "circle-exclamation": (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    "shield": (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    "image": (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
      </svg>
    ),
    "copy": (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
      </svg>
    ),
    "robot": (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><line x1="12" y1="7" x2="12" y2="11" />
        <line x1="8" y1="16" x2="8" y2="16.01" /><line x1="16" y1="16" x2="16" y2="16.01" />
      </svg>
    ),
    "gauge-high": (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" /><path d="M12 6v6l4 2" />
      </svg>
    ),
  };
  return <>{map[icon] ?? map["circle-exclamation"]}</>;
}

// ── Main Page ───────────────────────────────────────────────────────────

export default function TechnicalPage() {
  const { lastAudit, agentCache, setAgentResult } = useDashboard();
  const cached = agentCache.technical_seo as TechnicalSeoAgent | undefined;

  const auditId = lastAudit?.audit_id ?? "";
  const [techData, setTechData] = useState<TechSeoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "errors" | "warnings">("all");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const fetchTechSeo = useCallback(async () => {
    if (!auditId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/audit/${auditId}/technical-seo`);
      if (!res.ok) throw new Error("Failed");
      setTechData(await res.json());
    } catch {
      setTechData(null);
    } finally {
      setLoading(false);
    }
  }, [auditId]);

  useEffect(() => {
    fetchTechSeo();
  }, [fetchTechSeo]);

  const toggleExpand = (name: string) =>
    setExpanded((prev) => ({ ...prev, [name]: !prev[name] }));

  const filtered = techData?.categories.filter((cat) => {
    if (filter === "errors") return cat.severity === "error";
    if (filter === "warnings") return cat.severity === "warning";
    return true;
  }) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">Technical SEO</h1>
        <p className="text-sm text-white mt-1">
          Core Web Vitals, HTTPS, canonical tags, schema markup, broken links, robots.txt, and site-wide crawl issues.
        </p>
      </div>

      {/* Summary cards */}
      {techData && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-rose-500/[0.06] border border-rose-500/15 rounded-2xl p-[18px]">
            <div className="text-[11px] text-rose-400 font-semibold uppercase tracking-wider mb-1">Errors</div>
            <div className="text-[28px] font-bold font-display text-rose-400">{techData.summary.errors}</div>
          </div>
          <div className="bg-amber-500/[0.06] border border-amber-500/15 rounded-2xl p-[18px]">
            <div className="text-[11px] text-amber-400 font-semibold uppercase tracking-wider mb-1">Warnings</div>
            <div className="text-[28px] font-bold font-display text-amber-400">{techData.summary.warnings}</div>
          </div>
          <div className="bg-emerald-500/[0.06] border border-emerald-500/15 rounded-2xl p-[18px]">
            <div className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider mb-1">Passed</div>
            <div className="text-[28px] font-bold font-display text-emerald-400">{techData.summary.passed}</div>
          </div>
        </div>
      )}

      {/* Filter bar */}
      {techData && (
        <div className="flex gap-2">
          {(["all", "errors", "warnings"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[12px] px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                filter === f
                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                  : "bg-white/[0.03] border border-white/6 text-white hover:text-white"
              }`}
            >
              {f === "all" ? "All" : f === "errors" ? "Errors Only" : "Warnings Only"}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="py-16 text-center text-white text-sm animate-pulse">Loading technical SEO data...</div>
      )}

      {/* Empty state */}
      {!loading && !techData && !auditId && (
        <AgentRunner<TechnicalSeoAgent>
          endpoint="/agents/technical-seo"
          fields={["url", "keyword", "location"]}
          runLabel="Run Technical Audit"
          progressMessage="Fetching PageSpeed data and auditing technical signals..."
          cachedResult={cached}
          onResult={(data) => setAgentResult("technical_seo", data)}
          renderResult={(data) => <TechnicalSeoSection data={data} />}
        />
      )}

      {/* Category accordions */}
      {techData && filtered.length === 0 && (
        <div className="py-12 text-center text-white text-sm">
          {filter === "all" ? "No technical issues found. Great!" : `No ${filter} found.`}
        </div>
      )}

      {techData && filtered.map((cat) => {
        const isOpen = !!expanded[cat.name];
        const sevColor = cat.severity === "error" ? "text-rose-400" : "text-amber-400";
        const sevBg = cat.severity === "error" ? "bg-rose-500/10" : "bg-amber-500/10";

        return (
          <div key={cat.name} className="border border-white/6 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleExpand(cat.name)}
              className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors text-left"
            >
              <span className={`${sevColor} shrink-0`}>
                <CategoryIcon icon={cat.icon} />
              </span>
              <span className="flex-1 text-[13px] font-medium text-white">{cat.name}</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${sevBg} ${sevColor}`}>
                {cat.count}
              </span>
              <svg
                className={`w-4 h-4 text-white transition-transform ${isOpen ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isOpen && (
              <div className="border-t border-white/6 bg-[#0f0f12] p-4 space-y-1.5">
                {cat.items.map((rawItem, i) => {
                  const item = rawItem as Record<string, unknown>;
                  const str = (key: string) => item[key] != null ? String(item[key]) : "";
                  return (
                    <div key={i} className="bg-white/4 border border-white/4 rounded-[10px] px-3.5 py-2.5">
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
                        {item.page_url ? (
                          <span className="text-emerald-400 font-mono truncate">
                            {str("page_url").replace(/^https?:\/\//, "")}
                          </span>
                        ) : null}
                        {item.url ? (
                          <span className="text-rose-400 font-mono truncate">{str("url")}</span>
                        ) : null}
                        {item.status_code !== undefined && Number(item.status_code) > 0 ? (
                          <span className="text-white">
                            <span className="text-white/40">Status:</span> {str("status_code")}
                          </span>
                        ) : null}
                        {item.word_count !== undefined ? (
                          <span className="text-white">
                            <span className="text-white/40">Words:</span> {str("word_count")}
                          </span>
                        ) : null}
                        {item.value ? <span className="text-white">{str("value")}</span> : null}
                        {item.issue ? <span className="text-white">{str("issue")}</span> : null}
                        {item.description ? <span className="text-white">{str("description")}</span> : null}
                        {item.recommendation ? <span className="text-emerald-400">{str("recommendation")}</span> : null}
                        {item.metric ? (
                          <span className="text-white">
                            <span className="text-white/40">{str("metric")}:</span> {str("value")}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

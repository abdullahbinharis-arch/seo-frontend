"use client";

import { useState } from "react";
import { useDashboard } from "@/components/DashboardContext";
import {
  StatRow,
  StatBox,
  Card,
  DataTable,
  Tag,
  BtnPrimary,
  SectionHead,
  type Column,
} from "@/components/tool-ui";
import type { KeywordData, KeywordGroup, ManualKeywordResult } from "@/types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/* ── Difficulty helpers ──────────────────────────────────── */
function diffColor(d: number): string {
  if (d < 35) return "#10b981";
  if (d < 60) return "#f59e0b";
  return "#f43f5e";
}

function diffVariant(d: number): "low" | "med" | "high" {
  if (d < 35) return "low";
  if (d < 60) return "med";
  return "high";
}

function diffLabel(d: number): string {
  if (d < 35) return "Low";
  if (d < 60) return "Medium";
  return "High";
}

/* ── Intent tag variant ──────────────────────────────────── */
function intentVariant(intent: string): "high" | "med" | "low" | "info" {
  const il = intent.toLowerCase();
  if (il === "transactional" || il === "commercial") return "low"; // green = good for biz
  if (il === "informational") return "info";
  return "med";
}

/* ── Manual Search Result Card ───────────────────────────── */
function ResultCard({ result }: { result: ManualKeywordResult }) {
  return (
    <div className="bg-surface-2 border border-white/6 rounded-xl p-4 hover:border-white/10 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-[14px] font-semibold font-display text-white">
          {result.keyword}
        </h4>
        <Tag variant={intentVariant(result.intent)}>{result.intent}</Tag>
      </div>

      {/* Badges row */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-[11px] text-zinc-400">
          Vol: <span className="text-zinc-200 font-mono">{result.volume_estimate?.toLocaleString()}</span>
        </span>
        <span className="text-[11px] text-zinc-400">
          Diff:{" "}
          <span className="font-mono" style={{ color: diffColor(result.difficulty_estimate) }}>
            {result.difficulty_estimate}/100
          </span>
        </span>
        <Tag variant="info">{result.content_type}</Tag>
      </div>

      {/* SERP analysis */}
      <p className="text-[11px] text-zinc-500 leading-relaxed mb-2">
        <span className="text-zinc-400 font-medium">SERP:</span> {result.serp_analysis}
      </p>

      {/* Recommendation */}
      <p className="text-[11px] text-zinc-500 leading-relaxed mb-3">
        <span className="text-emerald-400 font-medium">Strategy:</span> {result.recommendation}
      </p>

      {/* Related keywords */}
      {result.related_keywords?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {result.related_keywords.map((rk) => (
            <span
              key={rk}
              className="text-[9px] bg-white/[0.04] border border-white/6 text-zinc-400 px-2 py-0.5 rounded-md"
            >
              {rk}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────── */
export function KeywordsToolView() {
  const { lastAudit } = useDashboard();
  const kd = lastAudit?.keyword_data as KeywordData | undefined;

  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchLocation, setSearchLocation] = useState(lastAudit?.location ?? "");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ManualKeywordResult[]>([]);
  const [searchError, setSearchError] = useState("");

  const keywords = kd?.keywords ?? [];
  const gaps = kd?.keyword_gaps ?? [];
  const groups = kd?.keyword_groups ?? [];
  const primaryKw = kd?.primary_keyword ?? "—";

  /* Avg difficulty */
  const avgDiff =
    keywords.length > 0
      ? Math.round(
          keywords.reduce((sum, kw) => sum + kw.difficulty, 0) / keywords.length
        )
      : 0;

  /* Manual keyword search */
  async function handleSearch() {
    if (!searchKeyword.trim()) return;
    setSearching(true);
    setSearchError("");
    try {
      const res = await fetch(`${API}/api/keyword-research`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: searchKeyword.trim(),
          location: searchLocation.trim(),
          business_type: lastAudit?.business_type ?? "local business",
        }),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data: ManualKeywordResult = await res.json();
      if (data.keyword) {
        setSearchResults((prev) => [data, ...prev]);
        setSearchKeyword("");
      }
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="animate-fadeIn space-y-5">
      {/* ── Manual Search Bar ──────────────────────────────── */}
      <Card title="Keyword Research" dotColor="#6366f1" meta="Manual search">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Research any keyword..."
            className="flex-1 bg-surface-1 border border-white/8 rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/40 transition-colors"
          />
          <input
            type="text"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Location (e.g. Toronto, Canada)"
            className="sm:w-56 bg-surface-1 border border-white/8 rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/40 transition-colors"
          />
          <BtnPrimary onClick={handleSearch} disabled={searching || !searchKeyword.trim()}>
            {searching ? "Searching..." : "Search"}
          </BtnPrimary>
        </div>

        {searchError && (
          <p className="text-[11px] text-rose-400 mt-2">{searchError}</p>
        )}

        {searchResults.length > 0 && (
          <div className="mt-4 space-y-3">
            {searchResults.map((r, i) => (
              <ResultCard key={`${r.keyword}-${i}`} result={r} />
            ))}
          </div>
        )}
      </Card>

      {/* ── From here on, only show when audit data exists ── */}
      {kd && (
        <>
          {/* ── Stat Row ────────────────────────────────────── */}
          <StatRow>
            <StatBox label="Primary Keyword" value={truncate(primaryKw, 22)} />
            <StatBox label="Keywords Tracked" value={keywords.length} />
            <StatBox label="Keyword Gaps" value={gaps.length} color="#f59e0b" />
            <StatBox
              label="Avg Difficulty"
              value={avgDiff}
              suffix="/100"
              color={diffColor(avgDiff)}
              progress={avgDiff}
              progressColor={diffColor(avgDiff)}
            />
          </StatRow>

          {/* ── Keywords by Service (grouped) ─────────────── */}
          {groups.length > 0 ? (
            <>
              <SectionHead
                title="Keywords by Service"
                subtitle={`${groups.length} service groups from your audit`}
              />
              {groups.map((group: KeywordGroup) => (
                <div key={group.service} className="mb-4">
                  <Card
                    title={group.service}
                    dotColor="#10b981"
                    meta={group.primary}
                  >
                    {group.keywords.length > 0 ? (
                      <DataTable
                        columns={KW_COLUMNS}
                        rows={group.keywords.map((kw) => ({
                          keyword: (
                            <span className="text-zinc-200 font-medium">
                              {kw.keyword}
                            </span>
                          ),
                          volume: (
                            <span className="font-mono text-[11px] text-zinc-400">
                              {kw.volume?.toLocaleString() ?? "—"}
                            </span>
                          ),
                          difficulty: (
                            <Tag variant={diffVariant(kw.difficulty)}>
                              {diffLabel(kw.difficulty)}
                            </Tag>
                          ),
                          intent: (
                            <Tag variant={intentVariant(kw.intent)}>
                              {kw.intent}
                            </Tag>
                          ),
                          action: (
                            <span className="text-[10px] text-emerald-400">
                              {kw.action}
                            </span>
                          ),
                        }))}
                      />
                    ) : (
                      <p className="text-[11px] text-zinc-600 py-3 text-center">
                        No keywords matched this service
                      </p>
                    )}
                  </Card>
                </div>
              ))}
            </>
          ) : (
            /* Fallback: flat table for older audits without groups */
            <Card
              title="Your Keywords"
              dotColor="#10b981"
              meta={`${keywords.length} tracked`}
            >
              <DataTable
                columns={KW_COLUMNS}
                highlightRow={keywords.findIndex((kw) => kw.is_primary)}
                rows={keywords.map((kw) => ({
                  keyword: (
                    <span className="text-zinc-200 font-medium">
                      {kw.keyword}
                    </span>
                  ),
                  volume: (
                    <span className="font-mono text-[11px] text-zinc-400">
                      {kw.volume?.toLocaleString() ?? "—"}
                    </span>
                  ),
                  difficulty: (
                    <Tag variant={diffVariant(kw.difficulty)}>
                      {diffLabel(kw.difficulty)}
                    </Tag>
                  ),
                  intent: (
                    <Tag variant={intentVariant(kw.intent)}>{kw.intent}</Tag>
                  ),
                  action: (
                    <span className="text-[10px] text-emerald-400">
                      {kw.action}
                    </span>
                  ),
                }))}
              />
            </Card>
          )}

          {/* ── Keyword Gap ──────────────────────────────────── */}
          {gaps.length > 0 && (
            <>
              <SectionHead
                title="Competitor Keyword Gap"
                subtitle={`${gaps.length} keywords your competitors rank for`}
              />
              <Card
                title="Keyword Gaps"
                dotColor="#f59e0b"
                meta={`${gaps.length} gaps`}
              >
                <DataTable
                  columns={GAP_COLUMNS}
                  rows={gaps.map((g) => ({
                    keyword: (
                      <span className="text-zinc-300">{g.keyword}</span>
                    ),
                    volume: (
                      <span className="font-mono text-[11px] text-zinc-400">
                        {g.volume?.toLocaleString() ?? "—"}
                      </span>
                    ),
                    difficulty: (
                      <Tag variant={diffVariant(g.difficulty)}>
                        {diffLabel(g.difficulty)}
                      </Tag>
                    ),
                    opportunity: (
                      <span className="text-[10px] text-amber-400">
                        {g.opportunity}
                      </span>
                    ),
                  }))}
                />
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}

/* ── Column definitions ──────────────────────────────────── */
const KW_COLUMNS: Column[] = [
  { key: "keyword", label: "Keyword" },
  { key: "volume", label: "Volume", align: "right" },
  { key: "difficulty", label: "Difficulty", align: "center" },
  { key: "intent", label: "Intent", align: "center" },
  { key: "action", label: "Action", align: "center" },
];

const GAP_COLUMNS: Column[] = [
  { key: "keyword", label: "Keyword" },
  { key: "volume", label: "Volume", align: "right" },
  { key: "difficulty", label: "Difficulty", align: "center" },
  { key: "opportunity", label: "Opportunity", align: "center" },
];

/* ── Utility ─────────────────────────────────────────────── */
function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max) + "..." : s;
}

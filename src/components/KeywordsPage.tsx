"use client";

import {
  StatRow,
  StatBox,
  Card,
  DataTable,
  Tag,
  type Column,
} from "@/components/tool-ui";
import type { KeywordResearchAgent, HighIntentKeyword } from "@/types";

/* ── Difficulty helpers ──────────────────────────────────── */
function diffColor(d: string): string {
  const dl = d.toLowerCase();
  if (dl === "low") return "#10b981";
  if (dl === "medium") return "#f59e0b";
  return "#f43f5e";
}

function diffVariant(d: string): "low" | "med" | "high" {
  const dl = d.toLowerCase();
  if (dl === "low") return "low";
  if (dl === "medium") return "med";
  return "high";
}

function diffToNumber(d: string): number {
  const dl = d.toLowerCase();
  if (dl === "low") return 25;
  if (dl === "medium") return 50;
  return 80;
}

/* ── Intent tag variant ──────────────────────────────────── */
function intentVariant(intent: string): "high" | "med" | "low" | "info" {
  const il = intent.toLowerCase();
  if (il === "transactional" || il === "commercial") return "low"; // green = good for biz
  if (il === "informational") return "info";
  return "med";
}

/* ── Main Component ──────────────────────────────────────── */
export function KeywordsToolView({ data }: { data: KeywordResearchAgent }) {
  const recs = data.recommendations;
  const keywords = recs.high_intent_keywords ?? [];
  const gaps = recs.competitor_keywords_we_miss ?? [];
  const clusters = recs.keyword_clusters ?? [];
  const primaryKw = recs.primary_keyword ?? data.keyword ?? "—";

  /* Avg difficulty */
  const avgDiff =
    keywords.length > 0
      ? Math.round(
          keywords.reduce((sum, kw) => sum + diffToNumber(kw.difficulty), 0) /
            keywords.length
        )
      : 0;

  /* Primary keyword row index for highlighting */
  const primaryIdx = keywords.findIndex(
    (kw) => kw.keyword.toLowerCase() === primaryKw.toLowerCase()
  );

  return (
    <div className="animate-fadeIn">
      {/* ── Stat Row ────────────────────────────────────── */}
      <StatRow>
        <StatBox label="Primary Keyword" value={truncate(primaryKw, 22)} />
        <StatBox label="Keywords Tracked" value={keywords.length} />
        <StatBox label="Keyword Gaps" value={gaps.length} color="#f59e0b" />
        <StatBox
          label="Avg Difficulty"
          value={avgDiff}
          suffix="/100"
          color={diffColor(avgDiff >= 60 ? "high" : avgDiff >= 35 ? "medium" : "low")}
          progress={avgDiff}
          progressColor={diffColor(avgDiff >= 60 ? "high" : avgDiff >= 35 ? "medium" : "low")}
        />
      </StatRow>

      {/* ── Keywords Table ──────────────────────────────── */}
      <Card title="Your Keywords" dotColor="#10b981" meta={`${keywords.length} tracked`}>
        <DataTable
          columns={KW_COLUMNS}
          highlightRow={primaryIdx >= 0 ? primaryIdx : undefined}
          rows={keywords.map((kw) => ({
            keyword: <span className="text-zinc-200 font-medium">{kw.keyword}</span>,
            volume: (
              <span className="font-mono text-[11px] text-zinc-400">
                {kw.estimated_monthly_searches?.toLocaleString() ?? "—"}
              </span>
            ),
            difficulty: (
              <Tag variant={diffVariant(kw.difficulty)}>{kw.difficulty}</Tag>
            ),
            intent: (
              <Tag variant={intentVariant(kw.intent)}>{kw.intent}</Tag>
            ),
          }))}
        />
      </Card>

      {/* ── Competitor Gap ──────────────────────────────── */}
      {gaps.length > 0 && (
        <div className="mt-4">
          <Card title="Competitor Keyword Gap" dotColor="#f59e0b" meta={`${gaps.length} gaps`}>
            <DataTable
              columns={GAP_COLUMNS}
              rows={gaps.map((kw) => ({
                keyword: <span className="text-zinc-300">{kw}</span>,
                opportunity: <Tag variant="med">Gap</Tag>,
              }))}
            />
          </Card>
        </div>
      )}

      {/* ── Keyword Clusters ────────────────────────────── */}
      {clusters.length > 0 && (
        <div className="mt-4">
          <Card title="Keyword Clusters" dotColor="#8b5cf6">
            <div className="space-y-4">
              {clusters.map((cluster, i) => (
                <div key={i}>
                  <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    {cluster.theme}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {cluster.keywords.map((kw, j) => (
                      <span
                        key={j}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-white/[0.04] text-zinc-400 border border-white/6"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
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
];

const GAP_COLUMNS: Column[] = [
  { key: "keyword", label: "Keyword" },
  { key: "opportunity", label: "Opportunity", align: "center" },
];

/* ── Utility ─────────────────────────────────────────────── */
function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max) + "…" : s;
}

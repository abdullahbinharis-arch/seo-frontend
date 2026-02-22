"use client";

import { useDashboard } from "@/components/DashboardContext";
import {
  StatRow,
  StatBox,
  Card,
  DataTable,
  Tag,
  type Column,
} from "@/components/tool-ui";
import type { KeywordData } from "@/types";

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

/* ── Main Component ──────────────────────────────────────── */
export function KeywordsToolView() {
  const { lastAudit } = useDashboard();
  const kd = lastAudit?.keyword_data as KeywordData | undefined;

  if (!kd) return null;

  const keywords = kd.keywords ?? [];
  const gaps = kd.keyword_gaps ?? [];
  const primaryKw = kd.primary_keyword ?? "—";

  /* Avg difficulty */
  const avgDiff =
    keywords.length > 0
      ? Math.round(
          keywords.reduce((sum, kw) => sum + kw.difficulty, 0) / keywords.length
        )
      : 0;

  /* Primary keyword row index for highlighting */
  const primaryIdx = keywords.findIndex((kw) => kw.is_primary);

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
          color={diffColor(avgDiff)}
          progress={avgDiff}
          progressColor={diffColor(avgDiff)}
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
                {kw.volume?.toLocaleString() ?? "—"}
              </span>
            ),
            difficulty: (
              <Tag variant={diffVariant(kw.difficulty)}>{diffLabel(kw.difficulty)}</Tag>
            ),
            intent: (
              <Tag variant={intentVariant(kw.intent)}>{kw.intent}</Tag>
            ),
            action: (
              <span className="text-[10px] text-emerald-400">{kw.action}</span>
            ),
          }))}
        />
      </Card>

      {/* ── Keyword Gap ──────────────────────────────────── */}
      {gaps.length > 0 && (
        <div className="mt-4">
          <Card title="Competitor Keyword Gap" dotColor="#f59e0b" meta={`${gaps.length} gaps`}>
            <DataTable
              columns={GAP_COLUMNS}
              rows={gaps.map((g) => ({
                keyword: <span className="text-zinc-300">{g.keyword}</span>,
                volume: (
                  <span className="font-mono text-[11px] text-zinc-400">
                    {g.volume?.toLocaleString() ?? "—"}
                  </span>
                ),
                difficulty: (
                  <Tag variant={diffVariant(g.difficulty)}>{diffLabel(g.difficulty)}</Tag>
                ),
                opportunity: (
                  <span className="text-[10px] text-amber-400">{g.opportunity}</span>
                ),
              }))}
            />
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
  return s.length > max ? s.slice(0, max) + "…" : s;
}

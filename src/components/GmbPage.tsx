"use client";

import { useDashboard } from "@/components/DashboardContext";
import {
  StatRow,
  StatBox,
  Card,
  DataTable,
  Tag,
  CheckItem,
  EmptyState,
  type Column,
} from "@/components/tool-ui";
import type {
  GbpAuditAgent,
  CitationBuilderAgent,
  CitationRecommendation,
} from "@/types";

/* ── Helper: score color ─────────────────────────────────── */
function scoreColor(score: number) {
  if (score >= 70) return "#10b981";
  if (score >= 40) return "#f59e0b";
  return "#f43f5e";
}

/* ── Main Component ──────────────────────────────────────── */
export function GmbToolView({ data }: { data: GbpAuditAgent }) {
  const { agentCache } = useDashboard();
  const citationData = agentCache.citation_builder as CitationBuilderAgent | undefined;

  const a = data.analysis;

  /* Stat values */
  const gbpScore = a.gbp_score ?? 0;

  // Parse review count from current_visibility e.g. "12 reviews on Google"
  const reviewMatch = a.review_strategy?.current_visibility?.match(/(\d+)/);
  const reviewCount = reviewMatch ? reviewMatch[1] : "—";

  // Citation count from citation builder
  const tier1 = citationData?.plan?.summary?.tier_1_count ?? 0;
  const tier2 = citationData?.plan?.summary?.tier_2_count ?? 0;
  const tier3 = citationData?.plan?.summary?.tier_3_count ?? 0;
  const citationsFound = citationData ? tier1 + tier2 + tier3 : null;
  const citationsTotal = citationData?.plan?.summary?.total_recommended ?? 20;

  // Photos from completeness audit
  const photoItem = a.completeness_audit?.photos ?? a.completeness_audit?.Photos;
  const photoStatus = photoItem?.status === "pass" ? "Added" : "Missing";

  /* Completeness audit checklist */
  const auditEntries = Object.entries(a.completeness_audit ?? {});
  const passCount = auditEntries.filter(([, v]) => v.status === "pass").length;

  /* Citation table rows */
  const citationRows = buildCitationRows(citationData);

  return (
    <div className="animate-fadeIn">
      {/* ── Stat Row ────────────────────────────────────── */}
      <StatRow>
        <StatBox
          label="GBP Score"
          value={gbpScore}
          suffix="/100"
          color={scoreColor(gbpScore)}
          progress={gbpScore}
          progressColor={scoreColor(gbpScore)}
        />
        <StatBox
          label="Reviews"
          value={reviewCount}
          note={a.review_strategy?.recommended_target ?? ""}
        />
        <StatBox
          label="Citations Found"
          value={citationsFound ?? "—"}
          suffix={citationsFound !== null ? `/${citationsTotal}` : undefined}
          progress={citationsFound !== null ? (citationsFound / citationsTotal) * 100 : undefined}
          progressColor="#f59e0b"
        />
        <StatBox
          label="Photos"
          value={photoStatus}
          color={photoStatus === "Added" ? "#10b981" : "#f59e0b"}
        />
      </StatRow>

      {/* ── Two-column layout ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="space-y-4">
          {/* NAP Consistency */}
          <Card title="NAP Consistency" dotColor={a.nap_consistency?.consistent ? "#10b981" : "#f43f5e"}>
            <div className="bg-surface-1 border border-white/6 rounded-xl p-4 space-y-2.5">
              <NapRow label="Name" value={a.nap_consistency?.name_on_website} />
              <NapRow label="Address" value={a.nap_consistency?.address_on_website} />
              <NapRow label="Phone" value={a.nap_consistency?.phone_on_website} />
              <NapRow
                label="Category"
                value={
                  a.completeness_audit?.primary_category?.note ??
                  a.completeness_audit?.["Primary Category"]?.note ??
                  "—"
                }
              />
            </div>
            {a.nap_consistency?.issues?.length > 0 && (
              <div className="mt-3 space-y-1">
                {a.nap_consistency.issues.map((issue: string, i: number) => (
                  <p key={i} className="text-[11px] text-rose-400">• {issue}</p>
                ))}
              </div>
            )}
          </Card>

          {/* Profile Completeness */}
          <Card
            title="Profile Completeness"
            meta={`${passCount}/${auditEntries.length} complete`}
          >
            <div>
              {auditEntries.map(([key, item]) => (
                <CheckItem
                  key={key}
                  done={item.status === "pass"}
                  label={formatKey(key)}
                  tag={
                    item.status === "warn"
                      ? { variant: "med", text: "Needs work" }
                      : item.status === "fail"
                      ? { variant: "high", text: "Missing" }
                      : undefined
                  }
                  muted={item.status === "unknown"}
                />
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Citation Directories */}
          <Card
            title="Citation Directories"
            dotColor="#3b82f6"
            meta={citationsFound !== null ? `${citationsFound} found` : undefined}
          >
            {citationRows.length > 0 ? (
              <DataTable
                columns={CITATION_COLUMNS}
                rows={citationRows}
              />
            ) : (
              <EmptyState message="Run Citation Builder for detailed directory data" />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ── NAP Row ─────────────────────────────────────────────── */
function NapRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-[11px] text-zinc-500 w-[70px] shrink-0">{label}</span>
      <span className="text-[12px] text-zinc-300">{value || "—"}</span>
    </div>
  );
}

/* ── Citation table helpers ──────────────────────────────── */
const CITATION_COLUMNS: Column[] = [
  { key: "directory", label: "Directory" },
  { key: "da", label: "DA", mono: true, align: "center" },
  { key: "status", label: "Status", align: "center" },
  { key: "tier", label: "Tier" },
];

function buildCitationRows(citationData?: CitationBuilderAgent) {
  if (!citationData?.plan?.recommendations) return [];

  const recs = citationData.plan.recommendations;
  const rows: Record<string, React.ReactNode>[] = [];

  const addTier = (items: CitationRecommendation[], tier: string) => {
    for (const item of items ?? []) {
      rows.push({
        directory: <span className="text-zinc-300">{item.name}</span>,
        da: item.da,
        status: (
          <Tag variant={item.status === "found" || item.status === "listed" ? "found" : "missing"}>
            {item.status === "found" || item.status === "listed" ? "Found" : "Missing"}
          </Tag>
        ),
        tier: <Tag variant="info">{tier}</Tag>,
      });
    }
  };

  addTier(recs.tier_1_critical, "Tier 1");
  addTier(recs.tier_2_important, "Tier 2");
  addTier(recs.tier_3_supplemental, "Tier 3");

  return rows;
}

/* ── Utility ─────────────────────────────────────────────── */
function formatKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

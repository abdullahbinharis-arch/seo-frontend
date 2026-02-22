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
import type { GmbData } from "@/types";

/* ── Helper: score color ─────────────────────────────────── */
function scoreColor(score: number) {
  if (score >= 70) return "#10b981";
  if (score >= 40) return "#f59e0b";
  return "#f43f5e";
}

/* ── Main Component ──────────────────────────────────────── */
export function GmbToolView() {
  const { lastAudit } = useDashboard();
  const gmb = lastAudit?.gmb_data as GmbData | undefined;

  if (!gmb) return null;

  const gbpScore = gmb.gbp_score ?? 0;
  const reviewCount = gmb.review_count ?? 0;
  const citationsFound = gmb.citations?.length ?? 0;
  const photoStatus = gmb.photos_count > 0 ? "Added" : "Missing";

  const passCount = gmb.checklist?.filter((c) => c.done).length ?? 0;
  const totalCount = gmb.checklist?.length ?? 0;

  /* Citation table rows */
  const citationRows = (gmb.citations ?? []).map((c) => ({
    directory: <span className="text-zinc-300">{c.directory}</span>,
    da: c.da,
    status: (
      <Tag variant={c.status === "found" || c.status === "listed" ? "found" : "missing"}>
        {c.status === "found" || c.status === "listed" ? "Found" : "Missing"}
      </Tag>
    ),
    tier: <Tag variant="info">{c.tier}</Tag>,
  }));

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
          note={gmb.avg_rating ? `${gmb.avg_rating}★ avg` : ""}
        />
        <StatBox
          label="Citations Found"
          value={citationsFound}
          suffix="/20"
          progress={(citationsFound / 20) * 100}
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
          <Card title="NAP Consistency" dotColor="#10b981">
            <div className="bg-surface-1 border border-white/6 rounded-xl p-4 space-y-2.5">
              <NapRow label="Name" value={gmb.nap?.name} />
              <NapRow label="Address" value={gmb.nap?.address} />
              <NapRow label="Phone" value={gmb.nap?.phone} />
              <NapRow label="Website" value={gmb.nap?.website} />
              <NapRow label="Category" value={gmb.nap?.category} />
              {gmb.nap?.category_optimal && gmb.nap.category_optimal !== gmb.nap?.category && (
                <NapRow label="Suggested" value={gmb.nap.category_optimal} />
              )}
            </div>
          </Card>

          {/* Profile Completeness */}
          <Card
            title="Profile Completeness"
            meta={`${passCount}/${totalCount} complete`}
          >
            <div>
              {(gmb.checklist ?? []).map((item, i) => (
                <CheckItem
                  key={i}
                  done={item.done}
                  label={item.item}
                  tag={
                    !item.done
                      ? { variant: "high", text: "Missing" }
                      : undefined
                  }
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
            meta={`${citationsFound} found`}
          >
            {citationRows.length > 0 ? (
              <DataTable
                columns={CITATION_COLUMNS}
                rows={citationRows}
              />
            ) : (
              <EmptyState message="No citation data available yet" />
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

/* ── Citation table columns ──────────────────────────────── */
const CITATION_COLUMNS: Column[] = [
  { key: "directory", label: "Directory" },
  { key: "da", label: "DA", mono: true, align: "center" },
  { key: "status", label: "Status", align: "center" },
  { key: "tier", label: "Tier" },
];

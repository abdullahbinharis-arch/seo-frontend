"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useDashboard } from "@/components/DashboardContext";
import { CategorySelect } from "@/components/dashboard/CategorySelect";
import { ServiceTagInput } from "@/components/dashboard/ServiceTagInput";
import { COUNTRY_CITIES } from "@/data/countryCities";
import type { Profile, AuditVersionMeta, AuditComparison, ScoreChange } from "@/types";

// ── Helpers ──────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 70) return "#6ee7b7";
  if (score >= 40) return "#fbbf24";
  return "#fb7185";
}

function changeColor(change: number): string {
  if (change > 0) return "#6ee7b7";
  if (change < 0) return "#fb7185";
  return "#71717a";
}

function changeArrow(change: number): string {
  if (change > 0) return "+";
  return "";
}

function MiniScoreRing({ score, size = 36 }: { score: number; size?: number }) {
  const r = 42;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const color = scoreColor(score);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-display font-bold" style={{ color, fontSize: size < 40 ? 11 : 14 }}>
        {score}
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
}

const inputClass = "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-emerald-500/30 transition-colors";

// ── Comparison View ──────────────────────────────────────────────────

function ScoreCompareRow({ label, data }: { label: string; data: ScoreChange }) {
  const color = changeColor(data.change);
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/[0.03] last:border-0">
      <span className="text-[12px] text-zinc-400 capitalize">{label.replace(/_/g, " ")}</span>
      <div className="flex items-center gap-3">
        <span className="text-[12px] text-zinc-500 font-mono">{data.v1}</span>
        <svg className="w-3 h-3 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
        <span className="text-[12px] font-mono font-semibold" style={{ color: scoreColor(data.v2) }}>{data.v2}</span>
        <span className="text-[11px] font-mono font-medium min-w-[40px] text-right" style={{ color }}>
          {changeArrow(data.change)}{data.change}
        </span>
      </div>
    </div>
  );
}

function ComparisonView({
  comparison,
  onClose,
}: {
  comparison: AuditComparison;
  onClose: () => void;
}) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-display font-semibold text-white">Version Comparison</span>
          <span className="text-[11px] text-zinc-500">
            v{comparison.v1.version} vs v{comparison.v2.version}
          </span>
        </div>
        <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* Overall score hero */}
        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">
              v{comparison.v1.version} · {formatDate(comparison.v1.created_at)}
            </div>
            <MiniScoreRing score={comparison.score_changes.overall.v1} size={56} />
          </div>
          <div className="flex flex-col items-center gap-1">
            <svg className="w-5 h-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <span
              className="text-sm font-display font-bold"
              style={{ color: changeColor(comparison.score_changes.overall.change) }}
            >
              {changeArrow(comparison.score_changes.overall.change)}{comparison.score_changes.overall.change}
            </span>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">
              v{comparison.v2.version} · {formatDate(comparison.v2.created_at)}
            </div>
            <MiniScoreRing score={comparison.score_changes.overall.v2} size={56} />
          </div>
        </div>

        {/* Score breakdown */}
        <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4">
          <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Score Breakdown</div>
          {(["website_seo", "backlinks", "local_seo", "ai_seo"] as const).map((key) => (
            <ScoreCompareRow key={key} label={key} data={comparison.score_changes[key]} />
          ))}
        </div>

        {/* Issues */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {comparison.issues_fixed.length > 0 && (
            <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  Issues Fixed ({comparison.issues_fixed.length})
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                {comparison.issues_fixed.map((issue, i) => (
                  <span key={i} className="text-[11px] text-emerald-400/80 leading-relaxed">{issue}</span>
                ))}
              </div>
            </div>
          )}
          {comparison.new_issues.length > 0 && (
            <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  New Issues ({comparison.new_issues.length})
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                {comparison.new_issues.map((issue, i) => (
                  <span key={i} className="text-[11px] text-rose-400/80 leading-relaxed">{issue}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Keywords */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {comparison.new_keywords.length > 0 && (
            <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4">
              <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                New Keywords ({comparison.new_keywords.length})
              </div>
              <div className="flex flex-wrap gap-1">
                {comparison.new_keywords.map((kw) => (
                  <span key={kw} className="text-[10px] px-2 py-[3px] rounded-md bg-emerald-500/10 text-emerald-400 font-medium">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
          {comparison.lost_keywords.length > 0 && (
            <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4">
              <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                Lost Keywords ({comparison.lost_keywords.length})
              </div>
              <div className="flex flex-wrap gap-1">
                {comparison.lost_keywords.map((kw) => (
                  <span key={kw} className="text-[10px] px-2 py-[3px] rounded-md bg-rose-500/10 text-rose-400 font-medium">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {comparison.issues_fixed.length === 0 && comparison.new_issues.length === 0 &&
         comparison.new_keywords.length === 0 && comparison.lost_keywords.length === 0 && (
          <div className="text-center py-4 text-[12px] text-zinc-500">
            No changes in issues or keywords between these versions.
          </div>
        )}
      </div>
    </div>
  );
}

// ── Profile Card ────────────────────────────────────────────────────

function ProfileCard({
  profile,
  isActive,
  onSwitch,
  onDelete,
  onUpdate,
  onCompare,
}: {
  profile: Profile;
  isActive: boolean;
  onSwitch: () => void;
  onDelete: () => void;
  onUpdate: (data: Partial<Profile>) => Promise<void>;
  onCompare: (profileId: string, versions: AuditVersionMeta[]) => void;
}) {
  const { data: session } = useSession();
  const { loadAuditById } = useDashboard();
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [versions, setVersions] = useState<AuditVersionMeta[]>([]);
  const [versionsLoaded, setVersionsLoaded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState(profile.business_name);
  const [editUrl, setEditUrl] = useState(profile.website_url);
  const [editCategory, setEditCategory] = useState(profile.business_category ?? "");
  const [editServices, setEditServices] = useState<string[]>(profile.services ?? []);
  const [editCountry, setEditCountry] = useState(profile.country ?? "");
  const [editCity, setEditCity] = useState(profile.city ?? "");

  const domain = profile.website_url.replace(/^https?:\/\//, "").replace(/\/$/, "");

  const availableCities = useMemo(() => {
    const entry = COUNTRY_CITIES.find((c) => c.name === editCountry);
    return entry?.cities ?? [];
  }, [editCountry]);

  const loadVersions = useCallback(async () => {
    const token = session?.accessToken as string | undefined;
    if (!token || versionsLoaded) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
      const res = await fetch(`${apiUrl}/profiles/${profile.id}/audits`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: AuditVersionMeta[] = await res.json();
        setVersions(data);
      }
    } catch { /* ignore */ }
    setVersionsLoaded(true);
  }, [session?.accessToken, profile.id, versionsLoaded]);

  function toggleVersions() {
    if (!showVersions) loadVersions();
    setShowVersions(!showVersions);
  }

  async function handleSave() {
    setSaving(true);
    await onUpdate({
      business_name: editName.trim(),
      website_url: editUrl.trim(),
      business_category: editCategory || null,
      services: editServices,
      country: editCountry || null,
      city: editCity || null,
    });
    setSaving(false);
    setEditing(false);
  }

  function handleCancelEdit() {
    setEditName(profile.business_name);
    setEditUrl(profile.website_url);
    setEditCategory(profile.business_category ?? "");
    setEditServices(profile.services ?? []);
    setEditCountry(profile.country ?? "");
    setEditCity(profile.city ?? "");
    setEditing(false);
  }

  async function handleVersionClick(auditId: string) {
    const token = session?.accessToken as string | undefined;
    if (!token) return;
    await loadAuditById(profile.id, auditId, token);
    router.push("/dashboard/overview");
  }

  const latestScore = profile.latest_audit?.overall_score;

  return (
    <div className={`bg-white/[0.03] border rounded-2xl overflow-hidden transition-all ${
      isActive ? "border-emerald-500/20" : "border-white/[0.06]"
    }`}>
      {/* Main content */}
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-display font-semibold text-[16px] text-white truncate">
                {profile.business_name}
              </h3>
              {isActive && (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 truncate">{domain}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0 ml-3">
            {latestScore != null && latestScore > 0 && (
              <MiniScoreRing score={latestScore} />
            )}
            {profile.audit_count != null && profile.audit_count > 0 && (
              <div className="text-right">
                <div className="text-[10px] text-zinc-600">
                  {profile.audit_count} audit{profile.audit_count !== 1 ? "s" : ""}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {profile.business_category && (
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/[0.04] text-zinc-400">
              {profile.business_category}
            </span>
          )}
          {profile.city && profile.country && (
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/[0.04] text-zinc-400">
              {profile.city}, {profile.country}
            </span>
          )}
        </div>

        {/* Services */}
        {profile.services && profile.services.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {profile.services.slice(0, 3).map((s) => (
              <span key={s} className="text-[10px] px-2 py-[3px] rounded-md bg-emerald-500/8 text-emerald-400 font-medium">
                {s}
              </span>
            ))}
            {profile.services.length > 3 && (
              <span className="text-[10px] px-2 py-[3px] rounded-md bg-white/[0.04] text-zinc-500 font-medium">
                +{profile.services.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Last audit info */}
        {profile.latest_audit && (
          <div className="flex items-center gap-2 text-[11px] text-zinc-500 mb-3">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Last audit: {formatDate(profile.latest_audit.created_at)} · v{profile.latest_audit.version}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
          {!isActive && (
            <button
              onClick={onSwitch}
              className="flex-1 px-3 py-2 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all"
            >
              Switch
            </button>
          )}
          <button
            onClick={() => setEditing(!editing)}
            className="flex-1 px-3 py-2 rounded-lg text-xs font-medium bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] hover:text-zinc-200 transition-all"
          >
            {editing ? "Cancel" : "Edit"}
          </button>
          <button
            onClick={toggleVersions}
            className="flex-1 px-3 py-2 rounded-lg text-xs font-medium bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] hover:text-zinc-200 transition-all"
          >
            {showVersions ? "Hide History" : "History"}
          </button>
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="px-3 py-2 rounded-lg text-xs font-medium bg-white/[0.04] text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-all"
            >
              Delete
            </button>
          ) : (
            <div className="flex gap-1">
              <button
                onClick={onDelete}
                className="px-3 py-2 rounded-lg text-xs font-medium bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-all"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-2 py-2 rounded-lg text-xs text-zinc-500 hover:text-zinc-300 transition-all"
              >
                No
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Inline edit form */}
      {editing && (
        <div className="border-t border-white/[0.06] bg-white/[0.02] p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 block">Business Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 block">Website URL</label>
              <input
                type="url"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 block">Category</label>
              <CategorySelect
                value={editCategory}
                onChange={setEditCategory}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 block">Services</label>
              <ServiceTagInput
                tags={editServices}
                onChange={setEditServices}
                placeholder="Type a service + Enter"
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 block">Country</label>
              <div className="relative">
                <select
                  value={editCountry}
                  onChange={(e) => { setEditCountry(e.target.value); setEditCity(""); }}
                  className={`${inputClass} appearance-none pr-8`}
                >
                  <option value="">Select country</option>
                  {COUNTRY_CITIES.map((c) => (
                    <option key={c.code} value={c.name} style={{ background: "#18181b" }}>{c.name}</option>
                  ))}
                </select>
                <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 block">City</label>
              <div className="relative">
                <select
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  disabled={!editCountry}
                  className={`${inputClass} appearance-none pr-8 disabled:opacity-50`}
                >
                  <option value="">{editCountry ? "Select city" : "Select country first"}</option>
                  {availableCities.map((c) => (
                    <option key={c} value={c} style={{ background: "#18181b" }}>{c}</option>
                  ))}
                </select>
                <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={handleCancelEdit}
              className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !editName.trim() || !editUrl.trim()}
              className="px-5 py-2 rounded-lg text-xs font-medium bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-all disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {/* Version history */}
      {showVersions && (
        <div className="border-t border-white/[0.06] bg-white/[0.02] p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Audit History
            </div>
            {versionsLoaded && versions.length >= 2 && (
              <button
                onClick={() => onCompare(profile.id, versions)}
                className="text-[10px] font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Compare Versions
              </button>
            )}
          </div>
          {!versionsLoaded ? (
            <div className="flex items-center gap-2 text-xs text-zinc-500 py-3">
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading versions...
            </div>
          ) : versions.length === 0 ? (
            <div className="text-xs text-zinc-500 py-3">No audits yet for this profile.</div>
          ) : (
            <div className="flex flex-col gap-1">
              {versions.map((v, i) => (
                <button
                  key={v.id}
                  onClick={() => handleVersionClick(v.id)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/4 transition-all text-left w-full"
                >
                  <span className="text-xs font-mono font-semibold text-zinc-400 w-8 shrink-0">
                    v{v.version}
                  </span>
                  {v.overall_score != null && v.overall_score > 0 ? (
                    <span
                      className="text-[11px] font-mono font-semibold w-8 shrink-0"
                      style={{ color: scoreColor(v.overall_score) }}
                    >
                      {v.overall_score}
                    </span>
                  ) : (
                    <span className="w-8 shrink-0" />
                  )}
                  <span className="text-xs text-zinc-500 flex-1">
                    {formatDate(v.created_at)}
                    {i === 0 && <span className="text-emerald-500/60 ml-1">(latest)</span>}
                  </span>
                  {v.execution_time && (
                    <span className="text-[10px] text-zinc-600">
                      {Math.round(v.execution_time)}s
                    </span>
                  )}
                  <svg className="w-3 h-3 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Compare Version Picker ──────────────────────────────────────────

function ComparePickerModal({
  profileId,
  versions,
  onCompare,
  onClose,
}: {
  profileId: string;
  versions: AuditVersionMeta[];
  onCompare: (profileId: string, v1Id: string, v2Id: string) => void;
  onClose: () => void;
}) {
  const [v1, setV1] = useState(versions.length >= 2 ? versions[1].id : "");
  const [v2, setV2] = useState(versions.length >= 1 ? versions[0].id : "");

  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[13px] font-display font-semibold text-white">Select Versions to Compare</span>
        <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 block">Older Version</label>
          <select
            value={v1}
            onChange={(e) => setV1(e.target.value)}
            className={`${inputClass} appearance-none`}
          >
            {versions.map((v) => (
              <option key={v.id} value={v.id} style={{ background: "#18181b" }}>
                v{v.version} — {formatDate(v.created_at)}{v.overall_score != null ? ` (Score: ${v.overall_score})` : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 block">Newer Version</label>
          <select
            value={v2}
            onChange={(e) => setV2(e.target.value)}
            className={`${inputClass} appearance-none`}
          >
            {versions.map((v) => (
              <option key={v.id} value={v.id} style={{ background: "#18181b" }}>
                v{v.version} — {formatDate(v.created_at)}{v.overall_score != null ? ` (Score: ${v.overall_score})` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors">
          Cancel
        </button>
        <button
          onClick={() => { if (v1 && v2 && v1 !== v2) onCompare(profileId, v1, v2); }}
          disabled={!v1 || !v2 || v1 === v2}
          className="px-5 py-2 rounded-lg text-xs font-medium bg-gradient-to-br from-emerald-600 to-emerald-500 text-white hover:-translate-y-px hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
        >
          Compare
        </button>
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────

export default function ProfileManagerPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const {
    profiles,
    fetchProfiles,
    profilesLoading,
    activeProfileId,
    switchProfile,
    setActiveProfileId,
  } = useDashboard();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  // Comparison state
  const [comparePicker, setComparePicker] = useState<{ profileId: string; versions: AuditVersionMeta[] } | null>(null);
  const [comparison, setComparison] = useState<AuditComparison | null>(null);
  const [comparing, setComparing] = useState(false);

  // Fetch profiles on mount
  useEffect(() => {
    const token = session?.accessToken as string | undefined;
    if (token) fetchProfiles(token);
  }, [session?.accessToken, fetchProfiles]);

  async function handleSwitch(profileId: string) {
    const token = session?.accessToken as string | undefined;
    if (!token) return;
    await switchProfile(profileId, token);
    router.push("/dashboard/overview");
  }

  async function handleDelete(profileId: string) {
    const token = session?.accessToken as string | undefined;
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/profiles/${profileId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        if (activeProfileId === profileId) {
          setActiveProfileId(null);
        }
        await fetchProfiles(token);
      }
    } catch { /* ignore */ }
  }

  async function handleUpdate(profileId: string, data: Partial<Profile>) {
    const token = session?.accessToken as string | undefined;
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/profiles/${profileId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await fetchProfiles(token);
      }
    } catch { /* ignore */ }
  }

  function handleOpenCompare(profileId: string, versions: AuditVersionMeta[]) {
    setComparison(null);
    setComparePicker({ profileId, versions });
  }

  async function handleCompare(profileId: string, v1Id: string, v2Id: string) {
    const token = session?.accessToken as string | undefined;
    if (!token) return;
    setComparing(true);
    try {
      const res = await fetch(
        `${apiUrl}/profiles/${profileId}/compare?v1=${encodeURIComponent(v1Id)}&v2=${encodeURIComponent(v2Id)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.ok) {
        const data: AuditComparison = await res.json();
        setComparison(data);
        setComparePicker(null);
      }
    } catch { /* ignore */ }
    setComparing(false);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-semibold text-xl text-white mb-1">Profile Manager</h1>
          <p className="text-xs text-zinc-500">
            Manage your business profiles, view audit history, and compare versions.
            {profiles.length > 0 && ` ${profiles.length} profile${profiles.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link
          href="/dashboard/audit"
          className="flex items-center gap-2 px-4 py-[9px] rounded-xl text-xs font-medium bg-gradient-to-br from-emerald-600 to-emerald-500 text-white hover:-translate-y-px hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Profile
        </Link>
      </div>

      {/* Comparison view */}
      {comparison && (
        <ComparisonView comparison={comparison} onClose={() => setComparison(null)} />
      )}

      {/* Compare picker */}
      {comparePicker && !comparison && (
        <ComparePickerModal
          profileId={comparePicker.profileId}
          versions={comparePicker.versions}
          onCompare={handleCompare}
          onClose={() => setComparePicker(null)}
        />
      )}

      {/* Comparing loading */}
      {comparing && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3 text-zinc-500">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-xs">Comparing versions...</span>
          </div>
        </div>
      )}

      {/* Loading */}
      {profilesLoading && profiles.length === 0 && (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-zinc-500">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading profiles...
          </div>
        </div>
      )}

      {/* Empty state */}
      {!profilesLoading && profiles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h3 className="font-display font-semibold text-white mb-1">No profiles yet</h3>
          <p className="text-xs text-zinc-500 mb-5">Run your first audit to create a business profile.</p>
          <Link
            href="/dashboard/audit"
            className="flex items-center gap-2 px-5 py-[9px] rounded-xl text-xs font-medium bg-gradient-to-br from-emerald-600 to-emerald-500 text-white hover:-translate-y-px hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            Run Your First Audit
          </Link>
        </div>
      )}

      {/* Profile grid */}
      {profiles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              isActive={profile.id === activeProfileId}
              onSwitch={() => handleSwitch(profile.id)}
              onDelete={() => handleDelete(profile.id)}
              onUpdate={(data) => handleUpdate(profile.id, data)}
              onCompare={handleOpenCompare}
            />
          ))}
        </div>
      )}
    </div>
  );
}

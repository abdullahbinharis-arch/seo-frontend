"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useDashboard } from "@/components/DashboardContext";

export function VersionSelector() {
  const { data: session } = useSession();
  const {
    auditVersions,
    versionsLoading,
    activeProfileId,
    loadAuditById,
    lastAudit,
  } = useDashboard();

  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (auditVersions.length === 0 && !versionsLoading) return null;

  const currentAuditId = lastAudit?.audit_id;
  const latestVersion = auditVersions.length > 0 ? Math.max(...auditVersions.map((v) => v.version)) : 0;
  const currentVersion = auditVersions.find((v) => v.id === currentAuditId);
  const isLatest = currentVersion?.version === latestVersion;

  async function handleSelect(auditId: string) {
    const token = session?.accessToken as string | undefined;
    if (!token || !activeProfileId || auditId === currentAuditId) {
      setOpen(false);
      return;
    }
    setSwitching(true);
    setOpen(false);
    await loadAuditById(activeProfileId, auditId, token);
    setSwitching(false);
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("en-CA", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <div className="relative" ref={ref}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        disabled={versionsLoading || switching}
        className="flex items-center gap-1.5 px-3 py-[6px] rounded-lg bg-white/5 border border-white/10 text-xs text-zinc-300 hover:border-white/20 hover:text-white transition-all disabled:opacity-50"
      >
        {switching ? (
          <svg className="w-3 h-3 animate-spin text-emerald-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : versionsLoading ? (
          <svg className="w-3 h-3 animate-spin text-zinc-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="w-3 h-3 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        <span className="font-mono">
          v{currentVersion?.version ?? latestVersion}
        </span>
        {isLatest && (
          <span className="text-[9px] font-semibold px-1.5 py-[1px] rounded bg-emerald-500/12 text-emerald-400 uppercase tracking-wider">
            latest
          </span>
        )}
        <svg
          className={`w-3 h-3 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full mt-1 right-0 w-[260px] bg-[#141418] border border-white/8 rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50">
          <div className="px-3.5 py-2.5 border-b border-white/6">
            <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              Audit Versions ({auditVersions.length})
            </div>
          </div>
          <div className="max-h-[280px] overflow-y-auto py-1">
            {auditVersions.map((v, idx) => {
              const isActive = v.id === currentAuditId;
              const isVersionLatest = v.version === latestVersion;
              // Score delta vs previous version (next in array since sorted desc)
              const prevVersion = idx < auditVersions.length - 1 ? auditVersions[idx + 1] : null;

              return (
                <button
                  key={v.id}
                  onClick={() => handleSelect(v.id)}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left transition-all ${
                    isActive ? "bg-emerald-500/8" : "hover:bg-white/4"
                  }`}
                >
                  <div className={`text-xs font-mono font-semibold ${
                    isActive ? "text-emerald-300" : "text-zinc-400"
                  }`}>
                    v{v.version}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-zinc-400 truncate">
                      {formatDate(v.created_at)}
                    </div>
                    {v.execution_time && (
                      <div className="text-[10px] text-zinc-600">
                        {Math.round(v.execution_time)}s
                        {v.pages_crawled ? ` · ${v.pages_crawled} pages` : ""}
                      </div>
                    )}
                  </div>
                  {isVersionLatest && (
                    <span className="text-[9px] font-semibold px-1.5 py-[1px] rounded bg-emerald-500/12 text-emerald-400 uppercase tracking-wider shrink-0">
                      latest
                    </span>
                  )}
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

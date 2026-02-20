"use client";

import { createContext, useContext, useState, useCallback } from "react";
import type { AuditResult } from "@/types";

// ── Agent key registry ─────────────────────────────────────────────────

export type AgentKey =
  | "keyword_research"
  | "on_page_seo"
  | "local_seo"
  | "technical_seo"
  | "content_rewriter"
  | "blog_writer"
  | "backlink_analysis"
  | "link_building"
  | "gbp_audit"
  | "citation_builder"
  | "rank_tracker"
  | "ai_seo";

// ── Form values (persisted to localStorage) ───────────────────────────

export interface LastFormValues {
  keyword:      string;
  url:          string;
  location:     string;
  businessName: string;
  businessType: string;
}

const FORM_LS_KEY  = "lr_form_v1";
const AUDIT_LS_KEY = "lr_last_audit_v1";

function loadFormValues(): LastFormValues {
  try {
    const raw = typeof window !== "undefined" && localStorage.getItem(FORM_LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { keyword: "", url: "", location: "Toronto, Canada", businessName: "", businessType: "" };
}

function persistFormValues(v: LastFormValues) {
  try { localStorage.setItem(FORM_LS_KEY, JSON.stringify(v)); } catch { /* ignore */ }
}

function loadLastAudit(): AuditResult | null {
  try {
    const raw = typeof window !== "undefined" && localStorage.getItem(AUDIT_LS_KEY);
    if (raw) return JSON.parse(raw) as AuditResult;
  } catch { /* ignore */ }
  return null;
}

function persistLastAudit(audit: AuditResult) {
  try { localStorage.setItem(AUDIT_LS_KEY, JSON.stringify(audit)); } catch { /* ignore */ }
}

// ── Context value shape ───────────────────────────────────────────────

interface DashboardContextValue {
  /** The last completed full audit (11-agent workflow). */
  lastAudit: AuditResult | null;
  /** Called by the audit page when a full audit completes. Also populates agentCache. */
  setLastAudit: (a: AuditResult) => void;
  /** Per-agent results — populated from full audit OR standalone runs. */
  agentCache: Partial<Record<AgentKey, unknown>>;
  /** Called by individual agent pages when a standalone run completes. */
  setAgentResult: (key: AgentKey, result: unknown) => void;
  /** Remove a cached agent result (forces the page to show its form). */
  clearAgentResult: (key: AgentKey) => void;
  /** Last form values across all agent pages — pre-fills every form. */
  lastFormValues: LastFormValues;
  /** Merge partial updates; also persists to localStorage. */
  setLastFormValues: (v: Partial<LastFormValues>) => void;
}

const DashboardContext = createContext<DashboardContextValue>({
  lastAudit: null,
  setLastAudit: () => {},
  agentCache: {},
  setAgentResult: () => {},
  clearAgentResult: () => {},
  lastFormValues: { keyword: "", url: "", location: "Toronto, Canada", businessName: "", businessType: "" },
  setLastFormValues: () => {},
});

// ── Provider ──────────────────────────────────────────────────────────

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [lastAudit,     setLastAuditState]   = useState<AuditResult | null>(loadLastAudit);
  const [agentCache,    setAgentCacheState]   = useState<Partial<Record<AgentKey, unknown>>>(() => {
    const stored = loadLastAudit();
    if (!stored?.agents) return {};
    const a = stored.agents as Record<string, unknown>;
    return {
      keyword_research:  a.keyword_research,
      on_page_seo:       a.on_page_seo,
      local_seo:         a.local_seo,
      technical_seo:     a.technical_seo,
      content_rewriter:  a.content_rewriter,
      backlink_analysis: a.backlink_analysis,
      link_building:     a.link_building,
      gbp_audit:         a.gbp_audit,
      citation_builder:  a.citation_builder,
      rank_tracker:      a.rank_tracker,
      ai_seo:            a.ai_seo,
      blog_writer:       a.blog_writer,
    };
  });
  const [lastFormValues, setFormValuesState]  = useState<LastFormValues>(loadFormValues);

  /** Full audit completion: cache every agent result + extract form values. */
  const setLastAudit = useCallback((audit: AuditResult) => {
    setLastAuditState(audit);
    persistLastAudit(audit);

    // Populate cache from every agent in the full audit
    const a = audit.agents as Record<string, unknown>;
    setAgentCacheState({
      keyword_research:  a.keyword_research,
      on_page_seo:       a.on_page_seo,
      local_seo:         a.local_seo,
      technical_seo:     a.technical_seo,
      content_rewriter:  a.content_rewriter,
      backlink_analysis: a.backlink_analysis,
      link_building:     a.link_building,
      gbp_audit:         a.gbp_audit,
      citation_builder:  a.citation_builder,
      rank_tracker:      a.rank_tracker,
      ai_seo:            a.ai_seo,
      blog_writer:       a.blog_writer,
    });

    // Save form values so all agent forms pre-fill
    const vals: LastFormValues = {
      keyword:      audit.keyword       ?? "",
      url:          audit.target_url    ?? "",
      location:     audit.location      ?? "Toronto, Canada",
      businessName: audit.business_name ?? "",
      businessType: audit.business_type ?? "",
    };
    setFormValuesState(vals);
    persistFormValues(vals);
  }, []);

  /** Standalone agent result — updates only that one cache slot. */
  const setAgentResult = useCallback((key: AgentKey, result: unknown) => {
    setAgentCacheState((prev) => ({ ...prev, [key]: result }));
  }, []);

  /** Clear one cache slot so the page reverts to its form. */
  const clearAgentResult = useCallback((key: AgentKey) => {
    setAgentCacheState((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  /** Merge form value updates + persist. */
  const setLastFormValues = useCallback((v: Partial<LastFormValues>) => {
    setFormValuesState((prev) => {
      const next = { ...prev, ...v };
      persistFormValues(next);
      return next;
    });
  }, []);

  return (
    <DashboardContext.Provider value={{
      lastAudit, setLastAudit,
      agentCache, setAgentResult, clearAgentResult,
      lastFormValues, setLastFormValues,
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  return useContext(DashboardContext);
}

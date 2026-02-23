"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import type { AuditResult, AuditVersionMeta, Profile } from "@/types";

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
  keyword:          string;
  url:              string;
  location:         string;
  businessName:     string;
  businessType:     string;
  businessCategory: string;
  services:         string[];
  country:          string;
  city:             string;
}

const FORM_LS_KEY    = "lr_form_v1";
const AUDIT_LS_KEY   = "lr_last_audit_v1";
const PROFILE_LS_KEY = "lr_active_profile_v1";

function loadFormValues(): LastFormValues {
  try {
    const raw = typeof window !== "undefined" && localStorage.getItem(FORM_LS_KEY);
    if (raw) return { businessCategory: "", services: [], country: "", city: "", ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { keyword: "", url: "", location: "Toronto, Canada", businessName: "", businessType: "", businessCategory: "", services: [], country: "", city: "" };
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

function loadActiveProfileId(): string | null {
  try {
    const raw = typeof window !== "undefined" && localStorage.getItem(PROFILE_LS_KEY);
    return raw || null;
  } catch { /* ignore */ }
  return null;
}

function persistActiveProfileId(id: string | null) {
  try {
    if (id) {
      localStorage.setItem(PROFILE_LS_KEY, id);
    } else {
      localStorage.removeItem(PROFILE_LS_KEY);
    }
  } catch { /* ignore */ }
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
  /** Currently active profile ID (persisted to localStorage). */
  activeProfileId: string | null;
  /** Set the active profile (persists to localStorage). */
  setActiveProfileId: (id: string | null) => void;
  /** User's profiles — server-authoritative. */
  profiles: Profile[];
  /** Fetch profiles from backend. */
  fetchProfiles: (accessToken: string) => Promise<void>;
  /** Whether profiles are currently loading. */
  profilesLoading: boolean;
  /** Audit versions for the active profile. */
  auditVersions: AuditVersionMeta[];
  /** Whether audit versions are loading. */
  versionsLoading: boolean;
  /** Load audit versions for a profile. */
  loadProfileAudits: (profileId: string, accessToken: string) => Promise<void>;
  /** Load a specific audit by ID and set it as lastAudit. */
  loadAuditById: (profileId: string, auditId: string, accessToken: string) => Promise<void>;
  /** Switch active profile: sets profile, loads latest audit + version list. */
  switchProfile: (profileId: string, accessToken: string) => Promise<void>;
}

const DashboardContext = createContext<DashboardContextValue>({
  lastAudit: null,
  setLastAudit: () => {},
  agentCache: {},
  setAgentResult: () => {},
  clearAgentResult: () => {},
  lastFormValues: { keyword: "", url: "", location: "Toronto, Canada", businessName: "", businessType: "", businessCategory: "", services: [], country: "", city: "" },
  setLastFormValues: () => {},
  activeProfileId: null,
  setActiveProfileId: () => {},
  profiles: [],
  fetchProfiles: async () => {},
  profilesLoading: false,
  auditVersions: [],
  versionsLoading: false,
  loadProfileAudits: async () => {},
  loadAuditById: async () => {},
  switchProfile: async () => {},
});

// ── Provider ──────────────────────────────────────────────────────────

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

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
  const [activeProfileId, setActiveProfileIdState] = useState<string | null>(loadActiveProfileId);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [auditVersions, setAuditVersions] = useState<AuditVersionMeta[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  /** Populate agent cache from a full audit result. */
  const populateAgentCache = useCallback((audit: AuditResult) => {
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
  }, []);

  /** Full audit completion: cache every agent result + extract form values. */
  const setLastAudit = useCallback((audit: AuditResult) => {
    setLastAuditState(audit);
    persistLastAudit(audit);
    populateAgentCache(audit);

    // Save form values so all agent forms pre-fill
    const vals: LastFormValues = {
      keyword:          audit.keyword       ?? "",
      url:              audit.target_url    ?? "",
      location:         audit.location      ?? "Toronto, Canada",
      businessName:     audit.business_name ?? "",
      businessType:     audit.business_type ?? "",
      businessCategory: "",
      services:         [],
      country:          "",
      city:             "",
    };
    setFormValuesState(vals);
    persistFormValues(vals);

    // Auto-set active profile from audit result
    if (audit.profile_id) {
      setActiveProfileIdState(audit.profile_id);
      persistActiveProfileId(audit.profile_id);
    }
  }, [populateAgentCache]);

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

  /** Set active profile + persist. */
  const setActiveProfileId = useCallback((id: string | null) => {
    setActiveProfileIdState(id);
    persistActiveProfileId(id);
  }, []);

  /** Fetch user profiles from backend. */
  const fetchProfiles = useCallback(async (accessToken: string) => {
    setProfilesLoading(true);
    try {
      const res = await fetch(`${apiUrl}/profiles`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProfiles(data);
      }
    } catch { /* ignore */ }
    setProfilesLoading(false);
  }, [apiUrl]);

  /** Load audit versions for a profile. */
  const loadProfileAudits = useCallback(async (profileId: string, accessToken: string) => {
    setVersionsLoading(true);
    try {
      const res = await fetch(`${apiUrl}/profiles/${profileId}/audits`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const data: AuditVersionMeta[] = await res.json();
        setAuditVersions(data);
      }
    } catch { /* ignore */ }
    setVersionsLoading(false);
  }, [apiUrl]);

  /** Load a specific audit by ID and set it as lastAudit. */
  const loadAuditById = useCallback(async (profileId: string, auditId: string, accessToken: string) => {
    try {
      const res = await fetch(`${apiUrl}/profiles/${profileId}/audits/${auditId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const audit: AuditResult = await res.json();
        setLastAuditState(audit);
        persistLastAudit(audit);
        populateAgentCache(audit);
      }
    } catch { /* ignore */ }
  }, [apiUrl, populateAgentCache]);

  /** Switch active profile: sets profile, loads latest audit + version list. */
  const switchProfile = useCallback(async (profileId: string, accessToken: string) => {
    setActiveProfileIdState(profileId);
    persistActiveProfileId(profileId);

    // Load latest audit for this profile
    try {
      const res = await fetch(`${apiUrl}/profiles/${profileId}/audits/latest`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const audit: AuditResult = await res.json();
        setLastAuditState(audit);
        persistLastAudit(audit);
        populateAgentCache(audit);
      }
    } catch { /* ignore */ }

    // Load version list
    await loadProfileAudits(profileId, accessToken);
  }, [apiUrl, populateAgentCache, loadProfileAudits]);

  /** Auto-fetch profiles on session availability. */
  useEffect(() => {
    const token = session?.accessToken as string | undefined;
    if (token && profiles.length === 0) {
      fetchProfiles(token);
    }
  }, [session?.accessToken, profiles.length, fetchProfiles]);

  return (
    <DashboardContext.Provider value={{
      lastAudit, setLastAudit,
      agentCache, setAgentResult, clearAgentResult,
      lastFormValues, setLastFormValues,
      activeProfileId, setActiveProfileId,
      profiles, fetchProfiles, profilesLoading,
      auditVersions, versionsLoading,
      loadProfileAudits, loadAuditById, switchProfile,
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  return useContext(DashboardContext);
}

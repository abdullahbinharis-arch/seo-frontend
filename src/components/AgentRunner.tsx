"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useDashboard } from "./DashboardContext";
import { ProgressIndicator } from "./ProgressIndicator";

export type AgentField =
  | "keyword"
  | "url"
  | "domain"
  | "location"
  | "businessName"
  | "businessType";

export interface AgentRunnerProps<T> {
  /** API endpoint path, e.g. "/agents/keyword-research" */
  endpoint: string;
  /** Which form fields to render */
  fields: AgentField[];
  /** Render the typed result (used for both cached and fresh runs) */
  renderResult: (data: T) => React.ReactNode;
  /** Cached result from context — if provided, start in "cached" mode */
  cachedResult?: T | null;
  /** Called when a standalone run produces a new result */
  onResult?: (data: T) => void;
  /** Override the default request body construction */
  buildBody?: (values: Record<string, string>) => Record<string, unknown>;
  /** Label for the submit button */
  runLabel?: string;
  /** Status message shown while running */
  progressMessage?: string;
}

// ── Internal mode union ───────────────────────────────────────────────

type Mode =
  | { type: "cached" }           // showing cachedResult prop
  | { type: "form"; hasBack: boolean }  // showing the form; hasBack means there's something to go back to
  | { type: "loading" }          // request in flight
  | { type: "result"; data: unknown }; // showing fresh local result

// ── Helpers ───────────────────────────────────────────────────────────

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 " +
  "focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500/70 " +
  "disabled:opacity-50 transition-all text-sm";

function formatRelative(iso?: string): string {
  if (!iso) return "";
  const ms   = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60_000);
  if (mins <  1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs  < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── AgentRunner ───────────────────────────────────────────────────────

export function AgentRunner<T = unknown>({
  endpoint,
  fields,
  renderResult,
  cachedResult,
  onResult,
  buildBody,
  runLabel      = "Run Analysis",
  progressMessage = "Analysing…",
}: AgentRunnerProps<T>) {
  const { data: session }          = useSession();
  const { lastFormValues, setLastFormValues } = useDashboard();

  // ── Form field state — initialised from lastFormValues ──────────────

  const has = (f: AgentField) => fields.includes(f);

  const [keyword,      setKeyword]      = useState(() => has("keyword")      ? lastFormValues.keyword      : "");
  const [url,          setUrl]          = useState(() => has("url")          ? lastFormValues.url          : "");
  const [domain,       setDomain]       = useState("");
  const [location,     setLocation]     = useState(() => has("location")     ? lastFormValues.location     : "Toronto, Canada");
  const [businessName, setBusinessName] = useState(() => has("businessName") ? lastFormValues.businessName : "");
  const [businessType, setBusinessType] = useState(() => has("businessType") ? lastFormValues.businessType : "");

  const [error, setError] = useState("");
  const [agentProgress, setAgentProgress] = useState(0);

  // Animate progress while loading
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const startProgress = useCallback(() => {
    setAgentProgress(0);
    const start = Date.now();
    progressTimer.current = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      // Ease toward 90% over ~30 seconds
      setAgentProgress(Math.min(90, Math.round((1 - Math.exp(-elapsed / 12)) * 90)));
    }, 500);
  }, []);
  const stopProgress = useCallback((final: number) => {
    if (progressTimer.current) clearInterval(progressTimer.current);
    progressTimer.current = null;
    setAgentProgress(final);
  }, []);

  // ── Mode state machine ───────────────────────────────────────────────

  const [mode, setMode] = useState<Mode>(() =>
    cachedResult ? { type: "cached" } : { type: "form", hasBack: false }
  );

  // Track whether we have a previous result to "go back" to when re-running
  const hasResult = mode.type === "cached" || mode.type === "result";

  // When cachedResult prop changes from outside (e.g. full audit finishes while on the page)
  const prevCachedRef = useRef(cachedResult);
  useEffect(() => {
    if (cachedResult !== prevCachedRef.current) {
      prevCachedRef.current = cachedResult;
      // Only switch to cached if we're currently sitting on an empty form
      if (cachedResult && mode.type === "form" && !mode.hasBack) {
        setMode({ type: "cached" });
      }
    }
  }, [cachedResult, mode]);

  // ── Re-fill form from lastFormValues when context updates ────────────
  // (covers the case where user runs a full audit, then navigates here)
  const lastFormRef = useRef(lastFormValues);
  useEffect(() => {
    if (lastFormValues === lastFormRef.current) return;
    lastFormRef.current = lastFormValues;
    if (has("keyword")      && !keyword)      setKeyword(lastFormValues.keyword);
    if (has("url")          && !url)          setUrl(lastFormValues.url);
    if (has("location")     && !location)     setLocation(lastFormValues.location || "Toronto, Canada");
    if (has("businessName") && !businessName) setBusinessName(lastFormValues.businessName);
    if (has("businessType") && !businessType) setBusinessType(lastFormValues.businessType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastFormValues]);

  // ── Form submit ───────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMode({ type: "loading" });
    setError("");
    startProgress();

    // Save form values to context so other pages pre-fill
    setLastFormValues({ keyword, url, location, businessName, businessType });

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

      const values: Record<string, string> = {
        keyword, url, domain, location, businessName, businessType,
      };

      const defaultBody: Record<string, unknown> = {};
      if (has("keyword"))      defaultBody.keyword       = keyword;
      if (has("url"))          defaultBody.target_url    = url;
      if (has("domain"))       defaultBody.domain        = domain || undefined;
      if (has("location"))     defaultBody.location      = location;
      if (has("businessName")) defaultBody.business_name = businessName;
      if (has("businessType")) defaultBody.business_type = businessType;

      const body = buildBody ? buildBody(values) : defaultBody;

      const res = await fetch(`${apiUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.accessToken
            ? { Authorization: `Bearer ${session.accessToken}` }
            : {}),
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.detail ?? `Server error ${res.status}`);
      }

      const data = await res.json() as T;
      stopProgress(100);
      setMode({ type: "result", data });
      onResult?.(data);
    } catch (err) {
      stopProgress(0);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      // Revert mode so the user can see the form again
      setMode({ type: "form", hasBack: hasResult });
    }
  }

  // ── Display data ──────────────────────────────────────────────────────

  const displayData: T | null =
    mode.type === "cached" ? (cachedResult ?? null)
    : mode.type === "result" ? (mode.data as T)
    : null;

  // ── Extract meta from result for the badge ────────────────────────────
  const meta = displayData as Record<string, unknown> | null;
  const metaKeyword = meta?.keyword as string | undefined;
  const metaUrl     = (meta?.target_url as string | undefined)?.replace(/^https?:\/\//, "");
  const metaTime    = formatRelative(meta?.timestamp as string | undefined);
  const isFromFullAudit = mode.type === "cached";

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">

      {/* ── Result banner (cached or fresh) ─────────────────────────── */}
      {displayData && (
        <div className="flex items-center justify-between gap-3 glass rounded-xl px-4 py-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-2 h-2 rounded-full shrink-0 ${isFromFullAudit ? "bg-emerald-400" : "bg-blue-400"}`} />
            <span className="text-xs text-zinc-400 truncate">
              {isFromFullAudit ? "From full audit" : "Standalone result"}
              {metaKeyword && <> · <span className="text-zinc-300">{metaKeyword}</span></>}
              {metaUrl     && <> · <span className="text-zinc-500 font-mono">{metaUrl}</span></>}
              {metaTime    && <> · <span className="text-zinc-600">{metaTime}</span></>}
            </span>
          </div>
          <button
            onClick={() => setMode({ type: "form", hasBack: true })}
            className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Re-run
          </button>
        </div>
      )}

      {/* ── Form ─────────────────────────────────────────────────────── */}
      {(mode.type === "form" || mode.type === "loading") && (
        <div className="glass rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Business row */}
            {(has("businessName") || has("businessType")) && (
              <div className="grid sm:grid-cols-2 gap-4">
                {has("businessName") && (
                  <Field label="Business Name" htmlFor="biz-name">
                    <input
                      id="biz-name" type="text"
                      value={businessName} onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Smith Family Dental" disabled={mode.type === "loading"}
                      className={inputClass}
                    />
                  </Field>
                )}
                {has("businessType") && (
                  <Field label="Business Type" htmlFor="biz-type">
                    <input
                      id="biz-type" type="text"
                      value={businessType} onChange={(e) => setBusinessType(e.target.value)}
                      placeholder="Dental Clinic" disabled={mode.type === "loading"}
                      className={inputClass}
                    />
                  </Field>
                )}
              </div>
            )}

            {/* Keyword */}
            {has("keyword") && (
              <Field label="Search Keyword" htmlFor="kw">
                <input
                  id="kw" type="text"
                  value={keyword} onChange={(e) => setKeyword(e.target.value)}
                  placeholder="dentist near me" required
                  disabled={mode.type === "loading"} className={inputClass}
                />
              </Field>
            )}

            {/* URL / Domain row */}
            {(has("url") || has("domain")) && (
              <div className={has("url") && has("domain") ? "grid sm:grid-cols-2 gap-4" : ""}>
                {has("url") && (
                  <Field label="Website URL" htmlFor="url">
                    <input
                      id="url" type="url"
                      value={url} onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com" required={!has("domain")}
                      disabled={mode.type === "loading"} className={inputClass}
                    />
                  </Field>
                )}
                {has("domain") && (
                  <Field label="Domain (full-site crawl)" htmlFor="domain">
                    <input
                      id="domain" type="text"
                      value={domain} onChange={(e) => setDomain(e.target.value)}
                      placeholder="example.com"
                      disabled={mode.type === "loading"} className={inputClass}
                    />
                  </Field>
                )}
              </div>
            )}

            {/* Location */}
            {has("location") && (
              <Field label="City / Location" htmlFor="location">
                <input
                  id="location" type="text"
                  value={location} onChange={(e) => setLocation(e.target.value)}
                  placeholder="Toronto, Canada" required
                  disabled={mode.type === "loading"} className={inputClass}
                />
              </Field>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit" disabled={mode.type === "loading"}
                className="btn-primary text-white font-semibold px-6 py-2.5 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed text-sm"
              >
                {mode.type === "loading" ? "Running…" : runLabel}
              </button>
              {mode.type === "form" && mode.hasBack && (
                <button
                  type="button"
                  onClick={() =>
                    setMode(
                      mode.type === "form" && displayData === null && cachedResult
                        ? { type: "cached" }
                        : mode.type === "form" && (mode as { hasBack: boolean }).hasBack
                          ? { type: "cached" }
                          : { type: "form", hasBack: false }
                    )
                  }
                  className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* Progress */}
          {mode.type === "loading" && (
            <div className="mt-5 border-t border-white/5 pt-5">
              <ProgressIndicator stage={progressMessage} progress={agentProgress} />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-5 flex gap-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Result display ────────────────────────────────────────────── */}
      {displayData && renderResult(displayData)}
    </div>
  );
}

// ── Field wrapper ─────────────────────────────────────────────────────

function Field({
  label, htmlFor, children,
}: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-zinc-300">{label}</label>
      {children}
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import type { AuditResult } from "@/types";
import { AuditResults } from "./AuditResults";
import { ProgressIndicator } from "./ProgressIndicator";
import Link from "next/link";

// Progress messages shown at different elapsed times during polling
const STAGE_MESSAGES: Array<{ after: number; message: string }> = [
  { after: 0,   message: "Analyzing your website…" },
  { after: 8,   message: "Detecting your business type and best keyword…" },
  { after: 20,  message: "Finding local competitors on Google…" },
  { after: 35,  message: "Analyzing keyword opportunities for your area…" },
  { after: 50,  message: "Auditing your website for on-page SEO signals…" },
  { after: 65,  message: "Checking backlink profile and domain authority…" },
  { after: 80,  message: "Analyzing your Google Business Profile…" },
  { after: 100, message: "Scoring your AI search visibility…" },
  { after: 120, message: "Building your local SEO strategy…" },
  { after: 145, message: "Calculating your LocalRank Score…" },
  { after: 170, message: "Almost done — finalizing your report…" },
];

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm";

export function AuditForm({ onComplete, embedded = false }: { onComplete?: (result: AuditResult) => void; embedded?: boolean } = {}) {
  const { data: session } = useSession();
  const [businessName, setBusinessName] = useState("");
  const [url, setUrl]                   = useState("");
  const [location, setLocation]         = useState("Toronto, Canada");
  const [loading, setLoading]           = useState(false);
  const [stage, setStage]               = useState("");
  const [progress, setProgress]         = useState(0);
  const [error, setError]               = useState("");
  const [result, setResult]             = useState<AuditResult | null>(null);
  const [formCollapsed, setFormCollapsed] = useState(false);

  const resultsRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to results when they appear
  useEffect(() => {
    if (result && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    setProgress(0);
    setFormCollapsed(false);
    setStage(STAGE_MESSAGES[0].message);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

      // Step 1 — kick off the audit, get back audit_id immediately
      // Keyword is omitted — backend auto-detects from the website
      const kickoffRes = await fetch(`${apiUrl}/workflow/seo-audit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.accessToken
            ? { Authorization: `Bearer ${session.accessToken}` }
            : {}),
        },
        body: JSON.stringify({
          target_url: url,
          location,
          business_name: businessName,
        }),
      });

      if (!kickoffRes.ok) {
        const body = await kickoffRes.json().catch(() => null);
        throw new Error(body?.detail ?? `Server error ${kickoffRes.status}`);
      }

      const { audit_id } = await kickoffRes.json();
      if (!audit_id) throw new Error("No audit_id returned from server");

      // Step 2 — poll until done
      const startedAt = Date.now();
      const POLL_INTERVAL = 3000; // ms between polls
      const MAX_WAIT = 240000;    // 4 minute timeout

      while (Date.now() - startedAt < MAX_WAIT) {
        await new Promise((r) => setTimeout(r, POLL_INTERVAL));

        const elapsed = Math.round((Date.now() - startedAt) / 1000);

        // Update stage message based on elapsed time
        const stageMsg = [...STAGE_MESSAGES]
          .reverse()
          .find((s) => elapsed >= s.after);
        if (stageMsg) setStage(stageMsg.message);

        // Smoothly advance progress bar — asymptotic curve reaching ~75% at 120s
        const cappedProgress = Math.min(95, Math.round(95 * (1 - Math.exp(-elapsed / 80))));
        setProgress(cappedProgress);

        const pollRes = await fetch(`${apiUrl}/audits/${audit_id}/status`);
        if (!pollRes.ok) continue; // transient error — keep polling

        const data = await pollRes.json();

        if (data.status === "failed") {
          throw new Error("Audit failed — please try again");
        }

        if (data.status !== "processing") {
          // status === "completed" → data IS the full report
          setProgress(100);
          setResult(data as AuditResult);
          setFormCollapsed(true);
          onComplete?.(data as AuditResult);
          return;
        }
      }

      throw new Error("Audit timed out — please try again");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setStage("");
    }
  }

  return (
    <div className={embedded ? "space-y-8" : "min-h-screen bg-[#09090b]"}>
      {!embedded && (
        <>
          {/* Header / Nav — only shown in standalone mode */}
          <header className="nav-blur border-b border-white/5 sticky top-0 z-50">
            <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-lg font-bold text-white font-display">LocalRank</span>
              </Link>

              <div className="flex-1" />

              {session?.user && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-zinc-400 hidden sm:block">{session.user.email}</span>
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="btn-secondary text-sm text-zinc-300 rounded-lg px-3 py-1.5"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </header>
        </>
      )}

      <main className={embedded ? "" : "max-w-5xl mx-auto px-6 py-10 space-y-8"}>
        {/* Form card — collapsible after completion */}
        {formCollapsed ? (
          <div className="glass rounded-2xl px-8 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500 rounded-full p-1 shrink-0">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm text-zinc-300">
                Audit complete for <span className="text-white font-medium">{businessName || url}</span>
              </span>
            </div>
            <button
              onClick={() => {
                setFormCollapsed(false);
                setResult(null);
                setError("");
                setProgress(0);
              }}
              className="btn-secondary text-sm text-zinc-300 rounded-lg px-4 py-2"
            >
              Run another audit
            </button>
          </div>
        ) : (
          <div className="glass rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white font-display mb-1">
              Audit your local search presence
            </h2>
            <p className="text-sm text-zinc-400 mb-6">
              Takes 60–90 seconds. We analyze your competitors and build a personalized strategy.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Field label="Business Name" htmlFor="businessName">
                <input
                  id="businessName"
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Smith Family Dental"
                  required
                  disabled={loading}
                  className={inputClass}
                />
              </Field>

              <div className="grid md:grid-cols-2 gap-5">
                <Field label="Website URL" htmlFor="url">
                  <input
                    id="url"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    required
                    disabled={loading}
                    className={inputClass}
                  />
                </Field>

                <Field label="City / Location" htmlFor="location">
                  <input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Toronto, Canada"
                    required
                    disabled={loading}
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary text-white font-semibold px-8 py-3 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Running audit…" : "Run Free Audit"}
                </button>
                {!loading && (
                  <p className="text-sm text-zinc-500">Takes 60–90 seconds</p>
                )}
              </div>
            </form>

            {/* Progress */}
            {loading && (
              <div className="mt-6 border-t border-white/5 pt-6">
                <ProgressIndicator stage={stage} progress={progress} />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mt-6 flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4">
                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium flex-1">{error}</p>
                <button
                  onClick={() => setError("")}
                  className="shrink-0 text-red-400 hover:text-red-300 transition-colors"
                  aria-label="Dismiss error"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        <div ref={resultsRef}>
          {result && <AuditResults data={result} />}
        </div>
      </main>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-zinc-300">
        {label}
      </label>
      {children}
    </div>
  );
}

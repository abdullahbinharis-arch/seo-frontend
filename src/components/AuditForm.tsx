"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import type { AuditResult } from "@/types";
import { AuditResults } from "./AuditResults";
import { ProgressIndicator } from "./ProgressIndicator";

const STAGES = [
  { delay: 0,     message: "Finding competitors on Google…" },
  { delay: 12000, message: "Analysing keyword gaps and search intent…" },
  { delay: 28000, message: "Scraping and auditing your page content…" },
  { delay: 45000, message: "Building local SEO strategy…" },
  { delay: 58000, message: "Combining results and generating quick wins…" },
];

export function AuditForm() {
  const { data: session } = useSession();
  const [keyword, setKeyword]   = useState("");
  const [url, setUrl]           = useState("");
  const [location, setLocation] = useState("Toronto, Canada");
  const [loading, setLoading]   = useState(false);
  const [stage, setStage]       = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError]       = useState("");
  const [result, setResult]     = useState<AuditResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    setProgress(0);

    // Kick off timed progress stages
    const timers: ReturnType<typeof setTimeout>[] = [];
    STAGES.forEach(({ delay, message }, i) => {
      timers.push(
        setTimeout(() => {
          setStage(message);
          setProgress(Math.round((i / STAGES.length) * 90));
        }, delay)
      );
    });

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
      const res = await fetch(`${apiUrl}/workflow/seo-audit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.accessToken
            ? { Authorization: `Bearer ${session.accessToken}` }
            : {}),
        },
        body: JSON.stringify({ keyword, target_url: url, location }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail ?? `Server error ${res.status}`);
      }

      const data: AuditResult = await res.json();
      setProgress(100);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      timers.forEach(clearTimeout);
      setLoading(false);
      setStage("");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center gap-4">
          <div className="bg-blue-600 text-white rounded-xl p-2.5">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">Local SEO Audit</h1>
            <p className="text-slate-500 text-sm">3 AI agents — keyword research, on-page SEO, and local strategy</p>
          </div>
          {session?.user && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500 hidden sm:block">{session.user.email}</span>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-sm text-slate-600 hover:text-slate-900 border border-slate-300 hover:border-slate-400 rounded-lg px-3 py-1.5 transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Enter your details</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-3 gap-5">
              <Field label="Target Keyword" htmlFor="keyword">
                <input
                  id="keyword"
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="dentist near me"
                  required
                  disabled={loading}
                  className="input"
                />
              </Field>

              <Field label="Website URL" htmlFor="url">
                <input
                  id="url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  required
                  disabled={loading}
                  className="input"
                />
              </Field>

              <Field label="Location" htmlFor="location">
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={loading}
                  className="input"
                />
              </Field>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-xl transition-colors"
              >
                {loading ? "Running audit…" : "Run SEO Audit"}
              </button>
              {!loading && (
                <p className="text-sm text-slate-400">Takes 60–90 seconds</p>
              )}
            </div>
          </form>

          {/* Progress */}
          {loading && (
            <div className="mt-6">
              <ProgressIndicator stage={stage} progress={progress} />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
        </div>

        {/* Results */}
        {result && <AuditResults data={result} />}
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
      <label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}

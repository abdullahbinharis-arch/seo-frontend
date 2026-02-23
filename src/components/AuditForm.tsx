"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import type { AuditResult } from "@/types";
import { AuditResults } from "./AuditResults";
import { ProgressIndicator } from "./ProgressIndicator";
import { Logo } from "./brand/Logo";
import { useDashboard } from "./DashboardContext";
import { CategorySelect } from "./dashboard/CategorySelect";
import { ServiceTagInput } from "./dashboard/ServiceTagInput";
import { COUNTRY_CITIES } from "@/data/countryCities";
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
  { after: 145, message: "Calculating your LocalRankr Score…" },
  { after: 170, message: "Almost done — finalizing your report…" },
];

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm";

const selectClass =
  "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm appearance-none cursor-pointer";

export function AuditForm({ onComplete, embedded = false, profileId }: { onComplete?: (result: AuditResult) => void; embedded?: boolean; profileId?: string | null } = {}) {
  const { data: session } = useSession();
  const { profiles, fetchProfiles, setActiveProfileId } = useDashboard();

  // ── Form state ──────────────────────────────────────────────────────
  const [businessName, setBusinessName] = useState("");
  const [url, setUrl]                   = useState("");
  const [category, setCategory]         = useState("");
  const [services, setServices]         = useState<string[]>([]);
  const [country, setCountry]           = useState("");
  const [city, setCity]                 = useState("");
  const [customCity, setCustomCity]     = useState("");
  const [cityIsOther, setCityIsOther]   = useState(false);

  // ── Profile selection ───────────────────────────────────────────────
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(profileId ?? null);

  // ── UI state ────────────────────────────────────────────────────────
  const [loading, setLoading]           = useState(false);
  const [stage, setStage]               = useState("");
  const [progress, setProgress]         = useState(0);
  const [error, setError]               = useState("");
  const [result, setResult]             = useState<AuditResult | null>(null);
  const [formCollapsed, setFormCollapsed] = useState(false);

  const resultsRef = useRef<HTMLDivElement>(null);

  // Derive available cities from selected country
  const availableCities = useMemo(() => {
    const entry = COUNTRY_CITIES.find((c) => c.name === country);
    return entry?.cities ?? [];
  }, [country]);

  // Fetch profiles on mount
  useEffect(() => {
    if (session?.accessToken) fetchProfiles(session.accessToken);
  }, [session?.accessToken, fetchProfiles]);

  // Auto-scroll to results when they appear
  useEffect(() => {
    if (result && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  // ── Profile handlers ────────────────────────────────────────────────

  function handleSelectProfile(p: { id: string; business_name: string; website_url: string; business_category: string | null; services: string[]; country: string | null; city: string | null }) {
    setSelectedProfileId(p.id);
    setBusinessName(p.business_name);
    setUrl(p.website_url);
    setCategory(p.business_category ?? "");
    setServices(p.services ?? []);

    const countryName = p.country ?? "";
    setCountry(countryName);

    const cityName = p.city ?? "";
    const entry = COUNTRY_CITIES.find((c) => c.name === countryName);
    if (entry && entry.cities.includes(cityName)) {
      setCity(cityName);
      setCityIsOther(false);
      setCustomCity("");
    } else if (cityName) {
      setCityIsOther(true);
      setCustomCity(cityName);
      setCity("__other__");
    } else {
      setCity("");
      setCityIsOther(false);
      setCustomCity("");
    }
  }

  function handleNewProfile() {
    setSelectedProfileId(null);
    setBusinessName("");
    setUrl("");
    setCategory("");
    setServices([]);
    setCountry("");
    setCity("");
    setCustomCity("");
    setCityIsOther(false);
  }

  // ── Country/city change handlers ────────────────────────────────────

  function handleCountryChange(value: string) {
    setCountry(value);
    setCity("");
    setCustomCity("");
    setCityIsOther(false);
  }

  function handleCityChange(value: string) {
    if (value === "__other__") {
      setCityIsOther(true);
      setCity("__other__");
      setCustomCity("");
    } else {
      setCityIsOther(false);
      setCity(value);
      setCustomCity("");
    }
  }

  // ── Submit ──────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const finalCity = cityIsOther ? customCity.trim() : city;
    if (!businessName.trim() || !url.trim() || !category.trim() || services.length === 0 || !country || !finalCity) {
      setError("Please fill in all fields (including at least 1 service)");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setProgress(0);
    setFormCollapsed(false);
    setStage(STAGE_MESSAGES[0].message);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
      const location = `${finalCity}, ${country}`;
      let profileIdToUse = selectedProfileId;

      // Step 1 — Create profile if needed (authenticated + new profile)
      if (session?.accessToken && !profileIdToUse) {
        const profileRes = await fetch(`${apiUrl}/profiles`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({
            business_name: businessName.trim(),
            website_url: url.trim(),
            business_category: category.trim(),
            services,
            country,
            city: finalCity,
          }),
        });

        if (profileRes.ok) {
          const profile = await profileRes.json();
          profileIdToUse = profile.id;
          setSelectedProfileId(profile.id);
        }
        // If profile creation fails, continue without profile_id
      }

      // Step 2 — Kick off the audit
      const kickoffRes = await fetch(`${apiUrl}/workflow/seo-audit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.accessToken
            ? { Authorization: `Bearer ${session.accessToken}` }
            : {}),
        },
        body: JSON.stringify({
          target_url: url.trim(),
          location,
          business_name: businessName.trim(),
          business_type: category.trim(),
          ...(profileIdToUse ? { profile_id: profileIdToUse } : {}),
        }),
      });

      if (!kickoffRes.ok) {
        const body = await kickoffRes.json().catch(() => null);
        throw new Error(body?.detail ?? `Server error ${kickoffRes.status}`);
      }

      const { audit_id } = await kickoffRes.json();
      if (!audit_id) throw new Error("No audit_id returned from server");

      // Step 3 — Poll until done
      const startedAt = Date.now();
      const POLL_INTERVAL = 3000;
      const MAX_WAIT = 240000;

      while (Date.now() - startedAt < MAX_WAIT) {
        await new Promise((r) => setTimeout(r, POLL_INTERVAL));

        const elapsed = Math.round((Date.now() - startedAt) / 1000);
        const stageMsg = [...STAGE_MESSAGES].reverse().find((s) => elapsed >= s.after);
        if (stageMsg) setStage(stageMsg.message);

        const cappedProgress = Math.min(95, Math.round(95 * (1 - Math.exp(-elapsed / 80))));
        setProgress(cappedProgress);

        const pollRes = await fetch(`${apiUrl}/audits/${audit_id}/status`);
        if (!pollRes.ok) continue;

        const data = await pollRes.json();

        if (data.status === "failed") {
          throw new Error("Audit failed — please try again");
        }

        if (data.status !== "processing") {
          setProgress(100);
          setResult(data as AuditResult);
          setFormCollapsed(true);

          if (profileIdToUse) setActiveProfileId(profileIdToUse);
          onComplete?.(data as AuditResult);

          // Refresh profiles list
          if (session?.accessToken) fetchProfiles(session.accessToken);
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
        <header className="nav-blur border-b border-white/5 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5">
              <Logo size="medium" animated={false} />
            </Link>
            <div className="flex-1" />
            {session?.user && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-zinc-400 hidden sm:block">{session.user.email}</span>
              </div>
            )}
          </div>
        </header>
      )}

      <main className={embedded ? "" : "max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8"}>
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
          <div className="glass rounded-2xl p-5 sm:p-8">
            <h2 className="text-xl font-bold text-white font-display mb-1">
              Audit your local search presence
            </h2>
            <p className="text-sm text-zinc-400 mb-6">
              Takes 60–90 seconds. We analyze your competitors and build a personalized strategy.
            </p>

            {/* Profile selector strip */}
            {profiles.length > 0 && (
              <div className="flex gap-2 mb-6 overflow-x-auto pb-1 -mx-1 px-1">
                <button
                  type="button"
                  onClick={handleNewProfile}
                  disabled={loading}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    selectedProfileId === null
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "bg-white/5 border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-300"
                  } disabled:opacity-50`}
                >
                  + New Profile
                </button>
                {profiles.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectProfile(p)}
                    disabled={loading}
                    className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      selectedProfileId === p.id
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        : "bg-white/5 border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-300"
                    } disabled:opacity-50`}
                  >
                    {p.business_name}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* ROW 1: Business Name | Website URL */}
              <div className="grid md:grid-cols-2 gap-5">
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
              </div>

              {/* ROW 2: Category | Services */}
              <div className="grid md:grid-cols-2 gap-5">
                <Field label="Business Category" htmlFor="category">
                  <CategorySelect
                    value={category}
                    onChange={setCategory}
                    disabled={loading}
                  />
                </Field>

                <Field label="Services" htmlFor="services">
                  <ServiceTagInput
                    tags={services}
                    onChange={setServices}
                    disabled={loading}
                    placeholder="Type a service + Enter"
                  />
                </Field>
              </div>

              {/* ROW 3: Country | City */}
              <div className="grid md:grid-cols-2 gap-5">
                <Field label="Country" htmlFor="country">
                  <div className="relative">
                    <select
                      id="country"
                      value={country}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      disabled={loading}
                      className={selectClass}
                    >
                      <option value="">Select country</option>
                      {COUNTRY_CITIES.map((c) => (
                        <option key={c.code} value={c.name} style={{ background: "#18181b" }}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <svg className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </Field>

                <Field label="City" htmlFor="city">
                  {cityIsOther ? (
                    <div className="flex gap-2">
                      <input
                        id="city"
                        type="text"
                        value={customCity}
                        onChange={(e) => setCustomCity(e.target.value)}
                        placeholder="Enter city name"
                        disabled={loading}
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={() => { setCityIsOther(false); setCity(""); setCustomCity(""); }}
                        disabled={loading}
                        className="shrink-0 px-3 py-2 rounded-xl border border-white/10 text-xs text-zinc-400 hover:text-zinc-200 hover:border-white/20 transition-all disabled:opacity-50"
                      >
                        Back
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <select
                        id="city"
                        value={city}
                        onChange={(e) => handleCityChange(e.target.value)}
                        disabled={loading || !country}
                        className={selectClass}
                      >
                        <option value="">{country ? "Select city" : "Select country first"}</option>
                        {availableCities.map((c) => (
                          <option key={c} value={c} style={{ background: "#18181b" }}>
                            {c}
                          </option>
                        ))}
                        {country && <option value="__other__" style={{ background: "#18181b" }}>Other...</option>}
                      </select>
                      <svg className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  )}
                </Field>
              </div>

              {/* ROW 4: Submit */}
              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary text-white font-semibold px-8 py-3 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto"
                >
                  {loading ? "Running audit…" : "Run Full-Site Audit"}
                </button>
                {!loading && (
                  <p className="text-sm text-zinc-500 hidden sm:block">Takes 60–90 seconds</p>
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

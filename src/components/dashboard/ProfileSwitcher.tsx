"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useDashboard } from "@/components/DashboardContext";

function scoreBadgeStyle(score: number): { bg: string; color: string } {
  if (score >= 70) return { bg: "rgba(16,185,129,0.12)", color: "#6ee7b7" };
  if (score >= 40) return { bg: "rgba(245,158,11,0.12)", color: "#fbbf24" };
  return { bg: "rgba(244,63,94,0.12)", color: "#fb7185" };
}

export function ProfileSwitcher() {
  const { data: session } = useSession();
  const router = useRouter();
  const { profiles, activeProfileId, switchProfile, lastAudit } = useDashboard();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const activeProfile = profiles.find((p) => p.id === activeProfileId);
  const displayName = activeProfile?.business_name || lastAudit?.business_name || session?.user?.email || "No Profile";

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function handleSwitch(profileId: string) {
    const token = session?.accessToken as string | undefined;
    if (!token) return;
    setOpen(false);
    await switchProfile(profileId, token);
    router.push("/dashboard/overview");
  }

  return (
    <div className="shrink-0 border-t border-white/6 px-[10px] py-3" ref={ref}>
      {/* Active profile button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-[10px] px-3 py-2 rounded-[9px] hover:bg-white/4 transition-all text-left"
      >
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shrink-0">
          <span className="text-[11px] font-bold text-white">
            {displayName[0]?.toUpperCase() ?? "U"}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-white truncate">{displayName}</div>
          <div className="text-[10px] font-semibold text-emerald-400">
            {activeProfile ? (activeProfile.city ? `${activeProfile.city}, ${activeProfile.country}` : activeProfile.website_url.replace(/^https?:\/\//, "").replace(/\/$/, "")) : "Free Plan"}
          </div>
        </div>
        <svg
          className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute bottom-[70px] left-[10px] right-[10px] bg-[#141418] border border-white/8 rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50">
          {/* Profile list */}
          <div className="max-h-[240px] overflow-y-auto py-1.5">
            {profiles.length === 0 ? (
              <div className="px-4 py-3 text-xs text-zinc-500 text-center">No profiles yet</div>
            ) : (
              profiles.map((profile) => {
                const isActive = profile.id === activeProfileId;
                const latestScore = profile.latest_audit ? null : null; // score not in Profile.latest_audit
                return (
                  <button
                    key={profile.id}
                    onClick={() => handleSwitch(profile.id)}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left transition-all ${
                      isActive ? "bg-emerald-500/8" : "hover:bg-white/4"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-[10px] font-bold ${
                      isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-white/6 text-zinc-400"
                    }`}>
                      {profile.business_name[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-medium truncate ${isActive ? "text-emerald-300" : "text-zinc-300"}`}>
                        {profile.business_name}
                      </div>
                      <div className="text-[10px] text-zinc-500 truncate">
                        {profile.website_url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                      </div>
                    </div>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    )}
                    {latestScore !== null && (
                      <span
                        className="text-[10px] font-semibold px-[6px] py-[1px] rounded-md font-mono"
                        style={{ background: scoreBadgeStyle(latestScore).bg, color: scoreBadgeStyle(latestScore).color }}
                      >
                        {latestScore}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer links */}
          <div className="border-t border-white/6 px-3.5 py-2">
            <Link
              href="/dashboard/profiles"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-1 py-1.5 text-xs text-zinc-400 hover:text-emerald-400 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Manage Profiles
            </Link>
          </div>
        </div>
      )}

      {/* Sign out */}
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="w-full flex items-center gap-2.5 px-3 py-1.5 mt-1 rounded-[9px] text-xs text-zinc-500 hover:text-zinc-300 hover:bg-white/4 transition-all"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Sign out
      </button>
    </div>
  );
}

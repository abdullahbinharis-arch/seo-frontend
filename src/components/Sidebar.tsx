"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useDashboard } from "@/components/DashboardContext";

// ── Score badge color helper ─────────────────────────────────────────

function scoreBadgeStyle(score: number): { bg: string; color: string } {
  if (score >= 70) return { bg: "rgba(16,185,129,0.12)", color: "#6ee7b7" };
  if (score >= 40) return { bg: "rgba(245,158,11,0.12)", color: "#fbbf24" };
  return { bg: "rgba(244,63,94,0.12)", color: "#fb7185" };
}

// ── Nav items (flat list matching v3 reference) ──────────────────────

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: "score" | "count" | "ai";
  dividerBefore?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "audit",
    label: "Audit Report",
    href: "/dashboard/overview",
    badge: "score",
    icon: (
      <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 14l2 2 4-4" />
      </svg>
    ),
  },
  {
    id: "tasks",
    label: "SEO Tasks",
    href: "/dashboard/tasks",
    badge: "count",
    icon: (
      <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 20V10M18 20V4M6 20v-4" />
      </svg>
    ),
  },
  {
    id: "gmb",
    label: "GMB Optimization",
    href: "/dashboard/gbp",
    icon: (
      <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    id: "keywords",
    label: "Keyword Research",
    href: "/dashboard/keywords",
    icon: (
      <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    ),
  },
  {
    id: "backlinks",
    label: "Backlink Builder",
    href: "/dashboard/backlinks",
    icon: (
      <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
  {
    id: "posts",
    label: "Post Creator",
    href: "/dashboard/posts",
    badge: "ai",
    icon: (
      <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    ),
  },
  {
    id: "content",
    label: "Content Writer",
    href: "/dashboard/content",
    badge: "ai",
    icon: (
      <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    id: "reports",
    label: "Reports",
    href: "/dashboard/history",
    dividerBefore: true,
    icon: (
      <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M16 13H8M16 17H8" />
      </svg>
    ),
  },
  {
    id: "settings",
    label: "Settings",
    href: "/dashboard/settings",
    icon: (
      <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06" />
      </svg>
    ),
  },
];

// ── Sidebar ──────────────────────────────────────────────────────────

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { lastAudit } = useDashboard();
  const scores = lastAudit?.scores;
  const taskCount = lastAudit?.seo_tasks?.length ?? 0;

  function isActive(href: string) {
    return pathname === href;
  }

  function renderBadge(item: NavItem) {
    if (!item.badge) return null;

    if (item.badge === "score" && scores) {
      const s = scoreBadgeStyle(scores.overall);
      return (
        <span
          className="text-[10px] font-semibold px-[7px] py-[2px] rounded-lg font-mono"
          style={{ background: s.bg, color: s.color }}
        >
          {scores.overall}
        </span>
      );
    }

    if (item.badge === "count" && taskCount > 0) {
      return (
        <span className="text-[10px] font-semibold px-[7px] py-[2px] rounded-lg font-mono bg-rose-500/10 text-rose-400">
          {taskCount}
        </span>
      );
    }

    if (item.badge === "ai") {
      return (
        <span className="text-[9px] font-semibold px-[7px] py-[2px] rounded-lg uppercase tracking-wider bg-emerald-500/10 text-emerald-400">
          AI
        </span>
      );
    }

    return null;
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-[10px] px-[18px] py-[18px] pb-[14px] border-b border-white/6 shrink-0">
        <div className="w-[30px] h-[30px] rounded-[9px] bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0">
          <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <span className="font-display font-bold text-[15px] tracking-tight text-white">LocalRank</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-[10px] px-[10px] scrollbar-none">
        {NAV_ITEMS.map((item) => (
          <div key={item.id}>
            {item.dividerBefore && (
              <div className="h-px bg-white/6 mx-3 my-2" />
            )}
            <Link
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-[11px] px-3 py-[9px] rounded-[9px] text-[13px] mb-[2px] transition-all ${
                isActive(item.href)
                  ? "bg-emerald-500/8 text-emerald-300"
                  : "text-zinc-400 hover:bg-white/4 hover:text-white"
              }`}
            >
              <span className={`shrink-0 ${isActive(item.href) ? "opacity-100" : "opacity-50"}`}>
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {renderBadge(item)}
            </Link>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="shrink-0 border-t border-white/6 px-[10px] py-3">
        <div className="flex items-center gap-[10px] px-3 py-2 rounded-[9px] hover:bg-white/4 transition-all">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shrink-0">
            <span className="text-[11px] font-bold text-white">
              {session?.user?.email?.[0]?.toUpperCase() ?? "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-white truncate">
              {lastAudit?.business_name || session?.user?.email || "User"}
            </div>
            <div className="text-[10px] font-semibold text-emerald-400">Free Plan</div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sign out"
            className="shrink-0 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-[#0f0f12] border-r border-white/6 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={onClose}
          />
          <aside className="fixed left-0 top-0 bottom-0 w-72 bg-[#0f0f12] border-r border-white/6 z-50 md:hidden flex flex-col">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}

// ── Mobile hamburger button ──────────────────────────────────────────

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors"
      aria-label="Open menu"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );
}

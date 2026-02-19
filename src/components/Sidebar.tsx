"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

// ── Nav tree ─────────────────────────────────────────────────────────

interface NavLeaf   { label: string; href: string }
interface NavGroup  { label: string; icon: React.ReactNode; children: NavLeaf[] }
interface NavSingle { label: string; href: string; icon: React.ReactNode }
type NavItem = NavSingle | NavGroup;

function isGroup(item: NavItem): item is NavGroup {
  return "children" in item;
}

const NAV: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard/overview",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "Website SEO",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
      </svg>
    ),
    children: [
      { label: "Overall Audit",       href: "/dashboard/audit" },
      { label: "Keyword Research",    href: "/dashboard/keywords" },
      { label: "Keyword Gap",         href: "/dashboard/keyword-gap" },
      { label: "On-Page Optimizer",   href: "/dashboard/on-page" },
      { label: "Content Rewriter",    href: "/dashboard/content" },
      { label: "Blog Writer",         href: "/dashboard/blog" },
      { label: "Technical SEO",       href: "/dashboard/technical" },
    ],
  },
  {
    label: "Backlink & Links",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    children: [
      { label: "Backlink Profile",       href: "/dashboard/backlinks" },
      { label: "Link Building Strategy", href: "/dashboard/link-building" },
    ],
  },
  {
    label: "Local SEO",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    children: [
      { label: "GBP Audit",          href: "/dashboard/gbp" },
      { label: "Citation Builder",   href: "/dashboard/citations" },
      { label: "Local Rank Tracker", href: "/dashboard/rank-tracker" },
    ],
  },
  {
    label: "AI SEO",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    children: [
      { label: "AI Visibility Scan", href: "/dashboard/ai-seo" },
    ],
  },
  {
    label: "Reports",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    children: [
      { label: "Audit History", href: "/dashboard/history" },
      { label: "Export PDF",    href: "/dashboard/export" },
    ],
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

// ── Sidebar ───────────────────────────────────────────────────────────

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Which groups are expanded — default all open
  const groupDefaults = NAV.filter(isGroup).reduce<Record<string, boolean>>(
    (acc, g) => { acc[g.label] = true; return acc; },
    {}
  );
  const [open, setOpen] = useState<Record<string, boolean>>(groupDefaults);

  function toggle(label: string) {
    setOpen((prev) => ({ ...prev, [label]: !prev[label] }));
  }

  function isActive(href: string) {
    return pathname === href;
  }

  function isGroupActive(children: NavLeaf[]) {
    return children.some((c) => pathname === c.href);
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/5 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0">
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <span className="text-base font-bold text-white font-display">LocalRank</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {NAV.map((item) => {
          if (isGroup(item)) {
            const active = isGroupActive(item.children);
            return (
              <div key={item.label}>
                {/* Group header */}
                <button
                  onClick={() => toggle(item.label)}
                  className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase transition-colors ${
                    active ? "text-emerald-400" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  <svg
                    className={`w-3 h-3 transition-transform shrink-0 ${open[item.label] ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Children */}
                {open[item.label] && (
                  <div className="ml-3 pl-4 border-l border-white/5 mt-0.5 mb-1 space-y-0.5">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={onClose}
                        className={`block px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          isActive(child.href)
                            ? "bg-emerald-500/10 text-emerald-400 font-medium"
                            : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          // Single link
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      {session?.user && (
        <div className="shrink-0 border-t border-white/5 px-4 py-3 flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-emerald-400">
              {session.user.email?.[0]?.toUpperCase() ?? "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-zinc-300 truncate">{session.user.email}</p>
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
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-[#0f0f12] border-r border-white/5 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={onClose}
          />
          <aside className="fixed left-0 top-0 bottom-0 w-72 bg-[#0f0f12] border-r border-white/5 z-50 md:hidden flex flex-col">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}

// ── Mobile hamburger button ───────────────────────────────────────────

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

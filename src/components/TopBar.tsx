"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDashboard } from "@/components/DashboardContext";
import { useSession } from "next-auth/react";

export const PAGE_TITLES: Record<string, string> = {
  "/dashboard/overview": "Audit Report",
  "/dashboard/tasks": "SEO Tasks",
  "/dashboard/gbp": "GMB Optimization",
  "/dashboard/keywords": "Keyword Research",
  "/dashboard/backlinks": "Backlink Builder",
  "/dashboard/posts": "Post Creator",
  "/dashboard/content": "Content Writer",
  "/dashboard/history": "Reports",
  "/dashboard/settings": "Settings",
  "/dashboard/audit": "Run Audit",
  "/dashboard/on-page": "On-Page Optimizer",
  "/dashboard/technical": "Technical SEO",
  "/dashboard/citations": "Citation Builder",
  "/dashboard/rank-tracker": "Rank Tracker",
  "/dashboard/ai-seo": "AI Visibility Scan",
  "/dashboard/link-building": "Link Building",
  "/dashboard/export": "Export PDF",
  "/dashboard/blog": "Blog Writer",
  "/dashboard/keyword-gap": "Keyword Gap",
};

export function TopBar() {
  const pathname = usePathname();
  const { lastAudit } = useDashboard();
  const { data: session } = useSession();

  const pageTitle = PAGE_TITLES[pathname] ?? "Dashboard";
  const businessName = lastAudit?.business_name || session?.user?.email || "LocalRankr";

  const handleExportPdf = async () => {
    if (!lastAudit?.audit_id) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
    window.open(`${apiUrl}/audits/${lastAudit.audit_id}/export`, "_blank");
  };

  return (
    <div className="hidden md:flex sticky top-0 z-30 items-center justify-between px-7 py-3 border-b border-white/6 bg-[#09090b]/92 backdrop-blur-xl">
      <div className="flex items-center gap-[10px]">
        <h1 className="font-display font-semibold text-[15px] text-white">{businessName}</h1>
        <span className="text-zinc-600 text-sm">/</span>
        <span className="text-[13px] text-zinc-500">{pageTitle}</span>
      </div>

      <div className="flex gap-2">
        <Link
          href="/dashboard/audit"
          className="px-[14px] py-[7px] rounded-lg text-xs font-medium border border-white/6 text-zinc-400 hover:border-white/12 hover:text-white transition-all"
        >
          Re-run Audit
        </Link>
        {lastAudit && (
          <button
            onClick={handleExportPdf}
            className="px-[14px] py-[7px] rounded-lg text-xs font-medium bg-gradient-to-br from-emerald-600 to-emerald-500 text-white hover:-translate-y-px hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
          >
            Export PDF
          </button>
        )}
      </div>
    </div>
  );
}

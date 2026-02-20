"use client";

import { useDashboard } from "@/components/DashboardContext";
import { AuditForm } from "@/components/AuditForm";

export default function AuditPage() {
  const { setLastAudit } = useDashboard();
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold text-white font-display">Overall Audit</h1>
      <p className="text-sm text-zinc-400 mb-6">
        Full 11-agent audit — keyword research, on-page, technical, local SEO, backlinks, AI visibility and more.
      </p>
      <AuditForm onComplete={setLastAudit} embedded />
    </div>
  );
}

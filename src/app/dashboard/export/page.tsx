"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

function ExportContent() {
  const params       = useSearchParams();
  const auditId      = params.get("id");
  const { data: session } = useSession();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError]   = useState("");

  async function downloadPdf(id: string) {
    setStatus("loading");
    setError("");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
      const res = await fetch(`${apiUrl}/audits/${id}/export`, {
        method: "POST",
        headers: session?.accessToken
          ? { Authorization: `Bearer ${session.accessToken}` }
          : {},
      });
      if (!res.ok) throw new Error(`Export failed (${res.status})`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `localrank-audit-${id.slice(0, 8)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed");
      setStatus("error");
    }
  }

  useEffect(() => {
    if (auditId && session) downloadPdf(auditId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auditId, session]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">Export PDF</h1>
        <p className="text-sm text-zinc-400 mt-1">Download your audit report as a branded PDF.</p>
      </div>

      <div className="glass rounded-2xl p-10 text-center space-y-5">
        {status === "loading" && (
          <>
            <div className="w-12 h-12 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin mx-auto" />
            <p className="text-zinc-400">Generating your PDF report…</p>
          </>
        )}
        {status === "done" && (
          <>
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-zinc-300">PDF downloaded successfully.</p>
            <Link href="/dashboard/history" className="text-emerald-400 hover:text-emerald-300 text-sm">
              ← Back to history
            </Link>
          </>
        )}
        {status === "error" && (
          <p className="text-red-400 text-sm">{error}</p>
        )}
        {status === "idle" && !auditId && (
          <>
            <p className="text-zinc-400">Select an audit from your history to export.</p>
            <Link href="/dashboard/history" className="btn-primary inline-flex items-center gap-2 text-white font-semibold px-5 py-2.5 rounded-xl text-sm">
              View History
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function ExportPage() {
  return (
    <Suspense fallback={<div className="text-zinc-400 text-sm p-8">Loading…</div>}>
      <ExportContent />
    </Suspense>
  );
}

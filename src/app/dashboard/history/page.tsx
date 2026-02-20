"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

function ExportButton({ auditId, token }: { auditId: string; token?: string }) {
  const [busy, setBusy] = useState(false);

  async function handleExport() {
    setBusy(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
      const res = await fetch(`${apiUrl}/audits/${auditId}/export`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`Export failed (${res.status})`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `localrank-audit-${auditId.slice(0, 8)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("PDF export failed — please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={busy}
      className="text-xs text-emerald-400 hover:text-emerald-300 font-medium disabled:opacity-50"
    >
      {busy ? "Exporting…" : "Export PDF"}
    </button>
  );
}

interface AuditRow {
  id: string;
  keyword: string;
  target_url: string;
  location: string;
  status: string;
  created_at: string;
  execution_time: number | null;
  api_cost: number | null;
}

export default function HistoryPage() {
  const { data: session } = useSession();
  const [rows, setRows]   = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    async function load() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
        const res = await fetch(`${apiUrl}/audits?limit=50`, {
          headers: session?.accessToken
            ? { Authorization: `Bearer ${session.accessToken}` }
            : {},
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        setRows(data.audits ?? data ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load history");
      } finally {
        setLoading(false);
      }
    }
    if (session) load();
  }, [session]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">Audit History</h1>
          <p className="text-sm text-zinc-400 mt-1">All past audits — click any row to view the full report.</p>
        </div>
        <Link href="/dashboard/audit" className="btn-primary text-white font-semibold px-4 py-2 rounded-xl text-sm">
          + New Audit
        </Link>
      </div>

      {loading && (
        <div className="glass rounded-2xl p-8 text-center text-zinc-400 text-sm">Loading audit history…</div>
      )}

      {error && (
        <div className="glass rounded-2xl p-6 text-red-400 text-sm">{error}</div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="glass rounded-2xl p-10 text-center space-y-4">
          <p className="text-zinc-400">No audits yet.</p>
          <Link href="/dashboard/audit" className="btn-primary inline-flex items-center gap-2 text-white font-semibold px-5 py-2.5 rounded-xl text-sm">
            Run Your First Audit
          </Link>
        </div>
      )}

      {rows.length > 0 && (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-xs text-zinc-500 uppercase tracking-wider">
                <th className="px-5 py-3 font-medium">Keyword</th>
                <th className="px-5 py-3 font-medium hidden sm:table-cell">URL</th>
                <th className="px-5 py-3 font-medium hidden md:table-cell">Location</th>
                <th className="px-5 py-3 font-medium hidden lg:table-cell">Duration</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.id}
                  className={`border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors ${i % 2 === 0 ? "" : "bg-white/1"}`}
                >
                  <td className="px-5 py-3 text-zinc-200 font-medium">{row.keyword}</td>
                  <td className="px-5 py-3 text-zinc-400 hidden sm:table-cell">
                    <a
                      href={row.target_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-zinc-200 transition-colors truncate max-w-48 block"
                    >
                      {row.target_url.replace(/^https?:\/\//, "")}
                    </a>
                  </td>
                  <td className="px-5 py-3 text-zinc-400 hidden md:table-cell">{row.location}</td>
                  <td className="px-5 py-3 text-zinc-500 hidden lg:table-cell font-mono text-xs">
                    {row.execution_time != null ? `${row.execution_time.toFixed(1)}s` : "—"}
                  </td>
                  <td className="px-5 py-3 text-zinc-500 text-xs font-mono">
                    {new Date(row.created_at).toLocaleDateString("en-CA", {
                      year: "numeric", month: "short", day: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <ExportButton auditId={row.id} token={session?.accessToken} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

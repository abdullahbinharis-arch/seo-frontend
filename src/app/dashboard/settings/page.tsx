"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [currentPw,  setCurrentPw]  = useState("");
  const [newPw,      setNewPw]      = useState("");
  const [confirmPw,  setConfirmPw]  = useState("");
  const [pwStatus,   setPwStatus]   = useState<"idle" | "loading" | "done" | "error">("idle");
  const [pwError,    setPwError]    = useState("");

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 text-sm transition-all";

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (newPw !== confirmPw) { setPwError("Passwords don't match"); return; }
    if (newPw.length < 8)    { setPwError("Password must be at least 8 characters"); return; }

    setPwStatus("loading");
    setPwError("");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
      const res = await fetch(`${apiUrl}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
        },
        body: JSON.stringify({ current_password: currentPw, new_password: newPw }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail ?? `Error ${res.status}`);
      }
      setPwStatus("done");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "Password change failed");
      setPwStatus("error");
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">Settings</h1>
        <p className="text-sm text-zinc-400 mt-1">Manage your account preferences.</p>
      </div>

      {/* Account info */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-zinc-300 mb-4">Account</h2>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <dt className="text-zinc-500">Email</dt>
            <dd className="text-zinc-200 font-medium">{session?.user?.email ?? "—"}</dd>
          </div>
          <div className="flex justify-between items-center">
            <dt className="text-zinc-500">Plan</dt>
            <dd>
              <span className="bg-emerald-500/15 text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded-full">Free</span>
            </dd>
          </div>
        </dl>
      </div>

      {/* Change password */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-zinc-300 mb-4">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-zinc-400">Current password</label>
            <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} required className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-zinc-400">New password</label>
            <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} required minLength={8} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-zinc-400">Confirm new password</label>
            <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} required className={inputClass} />
          </div>

          {pwError && <p className="text-red-400 text-sm">{pwError}</p>}
          {pwStatus === "done" && <p className="text-emerald-400 text-sm">Password updated successfully.</p>}

          <button
            type="submit"
            disabled={pwStatus === "loading"}
            className="btn-primary text-white font-semibold px-5 py-2.5 rounded-xl text-sm disabled:opacity-60"
          >
            {pwStatus === "loading" ? "Updating…" : "Update Password"}
          </button>
        </form>
      </div>

      {/* Danger zone */}
      <div className="glass rounded-2xl p-6 border border-red-500/10">
        <h2 className="text-sm font-semibold text-red-400 mb-4">Sign Out</h2>
        <p className="text-sm text-zinc-400 mb-4">You&apos;ll be redirected to the login page.</p>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="btn-secondary text-red-400 border-red-500/20 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-red-500/10 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

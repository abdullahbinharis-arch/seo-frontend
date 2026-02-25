"use client";

import { useState } from "react";
import { useDashboard } from "@/components/DashboardContext";
import { GmbToolView } from "@/components/GmbPage";
import { EmptyState } from "@/components/dashboard/EmptyState";

const PLATFORMS = [
  { name: "Google", icon: "G", status: "connected" as const },
  { name: "Facebook", icon: "F", status: "coming_soon" as const },
  { name: "Instagram", icon: "I", status: "coming_soon" as const },
  { name: "Yelp", icon: "Y", status: "coming_soon" as const },
  { name: "Bing Places", icon: "B", status: "coming_soon" as const },
  { name: "Apple Maps", icon: "A", status: "coming_soon" as const },
];

export default function GbpPage() {
  const { lastAudit } = useDashboard();
  const gmb = lastAudit?.gmb_data;

  // Form state — pre-fill from audit NAP data
  const nap = gmb?.nap;
  const [businessName, setBusinessName] = useState(nap?.name ?? lastAudit?.business_name ?? "");
  const [address, setAddress] = useState(nap?.address ?? "");
  const [phone, setPhone] = useState(nap?.phone ?? "");
  const [hours, setHours] = useState("");
  const [categories, setCategories] = useState(nap?.category ?? lastAudit?.business_type ?? "");
  const [description, setDescription] = useState("");

  if (!lastAudit) {
    return (
      <EmptyState
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        }
        title="No GBP Data Yet"
        description="Run your first audit to see your <strong>Google Business Profile score</strong>, NAP consistency, citation status, review insights, and a complete optimization checklist."
        previewLabels={["GBP Score", "Reviews", "Citations"]}
        note="Takes ~60 seconds · No credit card required"
      />
    );
  }

  const inputCls = "w-full bg-white/[0.03] border border-white/6 rounded-[10px] px-3.5 py-2.5 text-[13px] text-white placeholder:text-white focus:outline-none focus:border-emerald-500/40 focus:bg-emerald-500/[0.02] transition-all";
  const labelCls = "text-[10px] uppercase tracking-wider text-white block mb-1.5";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">GBP Audit & Edit</h1>
        <p className="text-sm text-white mt-1">
          Google Business Profile completeness audit, map pack status, review strategy, and profile editing.
        </p>
      </div>

      {/* Business Edit Form */}
      <div className="bg-surface-2 border border-white/6 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/6">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="text-[13px] font-semibold font-display text-white">Business Information</span>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Business Name</label>
              <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Your Business Name" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Phone Number</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 123-4567" className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Address</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St, Toronto, ON" className={inputCls} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Categories</label>
              <input type="text" value={categories} onChange={(e) => setCategories(e.target.value)} placeholder="e.g. Plumber, Emergency Plumbing" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Business Hours</label>
              <input type="text" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="Mon-Fri 9am-5pm" className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your business..." rows={3} className={`${inputCls} resize-none`} />
          </div>
        </div>
      </div>

      {/* Platform Sync */}
      <div className="bg-surface-2 border border-white/6 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/6">
          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
          <span className="text-[13px] font-semibold font-display text-white">Sync Across Platforms</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PLATFORMS.map((p) => (
              <div key={p.name} className="bg-white/[0.02] border border-white/6 rounded-xl p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-[13px] font-bold text-white shrink-0">
                  {p.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-medium text-white">{p.name}</div>
                  {p.status === "connected" ? (
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] text-emerald-400">Connected</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-white/40">Coming Soon</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Existing GMB Tool View */}
      {gmb && <GmbToolView />}
    </div>
  );
}

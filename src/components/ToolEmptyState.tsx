"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

interface PreviewItem {
  label: string;
}

interface ToolEmptyStateProps {
  icon: ReactNode;
  title: string;
  /** Supports HTML-like emphasis via <strong> tags — use dangerouslySetInnerHTML */
  description: string;
  previewLabels: string[];
  note: string;
}

export function ToolEmptyState({
  icon,
  title,
  description,
  previewLabels,
  note,
}: ToolEmptyStateProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-10 max-w-[560px] mx-auto mt-10">
      {/* Icon wrapper with radial glow */}
      <div className="relative w-20 h-20 rounded-[20px] bg-emerald-500/[0.06] border border-emerald-500/10 flex items-center justify-center mb-6">
        <div className="absolute -inset-2 rounded-[28px] bg-[radial-gradient(circle,rgba(16,185,129,0.04),transparent_70%)]" />
        <span className="relative text-emerald-300/70 [&>svg]:w-9 [&>svg]:h-9">
          {icon}
        </span>
      </div>

      {/* Title */}
      <h2 className="font-display font-bold text-xl text-white mb-2">{title}</h2>

      {/* Description with <strong> support */}
      <p
        className="text-[13px] text-zinc-600 leading-[1.7] mb-6 max-w-[400px] [&>strong]:text-zinc-400"
        dangerouslySetInnerHTML={{ __html: description }}
      />

      {/* Preview grid — 3 cols (2 on tiny screens) */}
      <div className="grid grid-cols-3 max-[480px]:grid-cols-2 gap-2 mb-7 w-full max-w-[440px]">
        {previewLabels.map((label) => (
          <div
            key={label}
            className="bg-white/[0.02] border border-white/6 rounded-lg px-3 py-2.5 text-left"
          >
            <div className="text-[9px] uppercase tracking-wider text-zinc-600 mb-0.5">
              {label}
            </div>
            {/* Placeholder bar */}
            <div className="h-4 w-[60%] bg-white/[0.04] rounded" />
          </div>
        ))}
      </div>

      {/* CTA button */}
      <button
        onClick={() => router.push("/dashboard/audit")}
        className="btn-primary text-white font-semibold px-7 py-2.5 rounded-xl text-sm flex items-center gap-2"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Run Your First Audit
      </button>

      {/* Bottom note */}
      <div className="flex items-center gap-1.5 mt-4">
        <span className="w-[5px] h-[5px] rounded-full bg-emerald-500 opacity-50" />
        <span className="text-[11px] text-zinc-700">{note}</span>
      </div>
    </div>
  );
}

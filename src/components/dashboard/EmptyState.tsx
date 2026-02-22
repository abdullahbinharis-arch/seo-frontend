"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  /** Supports <strong> tags via dangerouslySetInnerHTML */
  description: string;
  previewLabels: string[];
  note: string;
}

export function EmptyState({
  icon,
  title,
  description,
  previewLabels,
  note,
}: EmptyStateProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center text-center px-10 max-[480px]:px-5 max-w-[560px] mx-auto" style={{ paddingTop: 80, paddingBottom: 80, marginTop: 40 }}>
      {/* Icon wrapper — 80px, rounded-[20px], emerald glow */}
      <div className="relative w-20 h-20 rounded-[20px] bg-emerald-500/[0.06] border border-emerald-500/10 flex items-center justify-center mb-6">
        <div className="absolute -inset-2 rounded-[28px] bg-[radial-gradient(circle,rgba(16,185,129,0.04),transparent_70%)]" />
        <span className="relative text-emerald-300/70 [&>svg]:w-9 [&>svg]:h-9">
          {icon}
        </span>
      </div>

      {/* Title — Outfit 700, 20px */}
      <h2 className="font-display font-bold text-xl text-white mb-2">{title}</h2>

      {/* Description — 13px, #52525b, <strong> → #a1a1aa */}
      <p
        className="text-[13px] text-zinc-600 leading-[1.7] mb-6 max-w-[400px] [&_strong]:text-zinc-400"
        dangerouslySetInnerHTML={{ __html: description }}
      />

      {/* Preview grid — 3 cols, 2 on mobile */}
      <div className="grid grid-cols-3 max-[480px]:grid-cols-2 gap-2 mb-7 w-full max-w-[440px]">
        {previewLabels.map((label) => (
          <div
            key={label}
            className="bg-white/[0.02] border border-white/6 rounded-lg px-3 py-2.5 text-left"
          >
            <div className="text-[9px] uppercase tracking-[0.05em] text-zinc-600 mb-0.5">
              {label}
            </div>
            {/* Placeholder bar — matches .preview-item-val.placeholder */}
            <div className="h-4 w-[60%] bg-white/[0.04] rounded" />
          </div>
        ))}
      </div>

      {/* CTA button — green gradient, navigates to Audit Report */}
      <button
        onClick={() => router.push("/dashboard/overview")}
        className="bg-gradient-to-br from-emerald-600 to-emerald-500 text-white font-medium px-7 py-2.5 rounded-lg text-sm hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(16,185,129,0.25)] transition-all cursor-pointer border-none"
      >
        ⚡ Run Your First Audit
      </button>

      {/* Bottom note — green dot + muted text */}
      <div className="flex items-center gap-1.5 mt-4">
        <span className="w-[5px] h-[5px] rounded-full bg-emerald-500 opacity-50" />
        <span className="text-[11px] text-[#3f3f46]">{note}</span>
      </div>
    </div>
  );
}

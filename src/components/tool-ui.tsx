"use client";

import { type ReactNode, useState } from "react";

/* ── StatRow ─────────────────────────────────────────────── */
export function StatRow({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-5">
      {children}
    </div>
  );
}

/* ── StatBox ─────────────────────────────────────────────── */
interface StatBoxProps {
  label: string;
  value: string | number;
  suffix?: string;
  note?: string;
  color?: string;
  progress?: number;
  progressColor?: string;
}

export function StatBox({
  label,
  value,
  suffix,
  note,
  color,
  progress,
  progressColor,
}: StatBoxProps) {
  return (
    <div className="bg-surface-2 border border-white/6 rounded-[10px] p-3.5">
      <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
        {label}
      </div>
      <div className="font-display font-bold text-2xl" style={color ? { color } : undefined}>
        {value}
        {suffix && (
          <span className="text-sm font-normal text-zinc-500 ml-0.5">{suffix}</span>
        )}
      </div>
      {note && <div className="text-[10px] text-zinc-500 mt-0.5">{note}</div>}
      {progress !== undefined && (
        <div className="mt-2 h-1 rounded-full bg-white/6 overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(100, Math.max(0, progress))}%`,
              backgroundColor: progressColor ?? "#f59e0b",
            }}
          />
        </div>
      )}
    </div>
  );
}

/* ── Card ────────────────────────────────────────────────── */
interface CardProps {
  title: string;
  dotColor?: string;
  meta?: string;
  children: ReactNode;
  noPadding?: boolean;
}

export function Card({ title, dotColor, meta, children, noPadding }: CardProps) {
  return (
    <div className="bg-surface-2 border border-white/6 rounded-[14px] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/6">
        <div className="flex items-center gap-2">
          {dotColor && (
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: dotColor }}
            />
          )}
          <span className="text-[13px] font-semibold font-display text-white">
            {title}
          </span>
        </div>
        {meta && (
          <span className="text-[10px] text-zinc-500">{meta}</span>
        )}
      </div>
      <div className={noPadding ? "" : "p-4"}>{children}</div>
    </div>
  );
}

/* ── DataTable ───────────────────────────────────────────── */
export interface Column {
  key: string;
  label: string;
  mono?: boolean;
  align?: "left" | "center" | "right";
}

interface DataTableProps {
  columns: Column[];
  rows: Record<string, ReactNode>[];
  highlightRow?: number;
}

export function DataTable({ columns, rows, highlightRow }: DataTableProps) {
  if (rows.length === 0) {
    return (
      <p className="text-[11px] text-zinc-600 py-4 text-center">No data available</p>
    );
  }
  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <table className="w-full border-collapse text-[12px]">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium text-left px-2.5 py-2 border-b border-white/6"
                style={col.align ? { textAlign: col.align } : undefined}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className={`border-b border-white/[0.03] hover:bg-white/[0.015] transition-colors ${
                highlightRow === i ? "bg-emerald-500/[0.04]" : ""
              }`}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-2.5 py-2.5 ${
                    col.mono ? "font-mono text-[11px]" : ""
                  }`}
                  style={col.align ? { textAlign: col.align } : undefined}
                >
                  {row[col.key] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Tag ─────────────────────────────────────────────────── */
const TAG_STYLES: Record<string, string> = {
  high: "bg-rose-500/15 text-rose-400",
  med: "bg-amber-500/15 text-amber-400",
  low: "bg-emerald-500/15 text-emerald-400",
  found: "bg-emerald-500/15 text-emerald-400",
  missing: "bg-rose-500/15 text-rose-400",
  info: "bg-blue-500/15 text-blue-400",
};

export function Tag({
  variant,
  children,
}: {
  variant: "high" | "med" | "low" | "found" | "missing" | "info";
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-block text-[9px] font-medium uppercase tracking-wide px-[7px] py-[2px] rounded-[5px] ${
        TAG_STYLES[variant] ?? TAG_STYLES.info
      }`}
    >
      {children}
    </span>
  );
}

/* ── CheckItem ───────────────────────────────────────────── */
interface CheckItemProps {
  done: boolean;
  label: string;
  tag?: { variant: "high" | "med" | "low" | "found" | "missing" | "info"; text: string };
  muted?: boolean;
}

export function CheckItem({ done, label, tag, muted }: CheckItemProps) {
  return (
    <div className="flex items-center gap-2.5 py-2 border-b border-white/[0.03] last:border-0">
      <span
        className={`w-[18px] h-[18px] rounded-[5px] flex items-center justify-center shrink-0 text-[10px] ${
          done
            ? "bg-emerald-500 text-white"
            : "bg-rose-500/15 border border-rose-500/30"
        }`}
      >
        {done ? "✓" : ""}
      </span>
      <span
        className={`text-[12px] flex-1 ${muted ? "text-zinc-500" : "text-zinc-300"}`}
      >
        {label}
      </span>
      {tag && <Tag variant={tag.variant}>{tag.text}</Tag>}
    </div>
  );
}

/* ── ContentCard ─────────────────────────────────────────── */
interface ContentCardProps {
  title: string;
  description?: string;
  tag?: ReactNode;
  meta?: ReactNode;
  children?: ReactNode;
}

export function ContentCard({ title, description, tag, meta, children }: ContentCardProps) {
  return (
    <div className="bg-surface-1 border border-white/6 rounded-xl p-4 hover:border-white/12 hover:bg-surface-2 transition-colors">
      <div className="flex items-start justify-between mb-1.5">
        <h4 className="text-[13px] font-semibold font-display text-white">{title}</h4>
        {tag}
      </div>
      {description && (
        <p className="text-[11px] text-zinc-500 leading-relaxed mb-2">{description}</p>
      )}
      {meta && <div className="flex items-center gap-1.5">{meta}</div>}
      {children}
    </div>
  );
}

/* ── SectionHead ─────────────────────────────────────────── */
interface SectionHeadProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function SectionHead({ title, subtitle, action }: SectionHeadProps) {
  return (
    <div className="flex items-end justify-between mb-3 mt-6 first:mt-0">
      <div>
        <h3 className="text-[15px] font-semibold font-display text-white">{title}</h3>
        {subtitle && (
          <p className="text-[11px] text-zinc-500 mt-0.5">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

/* ── Btn (small reusable buttons) ────────────────────────── */
export function BtnPrimary({
  children,
  onClick,
  disabled,
  small,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  small?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg font-medium bg-gradient-to-br from-emerald-600 to-emerald-500 text-white hover:-translate-y-px hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none ${
        small ? "text-[11px] px-2.5 py-[5px]" : "text-[12px] px-3.5 py-[7px]"
      }`}
    >
      {children}
    </button>
  );
}

export function BtnGhost({
  children,
  onClick,
  disabled,
  small,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  small?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg font-medium border border-white/10 text-zinc-400 hover:border-white/20 hover:text-white transition-all disabled:opacity-50 ${
        small ? "text-[11px] px-2.5 py-[5px]" : "text-[12px] px-3.5 py-[7px]"
      }`}
    >
      {children}
    </button>
  );
}

/* ── CopyBtn ─────────────────────────────────────────────── */
export function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="text-[10px] text-zinc-500 hover:text-emerald-400 transition-colors"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

/* ── ExpandableContent ───────────────────────────────────── */
export function ExpandableContent({
  content,
  visible,
}: {
  content: string;
  visible: boolean;
}) {
  if (!visible) return null;
  return (
    <div className="mt-3 p-3 bg-surface-1 border border-white/6 rounded-lg">
      <div className="text-[12px] text-zinc-300 whitespace-pre-wrap leading-relaxed">
        {content}
      </div>
      <div className="mt-2 flex justify-end">
        <CopyBtn text={content} />
      </div>
    </div>
  );
}

/* ── EmptyState ──────────────────────────────────────────── */
export function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12">
      <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/6 flex items-center justify-center mx-auto mb-3">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      </div>
      <p className="text-[13px] text-zinc-500">{message}</p>
    </div>
  );
}

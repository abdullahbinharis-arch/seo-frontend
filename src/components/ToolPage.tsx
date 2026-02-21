"use client";

interface ToolPageProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  features: string[];
  auditContext?: string;
  children?: React.ReactNode;
}

export function ToolPage({
  icon,
  iconBg,
  title,
  description,
  features,
  auditContext,
  children,
}: ToolPageProps) {
  return (
    <div className="py-10 text-center">
      {/* Icon */}
      <div
        className="w-16 h-16 rounded-[18px] flex items-center justify-center mx-auto mb-4"
        style={{ background: iconBg }}
      >
        {icon}
      </div>

      {/* Title + description */}
      <h2 className="font-display font-semibold text-xl text-white mb-1.5">{title}</h2>
      <p className="text-[13px] text-zinc-500 max-w-[420px] mx-auto leading-relaxed mb-5">
        {description}
      </p>

      {/* Feature tags */}
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {features.map((f) => (
          <span
            key={f}
            className="text-[11px] px-3 py-[5px] rounded-lg bg-white/4 text-zinc-400"
          >
            {f}
          </span>
        ))}
      </div>

      {/* CTA slot */}
      {children}

      {/* Audit context */}
      {auditContext && (
        <p className="text-[11px] text-zinc-600 mt-4">{auditContext}</p>
      )}
    </div>
  );
}

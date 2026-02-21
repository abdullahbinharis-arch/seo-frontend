"use client";

export function ProgressIndicator({
  stage,
  progress,
}: {
  stage: string;
  progress: number;
}) {
  return (
    <div className="space-y-3">
      {/* Bar */}
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Stage label */}
      <div className="flex items-center gap-2.5 text-[#6ee7b7]">
        <span className="inline-flex">
          <svg
            className="w-4 h-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        </span>
        <span className="text-sm font-medium">{stage || "Starting audit…"}</span>
        <span className="ml-auto text-xs text-zinc-500 tabular-nums">{progress}%</span>
      </div>

      {/* Steps */}
      <div className="flex gap-1.5 pt-1">
        {[
          { label: "Research", at: 0 },
          { label: "SEO Analysis", at: 20 },
          { label: "Backlinks & Links", at: 40 },
          { label: "Local & AI", at: 60 },
          { label: "Finalizing", at: 80 },
        ].map((step) => {
          const active = progress >= step.at;
          return (
            <div
              key={step.label}
              className={`flex-1 flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
                active
                  ? "bg-emerald-500/10 text-[#6ee7b7] font-medium border border-emerald-500/20"
                  : "bg-white/5 text-zinc-500 border border-white/5"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  active ? "bg-emerald-400" : "bg-zinc-600"
                }`}
              />
              {step.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

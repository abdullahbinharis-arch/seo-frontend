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
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Stage label */}
      <div className="flex items-center gap-2.5 text-blue-600">
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
        <span className="ml-auto text-xs text-slate-400 tabular-nums">{progress}%</span>
      </div>

      {/* Steps */}
      <div className="flex gap-1.5 pt-1">
        {["Keyword Research", "On-Page SEO", "Local SEO"].map((step, i) => {
          const stepProgress = [0, 35, 65];
          const active = progress >= stepProgress[i];
          return (
            <div
              key={step}
              className={`flex-1 flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
                active
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  active ? "bg-blue-500" : "bg-slate-300"
                }`}
              />
              {step}
            </div>
          );
        })}
      </div>
    </div>
  );
}

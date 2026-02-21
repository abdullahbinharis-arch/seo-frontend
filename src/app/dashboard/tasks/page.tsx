"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useDashboard } from "@/components/DashboardContext";
import type { SeoTask } from "@/types";

// ── Helpers ──────────────────────────────────────────────────────────

function pillarLabel(p: string): string {
  switch (p) {
    case "website_seo": return "Website SEO";
    case "backlinks":   return "Backlinks";
    case "local_seo":   return "Local SEO";
    case "ai_seo":      return "AI SEO";
    default:            return p;
  }
}

// ── SEO Tasks Page ───────────────────────────────────────────────────

export default function TasksPage() {
  const { lastAudit } = useDashboard();
  const { data: session } = useSession();
  const rawTasks = lastAudit?.seo_tasks ?? [];

  // Local task state so we can toggle without waiting for backend
  const [tasks, setTasks] = useState<SeoTask[]>(rawTasks);
  // Sync if lastAudit changes
  const prevRef = useState(rawTasks)[0];
  if (rawTasks !== prevRef && rawTasks.length > 0 && tasks.length === 0) {
    setTasks(rawTasks);
  }

  const completed = tasks.filter((t) => t.status === "completed").length;
  const total = tasks.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const toggleTask = useCallback(
    async (taskId: string) => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: t.status === "completed" ? "pending" : "completed",
                completed_at:
                  t.status === "completed" ? undefined : new Date().toISOString(),
              }
            : t
        )
      );

      // Fire-and-forget PATCH to backend
      if (lastAudit?.audit_id) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
        const current = tasks.find((t) => t.id === taskId);
        const newStatus = current?.status === "completed" ? "pending" : "completed";
        try {
          await fetch(
            `${apiUrl}/audits/${lastAudit.audit_id}/tasks/${taskId}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                ...(session?.accessToken
                  ? { Authorization: `Bearer ${session.accessToken}` }
                  : {}),
              },
              body: JSON.stringify({ status: newStatus }),
            }
          );
        } catch {
          // Silently fail — local state already updated
        }
      }
    },
    [lastAudit?.audit_id, session?.accessToken, tasks]
  );

  // Group by priority
  const high = tasks.filter((t) => t.priority === "high");
  const medium = tasks.filter((t) => t.priority === "medium");
  const low = tasks.filter((t) => t.priority === "low");

  if (total === 0) {
    return (
      <div className="py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/4 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 20V10M18 20V4M6 20v-4" />
          </svg>
        </div>
        <h2 className="font-display font-semibold text-lg text-white mb-2">No tasks yet</h2>
        <p className="text-sm text-zinc-500 max-w-sm mx-auto">
          Run an audit to generate your personalized SEO task list with prioritized action items.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Progress bar */}
      <div className="mb-5">
        <div className="flex justify-between text-[11px] text-zinc-500 mb-1.5">
          <span>SEO Progress</span>
          <span>
            {completed} of {total} tasks completed
          </span>
        </div>
        <div className="h-1.5 bg-white/6 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Task groups */}
      {high.length > 0 && (
        <TaskGroup
          title="High Priority"
          titleColor="#fb7185"
          count={high.length}
          tasks={high}
          onToggle={toggleTask}
        />
      )}
      {medium.length > 0 && (
        <TaskGroup
          title="Medium Priority"
          titleColor="#fbbf24"
          count={medium.length}
          tasks={medium}
          onToggle={toggleTask}
        />
      )}
      {low.length > 0 && (
        <TaskGroup
          title="Growth"
          titleColor="#6ee7b7"
          count={low.length}
          tasks={low}
          onToggle={toggleTask}
        />
      )}
    </div>
  );
}

// ── Task group ───────────────────────────────────────────────────────

function TaskGroup({
  title,
  titleColor,
  count,
  tasks,
  onToggle,
}: {
  title: string;
  titleColor: string;
  count: number;
  tasks: SeoTask[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2.5">
        <div className="font-display font-semibold text-[13px]" style={{ color: titleColor }}>
          {title}
        </div>
        <span className="text-[10px] text-zinc-500 bg-white/4 px-2 py-0.5 rounded-md">
          {count} tasks
        </span>
      </div>

      <div className="space-y-1">
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} onToggle={onToggle} />
        ))}
      </div>
    </div>
  );
}

// ── Task item ────────────────────────────────────────────────────────

function TaskItem({
  task,
  onToggle,
}: {
  task: SeoTask;
  onToggle: (id: string) => void;
}) {
  const done = task.status === "completed";

  return (
    <div
      className="flex items-start gap-[11px] px-[14px] py-3 bg-zinc-900 border border-white/6 rounded-[10px] hover:border-white/12 transition-all cursor-pointer"
      onClick={() => onToggle(task.id)}
    >
      {/* Checkbox */}
      <div
        className={`w-[18px] h-[18px] rounded-[5px] shrink-0 mt-0.5 flex items-center justify-center transition-all border-[1.5px] ${
          done
            ? "bg-emerald-500 border-emerald-500"
            : "border-white/15 hover:border-emerald-500"
        }`}
      >
        {done && (
          <svg className="w-[10px] h-[10px]" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className={`text-[12.5px] font-medium leading-snug ${done ? "line-through text-zinc-500" : "text-white"}`}>
          {task.title}
        </div>
        <div className="text-[11px] text-zinc-500 mt-0.5">
          {pillarLabel(task.pillar)}
          {task.time_estimate ? ` · ${task.time_estimate}` : ""}
          {task.impact ? ` · ${task.impact}` : ""}
          {done && task.completed_at
            ? ` · Completed ${new Date(task.completed_at).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}`
            : ""}
        </div>
        {!done && task.priority && (
          <div className="mt-1.5">
            <span
              className="text-[9px] font-semibold px-[7px] py-[2px] rounded-[5px] uppercase tracking-wider"
              style={
                task.priority === "high"
                  ? { background: "rgba(244,63,94,0.1)", color: "#fb7185" }
                  : task.priority === "medium"
                  ? { background: "rgba(245,158,11,0.1)", color: "#fbbf24" }
                  : { background: "rgba(16,185,129,0.1)", color: "#6ee7b7" }
              }
            >
              {task.priority === "high" ? "High" : task.priority === "medium" ? "Medium" : "Growth"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

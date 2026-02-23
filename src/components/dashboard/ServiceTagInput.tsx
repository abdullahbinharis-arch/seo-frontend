"use client";

import { useState, useRef } from "react";
import { SERVICE_SUGGESTIONS, DEFAULT_SUGGESTIONS } from "@/data/categories";

interface ServiceTagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
  maxTags?: number;
  className?: string;
  category?: string;
}

export function ServiceTagInput({
  tags,
  onChange,
  disabled,
  placeholder = "Type a service + Enter",
  maxTags = 15,
  className,
  category,
}: ServiceTagInputProps) {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const atMax = tags.length >= maxTags;

  const suggestions = category
    ? SERVICE_SUGGESTIONS[category] ?? DEFAULT_SUGGESTIONS
    : DEFAULT_SUGGESTIONS;

  function addTag(raw: string) {
    const tag = raw.trim();
    if (!tag) return;
    if (tags.some((t) => t.toLowerCase() === tag.toLowerCase())) return;
    if (tags.length >= maxTags) return;
    onChange([...tags, tag]);
    setInput("");
  }

  function removeTag(idx: number) {
    onChange(tags.filter((_, i) => i !== idx));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData("text");
    if (text.includes(",")) {
      e.preventDefault();
      text.split(",").forEach((s) => addTag(s));
    }
  }

  const isEmptyStyle = className?.includes("empty-field");

  const containerClass = isEmptyStyle
    ? `empty-field flex flex-wrap items-center gap-1.5 min-h-[44px] !py-2 !px-3 cursor-text ${focused ? "ring-2 ring-emerald-500/70 border-emerald-500/70" : ""}`
    : `w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white transition-all flex flex-wrap items-center gap-1.5 min-h-[44px] cursor-text ${
        focused
          ? "ring-2 ring-emerald-500/70 border-emerald-500/70"
          : ""
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`;

  return (
    <div>
      <div
        className={containerClass}
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag, i) => (
          <span
            key={`${tag}-${i}`}
            className="inline-flex items-center gap-1 shrink-0 animate-[tagIn_0.15s_ease]"
            style={{
              padding: "3px 8px 3px 9px",
              borderRadius: 6,
              background: "rgba(16, 185, 129, 0.10)",
              border: "1px solid rgba(16, 185, 129, 0.15)",
              fontSize: 12,
              color: "#6ee7b7",
              fontWeight: 500,
              whiteSpace: "nowrap",
            }}
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeTag(i); }}
                className="flex items-center justify-center transition-colors hover:bg-rose-500/20 rounded"
                style={{ width: 14, height: 14, borderRadius: 3 }}
              >
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled || atMax}
          placeholder={atMax ? `Max ${maxTags} services` : (tags.length === 0 ? placeholder : "")}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-white placeholder-zinc-500 disabled:cursor-not-allowed"
        />
      </div>

      {/* Hint */}
      <div className="mt-1 flex items-center gap-1" style={{ fontSize: 10, color: "#3f3f46" }}>
        Press{" "}
        <kbd style={{
          display: "inline-flex", alignItems: "center", padding: "1px 5px",
          borderRadius: 3, background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.06)",
          fontFamily: "monospace", fontSize: 9, color: "#52525b",
        }}>Enter</kbd>
        {" "}or{" "}
        <kbd style={{
          display: "inline-flex", alignItems: "center", padding: "1px 5px",
          borderRadius: 3, background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.06)",
          fontFamily: "monospace", fontSize: 9, color: "#52525b",
        }}>,</kbd>
        {" "}to add &nbsp;&middot;&nbsp; click &times; to remove
      </div>

      {/* Suggestion pills */}
      {suggestions.length > 0 && !disabled && (
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {suggestions.map((s) => {
            const used = tags.some((t) => t.toLowerCase() === s.toLowerCase());
            return (
              <button
                key={s}
                type="button"
                onClick={() => !used && addTag(s)}
                disabled={used || atMax}
                className="transition-colors"
                style={{
                  padding: "3px 9px",
                  borderRadius: 6,
                  fontSize: 11,
                  background: used ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${used ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.06)"}`,
                  color: used ? "#27272a" : "#52525b",
                  cursor: used || atMax ? "default" : "pointer",
                  opacity: used ? 0.3 : 1,
                  pointerEvents: used ? "none" : "auto",
                }}
                onMouseEnter={(e) => {
                  if (!used) {
                    e.currentTarget.style.borderColor = "rgba(16,185,129,0.25)";
                    e.currentTarget.style.color = "#6ee7b7";
                    e.currentTarget.style.background = "rgba(16,185,129,0.04)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!used) {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.color = "#52525b";
                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  }
                }}
              >
                {s}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

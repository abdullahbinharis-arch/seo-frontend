"use client";

import { useState, useRef } from "react";

interface ServiceTagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
  maxTags?: number;
  className?: string;
}

export function ServiceTagInput({
  tags,
  onChange,
  disabled,
  placeholder = "e.g. Kitchen Renovation",
  maxTags = 15,
  className,
}: ServiceTagInputProps) {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const atMax = tags.length >= maxTags;

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

  // Build focus ring styles
  const focusStyles = focused
    ? "border-color: rgba(16,185,129,0.4); background: rgba(16,185,129,0.025); box-shadow: 0 0 0 3px rgba(16,185,129,0.06);"
    : "";

  return (
    <div
      className={isEmptyStyle ? "empty-field cursor-text" : `w-full rounded-[10px] bg-[rgba(255,255,255,0.025)] border border-[rgba(255,255,255,0.055)] text-white transition-all cursor-text ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 6,
        minHeight: tags.length > 0 ? undefined : undefined,
        ...(focused && !isEmptyStyle ? {
          borderColor: "rgba(16,185,129,0.4)",
          background: "rgba(16,185,129,0.025)",
          boxShadow: "0 0 0 3px rgba(16,185,129,0.06)",
        } : {}),
        ...(focused && isEmptyStyle ? {
          borderColor: "rgba(16,185,129,0.4)",
          background: "rgba(16,185,129,0.025)",
          boxShadow: "0 0 0 3px rgba(16,185,129,0.06)",
        } : {}),
      }}
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map((tag, i) => (
        <span
          key={`${tag}-${i}`}
          className="inline-flex items-center shrink-0 animate-[tagIn_0.15s_ease]"
          style={{
            gap: 4,
            padding: "3px 8px",
            borderRadius: 6,
            background: "rgba(16, 185, 129, 0.08)",
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
              className="flex items-center justify-center transition-opacity"
              style={{ opacity: 0.5, width: 14, height: 14 }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.5"; }}
            >
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth="3">
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
        placeholder={atMax ? `Max ${maxTags} services` : (tags.length === 0 ? placeholder : "Add another...")}
        className="flex-1 min-w-[120px] bg-transparent outline-none text-[13px] text-white disabled:cursor-not-allowed"
        style={{ padding: 0, border: "none", lineHeight: "1.45" }}
      />
    </div>
  );
}

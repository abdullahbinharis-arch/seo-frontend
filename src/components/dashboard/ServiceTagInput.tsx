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
  placeholder = "Type a service + Enter",
  maxTags = 15,
  className,
}: ServiceTagInputProps) {
  const [input, setInput] = useState("");
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
  const containerClass = isEmptyStyle
    ? "empty-field flex flex-wrap items-center gap-1.5 min-h-[44px] !py-2 !px-3 cursor-text"
    : "w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus-within:ring-2 focus-within:ring-emerald-500/70 focus-within:border-emerald-500/70 disabled:opacity-50 transition-all flex flex-wrap items-center gap-1.5 min-h-[44px] cursor-text";

  return (
    <div
      className={containerClass}
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map((tag, i) => (
        <span
          key={`${tag}-${i}`}
          className="bg-emerald-500/10 text-emerald-300 text-xs rounded-lg px-2.5 py-1 flex items-center gap-1.5 shrink-0"
        >
          {tag}
          {!disabled && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(i); }}
              className="text-emerald-300/60 hover:text-emerald-200 transition-colors"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
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
        disabled={disabled || atMax}
        placeholder={atMax ? `Max ${maxTags} services` : (tags.length === 0 ? placeholder : "")}
        className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-white placeholder-zinc-500 disabled:cursor-not-allowed"
      />
    </div>
  );
}

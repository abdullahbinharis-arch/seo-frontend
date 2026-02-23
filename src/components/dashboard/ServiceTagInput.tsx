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

// Must match all other inputs exactly: 11px 14px padding, 10px radius, etc.
const baseStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: 10,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
  color: "#fafafa",
  fontSize: 13.5,
  fontFamily: "inherit",
  lineHeight: "1.45",
  outline: "none",
  transition: "border-color 0.2s, background 0.2s, box-shadow 0.2s",
  cursor: "text",
  display: "flex",
  flexWrap: "wrap" as const,
  alignItems: "center",
  gap: 6,
};

export function ServiceTagInput({
  tags,
  onChange,
  disabled,
  placeholder = "e.g. Kitchen Renovation",
  maxTags = 15,
}: ServiceTagInputProps) {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
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

  const computedStyle: React.CSSProperties = {
    ...baseStyle,
    ...(hovered && !focused && !disabled ? {
      borderColor: "rgba(255,255,255,0.1)",
      background: "rgba(255,255,255,0.04)",
    } : {}),
    ...(focused ? {
      borderColor: "rgba(16,185,129,0.4)",
      background: "rgba(16,185,129,0.03)",
      boxShadow: "0 0 0 3px rgba(16,185,129,0.06)",
    } : {}),
    ...(disabled ? { opacity: 0.3, cursor: "not-allowed" } : {}),
  };

  return (
    <>
    <div
      style={computedStyle}
      onClick={() => inputRef.current?.focus()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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
        style={{
          flex: 1,
          minWidth: 120,
          padding: 0,
          border: "none",
          background: "transparent",
          outline: "none",
          color: "#fafafa",
          fontSize: 13.5,
          fontFamily: "inherit",
          lineHeight: "1.45",
        }}
      />
    </div>
    <p style={{ fontSize: 10, color: "#71717a", marginTop: 2, lineHeight: 1, marginBottom: -8 }}>
      {tags.length > 0 ? "Press Enter to add more" : "Press Enter to add a service"}
    </p>
  </>
  );
}

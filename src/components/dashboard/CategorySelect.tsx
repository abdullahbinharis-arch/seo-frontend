"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { BUSINESS_CATEGORIES } from "@/data/categories";

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function CategorySelect({ value, onChange, disabled, className }: CategorySelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isOther, setIsOther] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!query) return [...BUSINESS_CATEGORIES];
    const q = query.toLowerCase();
    return BUSINESS_CATEGORIES.filter((c) => c.toLowerCase().includes(q));
  }, [query]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Reset highlight when filtered list changes
  useEffect(() => {
    setHighlightIdx(0);
  }, [filtered.length]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (!open || !listRef.current) return;
    const items = listRef.current.children;
    if (items[highlightIdx]) {
      (items[highlightIdx] as HTMLElement).scrollIntoView({ block: "nearest" });
    }
  }, [highlightIdx, open]);

  function selectCategory(cat: string) {
    if (cat === "Other") {
      setIsOther(true);
      onChange("");
      setOpen(false);
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setIsOther(false);
      onChange(cat);
      setOpen(false);
      setQuery("");
    }
  }

  function handleInputFocus() {
    if (isOther) return; // In free-text mode, don't open dropdown
    setOpen(true);
    setQuery("");
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (isOther) {
      onChange(e.target.value);
    } else {
      setQuery(e.target.value);
      setOpen(true);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (isOther) return;
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightIdx((i) => Math.min(i + 1, filtered.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightIdx((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filtered[highlightIdx]) selectCategory(filtered[highlightIdx]);
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
    }
  }

  function handleBackToList() {
    setIsOther(false);
    onChange("");
    setQuery("");
    setTimeout(() => {
      inputRef.current?.focus();
      setOpen(true);
    }, 0);
  }

  const displayValue = isOther ? value : (open ? query : value);

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={isOther ? "Type your business category" : "Search categories..."}
          className={className?.includes("empty-field") ? "empty-field" : "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm pr-9"}
          autoComplete="off"
        />
        {isOther ? (
          <button
            type="button"
            onClick={handleBackToList}
            disabled={disabled}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-medium text-zinc-500 hover:text-emerald-400 transition-colors"
          >
            Back
          </button>
        ) : (
          <svg
            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        )}
      </div>

      {open && !isOther && (
        <div
          ref={listRef}
          className="absolute z-50 mt-1 w-full max-h-[240px] overflow-y-auto rounded-xl bg-[#18181b] border border-white/10 py-1"
        >
          {filtered.length === 0 ? (
            <div className="px-4 py-2.5 text-sm text-zinc-500">No matches</div>
          ) : (
            filtered.map((cat, i) => (
              <div
                key={cat}
                onClick={() => selectCategory(cat)}
                onMouseEnter={() => setHighlightIdx(i)}
                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                  i === highlightIdx
                    ? "bg-emerald-500/10 text-emerald-300"
                    : "text-zinc-300 hover:bg-white/[0.06]"
                } ${cat === value && !open ? "text-emerald-400" : ""}`}
              >
                {cat}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

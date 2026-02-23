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
  const triggerRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
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
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Reset highlight when filtered list changes
  useEffect(() => {
    setHighlightIdx(0);
  }, [filtered.length]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

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
      setTimeout(() => triggerRef.current?.focus(), 0);
    } else {
      setIsOther(false);
      onChange(cat);
      setOpen(false);
      setQuery("");
    }
  }

  function handleTriggerClick() {
    if (disabled) return;
    if (isOther) return;
    setOpen((prev) => !prev);
    setQuery("");
  }

  function handleTriggerChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (isOther) {
      onChange(e.target.value);
    }
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
  }

  function handleSearchKeyDown(e: React.KeyboardEvent) {
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
        setQuery("");
        break;
    }
  }

  function handleTriggerKeyDown(e: React.KeyboardEvent) {
    if (isOther) return;
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
      setQuery("");
    }
  }

  function handleBackToList() {
    setIsOther(false);
    onChange("");
    setQuery("");
    setTimeout(() => {
      setOpen(true);
    }, 0);
  }

  const isEmptyStyle = className?.includes("empty-field");
  const baseClass = isEmptyStyle
    ? "empty-field cursor-pointer"
    : "w-full rounded-[10px] bg-[rgba(255,255,255,0.025)] border border-[rgba(255,255,255,0.055)] text-white placeholder-[#52525b] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all text-[13px] cursor-pointer";

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`}>
      <div className="relative">
        <input
          ref={triggerRef}
          type="text"
          value={value}
          onChange={handleTriggerChange}
          onClick={handleTriggerClick}
          onKeyDown={handleTriggerKeyDown}
          readOnly={!isOther}
          disabled={disabled}
          placeholder={isOther ? "Type your business category" : "e.g. Kitchen Remodeler"}
          className={baseClass}
          style={{
            ...(isEmptyStyle ? {} : { padding: "11px 14px" }),
            paddingRight: 34,
            ...((!isOther) ? { caretColor: "transparent" } : {}),
          }}
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
            className={`pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`}
            width="10" height="6" viewBox="0 0 10 6" fill="none"
          >
            <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
      </div>

      {open && !isOther && (
        <div
          className="absolute z-50 mt-1 w-full rounded-[10px] border animate-[dropIn_0.15s_ease]"
          style={{
            background: "#151517",
            borderColor: "rgba(255,255,255,0.08)",
            boxShadow: "0 14px 44px rgba(0,0,0,0.55)",
          }}
        >
          {/* Sticky search input */}
          <div
            className="sticky top-0 z-10 p-1.5"
            style={{
              background: "#151517",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "10px 10px 0 0",
            }}
          >
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search categories..."
              className="w-full outline-none"
              style={{
                padding: "7px 10px",
                borderRadius: 7,
                fontSize: 12,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
                color: "#fafafa",
                fontFamily: "inherit",
              }}
              autoComplete="off"
            />
          </div>

          {/* Category list */}
          <div
            ref={listRef}
            className="max-h-[220px] overflow-y-auto"
            style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.08) transparent" }}
          >
            {filtered.length === 0 ? (
              <div className="px-3 py-2.5 text-zinc-500" style={{ fontSize: 12.5 }}>No matches</div>
            ) : (
              filtered.map((cat, i) => (
                <div
                  key={cat}
                  onClick={() => selectCategory(cat)}
                  onMouseEnter={() => setHighlightIdx(i)}
                  className="cursor-pointer transition-colors"
                  style={{
                    padding: "8px 12px",
                    fontSize: 12.5,
                    color: i === highlightIdx ? "#6ee7b7" : (cat === value ? "#6ee7b7" : "#a1a1aa"),
                    background: i === highlightIdx ? "rgba(16,185,129,0.06)" : "transparent",
                    fontWeight: cat === value ? 500 : 400,
                  }}
                >
                  {cat}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

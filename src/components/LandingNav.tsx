"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export function LandingNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-surface-0/80 nav-blur">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo size="medium" animated={false} />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
          <a href="#features" className="hover:text-white transition-colors duration-200">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors duration-200">How It Works</a>
          <a href="#pricing" className="hover:text-white transition-colors duration-200">Pricing</a>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden sm:inline-flex text-sm text-zinc-400 hover:text-white transition-colors px-4 py-2">
            Log in
          </Link>
          <Link href="/register" className="btn-primary text-white font-semibold px-4 py-2 rounded-lg text-sm hidden sm:inline-flex">
            Get Started Free
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-colors"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18" /><path d="M6 6l12 12" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12h18" /><path d="M3 6h18" /><path d="M3 18h18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/5 bg-surface-0/95 nav-blur px-6 py-4 flex flex-col gap-3">
          <a href="#features" onClick={() => setMenuOpen(false)} className="text-sm text-zinc-400 hover:text-white transition-colors py-2">Features</a>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="text-sm text-zinc-400 hover:text-white transition-colors py-2">How It Works</a>
          <a href="#pricing" onClick={() => setMenuOpen(false)} className="text-sm text-zinc-400 hover:text-white transition-colors py-2">Pricing</a>
          <div className="border-t border-white/5 pt-3 mt-1 flex flex-col gap-2">
            <Link href="/login" onClick={() => setMenuOpen(false)} className="text-sm text-zinc-400 hover:text-white transition-colors py-2">Log in</Link>
            <Link href="/register" onClick={() => setMenuOpen(false)} className="btn-primary text-white font-semibold px-4 py-2.5 rounded-lg text-sm text-center">Get Started Free</Link>
          </div>
        </div>
      )}
    </nav>
  );
}

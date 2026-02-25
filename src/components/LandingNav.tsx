"use client";

import Link from "next/link";
import { LogoIcon } from "@/components/brand/LogoIcon";

export function LandingNav() {
  return (
    <nav className="nav" id="navbar">
      <Link href="/" className="nav-logo">
        <div className="nav-logo-icon">
          <LogoIcon size={32} />
        </div>
        <span>
          <span className="local">Local</span>
          <span className="rankr">Rankr</span>
        </span>
      </Link>
      <div className="nav-links">
        <a href="#features">Features</a>
        <a href="#how-it-works">How It Works</a>
        <a href="#pricing">Pricing</a>
        <Link href="/login" className="nav-login">
          Log In
        </Link>
        <Link href="/dashboard/audit" className="nav-cta">
          Start Free Audit →
        </Link>
      </div>
    </nav>
  );
}

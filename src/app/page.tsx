import Link from "next/link";
import { RevealObserver } from "@/components/RevealObserver";
import { LandingNav } from "@/components/LandingNav";
import { LandingInteractive } from "@/components/LandingInteractive";
import "./landing.css";

// ── Check icon for pricing lists ─────────────────────────
function PriceCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function LandingPage() {
  const marqueeItems = [
    "Full-Site Crawling",
    "15-Rule SEO Engine",
    "Competitor Outrank",
    "AI Content Writer",
    "Schema Generator",
    "Keyword Gap Analysis",
    "Post Generator",
    "Backlink Analysis",
    "Multi-Profile Manager",
    "GMB Optimisation",
  ];

  return (
    <div
      style={{
        fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
        background: "var(--bg-0)",
        color: "var(--text-primary)",
      }}
    >
      {/* Particles + all JS interactions (client component) */}
      <LandingInteractive />

      {/* ── NAV ── */}
      <LandingNav />

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-grid" />
        <div className="hero-orb orb-1" />
        <div className="hero-orb orb-2" />
        <div className="hero-orb orb-3" />
        <div className="hero-scanline" />

        <div className="hero-badge">
          <div className="hero-badge-dot" />
          <span>AI-Powered Local SEO Platform</span>
        </div>

        <h1>
          Outrank Every
          <br />
          Competitor in <span className="gradient">Local Search</span>
        </h1>

        <p className="hero-sub">
          Full-site SEO audits, AI content that scores 90+, competitor analysis,
          and everything you need to dominate your local market — powered by one
          intelligent platform.
        </p>

        <div className="hero-actions">
          <Link href="/dashboard/audit" className="btn-primary">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            Run Free Audit
          </Link>
          <a href="#features" className="btn-secondary">
            See All Features
          </a>
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-num" data-count="50">
              0
            </div>
            <div className="hero-stat-label">Pages Crawled Per Audit</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-num" data-count="15">
              0
            </div>
            <div className="hero-stat-label">SEO Rules Scored</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-num" data-count="90" data-suffix="+">
              0
            </div>
            <div className="hero-stat-label">Avg Content Score</div>
          </div>
        </div>
      </section>

      {/* ── SCREENSHOT ── */}
      <section className="screenshot-section reveal-scale">
        <div className="screenshot-wrapper">
          <div className="screenshot-bar">
            <div className="screenshot-dot" />
            <div className="screenshot-dot" />
            <div className="screenshot-dot" />
          </div>
          <div className="screenshot-inner">
            <div className="mock-sidebar">
              <div className="mock-sidebar-item active">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 17H7A5 5 0 017 7h2m6 0h2a5 5 0 010 10h-2m-7-5h8" />
                </svg>
                Audit Report
              </div>
              <div className="mock-sidebar-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                Keyword Research
              </div>
              <div className="mock-sidebar-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 20V10M12 20V4M6 20v-4" />
                </svg>
                Keyword Gap
              </div>
              <div className="mock-sidebar-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                </svg>
                Content Writer
              </div>
              <div className="mock-sidebar-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M9 21V9" />
                </svg>
                Post Generator
              </div>
              <div className="mock-sidebar-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
                Schema Generator
              </div>
              <div className="mock-sidebar-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                </svg>
                Backlinks
              </div>
              <div className="mock-sidebar-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                GMB Optimisation
              </div>
              <div className="mock-sidebar-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <path d="M20 8v6M23 11h-6" />
                </svg>
                Profile Manager
              </div>
            </div>
            <div className="mock-main">
              <div className="mock-topbar">
                <div className="mock-title">Audit Report — Joe&apos;s Plumbing</div>
                <div className="mock-score-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span>Score: 87/100</span>
                </div>
              </div>
              <div className="mock-stats">
                <div className="mock-stat-card">
                  <div className="mock-stat-label">Pages Crawled</div>
                  <div className="mock-stat-val">38</div>
                </div>
                <div className="mock-stat-card">
                  <div className="mock-stat-label">SEO Issues</div>
                  <div className="mock-stat-val">14</div>
                </div>
                <div className="mock-stat-card">
                  <div className="mock-stat-label">Keywords Found</div>
                  <div className="mock-stat-val">126</div>
                </div>
                <div className="mock-stat-card">
                  <div className="mock-stat-label">Backlinks</div>
                  <div className="mock-stat-val">47</div>
                </div>
              </div>
              <div className="mock-chart" id="mockChart" />
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="marquee-section">
        <div className="marquee-track">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="marquee-item">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section className="section" id="features">
        <div className="section-header reveal">
          <div className="section-label">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            Features
          </div>
          <h2 className="section-title">
            Every Tool You Need to
            <br />
            <span className="gradient">Dominate Local SEO</span>
          </h2>
          <p className="section-desc">
            One platform. Full-site intelligence. AI that doesn&apos;t just audit — it writes content
            that ranks.
          </p>
        </div>

        <div className="features-grid">
          {/* ROW 1: Full-Site Audit + 15-Rule Scoring + Competitor Outrank */}
          <div className="feature-card reveal-left" data-delay="0">
            <div className="spotlight" style={{ background: "var(--emerald)", top: -100, left: -50 }} />
            <div className="feature-icon icon-emerald">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
            </div>
            <div className="feature-name">Full-Site SEO Audit</div>
            <div className="feature-desc">
              Crawls up to 50 pages — technical SEO, meta tags, headings, speed, and internal links.
              The full picture, not a shallow snapshot.
            </div>
          </div>

          <div className="feature-card reveal" data-delay="200">
            <div className="spotlight" style={{ background: "var(--amber)", top: -80, right: -80 }} />
            <div className="feature-icon icon-amber">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20V10M18 20V4M6 20v-4" />
              </svg>
            </div>
            <div className="feature-name">15-Rule SEO Scoring</div>
            <div className="feature-desc">
              Every page scored against 15 rules — keywords, headings, E-E-A-T, readability.
              Auto-fix anything below 80%.
            </div>
            <div className="score-ring-container">
              <div className="score-ring" id="scoreRing">
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle className="score-ring-bg" cx="40" cy="40" r="36" />
                  <circle className="score-ring-fill" cx="40" cy="40" r="36" />
                </svg>
                <div className="score-ring-num">87</div>
              </div>
              <div className="score-rules">
                <div className="score-rule">
                  <div className="score-rule-dot pass" />
                  <span className="score-rule-text">Keywords</span>
                </div>
                <div className="score-rule">
                  <div className="score-rule-dot pass" />
                  <span className="score-rule-text">Headings</span>
                </div>
                <div className="score-rule">
                  <div className="score-rule-dot warn" />
                  <span className="score-rule-text">Readability</span>
                </div>
                <div className="score-rule">
                  <div className="score-rule-dot pass" />
                  <span className="score-rule-text">E-E-A-T</span>
                </div>
              </div>
            </div>
          </div>

          <div className="feature-card reveal-right" data-delay="400">
            <div className="spotlight" style={{ background: "var(--blue)", top: -80, left: -80 }} />
            <div className="feature-icon icon-blue">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 19l7-7 3 3-7 7-3-3z" />
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
              </svg>
            </div>
            <div className="feature-name">Competitor Outrank</div>
            <div className="feature-desc">
              Analyze competitor pages, find gaps, generate content that outperforms — with meta,
              schema, FAQs baked in.
            </div>
            <div className="competitor-bars" id="compBars">
              <div className="comp-bar-row">
                <span className="comp-bar-label">You</span>
                <div className="comp-bar-track">
                  <div className="comp-bar-fill you" style={{ width: "92%" }} />
                </div>
                <span className="comp-bar-val">92</span>
              </div>
              <div className="comp-bar-row">
                <span className="comp-bar-label">Comp #1</span>
                <div className="comp-bar-track">
                  <div className="comp-bar-fill comp" style={{ width: "74%" }} />
                </div>
                <span className="comp-bar-val">74</span>
              </div>
              <div className="comp-bar-row">
                <span className="comp-bar-label">Comp #2</span>
                <div className="comp-bar-track">
                  <div className="comp-bar-fill comp" style={{ width: "61%" }} />
                </div>
                <span className="comp-bar-val">61</span>
              </div>
            </div>
          </div>

          {/* ROW 2: Keywords + Post Generator */}
          <div className="feature-card span-2 reveal-left" data-delay="0">
            <div className="spotlight" style={{ background: "var(--violet)", bottom: -100, left: "20%" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
              <div>
                <div className="feature-icon icon-emerald" style={{ width: 36, height: 36, marginBottom: 14 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                </div>
                <div className="feature-name" style={{ fontSize: 16 }}>
                  Keyword Research
                </div>
                <div className="feature-desc" style={{ fontSize: 12.5 }}>
                  Search volume, difficulty, intent classification. Manual deep-dive into any niche.
                </div>
              </div>
              <div>
                <div className="feature-icon icon-rose" style={{ width: 36, height: 36, marginBottom: 14 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 20V10M12 20V4M6 20v-4" />
                  </svg>
                </div>
                <div className="feature-name" style={{ fontSize: 16 }}>
                  Keyword Gap Analysis
                </div>
                <div className="feature-desc" style={{ fontSize: 12.5 }}>
                  Keywords your competitors rank for that you don&apos;t. Turn gaps into traffic.
                </div>
              </div>
            </div>
          </div>

          <div className="feature-card reveal-right" data-delay="200">
            <div className="spotlight" style={{ background: "var(--amber)", bottom: -80, right: -80 }} />
            <div className="feature-icon icon-amber">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 21V9" />
              </svg>
            </div>
            <div className="feature-name">Post Generator</div>
            <div className="feature-desc">
              Blogs, GMB posts, social media, guest posts — plus a content calendar. All
              SEO-optimized.
            </div>
            <div className="feature-tags" style={{ marginTop: 12 }}>
              <span className="feature-tag">Blog</span>
              <span className="feature-tag">GMB</span>
              <span className="feature-tag">Social</span>
              <span className="feature-tag">Calendar</span>
            </div>
          </div>

          {/* ROW 3: Schema+Backlinks | GMB | Multi-Profile */}
          <div className="feature-card reveal-left" data-delay="0">
            <div className="spotlight" style={{ background: "var(--violet)", top: -80, left: -80 }} />
            <div className="feature-icon icon-violet">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </div>
            <div className="feature-name">Schema & Backlinks</div>
            <div className="feature-desc">
              Auto-generate JSON-LD structured data for every page. Analyze your backlink profile
              with DA scoring and find link-building opportunities.
            </div>
            <div className="feature-tags" style={{ marginTop: 12 }}>
              <span className="feature-tag">JSON-LD</span>
              <span className="feature-tag">LocalBusiness</span>
              <span className="feature-tag">Domain Authority</span>
              <span className="feature-tag">Link Opportunities</span>
            </div>
          </div>

          <div className="feature-card reveal" data-delay="200">
            <div className="spotlight" style={{ background: "var(--blue)", top: -80, right: -80 }} />
            <div className="feature-icon icon-blue">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div className="feature-name">Google My Business Optimisation</div>
            <div className="feature-desc">
              Optimize your Google Business Profile — categories, attributes, posts, photos, and
              review strategy. Show up in the local pack.
            </div>
            <div className="feature-tags" style={{ marginTop: 12 }}>
              <span className="feature-tag">Local Pack</span>
              <span className="feature-tag">Categories</span>
              <span className="feature-tag">Reviews</span>
              <span className="feature-tag">Posts</span>
            </div>
          </div>

          <div className="feature-card reveal-right" data-delay="400">
            <div className="spotlight" style={{ background: "var(--emerald)", top: -80, right: -80 }} />
            <div className="feature-icon icon-emerald">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <path d="M20 8v6M23 11h-6" />
              </svg>
            </div>
            <div className="feature-name">Multi-Profile Manager</div>
            <div className="feature-desc">
              Manage multiple client sites from one dashboard. Version-controlled audits with
              progress tracking over time.
            </div>
            <div className="feature-tags" style={{ marginTop: 12 }}>
              <span className="feature-tag">Multi-Client</span>
              <span className="feature-tag">Version Control</span>
              <span className="feature-tag">Progress</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section" id="how-it-works" style={{ background: "var(--bg-1)" }}>
        <div className="section-header reveal">
          <div className="section-label">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            How It Works
          </div>
          <h2 className="section-title">
            From Audit to Rankings
            <br />
            in <span className="gradient">3 Steps</span>
          </h2>
        </div>

        <div className="steps-container" id="stepsContainer">
          <div className="steps-line" />
          <div className="steps-line-fill" id="stepsLineFill" />

          <div className="step" data-step="1">
            <div className="step-num">1</div>
            <div className="step-text">
              <div className="step-title">Run Your Full-Site Audit</div>
              <div className="step-desc">
                Enter your business details and location. Our AI crawler analyzes up to 50 pages —
                technical SEO, content, meta tags, speed, and internal links. Full health score in
                under 60 seconds.
              </div>
            </div>
          </div>

          <div className="step" data-step="2">
            <div className="step-num">2</div>
            <div className="step-text">
              <div className="step-title">Discover Gaps & Opportunities</div>
              <div className="step-desc">
                See which keywords competitors rank for that you don&apos;t. Every tool is
                pre-populated from your audit — keyword gaps, content fixes, backlink opportunities.
                Zero duplicate work.
              </div>
            </div>
          </div>

          <div className="step" data-step="3">
            <div className="step-num">3</div>
            <div className="step-text">
              <div className="step-title">Generate & Publish AI Content</div>
              <div className="step-desc">
                One click generates publish-ready content scoring 90+ against 15 SEO rules. Page
                rewrites, blog posts, schemas — all optimized. Auto-fix anything below 80%. Copy,
                paste, rank.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="section" id="pricing">
        <div className="section-header reveal">
          <div className="section-label">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
            Pricing
          </div>
          <h2 className="section-title">
            Start Free.
            <br />
            <span className="gradient">Scale When Ready.</span>
          </h2>
          <p className="section-desc">
            No credit card required. Run your first full-site audit in seconds.
          </p>
        </div>

        <div className="pricing-grid">
          <div className="price-card reveal-left">
            <div className="price-plan">Free</div>
            <div className="price-amount">
              <span className="currency">$</span>0
            </div>
            <div className="price-desc">Try LocalRankr with full access to core features.</div>
            <ul className="price-features">
              <li><PriceCheck />1 Full-Site Audit</li>
              <li><PriceCheck />15-Rule SEO Scoring</li>
              <li><PriceCheck />Keyword Research</li>
              <li><PriceCheck />1 AI Content Generation</li>
              <li><PriceCheck />Schema Generator</li>
            </ul>
            <Link href="/register" className="price-btn price-btn-secondary">
              Start Free →
            </Link>
          </div>

          <div className="price-card featured reveal-right">
            <div className="price-plan">Pro</div>
            <div className="price-amount">
              <span className="currency">$</span>29<span className="period">/mo</span>
            </div>
            <div className="price-desc">Unlimited audits, content, and client profiles.</div>
            <ul className="price-features">
              <li><PriceCheck />Unlimited Full-Site Audits</li>
              <li><PriceCheck />Unlimited AI Content</li>
              <li><PriceCheck />Competitor Outrank</li>
              <li><PriceCheck />Keyword Gap Analysis</li>
              <li><PriceCheck />Multi-Profile Manager</li>
              <li><PriceCheck />Post Generator + Calendar</li>
              <li><PriceCheck />Backlink Opportunities</li>
              <li><PriceCheck />GMB Optimisation</li>
            </ul>
            <Link href="/register" className="price-btn price-btn-primary">
              Get Pro Access →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="final-cta">
        <div className="final-cta-bg" />
        <div className="reveal">
          <h2>
            Stop Guessing.
            <br />
            <span className="gradient">Start Ranking.</span>
          </h2>
          <p>
            Your competitors are already optimizing. Run your free full-site audit and see exactly
            what&apos;s holding you back.
          </p>
          <Link
            href="/dashboard/audit"
            className="btn-primary"
            style={{ fontSize: 16, padding: "16px 36px" }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            Run Your Free Audit Now
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="landing-footer">
        <div className="footer-brand">
          <span>
            <span className="local">Local</span>
            <span className="rankr">Rankr</span>
          </span>
        </div>
        <div className="footer-links">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#">Blog</a>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
        </div>
        <div className="footer-copy">&copy; 2026 LocalRankr. All rights reserved.</div>
      </footer>

      {/* Scroll reveal observer (client component) */}
      <RevealObserver />
    </div>
  );
}

import Link from "next/link";
import { RevealObserver } from "@/components/RevealObserver";
import { Logo } from "@/components/brand/Logo";

// ── Star rating helper ──────────────────────────────────────────────
function Stars() {
  return (
    <div className="flex items-center gap-1 mb-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// ── Check icon ──────────────────────────────────────────────────────
function Check() {
  return (
    <svg className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function LandingPage() {
  const tickerItems = [
    "Bright Smile Dental", "Metro Law Group", "Summit Plumbing Co",
    "Olive & Vine Restaurant", "Peak Auto Repair", "Glow Salon & Spa", "Riverside Chiropractic",
  ];

  return (
    <div className="min-h-screen bg-surface-0 text-white" style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}>
      {/* Noise overlay */}
      <div className="noise-overlay" aria-hidden="true" />

      {/* ── NAV ── */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-surface-0/80 nav-blur">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size="medium" animated={false} />
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors duration-200">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors duration-200">How It Works</a>
            <a href="#pricing" className="hover:text-white transition-colors duration-200">Pricing</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:inline-flex text-sm text-zinc-400 hover:text-white transition-colors px-4 py-2">
              Log in
            </Link>
            <Link href="/register" className="btn-primary text-white font-semibold px-4 py-2 rounded-lg text-sm">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 grid-bg">
        <div className="hero-glow hero-glow-1" />
        <div className="hero-glow hero-glow-2" />
        <div className="hero-glow hero-glow-3" />

        <div className="relative max-w-5xl mx-auto px-6 text-center py-24 md:py-32">
          {/* Hero logo */}
          <div className="reveal flex justify-center mb-8">
            <Logo size="hero" animated={true} />
          </div>

          {/* Badge */}
          <div className="reveal inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-emerald-300 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
            AI-Powered Local SEO Intelligence
          </div>

          {/* Headline */}
          <h1 className="reveal reveal-delay-1 font-display font-extrabold text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[0.95] mb-6">
            Dominate<br />
            <span className="text-gradient">Local Search</span>
          </h1>

          {/* Subheadline */}
          <p className="reveal reveal-delay-2 text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10">
            The AI engine that audits, optimizes, and monitors your local SEO — so your business shows up first when customers search nearby.
          </p>

          {/* CTA row */}
          <div id="hero-cta" className="reveal reveal-delay-3 flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/dashboard/audit" className="btn-primary text-white font-semibold px-8 py-3.5 rounded-xl text-base w-full sm:w-auto text-center">
              Run Free Audit →
            </Link>
            <a href="#how-it-works" className="btn-secondary rounded-xl px-8 py-3.5 text-base text-zinc-300 w-full sm:w-auto text-center">
              See How It Works
            </a>
          </div>

          {/* Hero mock audit card */}
          <div className="reveal reveal-delay-4 glass rounded-2xl p-6 md:p-8 max-w-3xl mx-auto text-left">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Score ring */}
              <div className="flex-shrink-0 mx-auto md:mx-0">
                <div className="score-ring" style={{ "--score": 78 } as React.CSSProperties}>
                  <div className="score-ring-inner">
                    <span className="font-display font-bold text-3xl text-emerald-400">78</span>
                  </div>
                </div>
              </div>
              {/* Details */}
              <div className="flex-1 w-full">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-zinc-500">localrankr audit</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold uppercase tracking-wider">Live</span>
                </div>
                <h3 className="font-display font-semibold text-lg mb-3">Bright Smile Dental — Chicago, IL</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "On-Page", score: "82", color: "text-emerald-400" },
                    { label: "GBP", score: "65", color: "text-amber-400" },
                    { label: "Citations", score: "88", color: "text-emerald-400" },
                    { label: "Reviews", score: "51", color: "text-rose-400" },
                  ].map(({ label, score, color }) => (
                    <div key={label} className="rounded-lg bg-white/[0.03] px-3 py-2.5">
                      <div className="text-[11px] text-zinc-500 mb-0.5">{label}</div>
                      <div className={`font-semibold ${color}`}>{score}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF TICKER ── */}
      <section className="relative border-y border-white/5 overflow-hidden py-8 bg-surface-1/50">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs text-zinc-600 uppercase tracking-widest mb-6 font-medium">
            Trusted by 2,000+ local businesses
          </p>
          <div
            className="relative overflow-hidden"
            style={{ maskImage: "linear-gradient(90deg, transparent, black 15%, black 85%, transparent)" }}
          >
            <div className="ticker-track flex gap-16 items-center w-max">
              {[...tickerItems, ...tickerItems].map((name, i) => (
                <span key={i} className={i % 2 === 1 && i < tickerItems.length * 2 - 1 && (i + 1) % 2 === 0
                  ? "text-zinc-700"
                  : "text-zinc-600 font-display font-semibold text-lg whitespace-nowrap"
                }>
                  {i % 2 === 0 ? name : "✦"}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="relative py-28 md:py-36">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="reveal text-xs uppercase tracking-widest text-emerald-400 font-semibold mb-3">Capabilities</p>
            <h2 className="reveal reveal-delay-1 font-display font-bold text-3xl md:text-5xl tracking-tight mb-4">
              Everything your local<br />business needs to rank
            </h2>
            <p className="reveal reveal-delay-2 text-zinc-500 max-w-xl mx-auto">
              Four AI agents work in parallel to analyze every dimension of your local search presence — then tell you exactly what to fix.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                delay: "", color: "bg-emerald-500/10", stroke: "#6ee7b7",
                icon: <><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></>,
                title: "On-Page SEO Audit",
                desc: "Analyzes title tags, meta descriptions, headings, internal links, and content quality against local search best practices.",
              },
              {
                delay: "reveal-delay-1", color: "bg-blue-500/10", stroke: "#60a5fa",
                icon: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>,
                title: "Google Business Profile",
                desc: "Optimizes your GBP listing with category recommendations, post ideas, photo tips, and Q&A strategies for your industry.",
              },
              {
                delay: "reveal-delay-2", color: "bg-violet-500/10", stroke: "#a78bfa",
                icon: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
                title: "Citation Tracker",
                desc: "Identifies the most impactful directories for your industry and location — with direct links to claim or create each listing.",
              },
              {
                delay: "", color: "bg-amber-500/10", stroke: "#fbbf24",
                icon: <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>,
                title: "Review Intelligence",
                desc: "Generates AI review request templates and response suggestions that maintain your brand voice and build trust.",
              },
              {
                delay: "reveal-delay-1", color: "bg-rose-500/10", stroke: "#fb7185",
                icon: <><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></>,
                title: "Competitor Analysis",
                desc: "See how you stack up against nearby competitors. Uncover their citation sources, review volume, and keyword gaps.",
              },
              {
                delay: "reveal-delay-2", color: "bg-cyan-500/10", stroke: "#22d3ee",
                icon: <><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></>,
                title: "Technical SEO",
                desc: "Checks page speed, mobile-friendliness, structured data, canonical tags, and 15+ technical factors that affect local rankings.",
              },
            ].map(({ delay, color, stroke, icon, title, desc }) => (
              <div key={title} className={`reveal ${delay} glass glass-hover rounded-2xl p-6 transition-all duration-300`}>
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-4`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {icon}
                  </svg>
                </div>
                <h3 className="font-display font-semibold text-base mb-2">{title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="relative py-28 md:py-36 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-20">
            <p className="reveal text-xs uppercase tracking-widest text-emerald-400 font-semibold mb-3">How It Works</p>
            <h2 className="reveal reveal-delay-1 font-display font-bold text-3xl md:text-5xl tracking-tight">
              Three minutes to clarity
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {[
              { num: "1", delay: "", title: "Enter Your Business", desc: "Drop in your business name, website, type, and city. That's all we need." },
              { num: "2", delay: "reveal-delay-2", title: "AI Agents Analyze", desc: "Four specialized agents audit your on-page SEO, GBP, citations, competitors, and technical health — all at once." },
              { num: "3", delay: "reveal-delay-4", title: "Get Your Action Plan", desc: "Receive a scored report with prioritized fixes. Know exactly what to do first to climb the local pack." },
            ].map(({ num, delay, title, desc }) => (
              <div key={num} className={`reveal ${delay} text-center md:text-left`}>
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl glass mb-5">
                  <span className="font-display font-bold text-2xl text-gradient">{num}</span>
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="relative py-28 md:py-36 border-t border-white/5 bg-surface-1/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="reveal text-xs uppercase tracking-widest text-emerald-400 font-semibold mb-3">Results</p>
            <h2 className="reveal reveal-delay-1 font-display font-bold text-3xl md:text-5xl tracking-tight">
              Businesses that rank higher,<br />grow faster
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                delay: "",
                gradient: "from-emerald-400 to-cyan-400",
                quote: "We went from page 3 to the local 3-pack in 6 weeks. The citation recommendations alone were worth it — we had no idea we were missing Healthgrades and Zocdoc.",
                name: "Dr. Sarah Chen",
                biz: "Bright Smile Dental, Chicago",
              },
              {
                delay: "reveal-delay-1",
                gradient: "from-violet-400 to-pink-400",
                quote: "I manage 40+ local business clients. LocalRankr replaced 3 separate tools and saves me about 15 hours a month on audit reports alone.",
                name: "Marcus Rodriguez",
                biz: "Founder, Apex Digital Agency",
              },
              {
                delay: "reveal-delay-2",
                gradient: "from-amber-400 to-orange-400",
                quote: "As a plumber, I know nothing about SEO. LocalRankr told me exactly what to fix in plain English. My calls from Google went up 40% in two months.",
                name: "James Kowalski",
                biz: "Summit Plumbing, Denver",
              },
            ].map(({ delay, gradient, quote, name, biz }) => (
              <div key={name} className={`reveal ${delay} glass rounded-2xl p-6`}>
                <Stars />
                <p className="text-sm text-zinc-300 leading-relaxed mb-4">&ldquo;{quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradient}`} />
                  <div>
                    <div className="text-sm font-medium">{name}</div>
                    <div className="text-xs text-zinc-500">{biz}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="relative py-28 md:py-36 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="reveal text-xs uppercase tracking-widest text-emerald-400 font-semibold mb-3">Pricing</p>
            <h2 className="reveal reveal-delay-1 font-display font-bold text-3xl md:text-5xl tracking-tight mb-4">
              Simple, transparent pricing
            </h2>
            <p className="reveal reveal-delay-2 text-zinc-500">Start free. Upgrade when you&apos;re ready to grow.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 items-start">
            {/* Free */}
            <div className="reveal glass rounded-2xl p-6 md:p-8">
              <div className="text-sm text-zinc-500 font-medium mb-1">Free</div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-display font-bold text-4xl">$0</span>
                <span className="text-zinc-500 text-sm">/mo</span>
              </div>
              <p className="text-xs text-zinc-600 mb-6">For trying it out</p>
              <Link href="/register" className="btn-secondary block text-center rounded-xl px-6 py-3 text-sm font-medium text-zinc-300 mb-6">
                Get Started
              </Link>
              <ul className="space-y-3 text-sm text-zinc-400">
                {["3 audits per month", "1 business", "Basic report"].map((f) => (
                  <li key={f} className="flex items-start gap-2.5"><Check />{f}</li>
                ))}
              </ul>
            </div>

            {/* Pro */}
            <div className="reveal reveal-delay-1 rounded-2xl gradient-border p-6 md:p-8 bg-surface-1 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-[10px] font-bold uppercase tracking-wider text-black whitespace-nowrap">
                Most Popular
              </div>
              <div className="text-sm text-emerald-400 font-medium mb-1">Pro</div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-display font-bold text-4xl">$49</span>
                <span className="text-zinc-500 text-sm">/mo</span>
              </div>
              <p className="text-xs text-zinc-600 mb-6">For local business owners</p>
              <Link href="/register" className="btn-primary block text-center rounded-xl px-6 py-3 text-sm font-semibold text-white mb-6">
                Start Pro Trial
              </Link>
              <ul className="space-y-3 text-sm text-zinc-400">
                {["Unlimited audits", "1 business", "GBP optimization", "Review monitoring", "PDF export", "Monthly tracking"].map((f) => (
                  <li key={f} className="flex items-start gap-2.5"><Check />{f}</li>
                ))}
              </ul>
            </div>

            {/* Agency */}
            <div className="reveal reveal-delay-2 glass rounded-2xl p-6 md:p-8">
              <div className="text-sm text-zinc-500 font-medium mb-1">Agency</div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-display font-bold text-4xl">$149</span>
                <span className="text-zinc-500 text-sm">/mo</span>
              </div>
              <p className="text-xs text-zinc-600 mb-6">For marketing agencies</p>
              <a href="mailto:hello@localrankr.io" className="btn-secondary block text-center rounded-xl px-6 py-3 text-sm font-medium text-zinc-300 mb-6">
                Contact Sales
              </a>
              <ul className="space-y-3 text-sm text-zinc-400">
                {["Unlimited audits", "Up to 50 businesses", "Everything in Pro", "White-label reports", "Client dashboard", "Team access", "Priority support"].map((f) => (
                  <li key={f} className="flex items-start gap-2.5"><Check />{f}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative py-28 md:py-36 border-t border-white/5 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500 opacity-[0.04] blur-[120px] pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="reveal font-display font-bold text-3xl md:text-5xl lg:text-6xl tracking-tight mb-6">
            Stop guessing.<br />
            <span className="text-gradient">Start ranking.</span>
          </h2>
          <p className="reveal reveal-delay-1 text-zinc-500 text-lg max-w-xl mx-auto mb-10">
            Run your first free audit in under 3 minutes. No credit card required.
          </p>
          <div className="reveal reveal-delay-2">
            <Link href="/dashboard/audit" className="inline-flex btn-primary text-white font-semibold px-10 py-4 rounded-xl text-base">
              Run Free Audit →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-12 bg-surface-1/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Logo size="medium" animated={false} />
            <div className="flex items-center gap-8 text-sm text-zinc-600">
              <a href="mailto:support@localrankr.io" className="hover:text-zinc-400 transition-colors">Privacy</a>
              <a href="mailto:support@localrankr.io" className="hover:text-zinc-400 transition-colors">Terms</a>
              <a href="mailto:support@localrankr.io" className="hover:text-zinc-400 transition-colors">Support</a>
            </div>
            <p className="text-xs text-zinc-700">&copy; 2026 LocalRankr.io. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Scroll reveal observer (client component) */}
      <RevealObserver />
    </div>
  );
}

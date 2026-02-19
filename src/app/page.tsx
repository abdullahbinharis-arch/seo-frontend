import Link from "next/link";

const features = [
  {
    icon: "📍",
    title: "Google Map Pack Analysis",
    description: "See exactly why competitors rank above you in the local pack and what it takes to beat them.",
  },
  {
    icon: "🏆",
    title: "Local SEO Score",
    description: "Get a clear 0–100 score showing how your business performs across Google's local ranking factors.",
  },
  {
    icon: "📋",
    title: "Google Business Profile",
    description: "Step-by-step GBP optimization checklist tailored to your business type — not generic advice.",
  },
  {
    icon: "🔗",
    title: "Industry Citations",
    description: "The exact directories your competitors are listed in that you're missing — with outreach templates.",
  },
  {
    icon: "⭐",
    title: "Review Strategy",
    description: "Done-for-you templates and proven tactics to generate more 5-star reviews every month.",
  },
  {
    icon: "✍️",
    title: "Local Content Plan",
    description: "Blog topics, service-area pages, and FAQ content that attracts local search traffic.",
  },
];

const steps = [
  {
    num: "1",
    title: "Enter your business details",
    description: "Business name, type, website URL, and city. Takes about 30 seconds.",
  },
  {
    num: "2",
    title: "AI analyzes your presence",
    description: "3 AI agents scan Google results, your website, and local citation sources.",
  },
  {
    num: "3",
    title: "Get your action plan",
    description: "A personalized Local SEO Score plus specific steps to rank higher — starting today.",
  },
];

const businessTypes = [
  "Dentists",
  "Lawyers",
  "Plumbers",
  "Restaurants",
  "Auto Repair",
  "Salons",
  "Contractors",
  "Chiropractors",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-600 text-white rounded-xl p-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-slate-900">Local SEO Audit</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-slate-600 hover:text-slate-900 font-medium px-3 py-2"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full inline-block"></span>
          AI-powered · Free to start · Results in 60 seconds
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight mb-6">
          See how your business
          <br />
          <span className="text-blue-600">shows up in local search</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Get a free AI-powered Local SEO audit in 60 seconds. Find out exactly
          what&apos;s keeping you out of the Google Map Pack — and how to fix it.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link
            href="/audit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 py-4 rounded-xl text-lg transition-colors shadow-sm"
          >
            Run My Free Audit
          </Link>
          <span className="text-slate-400 text-sm">No credit card · No setup required</span>
        </div>

        {/* Business type pills */}
        <div className="flex flex-wrap justify-center gap-2">
          {businessTypes.map((t) => (
            <span
              key={t}
              className="bg-slate-100 text-slate-600 text-sm px-3.5 py-1.5 rounded-full"
            >
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* Score preview */}
      <section className="bg-gradient-to-br from-slate-50 to-blue-50 border-y border-slate-200 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">
              Your Local SEO Score, explained
            </h2>
            <p className="text-slate-500">
              We score your business across three dimensions that Google uses to rank local results.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                label: "On-Page SEO",
                score: 38,
                color: "bg-red-500",
                textColor: "text-red-600",
                desc: "Title tags, H1, local keywords, content",
              },
              {
                label: "Technical",
                score: 65,
                color: "bg-yellow-500",
                textColor: "text-yellow-600",
                desc: "Schema markup, mobile, page speed",
              },
              {
                label: "Local Presence",
                score: 72,
                color: "bg-green-500",
                textColor: "text-green-600",
                desc: "GBP, citations, NAP consistency, reviews",
              },
            ].map(({ label, score, color, textColor, desc }) => (
              <div
                key={label}
                className="bg-white rounded-2xl border border-slate-200 p-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-slate-700">{label}</span>
                  <span className={`text-3xl font-black ${textColor}`}>{score}</span>
                </div>
                <div className="bg-slate-100 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full ${color}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">How it works</h2>
          <p className="text-slate-500">
            Three simple steps to your personalized local SEO action plan.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-10">
          {steps.map(({ num, title, description }) => (
            <div key={num} className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-5">
                {num}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
              <p className="text-slate-500 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-900 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">
              Everything you need to rank higher locally
            </h2>
            <p className="text-slate-400">
              Our AI agents analyze what your top competitors are doing — and tell you exactly how to beat them.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map(({ icon, title, description }) => (
              <div
                key={title}
                className="bg-slate-800 rounded-2xl p-6 border border-slate-700"
              >
                <div className="text-3xl mb-4">{icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <h2 className="text-4xl font-extrabold text-slate-900 mb-4">
          Ready to get found by more local customers?
        </h2>
        <p className="text-lg text-slate-500 mb-10 max-w-xl mx-auto">
          Join local businesses getting more calls, walk-ins, and bookings directly from Google.
        </p>
        <Link
          href="/audit"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-12 py-4 rounded-xl text-lg transition-colors"
        >
          Run Your Free Audit
        </Link>
        <p className="mt-4 text-sm text-slate-400">No credit card required</p>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white rounded-lg p-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-slate-700">Local SEO Audit</span>
          </div>
          <p className="text-sm text-slate-400">AI-powered local SEO for local businesses</p>
        </div>
      </footer>
    </div>
  );
}

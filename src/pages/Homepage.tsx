/**
 * Homepage — institutional finance aesthetic with suite-style sections (eSignus-inspired structure)
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Brain,
  ArrowRight,
  Activity,
  MapPin,
  Building2,
  BarChart3,
  Lock,
  Sparkles,
  LayoutGrid,
  ChevronRight,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { SEO } from '../components/SEO';

const LIVE_QUOTES: { symbol: string; pct: number }[] = [
  { symbol: 'AAPL', pct: 1.57 },
  { symbol: 'TSLA', pct: -5.35 },
  { symbol: 'NVDA', pct: 1.83 },
];

const BENEFITS = [
  {
    title: 'Scale with conviction',
    body: 'Risk frameworks that grow with your book—clear limits, audit trails, and desk-wide alignment.',
  },
  {
    title: 'Cost-aware engineering',
    body: 'Unify research, execution, and reporting so every dollar of infrastructure maps to measurable outcomes.',
  },
  {
    title: 'Institutional-grade controls',
    body: 'Segregation of duties, documented workflows, and governance that satisfies the second line.',
  },
  {
    title: 'New revenue-ready workflows',
    body: 'Productize research and execution services without compromising the standards your clients expect.',
  },
  {
    title: 'Decentralized operational risk',
    body: 'Clear ownership of models, data, and approvals—fewer single points of failure across the stack.',
  },
  {
    title: 'Continuity you can rehearse',
    body: 'Recovery paths, runbooks, and scenario libraries so teams respond with discipline—not improvisation.',
  },
] as const;

const SUITES = [
  {
    icon: BarChart3,
    title: 'Risk & analytics core',
    tags: ['Surface-aware', 'Attribution', 'Limits'],
    body: 'Greeks, stress grids, and performance decomposition in one disciplined layer for options and multi-leg books.',
  },
  {
    icon: Building2,
    title: 'Execution fabric',
    tags: ['Routing', 'Transparency', 'Adapters'],
    body: 'Smart connectivity and clear intent-to-fill lineage—built for desks that cannot afford ambiguity at the wire.',
  },
  {
    icon: LayoutGrid,
    title: 'Unified workspace',
    tags: ['Single pane', 'Collaboration', 'Context'],
    body: 'Research, risk, and execution share one calm surface—fewer handoffs, clearer ownership across the desk.',
  },
] as const;

export const Homepage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0b0c0f] font-sans text-neutral-100 antialiased selection:bg-[#c6a575]/25">
      <SEO
        title="General Exchange - Algorithmic Trade Engine"
        description="Enterprise trade intelligence for options professionals. Integrated analytics, execution discipline, and market context."
        keywords="options trading platform, algorithmic trading, risk management software, AI trading tools, options analysis, institutional trading, General Exchange"
        canonical="https://generalexchange.com/"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'General Exchange',
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Web, iOS, Android',
          offers: {
            '@type': 'Offer',
            price: '49.00',
            priceCurrency: 'USD',
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            ratingCount: '1247',
          },
        }}
      />
      <Navbar showSearch={false} />

      <div className="pt-14 sm:pt-[3.75rem]">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-white/[0.04]">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_70%_at_50%_-15%,rgba(198,165,117,0.09),transparent_58%)]"
            aria-hidden
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:80px_80px] opacity-30" />

          <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-24 lg:py-28">
            <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-14 lg:gap-20 items-center">
              <div className="space-y-8 lg:space-y-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 backdrop-blur-sm">
                  <span className="text-[11px] sm:text-xs font-semibold tracking-[0.14em] uppercase text-[#d4b896]">
                    Connect With Interactive Brokers
                  </span>
                </div>

                <h1 className="font-display text-[2.35rem] sm:text-5xl lg:text-[3.35rem] xl:text-[3.65rem] leading-[1.08] font-normal text-neutral-50 tracking-[-0.02em]">
                  Algorithmic risk management for{' '}
                  <span className="text-neutral-400">options trading professionals</span>
                </h1>

                <p className="text-base sm:text-lg text-neutral-400 max-w-xl leading-relaxed font-light">
                  General Exchange combines the depth of Thomson Reuters, the insight of Bloomberg, and the clarity of{' '}
                  <em className="text-neutral-300 not-italic font-normal">The New York Times</em> with advanced models that help traders
                  manage risk and decide in real time—with the restraint your firm expects.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                  <Link
                    to="/request-access"
                    className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-neutral-100 text-[#0c0d10] text-sm font-semibold tracking-wide rounded-full hover:bg-white transition-all duration-300 group shadow-[0_8px_32px_-8px_rgba(0,0,0,0.4)]"
                  >
                    Start trading smarter
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <Link
                    to="/features#feature-backtesting"
                    className="inline-flex items-center justify-center px-8 py-3.5 border border-white/[0.1] text-sm font-medium text-neutral-200 rounded-full bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/[0.14] transition-all duration-300"
                  >
                    Explore platform
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="relative rounded-[28px] border border-white/[0.06] bg-[#101218]/75 backdrop-blur-xl shadow-[0_32px_64px_-28px_rgba(0,0,0,0.55)] overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
                    <span className="text-[10px] font-semibold tracking-[0.2em] text-neutral-500 uppercase">General Exchange</span>
                    <span className="text-[10px] text-neutral-500 font-mono tabular-nums px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400/90">
                      LIVE
                    </span>
                  </div>
                  <div className="p-6 sm:p-7">
                    <p className="text-[10px] font-semibold tracking-[0.18em] text-neutral-500 uppercase mb-4">Live market analysis</p>
                    <div className="space-y-2.5">
                      {LIVE_QUOTES.map(({ symbol, pct }) => {
                        const up = pct >= 0;
                        return (
                          <div
                            key={symbol}
                            className="flex items-center justify-between py-3.5 px-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.045] transition-all duration-300"
                          >
                            <div className="flex items-center gap-3">
                              <span className={`h-2 w-2 rounded-full ${up ? 'bg-emerald-400/85' : 'bg-rose-400/85'}`} />
                              <span className="font-mono text-sm font-medium text-neutral-200">{symbol}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-sm font-medium tabular-nums ${up ? 'text-emerald-400/85' : 'text-rose-400/85'}`}>
                                {up ? '+' : ''}
                                {pct.toFixed(2)}%
                              </span>
                              <Activity className={`w-3.5 h-3.5 ${up ? 'text-emerald-500/60' : 'text-rose-400/60'}`} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="hidden sm:block absolute -right-2 top-[18%] w-[min(100%,200px)] p-4 rounded-2xl border border-emerald-500/12 bg-[#101218]/90 backdrop-blur-md shadow-lg shadow-black/20">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500/80" />
                    <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Long call leg</span>
                  </div>
                  <p className="font-mono text-xs text-neutral-200">NVDA $142.50C</p>
                  <p className="text-[10px] text-neutral-600 mt-1">Apr 18 · entry $4.10</p>
                  <p className="text-sm font-semibold text-emerald-400/90 mt-2 tabular-nums">+Return 31.2%</p>
                </div>
                <div className="hidden sm:block absolute -left-2 bottom-[22%] w-[min(100%,200px)] p-4 rounded-2xl border border-violet-500/12 bg-[#101218]/90 backdrop-blur-md shadow-lg shadow-black/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-3.5 h-3.5 text-violet-400/80" />
                    <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Win rate</span>
                  </div>
                  <p className="text-2xl font-semibold text-violet-400/90 tabular-nums">72%</p>
                  <p className="text-[10px] text-neutral-600 mt-1">Trailing 90 days</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Platform advantages — eSignus-style light band */}
        <section className="bg-[#efeeeb] text-[#1a1b1e] border-b border-neutral-200/60">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-20 sm:py-24 lg:py-28">
            <div className="max-w-3xl mb-14 sm:mb-16">
              <p className="text-xs font-semibold tracking-[0.16em] uppercase text-[#8b7355]/90 mb-4">Platform advantages</p>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] leading-tight font-normal text-[#121317] tracking-tight">
                Elevate the institutional workflow
              </h2>
              <p className="mt-5 text-base text-neutral-600 leading-relaxed max-w-2xl font-light">
                The same rigor you expect from a tier-one counterparty—applied to how you research, risk-manage, and deliver outcomes.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
              {BENEFITS.map(({ title, body }) => (
                <div
                  key={title}
                  className="group rounded-3xl bg-white/70 p-6 sm:p-7 border border-neutral-200/50 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_-12px_rgba(0,0,0,0.08)] transition-all duration-300"
                >
                  <div className="h-1 w-10 bg-[#c6a575]/70 rounded-full mb-4 group-hover:w-14 transition-all" />
                  <h3 className="text-lg font-semibold text-[#121317] mb-2">{title}</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Suite solutions */}
        <section className="relative bg-[#0c0d11] border-b border-white/[0.04]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_100%_0%,rgba(198,165,117,0.05),transparent_52%)]" />
          <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-20 sm:py-24 lg:py-28">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-14 sm:mb-16">
              <div className="max-w-2xl">
                <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#c6a575]/90 mb-4">Solutions</p>
                <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.65rem] leading-tight font-normal text-neutral-50">
                  One architecture. Three execution-ready layers.
                </h2>
              </div>
              <Link
                to="/features"
                className="inline-flex items-center gap-1 text-sm font-medium text-[#c6a575] hover:text-[#d4b896] transition-colors shrink-0"
              >
                View full capability map
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {SUITES.map(({ icon: Icon, title, tags, body }) => (
                <article
                  key={title}
                  className="flex flex-col rounded-[28px] border border-white/[0.06] bg-white/[0.025] p-6 sm:p-8 hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-300 h-full shadow-[0_8px_40px_-24px_rgba(0,0,0,0.35)]"
                >
                  <div className="w-12 h-12 rounded-2xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-center mb-5">
                    <Icon className="w-5 h-5 text-[#c6a575]" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-100 mb-3">{title}</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] uppercase tracking-wider text-neutral-500 border border-white/[0.08] px-2.5 py-1 rounded-full bg-white/[0.02]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-neutral-400 leading-relaxed flex-1">{body}</p>
                  <Link to="/features" className="mt-6 inline-flex items-center gap-1 text-xs font-semibold tracking-wide text-[#c6a575] hover:text-[#d4b896]">
                    Learn more <ArrowRight className="w-3 h-3" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Trust + CTA */}
        <section className="bg-[#efeeeb] text-[#1a1b1e] border-b border-neutral-200/60">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-20">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10 p-8 sm:p-10 rounded-[28px] border border-neutral-200/50 bg-white/65 backdrop-blur-md shadow-[0_8px_40px_-20px_rgba(0,0,0,0.06)]">
              <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
                <div className="flex items-center gap-2 text-neutral-400">
                  <Lock className="w-4 h-4 text-[#8b7355]" />
                  <span className="text-xs font-semibold tracking-[0.15em] uppercase">Designed for regulated environments</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-400">
                  <Sparkles className="w-4 h-4 text-[#8b7355]" />
                  <span className="text-xs font-semibold tracking-[0.15em] uppercase">Model & data lineage by default</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <Link
                  to="/pricing"
                  className="inline-flex items-center justify-center px-7 py-3.5 bg-[#121317] text-neutral-100 text-sm font-semibold rounded-full hover:bg-neutral-800 transition-all duration-300 shadow-md shadow-black/10"
                >
                  View pricing
                </Link>
                <Link
                  to="/request-access"
                  className="inline-flex items-center justify-center px-7 py-3.5 border border-neutral-300/80 text-sm font-medium text-[#121317] rounded-full bg-white/50 hover:bg-white/90 transition-all duration-300"
                >
                  Speak with us
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#0b0c0f] border-t border-white/[0.04] py-14">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-10 md:gap-8 mb-14">
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-[2px] h-5 bg-[#c6a575]" />
                  <h3 className="font-display text-lg text-neutral-100">General Exchange</h3>
                </div>
                <p className="text-neutral-500 text-sm leading-relaxed mb-4">Enterprise Trade Intelligence</p>
                <div className="flex items-center gap-2 text-neutral-600">
                  <MapPin className="w-3.5 h-3.5 text-[#c6a575]/70" />
                  <span className="text-xs">Fort Worth, Texas</span>
                </div>
              </div>
              <div>
                <h4 className="text-[11px] font-semibold text-neutral-500 uppercase tracking-[0.2em] mb-4">Platform</h4>
                <ul className="space-y-2.5">
                  <li>
                    <Link to="/features" className="text-sm text-neutral-400 hover:text-[#c6a575] transition-colors">
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link to="/pricing" className="text-sm text-neutral-400 hover:text-[#c6a575] transition-colors">
                      Pricing
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-[11px] font-semibold text-neutral-500 uppercase tracking-[0.2em] mb-4">Company</h4>
                <ul className="space-y-2.5">
                  <li>
                    <Link to="/community" className="text-sm text-neutral-400 hover:text-[#c6a575] transition-colors">
                      Community
                    </Link>
                  </li>
                  <li>
                    <Link to="/documents" className="text-sm text-neutral-400 hover:text-[#c6a575] transition-colors">
                      Documents
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-[11px] font-semibold text-neutral-500 uppercase tracking-[0.2em] mb-4">Resources</h4>
                <ul className="space-y-2.5">
                  <li>
                    <Link to="/university" className="text-sm text-neutral-400 hover:text-[#c6a575] transition-colors">
                      University
                    </Link>
                  </li>
                  <li>
                    <Link to="/help-center" className="text-sm text-neutral-400 hover:text-[#c6a575] transition-colors">
                      Help Center
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-[11px] font-semibold text-neutral-500 uppercase tracking-[0.2em] mb-4">Services</h4>
                <ul className="space-y-2.5">
                  <li>
                    <Link to="/newsletter" className="text-sm text-neutral-400 hover:text-[#c6a575] transition-colors">
                      Newsletter
                    </Link>
                  </li>
                  <li>
                    <Link to="/dashboard" className="text-sm text-neutral-400 hover:text-[#c6a575] transition-colors">
                      Wallet
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t border-white/[0.06] flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-neutral-600 text-xs">© {new Date().getFullYear()} General Exchange. All rights reserved.</p>
              <div className="flex flex-wrap justify-center gap-6 text-xs text-neutral-600">
                <a href="#" className="hover:text-neutral-300 transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="hover:text-neutral-300 transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="hover:text-neutral-300 transition-colors">
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

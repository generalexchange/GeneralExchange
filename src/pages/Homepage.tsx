/**
 * Homepage — institutional finance aesthetic with suite-style sections (eSignus-inspired structure)
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Brain,
  Newspaper,
  Activity,
  MapPin,
  Lock,
  Sparkles,
  Check,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { SEO } from '../components/SEO';

const LIVE_QUOTES: { symbol: string; pct: number }[] = [
  { symbol: 'AAPL', pct: 1.57 },
  { symbol: 'TSLA', pct: -5.35 },
  { symbol: 'NVDA', pct: 1.83 },
];

const BENEFITS: {
  facet: string;
  title: string;
  body: string;
  lede: string;
  bullets: readonly string[];
}[] = [
  {
    facet: 'Risk · Governance · Alignment',
    title: 'Scale with conviction',
    body: 'Run pre-trade checks, live exposure controls, and breach routing in one loop so risk response stays deterministic as volume grows.',
    lede: 'Every order is evaluated against live book limits, scenario envelopes, and desk policies before release, then re-checked as fills and hedges change state.',
    bullets: [
      'Pre-trade gate that validates position, strategy, and liquidity constraints per desk',
      'Intraday recalculation of net and gross exposure with policy-aware breach escalation',
      'Time-ordered event ledger that links signal, order intent, override, fill, and settlement',
    ],
  },
  {
    facet: 'Spend · Telemetry · ROI',
    title: 'Cost-aware engineering',
    body: 'Instrument every execution path from strategy trigger to venue response so capacity decisions are tied to measurable desk output.',
    lede: 'When a route slows or cost drifts, attribution points to the exact stage that changed: signal compute, adapter hop, venue response, or reconciliation.',
    bullets: [
      'Latency budget views split by research runtime, risk checks, routing, and exchange acknowledgment',
      'Cost lineage across data feeds, compute pools, and broker or venue transport',
      'Capacity planner that exposes underused pipelines before spend expands',
    ],
  },
  {
    facet: 'SoD · Policy · Second line',
    title: 'Institutional-grade controls',
    body: 'Encode maker-checker controls directly into model, limit, and release flows so governance is enforced by process, not reminders.',
    lede: 'Changes move through role-bound checkpoints with signed approvals, policy version references, and evidence artifacts generated at each step.',
    bullets: [
      'Role-segregated workflow for parameter edits, exception windows, and deployment cutovers',
      'Policy attachments version-locked to features and enforced at runtime decision points',
      'Audit-ready evidence bundle export with approver chain and execution impact snapshot',
    ],
  },
  {
    facet: 'Offerings · Brand · Trust',
    title: 'New revenue-ready workflows',
    body: 'Package desk capabilities into client-grade services with controlled entitlements, statement integrity, and reproducible outputs.',
    lede: 'The same trade engine primitives used internally can be exposed externally with scoped permissions, disclosure controls, and service-level boundaries.',
    bullets: [
      'Entitlement matrix maps accounts to strategy access, data visibility, and risk ceilings',
      'White-label reporting blocks inherit approved metrics and controlled narrative templates',
      'Client statement generator reconciles to internal ledger states with replay support',
    ],
  },
  {
    facet: 'Models · Data · Approvals',
    title: 'Decentralized operational risk',
    body: 'Assign explicit ownership to models, datasets, and approval paths so incidents route to accountable operators without delay.',
    lede: 'Each production artifact carries a steward, fallback owner, and review cadence, reducing hidden dependencies and single-point fragility.',
    bullets: [
      'Ownership graph spans factors, feature stores, vendor feeds, and release branches',
      'Approval attestations expire on schedule to prevent stale authorizations',
      'Failure domain map ties alerts to first responders with recovery playbook hooks',
    ],
  },
  {
    facet: 'Runbooks · Scenarios · Drills',
    title: 'Continuity you can rehearse',
    body: 'Run structured stress scenarios and recovery drills against live-like states so outage response is practiced, timed, and measurable.',
    lede: 'Operational continuity improves when rollback plans, communication trees, and cutover steps are rehearsed in the same environment used for execution.',
    bullets: [
      'Scenario catalog combining historical dislocations with desk-specific synthetic shocks',
      'Runbook executor with timed checkpoints, dependency checks, and escalation triggers',
      'Post-drill scorecards feeding control tuning, staffing plans, and release criteria',
    ],
  },
];

const SUITES = [
  {
    layer: '01',
    title: 'Risk & analytics core',
    tags: ['Surface-aware', 'Attribution', 'Limits'],
    body: 'Greeks, stress grids, and performance decomposition in one disciplined layer for options and multi-leg books.',
    feedCategory: 'Desk intelligence',
    timeLabel: 'Live',
  },
  {
    layer: '02',
    title: 'Execution fabric',
    tags: ['Routing', 'Transparency', 'Adapters'],
    body: 'Smart connectivity and clear intent-to-fill lineage—built for desks that cannot afford ambiguity at the wire.',
    feedCategory: 'Infrastructure',
    timeLabel: '2m ago',
  },
  {
    layer: '03',
    title: 'Unified workspace',
    tags: ['Single pane', 'Collaboration', 'Context'],
    body: 'Research, risk, and execution share one calm surface—fewer handoffs, clearer ownership across the desk.',
    feedCategory: 'Workflow',
    timeLabel: '8m ago',
  },
] as const;

const BRIDGE_OBSERVER_ORIGIN = 'https://bridgeobserver.com';

/** Smoky gray product bands — Platform advantages + brochure 01–06 */
const IBM = {
  bg00: '#d8d8df',
  bg10: '#cbcbd4',
  wire: '#6e6e78',
  border: 'rgba(0,0,0,0.09)',
  text: '#18181b',
  text60: '#52525c',
  text70: '#3f3f46',
  plaque: '#e6e6ec',
} as const;

const CAPABILITY_STRIP = [
  { label: 'Book governance', detail: 'Limits & attestation' },
  { label: 'Lineage', detail: 'Model & data maps' },
  { label: 'Latency envelope', detail: 'Measured paths' },
  { label: 'Recovery', detail: 'Rehearsed exits' },
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
                    className="inline-flex items-center justify-center px-8 py-3.5 bg-neutral-100 text-[#0c0d10] text-sm font-semibold tracking-wide rounded-full hover:bg-white transition-all duration-300 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.4)]"
                  >
                    Request Access
                  </Link>
                  <Link
                    to="/bridge-observer"
                    className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-[#2a2b31] text-sm font-semibold text-neutral-100 rounded-full bg-[#0f1014] hover:bg-[#15171d] hover:border-[#3a3d47] transition-all duration-300"
                  >
                    Bridge Observer
                    <Newspaper className="w-4 h-4" />
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

        {/* Platform advantages — editorial grid intro with minimal capability tiles */}
        <section
          className="border-b"
          style={{ backgroundColor: IBM.bg00, color: IBM.text, borderColor: IBM.border }}
        >
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-20 lg:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 items-start">
              <header className="lg:col-span-5 space-y-5 min-w-0 lg:pr-6">
                <p
                  className="text-xs font-semibold tracking-[0.16em] uppercase"
                  style={{ color: IBM.text60 }}
                >
                  Platform advantages
                </p>
                <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1.1] font-normal tracking-tight">
                  Elevate the institutional workflow
                </h2>
                <p
                  className="text-base sm:text-lg leading-relaxed max-w-xl font-light"
                  style={{ color: IBM.text70 }}
                >
                  The same rigor you expect from a tier-one counterparty—applied to how you research, risk-manage, and deliver outcomes.
                </p>
                <div
                  className="pt-5 border-t text-[11px] tracking-[0.14em] uppercase font-medium"
                  style={{ color: IBM.text60, borderColor: IBM.border }}
                >
                  Deterministic pre-trade checks · live state updates · accountable post-trade evidence
                </div>
              </header>
              <aside className="lg:col-span-7 min-w-0 w-full" aria-label="Capability summary grid">
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 h-full"
                  style={{ gridAutoRows: 'minmax(7rem, auto)' }}
                >
                  {CAPABILITY_STRIP.map(({ label, detail }) => (
                    <div
                      key={label}
                      className="rounded-xl sm:rounded-2xl border px-5 py-5 sm:px-6 sm:py-6 flex flex-col justify-between shadow-[0_2px_10px_rgba(0,0,0,0.06)] min-h-[7rem]"
                      style={{
                        borderColor: IBM.border,
                        backgroundColor: IBM.plaque,
                      }}
                    >
                      <p
                        className="text-[11px] font-semibold tracking-[0.14em] uppercase"
                        style={{ color: IBM.text60 }}
                      >
                        {label}
                      </p>
                      <p
                        className="text-sm sm:text-base mt-2 leading-snug font-medium"
                        style={{ color: IBM.text70 }}
                      >
                        {detail}
                      </p>
                      <span className="mt-5 block w-8 border-b" style={{ borderColor: IBM.wire }} aria-hidden />
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* Brochure chapters: one full viewport per advantage */}
        {BENEFITS.map(({ facet, title, body, lede, bullets }, idx) => {
          const n = String(idx + 1).padStart(2, '0');
          const light = idx % 2 === 0;
          const sectionBg = light ? IBM.bg00 : IBM.bg10;
          /** Sections 01, 03, 05: panel left, narrative right */
          const flipLayout = idx % 2 === 0;
          const mainColumn = (
            <div
              className={`lg:col-span-7 space-y-6 sm:space-y-8 min-w-0 ${flipLayout ? 'lg:order-2' : 'lg:order-1'}`}
            >
              <div
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 pb-5 border-b"
                style={{ borderColor: IBM.border }}
              >
                <span
                  className="font-mono text-sm tabular-nums tracking-[0.25em] rounded-full px-3 py-1.5 border"
                  style={{
                    color: IBM.text60,
                    borderColor: IBM.wire,
                    backgroundColor: IBM.plaque,
                  }}
                >
                  {n}
                </span>
                <span
                  className="text-xs sm:text-sm font-medium tracking-wide"
                  style={{ color: IBM.text60 }}
                >
                  {facet}
                </span>
              </div>
              <h3 className="font-display text-3xl sm:text-4xl lg:text-[2.85rem] xl:text-[3.1rem] leading-[1.08] font-normal">
                {title}
              </h3>
              <p
                className="text-lg sm:text-xl leading-relaxed max-w-2xl font-normal"
                style={{ color: IBM.text70 }}
              >
                {body}
              </p>
              <p
                className="text-base leading-relaxed max-w-2xl border-l-2 pl-5"
                style={{ color: IBM.text60, borderLeftColor: IBM.wire }}
              >
                {lede}
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 pt-2 max-w-4xl">
                {bullets.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-base leading-relaxed"
                    style={{ color: IBM.text70 }}
                  >
                    <Check
                      className="w-5 h-5 shrink-0 mt-0.5"
                      style={{ color: IBM.text60 }}
                      strokeWidth={2}
                      aria-hidden
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
          const panelColumn = (
            <div className={`lg:col-span-5 w-full min-w-0 ${flipLayout ? 'lg:order-1' : 'lg:order-2'}`}>
              <div
                className="rounded-[1.75rem] lg:rounded-[2rem] border min-h-[240px] sm:min-h-[280px] lg:min-h-[min(52vh,440px)] shadow-[0_2px_12px_rgba(0,0,0,0.08)]"
                style={{ borderColor: IBM.border, backgroundColor: IBM.plaque }}
                data-illustration-slot={`platform-advantage-${n}-panel`}
                aria-label="Illustration"
              />
            </div>
          );
          return (
            <section
              key={title}
              id={`platform-advantage-${n}`}
              className="scroll-mt-[calc(3.75rem+1px)] min-h-screen flex items-stretch border-b"
              style={{
                backgroundColor: sectionBg,
                color: IBM.text,
                borderColor: IBM.border,
              }}
            >
              <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-20 lg:py-24 w-full flex flex-col justify-center">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-20 items-start lg:items-center">
                  {mainColumn}
                  {panelColumn}
                </div>
              </div>
            </section>
          );
        })}

        {/* Bridge Observer — modern wire grid (future: bridgeobserver.com API) */}
        <section
          className="bg-[#1a1d24] border-b border-white/[0.08] scroll-mt-[calc(3.75rem+1px)]"
          aria-labelledby="bridge-observer-heading"
        >
          <div className="max-w-[1100px] mx-auto px-5 sm:px-8 lg:px-10 py-16 sm:py-20 lg:py-24">
            <header className="text-center border border-white/[0.14] rounded-[24px] bg-white/[0.04] py-8 sm:py-10 px-5 sm:px-8">
              <p className="text-[10px] sm:text-[11px] tracking-[0.32em] uppercase text-neutral-300 mb-3">
                General Exchange — Wire
              </p>
              <h2
                id="bridge-observer-heading"
                className="text-[2rem] sm:text-[2.6rem] lg:text-[2.9rem] font-semibold text-neutral-50 tracking-[-0.02em] leading-[1.02]"
              >
                Bridge Observer
              </h2>
            </header>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-6 text-[11px] uppercase tracking-[0.2em] text-neutral-300">
              <span>Capability — desk breadth</span>
              <div className="flex flex-wrap gap-x-8 gap-y-2">
                <a
                  href={BRIDGE_OBSERVER_ORIGIN}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#d6ba8b] hover:text-[#e3ccaa] transition-colors"
                >
                  Bridge Observer
                </a>
                <Link to="/features" className="text-neutral-200 hover:text-white transition-colors">
                  Capability map
                </Link>
              </div>
            </div>

            <div
              className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4"
              role="list"
            >
              {SUITES.map(({ layer, title, tags, body, feedCategory, timeLabel }) => (
                <article
                  key={title}
                  role="listitem"
                  className="rounded-2xl border border-white/[0.12] bg-white/[0.05] py-8 sm:py-10 px-5 sm:px-6 transition-colors hover:bg-white/[0.07]"
                >
                  <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-300 mb-5 flex flex-wrap gap-x-2 gap-y-1">
                    <span className="text-[#d6ba8b]">Layer {layer}</span>
                    <span className="text-neutral-500" aria-hidden>
                      |
                    </span>
                    <span>{feedCategory}</span>
                    <span className="text-neutral-500" aria-hidden>
                      |
                    </span>
                    <span className="tabular-nums">{timeLabel}</span>
                  </p>
                  <h3 className="text-xl sm:text-2xl text-neutral-100 font-semibold leading-snug tracking-[-0.01em] mb-3">
                    {title}
                  </h3>
                  <p className="text-sm text-neutral-200 leading-[1.65] mb-6">{body}</p>
                  <p className="text-[11px] text-neutral-400 leading-relaxed border-t border-white/[0.1] pt-4">
                    {tags.join(' · ')}
                  </p>
                </article>
              ))}
            </div>

          </div>
        </section>

        {/* Trust + CTA — same smoky gray system as platform bands */}
        <section
          className="border-b"
          style={{ backgroundColor: IBM.bg00, color: IBM.text, borderColor: IBM.border }}
        >
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-20">
            <div
              className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10 p-8 sm:p-10 rounded-[28px] border shadow-[0_8px_40px_-20px_rgba(0,0,0,0.08)]"
              style={{ borderColor: IBM.border, backgroundColor: IBM.plaque }}
            >
              <div className="flex flex-wrap items-center gap-x-10 gap-y-4 text-[#3f3f46]">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 shrink-0 text-[#3f3f46]" strokeWidth={2} aria-hidden />
                  <span className="text-xs font-semibold tracking-[0.15em] uppercase">Designed for regulated environments</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 shrink-0 text-[#3f3f46]" strokeWidth={2} aria-hidden />
                  <span className="text-xs font-semibold tracking-[0.15em] uppercase">Model & data lineage by default</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <Link
                  to="/pricing"
                  className="inline-flex items-center justify-center px-7 py-3.5 text-sm font-semibold rounded-full transition-colors border border-[#3f3f46] text-[#3f3f46] bg-transparent hover:bg-[#3f3f46]/10"
                >
                  View pricing
                </Link>
                <Link
                  to="/request-access"
                  className="inline-flex items-center justify-center px-7 py-3.5 text-sm font-semibold rounded-full transition-colors border border-[#3f3f46] text-[#3f3f46] bg-transparent hover:bg-[#3f3f46]/10"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 md:gap-8 mb-14">
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

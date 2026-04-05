/**
 * Homepage — General Exchange · tokenized AMD compute (Lubbock.cloud)
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Sparkles, Check, Cpu, LineChart, Shield } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { SEO } from '../components/SEO';
import { Hero } from '../components/Hero';
import { InstitutionalFooter } from '../components/InstitutionalFooter';

const PREMIUM_CARDS = [
  {
    title: 'Tokenized Compute',
    body: 'Reserve AMD GPU capacity as tradeable units—train models, run simulations, and scale inference without owning the rack.',
    icon: Cpu,
    href: '/pricing',
  },
  {
    title: 'Backtesting Engine',
    body: 'Reproducible historical runs with disciplined leakage controls—built for desks that treat backtests as regulated artifacts.',
    icon: LineChart,
    href: '/features#feature-backtesting',
  },
  {
    title: 'Risk Modeling Suite',
    body: 'Monte Carlo, scenario libraries, and VaR-style grids executed on institutional-grade silicon with clear provenance.',
    icon: Shield,
    href: '/features#feature-risk-management',
  },
] as const;

const BENEFITS: {
  facet: string;
  title: string;
  body: string;
  lede: string;
  bullets: readonly string[];
}[] = [
  {
    facet: 'Compute · Tokens · Capacity',
    title: 'Capacity you can schedule and hedge',
    body: 'Tokenized AMD hours align spend with research windows, batch inference, and stress runs—so desks scale compute like any other input.',
    lede: 'General Exchange connects trader workflows to Lubbock.cloud pools with clear unit economics and queue visibility.',
    bullets: [
      'GPU-hour tokens mapped to MI-class AMD inventory',
      'Priority lanes for Monte Carlo and backtest grids',
      'Attribution from job lineage to strategy and book',
    ],
  },
  {
    facet: 'Research · Simulation · Deployment',
    title: 'From training run to production signal',
    body: 'The same fabric supports training trading algorithms, Monte Carlo paths, risk modelling, and inference—with consistent logging.',
    lede: 'Bridge Observer intelligence surfaces sit beside execution context so narrative and compute decisions stay linked.',
    bullets: [
      'Shared metadata across training, backtest, and live',
      'Scenario catalogues for regulatory-style replay',
      'Inference SLOs without starving research queues',
    ],
  },
  {
    facet: 'Governance · Evidence · Trust',
    title: 'Institutional controls by design',
    body: 'Approvals, entitlements, and exportable evidence bundles mirror what wealth and quant desks expect from tier-one infrastructure.',
    lede: 'No cartoon promises—just disciplined process, segregation of duties, and audit-friendly outputs.',
    bullets: [
      'Role-bound changes to models and capacity plans',
      'Version-locked policies at runtime checkpoints',
      'Evidence exports with approver chain snapshots',
    ],
  },
];

const SUITES = [
  {
    layer: '01',
    title: 'Desk intelligence',
    tags: ['Bridge Observer', 'Context', 'Taxonomy'],
    body: 'Headlines and signals mapped to book, model, and venue so traders move from narrative to exposure in one motion.',
    feedCategory: 'Market intelligence',
    timeLabel: 'Live',
  },
  {
    layer: '02',
    title: 'Compute fabric',
    tags: ['AMD', 'Tokenized', 'Lubbock.cloud'],
    body: 'Reserved MI-class pools for training, inference, and simulation—with transparent unit pricing and queue discipline.',
    feedCategory: 'Infrastructure',
    timeLabel: 'Updated',
  },
  {
    layer: '03',
    title: 'Strategy workspace',
    tags: ['Backtest', 'Risk', 'Builder'],
    body: 'A calm single pane for research, risk, and release—fewer handoffs, clearer ownership across the desk.',
    feedCategory: 'Workflow',
    timeLabel: '8m ago',
  },
] as const;

const BRIDGE_OBSERVER_ORIGIN = 'https://bridgeobserver.com';

/** Warm English-institutional light bands */
const BAND = {
  bg00: '#ECE8E0',
  bg10: '#E3DDD2',
  wire: '#6b7c6e',
  border: 'rgba(46, 90, 58, 0.14)',
  text: '#1A1A1A',
  text60: '#4a4a48',
  text70: '#2f2f2d',
  plaque: '#F5F2EB',
} as const;

export const Homepage: React.FC = () => {
  return (
    <div className="min-h-screen bg-charcoal font-sans text-neutral-100 antialiased selection:bg-tan/20">
      <SEO
        title="General Exchange — Institutional-Grade Compute for Trading"
        description="Train, test, and deploy trading algorithms using tokenized AMD compute. The consumer UI for Lubbock.cloud."
        keywords="tokenized compute, AMD GPU, trading algorithms, Monte Carlo, backtesting, risk modelling, Lubbock.cloud, General Exchange"
        canonical="https://generalexchange.com/"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'General Exchange',
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Web',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
        }}
      />
      <Navbar showSearch={false} />

      <div className="pt-14 sm:pt-[3.75rem]">
        <Hero />

        {/* Premium institutional cards */}
        <section
          className="border-b"
          style={{ backgroundColor: BAND.bg00, color: BAND.text, borderColor: BAND.border }}
        >
          <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-20 lg:py-28">
            <header className="max-w-2xl mb-12 sm:mb-16">
              <p className="text-xs font-semibold tracking-[0.16em] uppercase mb-3" style={{ color: BAND.text60 }}>
                Platform pillars
              </p>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1.08] font-medium tracking-tight">
                Compute, backtest, and risk—in one institutional stack
              </h2>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-8">
              {PREMIUM_CARDS.map(({ title, body, icon: Icon, href }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    to={href}
                    className="group block h-full rounded-sm border p-6 sm:p-8 transition-all duration-300 hover:shadow-[0_20px_50px_-28px_rgba(46,90,58,0.18)]"
                    style={{
                      borderColor: BAND.border,
                      backgroundColor: BAND.plaque,
                    }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <span className="block w-10 h-px bg-institutional-green/50 group-hover:w-14 transition-all" aria-hidden />
                      <Icon className="w-5 h-5 text-institutional-green" strokeWidth={1.25} />
                    </div>
                    <h3 className="font-display text-xl sm:text-2xl mb-3 group-hover:text-institutional-green transition-colors">
                      {title}
                    </h3>
                    <p className="text-sm sm:text-base leading-relaxed font-light" style={{ color: BAND.text70 }}>
                      {body}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Capability chapters */}
        {BENEFITS.map(({ facet, title, body, lede, bullets }, idx) => {
          const n = String(idx + 1).padStart(2, '0');
          const light = idx % 2 === 0;
          const sectionBg = light ? BAND.bg00 : BAND.bg10;
          const flipLayout = idx % 2 === 0;
          const mainColumn = (
            <div className={`lg:col-span-7 space-y-6 sm:space-y-8 min-w-0 ${flipLayout ? 'lg:order-2' : 'lg:order-1'}`}>
              <div
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 pb-5 border-b"
                style={{ borderColor: BAND.border }}
              >
                <span
                  className="font-mono text-sm tabular-nums tracking-[0.25em] rounded-sm px-3 py-1.5 border"
                  style={{
                    color: BAND.text60,
                    borderColor: BAND.wire,
                    backgroundColor: BAND.plaque,
                  }}
                >
                  {n}
                </span>
                <span className="text-xs sm:text-sm font-medium tracking-wide" style={{ color: BAND.text60 }}>
                  {facet}
                </span>
              </div>
              <h3 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1.08] font-medium">{title}</h3>
              <p className="text-lg sm:text-xl leading-relaxed max-w-2xl font-light" style={{ color: BAND.text70 }}>
                {body}
              </p>
              <p
                className="text-base leading-relaxed max-w-2xl border-l-2 pl-5"
                style={{ color: BAND.text60, borderLeftColor: BAND.wire }}
              >
                {lede}
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 pt-2 max-w-4xl">
                {bullets.map((item) => (
                  <li key={item} className="flex gap-3 text-base leading-relaxed" style={{ color: BAND.text70 }}>
                    <Check className="w-5 h-5 shrink-0 mt-0.5 text-institutional-green" strokeWidth={1.75} aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
          const panelColumn = (
            <div className={`lg:col-span-5 w-full min-w-0 ${flipLayout ? 'lg:order-1' : 'lg:order-2'}`}>
              <div
                className="rounded-sm border min-h-[240px] sm:min-h-[280px] lg:min-h-[min(48vh,400px)] shadow-[0_2px_12px_rgba(0,0,0,0.06)] bg-gradient-to-br from-institutional-green/8 via-transparent to-tan/10"
                style={{ borderColor: BAND.border, backgroundColor: BAND.plaque }}
                aria-hidden
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
                color: BAND.text,
                borderColor: BAND.border,
              }}
            >
              <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-20 lg:py-24 w-full flex flex-col justify-center">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-20 items-start lg:items-center">
                  {mainColumn}
                  {panelColumn}
                </div>
              </div>
            </section>
          );
        })}

        {/* Bridge Observer */}
        <section
          className="bg-dark-gray border-b border-white/[0.06] scroll-mt-[calc(3.75rem+1px)]"
          aria-labelledby="bridge-observer-heading"
        >
          <div className="max-w-[1100px] mx-auto px-5 sm:px-8 lg:px-10 py-16 sm:py-20 lg:py-24">
            <header className="text-center border border-tan/20 rounded-sm bg-charcoal/40 py-8 sm:py-10 px-5 sm:px-8">
              <p className="text-[10px] sm:text-[11px] tracking-[0.28em] uppercase text-neutral-400 mb-3">
                Market intelligence
              </p>
              <h2
                id="bridge-observer-heading"
                className="font-display text-[2rem] sm:text-[2.6rem] lg:text-[2.85rem] font-medium text-neutral-50 tracking-tight leading-[1.05]"
              >
                Bridge Observer
              </h2>
              <p className="mt-4 text-sm text-neutral-400 max-w-xl mx-auto leading-relaxed">
                Curated wire for desks—connect narrative to book context and Lubbock.cloud workloads.
              </p>
            </header>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-8 text-[11px] uppercase tracking-[0.18em] text-neutral-400">
              <span>General Exchange · Wire</span>
              <div className="flex flex-wrap gap-x-8 gap-y-2">
                <a
                  href={BRIDGE_OBSERVER_ORIGIN}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-tan hover:text-tan-muted transition-colors"
                >
                  bridgeobserver.com
                </a>
                <Link to="/bridge-observer" className="text-neutral-200 hover:text-tan transition-colors">
                  Full feed
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5" role="list">
              {SUITES.map(({ layer, title, tags, body, feedCategory, timeLabel }) => (
                <article
                  key={title}
                  role="listitem"
                  className="rounded-sm border border-white/[0.08] bg-charcoal/60 py-7 sm:py-9 px-5 sm:px-6 transition-colors hover:border-institutional-green/35 hover:bg-charcoal/80"
                >
                  <p className="text-[10px] uppercase tracking-[0.16em] text-neutral-500 mb-4 flex flex-wrap gap-x-2 gap-y-1">
                    <span className="text-tan">Layer {layer}</span>
                    <span className="text-neutral-600" aria-hidden>
                      |
                    </span>
                    <span>{feedCategory}</span>
                    <span className="text-neutral-600" aria-hidden>
                      |
                    </span>
                    <span className="tabular-nums">{timeLabel}</span>
                  </p>
                  <h3 className="font-display text-xl sm:text-2xl text-neutral-100 leading-snug tracking-tight mb-3">{title}</h3>
                  <p className="text-sm text-neutral-400 leading-relaxed mb-5">{body}</p>
                  <p className="text-[11px] text-neutral-500 leading-relaxed border-t border-white/[0.08] pt-4">{tags.join(' · ')}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Trust + CTA */}
        <section className="border-b" style={{ backgroundColor: BAND.bg00, color: BAND.text, borderColor: BAND.border }}>
          <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-20">
            <div
              className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10 p-8 sm:p-10 rounded-sm border shadow-[0_8px_40px_-20px_rgba(46,90,58,0.12)]"
              style={{ borderColor: BAND.border, backgroundColor: BAND.plaque }}
            >
              <div className="flex flex-wrap items-center gap-x-10 gap-y-4" style={{ color: BAND.text70 }}>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 shrink-0 text-institutional-green" strokeWidth={1.5} aria-hidden />
                  <span className="text-xs font-semibold tracking-[0.15em] uppercase">Regulated-environment ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 shrink-0 text-institutional-green" strokeWidth={1.5} aria-hidden />
                  <span className="text-xs font-semibold tracking-[0.15em] uppercase">Lineage-aware by default</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <Link
                  to="/pricing"
                  className="inline-flex items-center justify-center px-7 py-3.5 text-sm font-semibold rounded-sm transition-colors border border-institutional-green text-institutional-green bg-transparent hover:bg-institutional-green/10"
                >
                  View tokens
                </Link>
                <Link
                  to="/request-access"
                  className="inline-flex items-center justify-center px-7 py-3.5 text-sm font-semibold rounded-sm transition-colors bg-institutional-green text-white hover:bg-institutional-green-muted"
                >
                  Speak with us
                </Link>
              </div>
            </div>
          </div>
        </section>

        <InstitutionalFooter />
      </div>
    </div>
  );
};

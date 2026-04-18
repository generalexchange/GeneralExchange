/**
 * Homepage-only full-viewport marketing sections (Risk, Strategies, History, Backspace) after Hero + positioning strip.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Hero } from '@/components/Hero';
import {
  HomepageBridgeObserverRestored,
  HomepageTrustCtaRestored,
  HomepageRemainingPillars,
} from './HomepageLegacyRestored';

function SectionActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-10 flex flex-col gap-3 border-t border-white/[0.08] pt-8 sm:flex-row sm:flex-wrap sm:items-center">
      {children}
    </div>
  );
}

const btnPrimary =
  'inline-flex items-center justify-center rounded-lg bg-tan px-6 py-3 text-sm font-semibold text-charcoal transition-colors hover:bg-tan-muted';
const btnGreen =
  'inline-flex items-center justify-center rounded-lg bg-institutional-green px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-institutional-green-muted';

const easeLux = [0.22, 1, 0.36, 1] as const;

const sectionReveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-12% 0px' },
  transition: { duration: 0.65, ease: easeLux },
};

function SectionNum({ n, label }: { n: string; label: string }) {
  return (
    <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-500 sm:text-[11px]">
      <span className="text-tan/90">{n}</span>
      <span className="text-zinc-600"> · </span>
      {label}
    </p>
  );
}

function PayoffCurveSvg({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 220"
      className={`h-auto w-full min-h-[200px] max-w-none text-zinc-500 sm:min-h-[240px] lg:min-h-[260px] ${className}`}
      aria-hidden
    >
      <defs>
        <linearGradient id="hp-payoff-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(46,90,58,0.35)" />
          <stop offset="100%" stopColor="rgba(46,90,58,0)" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="400" height="220" fill="transparent" />
      <line x1="40" y1="20" x2="40" y2="200" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
      <line x1="40" y1="200" x2="380" y2="200" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
      <path
        d="M 40 165 Q 120 40 200 95 T 380 55"
        fill="none"
        stroke="rgb(210,180,140)"
        strokeWidth="1.5"
        strokeOpacity="0.85"
      />
      <path
        d="M 40 165 Q 120 40 200 95 T 380 55 L 380 200 L 40 200 Z"
        fill="url(#hp-payoff-fill)"
        opacity="0.9"
      />
    </svg>
  );
}

const STRATEGY_ROWS = [
  { name: 'Mean Reversion', sym: 'SPY', tf: '15min', ran: '2026-04-12' },
  { name: 'Momentum Breakout', sym: 'QQQ', tf: '1hr', ran: '2026-04-11' },
  { name: 'Iron Condor', sym: 'AAPL', tf: 'Weekly', ran: '2026-04-10' },
  { name: 'VWAP Fade', sym: 'NQ', tf: '5min', ran: '2026-04-09' },
] as const;

const HISTORY_ROWS = [
  { d: '2026-04-12', sym: 'QQQ', strat: 'Momentum Breakout', en: '412.08', ex: '418.40', pnl: '+1,842', res: 'WIN' as const },
  { d: '2026-04-11', sym: 'SPY', strat: 'Mean Reversion', en: '481.20', ex: '479.55', pnl: '-412', res: 'LOSS' as const },
  { d: '2026-04-10', sym: 'AAPL', strat: 'Iron Condor', en: '—', ex: '—', pnl: '+620', res: 'WIN' as const },
  { d: '2026-04-09', sym: 'NQ', strat: 'VWAP Fade', en: '18,442', ex: '18,510', pnl: '+340', res: 'WIN' as const },
  { d: '2026-04-08', sym: 'SPY', strat: 'Mean Reversion', en: '483.10', ex: '482.20', pnl: '-180', res: 'LOSS' as const },
];

export function HomepageFullPageSections() {
  return (
    <div className="bg-charcoal text-neutral-100">
      <Hero />

      {/* 01 — Risk */}
      <section
        className="flex min-h-screen flex-col justify-center border-b border-white/[0.06] bg-dark-gray/40 md:min-h-[100dvh]"
        aria-labelledby="hp-risk-title"
      >
        <motion.div className="mx-auto w-full max-w-content px-4 py-16 sm:px-6 sm:py-20 lg:px-10 lg:py-24" {...sectionReveal}>
          <SectionNum n="01" label="Risk" />
          <h2
            id="hp-risk-title"
            className="max-w-3xl font-display text-3xl font-medium leading-tight tracking-tight text-neutral-50 sm:text-4xl lg:text-[2.75rem]"
          >
            Real Time Payoff Simulation
          </h2>
          <p className="mt-4 max-w-3xl text-sm font-light leading-relaxed text-zinc-400 sm:text-base">
            Exposure visualization is how you actually see the book: net and gross by name, Greeks and decay through the
            session, where theta is earned or spent, and how concentration stacks across sectors, expiries, and venues—ladders,
            heatmaps, and drill-downs in one surface so you are not reconciling three spreadsheets at midnight. The goal is a
            live, legible picture of risk and capital before you size anything, not a static report that was already stale when
            it left the queue.
          </p>

          <div className="mt-12 flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
            <div className="min-w-0 flex-1">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1 lg:gap-5">
                {(
                  [
                    {
                      title: 'Profit & Loss',
                      body: 'Mark-to-market and scenario P&L in one surface: see how the book moves with price, volatility, and time before you add size or put on a hedge.',
                    },
                    {
                      title: 'Stress Test',
                      body: 'Shock the whole portfolio against tail moves, wider vol, and liquidity gaps—same book, faster answers than one-off spreadsheets.',
                    },
                    {
                      title: 'Greeks',
                      body: 'Delta, gamma, theta, and vega together so directional risk, convexity bleed, and vol sensitivity stay in one lens—not four different tabs.',
                    },
                  ] as const
                ).map((c) => (
                  <div
                    key={c.title}
                    className="rounded-xl border border-white/[0.08] bg-charcoal/60 p-5 sm:p-6"
                  >
                    <h3 className="font-display text-lg text-neutral-100">{c.title}</h3>
                    <p className="mt-2 text-sm font-light leading-relaxed text-zinc-500">{c.body}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex w-full flex-col gap-6 lg:max-w-xl xl:max-w-2xl lg:shrink-0">
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-7">
                <p className="mb-4 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Payoff preview</p>
                <PayoffCurveSvg />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-3 lg:flex-col xl:flex-row">
                <Link
                  href="/risk-management"
                  className={`${btnPrimary} inline-flex min-h-[48px] flex-1 items-center justify-center px-6 py-3.5 sm:max-w-md lg:w-full xl:max-w-none`}
                >
                  Risk Management
                </Link>
                <Link
                  href="/reconnaissance"
                  className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-lg border border-white/[0.14] bg-transparent px-6 py-3.5 text-sm font-semibold text-zinc-200 transition-colors hover:border-tan/40 hover:bg-white/[0.05] hover:text-tan sm:max-w-md lg:w-full xl:max-w-none"
                >
                  Reconnaissance
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 02 — Strategies */}
      <section
        className="flex min-h-screen flex-col justify-center border-b border-white/[0.06] md:min-h-[100dvh]"
        aria-labelledby="hp-strategies-title"
      >
        <motion.div className="mx-auto w-full max-w-content px-4 py-16 sm:px-6 sm:py-20 lg:px-10 lg:py-24" {...sectionReveal}>
          <SectionNum n="02" label="Strategies" />
          <h2
            id="hp-strategies-title"
            className="max-w-3xl font-display text-3xl font-medium leading-tight tracking-tight text-neutral-50 sm:text-4xl lg:text-[2.75rem]"
          >
            Build once. Deploy anywhere.
          </h2>
          <p className="mt-4 max-w-3xl text-sm font-light leading-relaxed text-zinc-400 sm:text-base">
            Every strategy you save becomes a reusable template. Wire it into TradeEngine, backtest it in Backspace, or share
            it later.
          </p>

          <div className="mt-10 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3 sm:px-5">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Strategy library</span>
            </div>
            <ul className="divide-y divide-white/[0.06]" role="list">
              {STRATEGY_ROWS.map((r) => (
                <li key={r.name}>
                  <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-200">
                        {r.name} <span className="text-zinc-600">·</span> {r.sym}{' '}
                        <span className="text-zinc-600">·</span> {r.tf}
                      </p>
                      <p className="mt-0.5 text-[11px] text-zinc-500">Last run {r.ran}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      className="shrink-0 self-start rounded-lg border border-white/[0.1] bg-transparent px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 transition-colors hover:border-institutional-green/40 hover:bg-institutional-green/10 hover:text-tan sm:self-center"
                    >
                      Load into TradeEngine
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-white/[0.06] px-4 py-3 sm:px-5">
              <span className="inline-flex rounded-full border border-tan/25 bg-tan/10 px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-tan/90">
                Strategies become monetizable — coming soon
              </span>
            </div>
          </div>

          <SectionActions>
            <Link href="/library" className={btnPrimary}>
              Library
            </Link>
          </SectionActions>
        </motion.div>
      </section>

      {/* 03 — History */}
      <section
        className="flex min-h-screen flex-col justify-center border-b border-white/[0.06] bg-dark-gray/35 md:min-h-[100dvh]"
        aria-labelledby="hp-history-title"
      >
        <motion.div className="mx-auto w-full max-w-content px-4 py-16 sm:px-6 sm:py-20 lg:px-10 lg:py-24" {...sectionReveal}>
          <SectionNum n="03" label="History" />
          <h2
            id="hp-history-title"
            className="max-w-3xl font-display text-3xl font-medium leading-tight tracking-tight text-neutral-50 sm:text-4xl lg:text-[2.75rem]"
          >
            There Is A Story In Every Trade
          </h2>
          <p className="mt-4 max-w-3xl text-sm font-light leading-relaxed text-zinc-400 sm:text-base">
            P&L tracking. Decision review. Performance broken down by strategy, symbol, and session. This is what makes you
            better.
          </p>

          <div className="mt-10 overflow-x-auto rounded-xl border border-white/[0.08]">
            <table className="w-full min-w-[640px] text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.03] text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  {['Date', 'Symbol', 'Strategy', 'Entry', 'Exit', 'P&L', 'Result'].map((h) => (
                    <th key={h} className="px-3 py-3 font-medium sm:px-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {HISTORY_ROWS.map((row) => (
                  <tr key={row.d + row.sym} className="text-zinc-300">
                    <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[11px] text-zinc-500 sm:px-4">{row.d}</td>
                    <td className="px-3 py-2.5 font-medium sm:px-4">{row.sym}</td>
                    <td className="px-3 py-2.5 text-zinc-400 sm:px-4">{row.strat}</td>
                    <td className="px-3 py-2.5 font-mono tabular-nums sm:px-4">{row.en}</td>
                    <td className="px-3 py-2.5 font-mono tabular-nums sm:px-4">{row.ex}</td>
                    <td className={`px-3 py-2.5 font-mono tabular-nums sm:px-4 ${row.pnl.startsWith('+') ? 'text-institutional-green' : 'text-rose-400/90'}`}>
                      {row.pnl}
                    </td>
                    <td className="px-3 py-2.5 sm:px-4">
                      <span
                        className={
                          row.res === 'WIN'
                            ? 'rounded border border-institutional-green/40 bg-institutional-green/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-tan'
                            : 'rounded border border-white/[0.12] bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-400'
                        }
                      >
                        {row.res}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <SectionActions>
            <Link href="/almanac" className={btnPrimary}>
              Farmers Almanac
            </Link>
          </SectionActions>

          <HomepageRemainingPillars />
        </motion.div>
      </section>

      {/* 04 — Backspace */}
      <section
        className="relative flex min-h-screen flex-col justify-center overflow-hidden border-b border-white/[0.06] md:min-h-[100dvh]"
        aria-labelledby="hp-backspace-title"
      >
        <span
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-display text-[clamp(8rem,28vw,18rem)] font-semibold leading-none text-white/[0.04]"
          aria-hidden
        >
          04
        </span>

        <motion.div className="relative z-10 mx-auto w-full max-w-content px-4 py-16 sm:px-6 sm:py-20 lg:px-10 lg:py-24" {...sectionReveal}>
          <SectionNum n="04" label="Backspace" />
          <h2
            id="hp-backspace-title"
            className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-none tracking-tight text-neutral-50"
          >
            Backspace
          </h2>
          <p className="mt-4 text-lg font-light text-zinc-400 sm:text-xl">Our proprietary backtesting engine.</p>

          <blockquote className="mt-8 max-w-4xl border-l-2 border-institutional-green/50 pl-5 text-sm font-light leading-relaxed text-zinc-400 sm:text-base sm:pl-6">
            Backspace is where strategies are proven before capital is committed. Feed it a dataset, select your model —
            XGBoost, LSTM, or Reinforcement Learning — and run your setup against real historical paths. Calibration reports.
            Prediction vs actual overlays. Execution simulation. Backspace isn&apos;t a research toy — it&apos;s the proof layer
            between your idea and your position.
          </blockquote>

          <div className="mt-8 flex flex-wrap gap-2">
            {['Multi-Model', 'Dataset Import', 'QuantConnect Ready'].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1 text-[11px] font-medium text-zinc-400"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-6 sm:gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
            <div className="w-full max-w-xl flex-1 rounded-2xl border border-white/[0.1] bg-charcoal/80 p-4 shadow-[0_20px_60px_-24px_rgba(0,0,0,0.55)] sm:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Backspace · preview</p>
              <div className="mt-3 rounded-lg border border-dashed border-white/[0.12] bg-white/[0.02] px-4 py-8 text-center">
                <p className="text-xs text-zinc-400">Drop dataset or browse</p>
                <p className="mt-1 text-[10px] text-zinc-600">.csv · .json · .parquet</p>
              </div>
              <div className="mt-4 h-28 rounded-lg border border-white/[0.08] bg-white/[0.02] p-3">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-600">Prediction vs actual</p>
                <svg viewBox="0 0 280 72" className="mt-2 h-full w-full text-zinc-600" aria-hidden>
                  <path
                    d="M 0 50 L 40 45 L 80 52 L 120 38 L 160 44 L 200 28 L 240 36 L 280 22"
                    fill="none"
                    stroke="rgb(210,180,140)"
                    strokeWidth="1.25"
                    strokeOpacity="0.7"
                  />
                  <path
                    d="M 0 54 L 40 48 L 80 55 L 120 42 L 160 48 L 200 32 L 240 40 L 280 28"
                    fill="none"
                    stroke="rgb(46,90,58)"
                    strokeWidth="1.25"
                    strokeOpacity="0.85"
                  />
                </svg>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center justify-start gap-3 border-t border-white/[0.06] pt-6 lg:items-center lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
              <Link
                href="/tokenomics"
                className="inline-flex min-h-[48px] min-w-[10rem] items-center justify-center rounded-lg border border-white/[0.14] bg-transparent px-8 py-3.5 text-sm font-semibold text-zinc-200 transition-colors hover:border-tan/40 hover:bg-white/[0.05] hover:text-tan"
              >
                Tokenomics
              </Link>
              <Link
                href="/backspace"
                className={`${btnGreen} inline-flex min-h-[48px] min-w-[10rem] items-center justify-center px-8 py-3.5`}
              >
                Backspace
              </Link>
            </div>
          </div>

          <div className="mt-12 space-y-8">
            <HomepageBridgeObserverRestored />
            <HomepageTrustCtaRestored />
          </div>
        </motion.div>
      </section>
    </div>
  );
}

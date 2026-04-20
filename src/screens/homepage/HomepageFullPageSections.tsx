/**
 * Homepage-only full-viewport marketing sections (Risk, Library, Backspace) after Hero.
 */

'use client';

import React, { useId } from 'react';
import Link from 'next/link';
import { Hero } from '@/components/Hero';
import { SectionShell } from '@/components/homepage/SectionShell';
import { HomepageTrustCtaRestored, HomepageRemainingPillars } from './HomepageLegacyRestored';

/** Rounded tile with erase mark — reads as “delete / rewind proof” without echoing third-party logos. */
function BackspaceGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 22 22" fill="none" aria-hidden>
      <rect x="2.25" y="2.75" width="17.5" height="16.5" rx="4" className="stroke-current" strokeWidth="1.35" opacity="0.9" />
      <path
        d="M8.35 8.6l5.3 5.3m0-5.3l-5.3 5.3"
        className="stroke-current"
        strokeWidth="1.45"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Black surface + brass outline — shared by Risk, Library, and Backspace CTAs. */
const btnSection =
  'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-brass bg-black px-5 py-3 text-[13px] font-semibold tracking-wide text-tan transition-all duration-300 hover:border-brass-deep hover:bg-neutral-950 hover:text-brass focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/40 active:scale-[0.99] sm:w-auto sm:min-w-[10.25rem] sm:px-7 sm:py-3.5';

const btnSectionCompact =
  'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded border border-brass bg-black px-3 py-2.5 text-[10px] font-semibold uppercase leading-tight tracking-[0.14em] text-tan transition-all duration-300 hover:border-brass-deep hover:bg-neutral-950 hover:text-brass focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/40 active:scale-[0.99] sm:w-auto sm:min-h-0 sm:min-w-[11rem] sm:py-1.5';

function SectionActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-10 flex w-full max-w-lg flex-col gap-3 border-t border-white/[0.06] pt-8 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center">
      {children}
    </div>
  );
}

const RISK_CARDS = [
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
] as const;

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

function PayoffCurveSvg({ className = '' }: { className?: string }) {
  const uid = useId().replace(/:/g, '');
  const gid = `hp-pay-${uid}`;

  return (
    <svg
      viewBox="0 0 400 220"
      className={`h-auto w-full min-h-[200px] max-w-none sm:min-h-[240px] lg:min-h-[260px] ${className}`}
      aria-hidden
    >
      <defs>
        <linearGradient id={`${gid}-fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(46,90,58,0.38)" />
          <stop offset="100%" stopColor="rgba(46,90,58,0)" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="400" height="220" fill="transparent" />
      <line x1="40" y1="20" x2="40" y2="200" stroke="#C9A96E" strokeOpacity="0.35" strokeWidth="1" />
      <line x1="40" y1="200" x2="380" y2="200" stroke="#C9A96E" strokeOpacity="0.35" strokeWidth="1" />
      <path
        d="M 40 170 Q 120 80 200 115 T 380 90"
        fill="none"
        stroke="rgba(212,212,216,0.35)"
        strokeWidth="1"
        strokeDasharray="3 4"
      />
      <path
        d="M 40 165 Q 120 40 200 95 T 380 55"
        fill="none"
        stroke="#C9A96E"
        strokeWidth="1.5"
        strokeOpacity="0.95"
      />
      <path
        d="M 40 165 Q 120 40 200 95 T 380 55 L 380 200 L 40 200 Z"
        fill={`url(#${gid}-fill)`}
        opacity="0.9"
      />
    </svg>
  );
}

function HistoryIllustration() {
  return (
    <>
      <ul className="divide-y divide-white/[0.08] sm:hidden" role="list">
        {HISTORY_ROWS.map((row) => {
          const isWin = row.res === 'WIN';
          return (
            <li key={row.d + row.sym} className="flex items-center justify-between gap-4 px-3 py-4 sm:px-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-neutral-50">
                  {row.sym}
                  <span className="ml-2 text-zinc-600">·</span>
                  <span className="ml-2 text-zinc-400">{row.strat}</span>
                </p>
                <p className="mt-0.5 font-mono text-[10px] text-zinc-500 tabular">{row.d}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className={`font-mono text-sm tabular ${isWin ? 'text-moss' : 'text-rose-400'}`}>{row.pnl}</span>
                <span
                  className={`font-display text-base ${isWin ? 'text-moss' : 'text-zinc-500'}`}
                  aria-label={row.res}
                >
                  {isWin ? '▲' : '▽'}
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="hidden overflow-hidden rounded-lg border border-white/[0.08] bg-charcoal/70 shadow-[0_24px_48px_-28px_rgba(0,0,0,0.45)] sm:block">
        <table className="w-full table-fixed border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.04] sc-serif text-[10px] text-zinc-400">
              <th className="w-[12%] px-3 py-3 font-medium">Date</th>
              <th className="w-[9%] px-3 py-3 font-medium">Sym</th>
              <th className="w-[32%] px-3 py-3 font-medium">Strategy</th>
              <th className="w-[13%] px-3 py-3 font-medium">Entry</th>
              <th className="w-[13%] px-3 py-3 font-medium">Exit</th>
              <th className="w-[13%] px-3 py-3 font-medium">P&amp;L</th>
              <th className="w-[8%] px-3 py-3 text-center font-medium">·</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {HISTORY_ROWS.map((row) => {
              const isWin = row.res === 'WIN';
              return (
                <tr
                  key={row.d + row.sym}
                  className="text-zinc-200 transition-colors hover:bg-white/[0.04]"
                >
                  <td className="px-3 py-3 font-mono text-[11px] text-zinc-500 tabular">{row.d}</td>
                  <td className="px-3 py-3 font-medium text-neutral-50">{row.sym}</td>
                  <td className="px-3 py-3 text-zinc-400">{row.strat}</td>
                  <td className="px-3 py-3 font-mono text-[11px] tabular text-zinc-300">{row.en}</td>
                  <td className="px-3 py-3 font-mono text-[11px] tabular text-zinc-300">{row.ex}</td>
                  <td className={`px-3 py-3 font-mono text-[11px] tabular ${isWin ? 'text-moss' : 'text-rose-400'}`}>
                    {row.pnl}
                  </td>
                  <td
                    className={`px-3 py-3 text-center font-display text-base ${isWin ? 'text-moss' : 'text-zinc-500'}`}
                    aria-label={row.res}
                  >
                    {isWin ? '▲' : '▽'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function HomepageFullPageSections() {
  return (
    <div className="bg-charcoal text-neutral-100">
      <Hero />

      <SectionShell
        tone="primary"
        eyebrowNum="I"
        eyebrowLabel="Risk"
        ariaLabelledBy="hp-risk-title"
        title={<span id="hp-risk-title">Real Time Payoff Simulation</span>}
        lede="Exposure visualization is how you actually see the book: net and gross by name, Greeks and decay through the session, where theta is earned or spent, and how concentration stacks across sectors, expiries, and venues—ladders, heatmaps, and drill-downs in one surface so you are not reconciling three spreadsheets at midnight. The goal is a live, legible picture of risk and capital before you size anything, not a static report that was already stale when it left the queue."
      >
        <div className="mt-10 flex min-w-0 flex-col gap-10 sm:mt-12 lg:flex-row lg:items-start lg:gap-12">
          <div className="min-w-0 flex-1">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:grid-cols-1 lg:gap-7">
              {RISK_CARDS.map((c) => (
                <div key={c.title} className="min-w-0 border-l-2 border-brass/40 py-1 pl-4 sm:pl-5">
                  <h3 className="sc-serif text-[13px] font-medium text-neutral-50">{c.title}</h3>
                  <p className="mt-2 text-pretty text-[14px] font-normal leading-[1.7] text-zinc-400 break-words">{c.body}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex w-full flex-col gap-6 lg:max-w-xl xl:max-w-2xl lg:shrink-0">
            <div className="rounded-lg border border-white/[0.08] bg-charcoal/60 p-5 sm:p-7">
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Payoff preview</p>
              <PayoffCurveSvg />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-3 lg:flex-col xl:flex-row">
              <Link href="/reconnaissance" className={`${btnSection} flex-1 sm:max-w-md lg:w-full xl:max-w-none`}>
                Riskonometry
              </Link>
            </div>
          </div>
        </div>
      </SectionShell>

      <SectionShell
        tone="secondary"
        eyebrowNum="II"
        eyebrowLabel="Library"
        ariaLabelledBy="hp-library-title"
        title={<span id="hp-library-title">Library</span>}
        lede={
          'Reusable strategy templates, deployment into The Exchange and Backspace, and a full trade history—P&L, decisions, and performance by strategy, symbol, and session—in one place.'
        }
      >
        <div className="mt-10 grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-12">
          <div className="min-w-0">
            <h3 className="font-display text-xl font-normal tracking-tight text-neutral-50 sm:text-2xl">
              Build once. Deploy anywhere.
            </h3>
            <p className="mt-3 text-sm font-normal leading-[1.75] text-zinc-400 sm:text-base">
              Every strategy you save becomes a reusable template. Wire it into The Exchange, backtest it in Backspace, or share
              it later.
            </p>
            <div className="mt-6 overflow-hidden rounded-lg border border-white/[0.08] bg-charcoal/60">
              <div className="flex items-center justify-between border-b border-white/[0.08] bg-white/[0.04] px-4 py-3 sm:px-5">
                <span className="sc-serif text-[11px] text-zinc-400">Strategy library</span>
              </div>
              <ul className="divide-y divide-white/[0.06]" role="list">
                {STRATEGY_ROWS.map((r) => (
                  <li key={r.name}>
                    <div className="flex flex-col gap-3 px-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-3.5">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-neutral-50 sm:truncate">
                          {r.name} <span className="text-zinc-500">·</span> {r.sym}{' '}
                          <span className="text-zinc-500">·</span> {r.tf}
                        </p>
                        <p className="mt-0.5 text-[11px] font-normal text-zinc-500">Last run {r.ran}</p>
                      </div>
                      <Link href="/dashboard" className={`${btnSectionCompact} shrink-0 self-stretch sm:self-center sm:shrink-0`}>
                        Load into The Exchange
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="min-w-0">
            <h3 className="font-display text-xl font-normal tracking-tight text-neutral-50 sm:text-2xl">
              There Is A Story In Every Trade
            </h3>
            <p className="mt-3 text-sm font-normal leading-[1.75] text-zinc-400 sm:text-base">
              P&amp;L tracking. Decision review. Performance broken down by strategy, symbol, and session. This is what makes you
              better.
            </p>
            <div className="mt-6 rounded-lg border border-white/[0.08] bg-charcoal/40 p-1 sm:p-0 sm:bg-transparent sm:border-0">
              <HistoryIllustration />
            </div>
          </div>
        </div>

        <SectionActions>
          <Link href="/tokenomics" className={btnSection}>
            Tokenomics
          </Link>
        </SectionActions>

        <HomepageRemainingPillars />
      </SectionShell>

      <SectionShell
        tone="primary"
        verticalRhythm="lastOnPage"
        eyebrowNum="III"
        eyebrowLabel="Backspace"
        ariaLabelledBy="hp-backspace-title"
        title={
          <span
            id="hp-backspace-title"
            className="block text-pretty text-[clamp(1.85rem,8vw,3.5rem)] leading-[1.02] tracking-tight break-words"
          >
            Backspace
          </span>
        }
        lede="Our proprietary backtesting engine."
      >
        <blockquote className="mt-6 max-w-4xl border-l-2 border-brass pl-4 text-pretty text-[15px] font-normal leading-[1.75] text-zinc-300 break-words sm:mt-8 sm:pl-6 sm:text-base">
          Backspace is where you prove a trading plan before you risk real money. Load your data, pick a model that
          fits—XGBoost, LSTM, or reinforcement learning—and run it on real history so you see calm days and rough ones. You get
          simple reports that stack predictions next to what actually happened and sketch how orders might have filled. It is
          the step between a hunch and a position your desk can explain with confidence—not a toy, but the proof layer between
          your idea and your book.
        </blockquote>

        <div className="mt-8 flex flex-col gap-5 pb-4 sm:mt-10 sm:gap-6 sm:pb-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:pb-7">
          <div className="w-full max-w-xl flex-1 rounded-lg border border-white/[0.08] bg-charcoal/60 p-5 sm:p-6">
            <p className="sc-serif text-[11px] text-zinc-500">Backspace · preview</p>
            <div className="mt-3 rounded border border-dashed border-white/[0.12] bg-white/[0.03] px-4 py-8 text-center">
              <p className="text-xs text-zinc-300">Drop dataset or browse</p>
              <p className="mt-1 text-[10px] text-zinc-500 tabular">.csv · .json · .parquet</p>
            </div>
            <div className="mt-4 h-28 rounded border border-white/[0.08] bg-white/[0.03] p-3">
              <p className="sc-serif text-[10px] text-zinc-500">Prediction vs actual</p>
              <svg viewBox="0 0 280 72" className="mt-2 h-full w-full" aria-hidden>
                <path
                  d="M 0 50 L 40 45 L 80 52 L 120 38 L 160 44 L 200 28 L 240 36 L 280 22"
                  fill="none"
                  stroke="rgba(46,90,58,0.85)"
                  strokeWidth="1.25"
                />
                <path
                  d="M 0 54 L 40 48 L 80 55 L 120 42 L 160 48 L 200 32 L 240 40 L 280 28"
                  fill="none"
                  stroke="#C9A96E"
                  strokeWidth="1.25"
                  strokeOpacity="0.95"
                />
              </svg>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-start gap-3 border-t border-white/[0.06] pt-5 sm:pt-6 lg:items-center lg:border-l lg:border-t-0 lg:border-white/[0.08] lg:pl-8 lg:pt-0 xl:pl-10">
            <Link href="/backspace" className={`${btnSection} min-w-[10rem] justify-center`}>
              <BackspaceGlyph className="h-[1.05rem] w-[1.05rem] shrink-0 opacity-90" />
              Backspace
            </Link>
          </div>
        </div>

        <div className="mt-12 border-t border-white/[0.06] pt-10 sm:mt-14 sm:pt-12 lg:mt-16 lg:pt-14">
          <div className="mx-auto max-w-content layout-gutter">
            <div className="rule-brass my-6 sm:my-8 lg:my-10" aria-hidden />
          </div>
          <HomepageTrustCtaRestored />
        </div>
      </SectionShell>
    </div>
  );
}

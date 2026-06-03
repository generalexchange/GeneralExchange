/**
 * The Exchange / Trade Engine product page.
 *
 * Leads with the computational value of the Monte Carlo engine (@gx/analytics):
 *  - a live win-rate simulation in the hero (active trading, trade by trade),
 *  - parallax sections that explain how Monte Carlo turns thousands of simulated
 *    futures into risk parameters and expected return over a time horizon,
 *  - an options chain "earn-picker" where the modeled probability and expected
 *    return are computed per strike so the user effectively picks the outcome.
 *
 * The tail retains the Interactive Brokers execution layer + platform topology.
 * Route remains /trade-engine.
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import {
  SeededRandom,
  blackScholes,
  kellyCriterion,
  simulatePricePaths,
} from '@gx/analytics';
import { Navbar } from '@/components/Navbar';
import { InstitutionalFooter } from '@/components/InstitutionalFooter';
import { HeroSystemTopologyIllustration } from '@/components/homepage/HomepageMechanicsIllustrations';
import {
  HomepageExecutionLoopRestored,
  PillarSectionEmbed,
  getPillarById,
} from '@/screens/homepage/HomepageLegacyRestored';

const easeLux = [0.22, 1, 0.36, 1] as const;

const panel =
  'rounded-lg border border-white/[0.08] bg-charcoal/60 shadow-[0_24px_48px_-28px_rgba(0,0,0,0.55)]';
const panelHead =
  'flex items-center justify-between border-b border-white/[0.08] bg-white/[0.04] px-4 py-2.5';
const eyebrow = 'sc-serif text-[10px] text-zinc-400';

/* ============================================================== */
/* Precomputed Monte Carlo runs (deterministic seeds → stable SSR)  */
/* ============================================================== */

const SPOT = 100;

function quantile(sortedAsc: number[], frac: number): number {
  if (sortedAsc.length === 0) return 0;
  const idx = Math.min(sortedAsc.length - 1, Math.max(0, Math.round(frac * (sortedAsc.length - 1))));
  return sortedAsc[idx];
}

interface StepBand {
  t: number;
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
}

function buildStepBands(paths: number[][], steps: number): StepBand[] {
  const bands: StepBand[] = [];
  for (let t = 0; t <= steps; t += 1) {
    const col = paths.map((p) => p[t]).sort((a, b) => a - b);
    bands.push({
      t,
      p10: quantile(col, 0.1),
      p25: quantile(col, 0.25),
      p50: quantile(col, 0.5),
      p75: quantile(col, 0.75),
      p90: quantile(col, 0.9),
    });
  }
  return bands;
}

/** One-year fan of price paths used by the parallax explainer. */
const FAN_STEPS = 42;
const fanRun = simulatePricePaths({
  currentPrice: SPOT,
  volatility: 0.28,
  drift: 0.1,
  timeHorizon: 1,
  steps: FAN_STEPS,
  simulationCount: 1400,
  maxRecordedPaths: 320,
  seed: 7,
});
const FAN_BANDS = buildStepBands(fanRun.paths, FAN_STEPS);
const FAN_TERMINAL = [...fanRun.terminalPrices].sort((a, b) => a - b);
const FAN_EXPECTED = fanRun.expectedPrice;
const FAN_P10 = quantile(FAN_TERMINAL, 0.1);
const FAN_P90 = quantile(FAN_TERMINAL, 0.9);
const FAN_PROB_UP = FAN_TERMINAL.filter((p) => p > SPOT).length / FAN_TERMINAL.length;

/** Quarter-year run for the options chain (P(ITM) + expected payoff per strike). */
const chainRun = simulatePricePaths({
  currentPrice: SPOT,
  volatility: 0.28,
  drift: 0.1,
  timeHorizon: 0.25,
  steps: 20,
  simulationCount: 6000,
  maxRecordedPaths: 0,
  seed: 11,
});
const CHAIN_TERMINAL = chainRun.terminalPrices;

const STRIKES = [92.5, 97.5, 100, 102.5, 107.5, 112.5];

interface ChainRow {
  strike: number;
  premium: number;
  delta: number;
  probItm: number;
  expectedReturn: number;
}

const CHAIN: ChainRow[] = STRIKES.map((strike) => {
  const bs = blackScholes({
    stockPrice: SPOT,
    strike,
    timeToExpiration: 0.25,
    volatility: 0.28,
    riskFreeRate: 0.04,
    optionType: 'call',
  });
  const itm = CHAIN_TERMINAL.filter((p) => p > strike).length / CHAIN_TERMINAL.length;
  const meanPayoff =
    CHAIN_TERMINAL.reduce((s, p) => s + Math.max(0, p - strike), 0) / CHAIN_TERMINAL.length;
  const expectedReturn = bs.theoreticalPrice > 0 ? meanPayoff / bs.theoreticalPrice - 1 : 0;
  return { strike, premium: bs.theoreticalPrice, delta: bs.delta, probItm: itm, expectedReturn };
});

/** "Pick how much you want to earn" — target return → best-matching strike. */
const TARGETS = [0.25, 0.6, 1.2];
const EARN_TIERS = TARGETS.map((target) => {
  const match = CHAIN.reduce((best, row) =>
    Math.abs(row.expectedReturn - target) < Math.abs(best.expectedReturn - target) ? row : best,
  );
  return { target, row: match };
});

/** Kelly sizing example off the modeled edge. */
const SIZING = kellyCriterion({
  winProbability: FAN_PROB_UP,
  averageWin: 2,
  averageLoss: 1,
  accountSize: 100_000,
});

/* ============================================================== */
/* Hero — live win-rate simulation (active trading, trade by trade)*/
/* ============================================================== */

const HERO_WIN_RATE = 0.57;
const HERO_MAX_TRADES = 70;
const HERO_VISIBLE = 48;

interface HeroState {
  equity: number[];
  results: boolean[];
  wins: number;
  total: number;
}

const HERO_INITIAL: HeroState = { equity: [100], results: [], wins: 0, total: 0 };

function WinRateLiveSim() {
  const reduce = useReducedMotion();
  const [state, setState] = useState<HeroState>(HERO_INITIAL);
  const rng = useRef(new SeededRandom(20260603));

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => {
      setState((prev) => {
        if (prev.total >= HERO_MAX_TRADES) {
          rng.current = new SeededRandom(20260603);
          return HERO_INITIAL;
        }
        const win = rng.current.bernoulli(HERO_WIN_RATE);
        const last = prev.equity[prev.equity.length - 1];
        // +1.7% on a win, −1.0% on a loss → positive expectancy.
        const next = last * (win ? 1.017 : 0.99);
        const equity = [...prev.equity, next].slice(-HERO_VISIBLE);
        return {
          equity,
          results: [...prev.results, win].slice(-22),
          wins: prev.wins + (win ? 1 : 0),
          total: prev.total + 1,
        };
      });
    }, 150);
    return () => window.clearInterval(id);
  }, [reduce]);

  const realizedWinRate = state.total > 0 ? state.wins / state.total : HERO_WIN_RATE;
  const equity = state.equity;
  const min = Math.min(...equity);
  const max = Math.max(...equity);
  const span = max - min || 1;
  const W = 320;
  const H = 96;
  const points = equity.map((v, i) => {
    const x = equity.length > 1 ? (i / (equity.length - 1)) * W : 0;
    const y = H - ((v - min) / span) * (H - 8) - 4;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `${linePath} L ${W},${H} L 0,${H} Z`;
  const totalReturn = equity[equity.length - 1] / equity[0] - 1;

  return (
    <div className={`${panel} w-full max-w-md overflow-hidden`} aria-hidden>
      <div className={panelHead}>
        <span className={eyebrow}>Active session · win-rate simulation</span>
        <span className="flex items-center gap-1.5 font-mono text-[9px] text-moss">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-moss" /> live
        </span>
      </div>

      <div className="grid grid-cols-3 divide-x divide-white/[0.06] border-b border-white/[0.06]">
        <div className="px-4 py-3">
          <p className="text-[9px] uppercase tracking-wider text-zinc-500">Win rate</p>
          <p className="mt-1 font-mono text-2xl tabular-nums text-tan">
            {(realizedWinRate * 100).toFixed(1)}
            <span className="text-sm text-tan/60">%</span>
          </p>
        </div>
        <div className="px-4 py-3">
          <p className="text-[9px] uppercase tracking-wider text-zinc-500">Trades</p>
          <p className="mt-1 font-mono text-2xl tabular-nums text-neutral-100">{state.total}</p>
        </div>
        <div className="px-4 py-3">
          <p className="text-[9px] uppercase tracking-wider text-zinc-500">Session P&amp;L</p>
          <p
            className={`mt-1 font-mono text-2xl tabular-nums ${totalReturn >= 0 ? 'text-moss' : 'text-red-400/90'}`}
          >
            {totalReturn >= 0 ? '+' : ''}
            {(totalReturn * 100).toFixed(1)}
            <span className="text-sm opacity-60">%</span>
          </p>
        </div>
      </div>

      <div className="px-4 pb-3 pt-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-24 w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="heroEquityFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(210,180,140,0.28)" />
              <stop offset="100%" stopColor="rgba(210,180,140,0)" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#heroEquityFill)" />
          <path d={linePath} fill="none" stroke="rgb(210,180,140)" strokeWidth="1.5" />
        </svg>
        <div className="mt-3 flex flex-wrap gap-1">
          {state.results.map((win, i) => (
            <span
              key={i}
              className={`h-3 w-3 rounded-[2px] ${win ? 'bg-moss/70' : 'bg-red-400/50'}`}
              title={win ? 'win' : 'loss'}
            />
          ))}
        </div>
      </div>

      <p className="border-t border-white/[0.06] px-4 py-3 text-[10px] leading-relaxed text-zinc-500">
        Each tick is one trade drawn from a {Math.round(HERO_WIN_RATE * 100)}% edge. The realized win
        rate and equity curve are what a Monte Carlo run estimates thousands of times over — before a
        dollar is committed.
      </p>
    </div>
  );
}

/* ============================================================== */
/* Parallax helpers                                                */
/* ============================================================== */

function useParallax(range: [number, number]) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], range);
  return { ref, y };
}

/* ============================================================== */
/* Fan chart — thousands of simulated futures                      */
/* ============================================================== */

function FanChartIllustration() {
  const W = 640;
  const H = 280;
  const padL = 8;
  const padR = 8;
  const padT = 14;
  const padB = 22;
  const lo = Math.min(...FAN_BANDS.map((b) => b.p10)) * 0.99;
  const hi = Math.max(...FAN_BANDS.map((b) => b.p90)) * 1.01;
  const xOf = (t: number) => padL + (t / FAN_STEPS) * (W - padL - padR);
  const yOf = (v: number) => padT + (1 - (v - lo) / (hi - lo)) * (H - padT - padB);

  const bandArea = (top: (b: StepBand) => number, bot: (b: StepBand) => number) => {
    const upper = FAN_BANDS.map((b) => `${xOf(b.t).toFixed(1)},${yOf(top(b)).toFixed(1)}`);
    const lower = [...FAN_BANDS]
      .reverse()
      .map((b) => `${xOf(b.t).toFixed(1)},${yOf(bot(b)).toFixed(1)}`);
    return `M ${upper.join(' L ')} L ${lower.join(' L ')} Z`;
  };

  const medianPath = `M ${FAN_BANDS.map((b) => `${xOf(b.t).toFixed(1)},${yOf(b.p50).toFixed(1)}`).join(' L ')}`;
  const sampleColors = ['rgba(255,255,255,0.16)', 'rgba(255,255,255,0.12)', 'rgba(255,255,255,0.10)'];
  const samplePaths = fanRun.paths.slice(0, 3).map(
    (p) => `M ${p.map((v, t) => `${xOf(t).toFixed(1)},${yOf(v).toFixed(1)}`).join(' L ')}`,
  );

  return (
    <div className={`${panel} overflow-hidden`}>
      <div className={panelHead}>
        <span className={eyebrow}>1,400 simulated price paths · SPY-like · 1Y horizon</span>
        <span className="font-mono text-[9px] tabular-nums text-zinc-500">seed · 7</span>
      </div>
      <div className="p-3 sm:p-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Monte Carlo price-path fan chart">
          <line x1={padL} y1={yOf(SPOT)} x2={W - padR} y2={yOf(SPOT)} stroke="rgba(255,255,255,0.12)" strokeDasharray="3 4" />
          <path d={bandArea((b) => b.p90, (b) => b.p10)} fill="rgba(210,180,140,0.10)" />
          <path d={bandArea((b) => b.p75, (b) => b.p25)} fill="rgba(210,180,140,0.18)" />
          {samplePaths.map((d, i) => (
            <path key={i} d={d} fill="none" stroke={sampleColors[i]} strokeWidth="1" />
          ))}
          <path d={medianPath} fill="none" stroke="rgb(210,180,140)" strokeWidth="1.75" />
          <circle cx={xOf(FAN_STEPS)} cy={yOf(FAN_EXPECTED)} r="3" fill="rgb(210,180,140)" />
        </svg>
        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 px-1 text-[10px] text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-tan" /> median path</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-tan/40" /> 25–75%</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-tan/20" /> 10–90%</span>
          <span className="ml-auto font-mono tabular-nums">spot ${SPOT.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================== */
/* Risk parameters derived from the distribution                   */
/* ============================================================== */

function RiskParametersIllustration() {
  const rows: [string, string, string][] = [
    ['Expected price · 1Y', `$${FAN_EXPECTED.toFixed(2)}`, `${((FAN_EXPECTED / SPOT - 1) * 100).toFixed(1)}% drift-adjusted`],
    ['Probability up', `${(FAN_PROB_UP * 100).toFixed(1)}%`, 'share of paths finishing above spot'],
    ['10–90% outcome band', `$${FAN_P10.toFixed(0)} – $${FAN_P90.toFixed(0)}`, 'where 80% of futures land'],
    ['Downside (10th pct)', `$${FAN_P10.toFixed(2)}`, 'risk parameter for stop / size'],
    ['Kelly-optimal size', `${((SIZING.recommendedSize / 100_000) * 100).toFixed(1)}%`, 'half-Kelly of equity, capped'],
  ];
  return (
    <div className={`${panel} overflow-hidden`}>
      <div className={panelHead}>
        <span className={eyebrow}>Derived risk parameters · from {fanRun.terminalPrices.length.toLocaleString()} outcomes</span>
        <span className="font-mono text-[9px] text-moss">computed</span>
      </div>
      <div className="divide-y divide-white/[0.06]">
        {rows.map(([label, value, note]) => (
          <div key={label} className="flex items-center justify-between gap-4 px-4 py-3.5">
            <div className="min-w-0">
              <p className="text-[13px] text-neutral-100">{label}</p>
              <p className="mt-0.5 text-[10px] text-zinc-500">{note}</p>
            </div>
            <span className="shrink-0 font-mono text-sm tabular-nums text-tan">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================== */
/* Options chain — pick how much you want to earn                  */
/* ============================================================== */

function probTone(p: number): string {
  if (p >= 0.5) return 'text-moss';
  if (p >= 0.3) return 'text-tan';
  return 'text-zinc-400';
}

function OptionsChainEarnPicker() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr] lg:items-start">
      <div className={`${panel} overflow-hidden`}>
        <div className={panelHead}>
          <span className={eyebrow}>Options chain · calls · 90d · modeled by Monte Carlo</span>
          <span className="font-mono text-[9px] tabular-nums text-zinc-500">σ 28% · r 4%</span>
        </div>
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-white/[0.03] text-[9px] uppercase tracking-wider text-zinc-500">
              <th className="px-3 py-2 font-medium">Strike</th>
              <th className="px-3 py-2 text-right font-medium">Premium</th>
              <th className="px-3 py-2 text-right font-medium">Delta</th>
              <th className="px-3 py-2 text-right font-medium">P(ITM)</th>
              <th className="px-3 py-2 text-right font-medium">Exp. return</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {CHAIN.map((row) => (
              <tr key={row.strike} className={row.strike === SPOT ? 'bg-tan/[0.05]' : undefined}>
                <td className="px-3 py-2.5 font-mono tabular-nums text-neutral-100">{row.strike.toFixed(1)}</td>
                <td className="px-3 py-2.5 text-right font-mono tabular-nums text-zinc-300">${row.premium.toFixed(2)}</td>
                <td className="px-3 py-2.5 text-right font-mono tabular-nums text-zinc-400">{row.delta.toFixed(2)}</td>
                <td className={`px-3 py-2.5 text-right font-mono tabular-nums ${probTone(row.probItm)}`}>
                  {(row.probItm * 100).toFixed(0)}%
                </td>
                <td className="px-3 py-2.5 text-right font-mono tabular-nums text-tan">
                  {row.expectedReturn >= 0 ? '+' : ''}
                  {(row.expectedReturn * 100).toFixed(0)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="border-t border-white/[0.06] px-3 py-2.5 text-[10px] text-zinc-500">
          Premium and delta are Black–Scholes; P(ITM) and expected return are read straight from the
          simulated terminal distribution. Max loss on each long call is the premium.
        </p>
      </div>

      <div className={`${panel} overflow-hidden`}>
        <div className={panelHead}>
          <span className={eyebrow}>Pick the outcome</span>
          <span className="font-mono text-[9px] text-zinc-500">target → trade</span>
        </div>
        <div className="divide-y divide-white/[0.06]">
          {EARN_TIERS.map(({ target, row }) => (
            <div key={target} className="px-4 py-4">
              <div className="flex items-baseline justify-between">
                <p className="font-mono text-lg tabular-nums text-neutral-100">
                  +{(target * 100).toFixed(0)}%
                  <span className="ml-1.5 text-[10px] font-normal text-zinc-500">target return</span>
                </p>
                <span className="font-mono text-[11px] tabular-nums text-tan">${row.strike.toFixed(1)} call</span>
              </div>
              <div className="mt-2 flex items-center gap-3 text-[10px] text-zinc-500">
                <span>P(ITM) <span className={`font-mono ${probTone(row.probItm)}`}>{(row.probItm * 100).toFixed(0)}%</span></span>
                <span className="text-zinc-700">·</span>
                <span>premium <span className="font-mono text-zinc-300">${row.premium.toFixed(2)}</span></span>
                <span className="text-zinc-700">·</span>
                <span>max loss <span className="font-mono text-zinc-300">${row.premium.toFixed(2)}</span></span>
              </div>
            </div>
          ))}
        </div>
        <p className="border-t border-white/[0.06] px-4 py-3 text-[10px] leading-relaxed text-zinc-500">
          State the return you want; the engine maps it to the strike whose modeled distribution
          delivers it — and shows the probability you are paying for.
        </p>
      </div>
    </div>
  );
}

/* ============================================================== */
/* Page                                                            */
/* ============================================================== */

export const TradeEngine: React.FC = () => {
  const fan = useParallax([60, -60]);
  const risk = useParallax([50, -50]);
  const chain = useParallax([40, -40]);

  return (
    <div className="min-h-screen bg-charcoal font-sans text-neutral-100 antialiased selection:bg-tan/20">
      <Navbar showSearch={false} />

      <div className="pt-[calc(3.5rem+env(safe-area-inset-top,0px))] sm:pt-[calc(3.75rem+env(safe-area-inset-top,0px))]">
        {/* Hero — live win-rate simulation */}
        <section
          className="relative overflow-hidden border-b border-white/[0.06] md:min-h-[min(100dvh,900px)]"
          aria-labelledby="the-exchange-title"
        >
          <div className="pointer-events-none absolute inset-0">
            <div
              className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-20%,rgba(46,90,58,0.08),transparent_55%)]"
              aria-hidden
            />
            <div
              className="absolute inset-0 opacity-[0.035] bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:72px_72px]"
              aria-hidden
            />
          </div>

          <div className="relative z-10 mx-auto flex w-full max-w-content flex-col px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_auto] lg:gap-16 xl:gap-24">
              <div className="min-w-0 max-w-2xl lg:max-w-none lg:pr-8">
                <div className="mb-5 h-px w-12 bg-tan/50" aria-hidden />
                <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-500 sm:text-[11px]">
                  <span className="text-tan/90">01</span>
                  <span className="text-zinc-600"> · </span>
                  The Exchange · Monte Carlo engine
                </p>
                <motion.h1
                  id="the-exchange-title"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.75, ease: easeLux }}
                  className="mt-4 font-display text-[clamp(2.25rem,5.5vw,3.75rem)] font-medium leading-[1.08] tracking-tight text-neutral-100"
                >
                  Decide what you want to earn. The engine computes the path.
                </motion.h1>
                <p className="mt-6 max-w-xl border-l border-white/[0.08] pl-5 text-sm font-light leading-relaxed text-zinc-500 sm:text-[15px] sm:leading-[1.65]">
                  Every setup is run through thousands of simulated futures before risk is committed.
                  The Monte Carlo engine turns an edge into a win rate, a win rate into risk
                  parameters, and risk parameters into an expected return you can choose against —
                  right inside the options chain.
                </p>
                <Link
                  href="/request-access"
                  className="mt-12 inline-flex w-full max-w-xs items-center justify-center border border-white/[0.18] bg-white/[0.04] px-10 py-3.5 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-100 transition-colors hover:border-tan/45 hover:bg-white/[0.07] sm:w-auto"
                >
                  Interactive Brokers
                </Link>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: easeLux, delay: 0.15 }}
                className="flex justify-center border-t border-white/[0.06] pt-10 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0"
              >
                <WinRateLiveSim />
              </motion.div>
            </div>
          </div>
        </section>

        {/* II — Thousands of futures (fan chart, parallax) */}
        <section ref={fan.ref} className="relative overflow-hidden border-b border-white/[0.06] py-16 sm:py-20 lg:py-28">
          <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-10">
            <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16">
              <div>
                <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-tan/90">
                  02 · Simulation
                </p>
                <h2 className="font-display text-[clamp(1.6rem,3.4vw,2.5rem)] font-medium leading-[1.12] tracking-tight text-neutral-100">
                  Thousands of futures, not one forecast.
                </h2>
                <p className="mt-5 max-w-md text-sm font-light leading-relaxed text-zinc-400 sm:text-[15px] sm:leading-[1.7]">
                  A single price target is a guess. The engine draws thousands of paths from the
                  asset&apos;s volatility and drift using geometric Brownian motion, then keeps the whole
                  distribution of where price could be at every step of the horizon — the median, the
                  likely band, and the tails.
                </p>
                <dl className="mt-7 grid grid-cols-3 gap-4">
                  {[
                    ['1,400', 'paths drawn'],
                    [`${FAN_STEPS}`, 'steps / horizon'],
                    ['seeded', 'reproducible'],
                  ].map(([v, k]) => (
                    <div key={k} className="border-l-2 border-brass/40 pl-3">
                      <dt className="font-mono text-lg tabular-nums text-tan">{v}</dt>
                      <dd className="mt-0.5 text-[10px] uppercase tracking-wider text-zinc-500">{k}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <motion.div style={{ y: fan.y }}>
                <FanChartIllustration />
              </motion.div>
            </div>
          </div>
        </section>

        {/* III — From distribution to risk parameters (parallax) */}
        <section ref={risk.ref} className="relative overflow-hidden border-b border-white/[0.06] bg-dark-gray py-16 sm:py-20 lg:py-28">
          <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-10">
            <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16">
              <motion.div style={{ y: risk.y }} className="order-2 lg:order-1">
                <RiskParametersIllustration />
              </motion.div>
              <div className="order-1 lg:order-2">
                <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-tan/90">
                  03 · Risk parameters
                </p>
                <h2 className="font-display text-[clamp(1.6rem,3.4vw,2.5rem)] font-medium leading-[1.12] tracking-tight text-neutral-100">
                  The distribution becomes your risk parameters.
                </h2>
                <p className="mt-5 max-w-md text-sm font-light leading-relaxed text-zinc-400 sm:text-[15px] sm:leading-[1.7]">
                  Once the futures are simulated, the numbers that matter fall out of the distribution
                  directly: the expected price over the horizon, the probability of finishing up, the
                  band where most outcomes land, and the tail that defines your downside. Position size
                  follows from the modeled edge via the Kelly criterion — no guesswork, no round numbers.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* IV — Options chain earn-picker (parallax) */}
        <section ref={chain.ref} className="relative overflow-hidden border-b border-white/[0.06] py-16 sm:py-20 lg:py-28">
          <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-2xl text-center">
              <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-tan/90">
                04 · The options chain
              </p>
              <h2 className="font-display text-[clamp(1.6rem,3.4vw,2.5rem)] font-medium leading-[1.12] tracking-tight text-neutral-100">
                Pick how much you want to earn.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-sm font-light leading-relaxed text-zinc-400 sm:text-[15px] sm:leading-[1.7]">
                The same simulated distribution prices the chain. Every strike carries a modeled
                probability of finishing in the money and an expected return over the horizon. Choose the
                outcome you want and the engine shows you the trade that targets it — and the odds you are
                paying for.
              </p>
            </div>
            <motion.div style={{ y: chain.y }} className="mt-12">
              <OptionsChainEarnPicker />
            </motion.div>
          </div>
        </section>

        {/* V — Interactive Brokers execution layer (retained) */}
        <section className="border-b border-white/[0.06] py-14 sm:py-16 lg:py-20" aria-labelledby="ib-depth-title">
          <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-10">
            <h2 id="ib-depth-title" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-tan/90">
              Interactive Brokers execution layer
            </h2>
            <p className="mt-2 max-w-3xl text-sm font-light leading-relaxed text-neutral-400 sm:text-[15px] sm:leading-[1.75]">
              When the modeled trade is chosen, it is not pushed blindly. Each instruction carries
              strategy metadata, risk context, and route intent. Before transmission, the platform
              enforces account-level limits, concentration controls, and slippage thresholds; after
              transmission, fill quality and route behavior are measured against expected execution
              envelopes so desk operators can attribute variance and tighten policies over time.
            </p>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {[
                [
                  'Pre-trade controls',
                  'Margin checks, notional caps, venue constraints, and policy validation run before any order is released.',
                ],
                [
                  'Smart routing governance',
                  'Primary route selection with deterministic fallback logic, partial-fill handling, and cancel/replace discipline.',
                ],
                [
                  'Post-trade analytics',
                  'Fill latency, realized slippage, and route outcome distributions are persisted for audit and model feedback.',
                ],
              ].map(([title, body]) => (
                <div key={title} className="rounded-lg border border-white/[0.08] bg-dark-gray/55 p-5">
                  <h3 className="sc-serif text-[13px] text-neutral-100">{title}</h3>
                  <p className="mt-2 text-[13px] leading-[1.75] text-zinc-400">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-white/[0.06] py-14 sm:py-16 lg:py-20" aria-labelledby="exchange-topology-title">
          <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-10">
            <h2 id="exchange-topology-title" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-tan/90">
              End-to-end platform topology
            </h2>
            <p className="mt-2 max-w-2xl text-xs font-light leading-relaxed text-neutral-500">
              How orders, risk, compute, routing, and evidence connect through The Exchange—one direction of travel so auditors
              and desks share the same mental model.
            </p>
            <div className="mt-6 rounded-lg border border-white/[0.1] bg-dark-gray/55 px-3 py-4 backdrop-blur-sm sm:px-5 sm:py-5">
              <HeroSystemTopologyIllustration />
            </div>
          </div>
        </section>

        <section className="border-t border-white/[0.06] bg-charcoal py-12 sm:py-16 lg:py-20" aria-labelledby="execution-loop-heading">
          <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-10">
            <HomepageExecutionLoopRestored />
          </div>
        </section>

        <div className="space-y-10 border-t border-white/[0.06] py-12 sm:space-y-12 sm:py-16 lg:py-20">
          {(() => {
            const routing = getPillarById('execution-routing');
            const workflow = getPillarById('institutional-workflow');
            const governance = getPillarById('governance-compliance');
            return (
              <>
                {routing ? <PillarSectionEmbed pillar={routing} index={0} /> : null}
                {workflow ? <PillarSectionEmbed pillar={workflow} index={1} /> : null}
                {governance ? <PillarSectionEmbed pillar={governance} index={2} /> : null}
              </>
            );
          })()}
        </div>
      </div>

      <InstitutionalFooter />
    </div>
  );
};

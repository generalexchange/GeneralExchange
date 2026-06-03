/**
 * TradeEngine showcase illustrations — Monte Carlo precompute + visual components.
 * Used by the /tradeengine explanation page only.
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import {
  SeededRandom,
  blackScholes,
  distribution as buildDistribution,
  kellyCriterion,
  simulatePricePaths,
} from '@gx/analytics';

export const SPOT = 100;

const panel =
  'rounded-lg border border-white/[0.08] bg-charcoal/60 shadow-[0_24px_48px_-28px_rgba(0,0,0,0.55)]';
const panelHead =
  'flex items-center justify-between border-b border-white/[0.08] bg-white/[0.04] px-4 py-2.5';
const eyebrow = 'sc-serif text-[10px] text-zinc-400';

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

const FAN_STEPS = 42;
export const fanRun = simulatePricePaths({
  currentPrice: SPOT,
  volatility: 0.28,
  drift: 0.1,
  timeHorizon: 1,
  steps: FAN_STEPS,
  simulationCount: 1400,
  maxRecordedPaths: 320,
  seed: 7,
});
export const FAN_BANDS = buildStepBands(fanRun.paths, FAN_STEPS);
export const FAN_TERMINAL = [...fanRun.terminalPrices].sort((a, b) => a - b);
export const FAN_EXPECTED = fanRun.expectedPrice;
export const FAN_P10 = quantile(FAN_TERMINAL, 0.1);
export const FAN_P90 = quantile(FAN_TERMINAL, 0.9);
export const FAN_PROB_UP = FAN_TERMINAL.filter((p) => p > SPOT).length / FAN_TERMINAL.length;
export const FAN_HISTOGRAM = buildDistribution(FAN_TERMINAL, 24);

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

const TARGETS = [0.25, 0.6, 1.2];
const EARN_TIERS = TARGETS.map((target) => {
  const match = CHAIN.reduce((best, row) =>
    Math.abs(row.expectedReturn - target) < Math.abs(best.expectedReturn - target) ? row : best,
  );
  return { target, row: match };
});

export const SIZING = kellyCriterion({
  winProbability: FAN_PROB_UP,
  averageWin: 2,
  averageLoss: 1,
  accountSize: 100_000,
});

/* ── Hero: live win-rate simulation ── */

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

export function WinRateLiveSim() {
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
        const next = last * (win ? 1.017 : 0.99);
        return {
          equity: [...prev.equity, next].slice(-HERO_VISIBLE),
          results: [...prev.results, win].slice(-28),
          wins: prev.wins + (win ? 1 : 0),
          total: prev.total + 1,
        };
      });
    }, 140);
    return () => window.clearInterval(id);
  }, [reduce]);

  const realizedWinRate = state.total > 0 ? state.wins / state.total : HERO_WIN_RATE;
  const equity = state.equity;
  const min = Math.min(...equity);
  const max = Math.max(...equity);
  const span = max - min || 1;
  const W = 480;
  const H = 140;
  const points = equity.map((v, i) => {
    const x = equity.length > 1 ? (i / (equity.length - 1)) * W : 0;
    const y = H - ((v - min) / span) * (H - 10) - 5;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const linePath = points.length ? `M ${points.join(' L ')}` : '';
  const areaPath = linePath ? `${linePath} L ${W},${H} L 0,${H} Z` : '';
  const totalReturn = equity[equity.length - 1] / equity[0] - 1;

  return (
    <div className={`${panel} w-full overflow-hidden`}>
      <div className={panelHead}>
        <span className={eyebrow}>Active session · win-rate simulation</span>
        <span className="flex items-center gap-1.5 font-mono text-[9px] text-moss">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-moss" /> live
        </span>
      </div>
      <div className="grid grid-cols-3 divide-x divide-white/[0.06] border-b border-white/[0.06]">
        <div className="px-5 py-4">
          <p className="text-[9px] uppercase tracking-wider text-zinc-500">Win rate</p>
          <p className="mt-1 font-mono text-3xl tabular-nums text-tan">
            {(realizedWinRate * 100).toFixed(1)}%
          </p>
        </div>
        <div className="px-5 py-4">
          <p className="text-[9px] uppercase tracking-wider text-zinc-500">Trades</p>
          <p className="mt-1 font-mono text-3xl tabular-nums text-neutral-100">{state.total}</p>
        </div>
        <div className="px-5 py-4">
          <p className="text-[9px] uppercase tracking-wider text-zinc-500">Session P&amp;L</p>
          <p className={`mt-1 font-mono text-3xl tabular-nums ${totalReturn >= 0 ? 'text-moss' : 'text-red-400/90'}`}>
            {totalReturn >= 0 ? '+' : ''}
            {(totalReturn * 100).toFixed(1)}%
          </p>
        </div>
      </div>
      <div className="px-5 pb-4 pt-5">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-36 w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="teEquityFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(210,180,140,0.32)" />
              <stop offset="100%" stopColor="rgba(210,180,140,0)" />
            </linearGradient>
          </defs>
          {areaPath ? <path d={areaPath} fill="url(#teEquityFill)" /> : null}
          {linePath ? <path d={linePath} fill="none" stroke="rgb(210,180,140)" strokeWidth="2" /> : null}
        </svg>
        <div className="mt-4 flex flex-wrap gap-1">
          {state.results.map((win, i) => (
            <span
              key={i}
              className={`h-3.5 w-3.5 rounded-[2px] ${win ? 'bg-moss/75' : 'bg-red-400/55'}`}
            />
          ))}
        </div>
      </div>
      <p className="border-t border-white/[0.06] px-5 py-4 text-[11px] leading-relaxed text-zinc-500">
        Each tick is one trade from a {Math.round(HERO_WIN_RATE * 100)}% edge. Monte Carlo replays this
        thousands of times to estimate the stable win rate and equity curve before capital is committed.
      </p>
    </div>
  );
}

/* ── Pipeline: warehouse → engine → chain ── */

export function MonteCarloPipelineIllustration() {
  const stages = [
    { id: '01', label: 'Warehouse inputs', detail: 'volatility · drift · regime · flow · win-rate priors' },
    { id: '02', label: 'Monte Carlo engine', detail: '1,400+ GBM paths · seeded · reproducible' },
    { id: '03', label: 'Distribution read', detail: 'percentiles · P(up) · tail risk · Kelly size' },
    { id: '04', label: 'Options chain map', detail: 'P(ITM) · expected return per strike' },
  ];
  return (
    <div className={`${panel} overflow-hidden`}>
      <div className={panelHead}>
        <span className={eyebrow}>Data processing pipeline · @gx/analytics</span>
        <span className="font-mono text-[9px] text-moss">deterministic</span>
      </div>
      <div className="grid gap-px bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-4">
        {stages.map((s) => (
          <div key={s.id} className="bg-charcoal/85 px-5 py-6">
            <p className="font-mono text-[10px] tabular text-tan">{s.id}</p>
            <p className="mt-2 text-[14px] font-medium text-neutral-100">{s.label}</p>
            <p className="mt-2 text-[11px] leading-relaxed text-zinc-500">{s.detail}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-white/[0.06] px-5 py-4 font-mono text-[11px] text-zinc-500">
        Historical edge + game-theory conviction → simulated futures → risk parameters → chain pricing
      </div>
    </div>
  );
}

/* ── Three simulation modes ── */

export function SimulationModesIllustration() {
  const modes = [
    {
      type: 'A · Price path',
      inputs: 'spot · σ · μ · horizon',
      outputs: 'terminal distribution · percentile bands · expected price',
    },
    {
      type: 'B · Strategy outcome',
      inputs: 'win rate · avg win/loss · frequency · size',
      outputs: 'P(profit) · drawdown · risk of ruin · equity distribution',
    },
    {
      type: 'C · Trade quality',
      inputs: 'signal · liquidity · regime · sentiment · structure',
      outputs: 'conviction · noise · confidence interval · quality grade',
    },
  ];
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {modes.map((m) => (
        <div key={m.type} className={`${panel} p-5`}>
          <p className="font-mono text-[10px] uppercase tracking-wider text-tan">{m.type}</p>
          <p className="mt-3 text-[10px] uppercase tracking-wider text-zinc-600">Inputs</p>
          <p className="mt-1 text-[12px] leading-relaxed text-zinc-400">{m.inputs}</p>
          <p className="mt-4 text-[10px] uppercase tracking-wider text-zinc-600">Outputs</p>
          <p className="mt-1 text-[12px] leading-relaxed text-zinc-300">{m.outputs}</p>
        </div>
      ))}
    </div>
  );
}

/* ── Fan chart ── */

export function FanChartIllustration() {
  const W = 720;
  const H = 360;
  const padL = 12;
  const padR = 12;
  const padT = 18;
  const padB = 28;
  const lo = Math.min(...FAN_BANDS.map((b) => b.p10)) * 0.98;
  const hi = Math.max(...FAN_BANDS.map((b) => b.p90)) * 1.02;
  const xOf = (t: number) => padL + (t / FAN_STEPS) * (W - padL - padR);
  const yOf = (v: number) => padT + (1 - (v - lo) / (hi - lo)) * (H - padT - padB);

  const bandArea = (top: (b: StepBand) => number, bot: (b: StepBand) => number) => {
    const upper = FAN_BANDS.map((b) => `${xOf(b.t).toFixed(1)},${yOf(top(b)).toFixed(1)}`);
    const lower = [...FAN_BANDS].reverse().map((b) => `${xOf(b.t).toFixed(1)},${yOf(bot(b)).toFixed(1)}`);
    return `M ${upper.join(' L ')} L ${lower.join(' L ')} Z`;
  };

  const medianPath = `M ${FAN_BANDS.map((b) => `${xOf(b.t).toFixed(1)},${yOf(b.p50).toFixed(1)}`).join(' L ')}`;
  const samplePaths = fanRun.paths.slice(0, 6).map(
    (p, i) => ({
      d: `M ${p.map((v, t) => `${xOf(t).toFixed(1)},${yOf(v).toFixed(1)}`).join(' L ')}`,
      opacity: 0.08 + i * 0.02,
    }),
  );

  return (
    <div className={`${panel} overflow-hidden`}>
      <div className={panelHead}>
        <span className={eyebrow}>1,400 simulated price paths · 1Y horizon · geometric Brownian motion</span>
        <span className="font-mono text-[9px] tabular-nums text-zinc-500">seed · 7</span>
      </div>
      <div className="p-4 sm:p-6">
        <svg viewBox={`0 0 ${W} ${H}`} className="min-h-[280px] w-full sm:min-h-[340px]" role="img" aria-label="Monte Carlo fan chart">
          <line x1={padL} y1={yOf(SPOT)} x2={W - padR} y2={yOf(SPOT)} stroke="rgba(255,255,255,0.14)" strokeDasharray="4 5" />
          <path d={bandArea((b) => b.p90, (b) => b.p10)} fill="rgba(210,180,140,0.12)" />
          <path d={bandArea((b) => b.p75, (b) => b.p25)} fill="rgba(210,180,140,0.22)" />
          {samplePaths.map((p, i) => (
            <path key={i} d={p.d} fill="none" stroke={`rgba(255,255,255,${p.opacity + 0.1})`} strokeWidth="1" />
          ))}
          <path d={medianPath} fill="none" stroke="rgb(210,180,140)" strokeWidth="2.25" />
          <circle cx={xOf(FAN_STEPS)} cy={yOf(FAN_EXPECTED)} r="4" fill="rgb(210,180,140)" />
          <text x={padL + 4} y={yOf(SPOT) - 6} fill="rgba(255,255,255,0.35)" fontSize="10" fontFamily="monospace">
            spot ${SPOT}
          </text>
        </svg>
        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] text-zinc-500">
          <span className="flex items-center gap-2"><span className="h-2.5 w-4 rounded-sm bg-tan" /> median</span>
          <span className="flex items-center gap-2"><span className="h-2.5 w-4 rounded-sm bg-tan/45" /> 25–75%</span>
          <span className="flex items-center gap-2"><span className="h-2.5 w-4 rounded-sm bg-tan/25" /> 10–90%</span>
          <span className="ml-auto font-mono tabular-nums text-tan">E[terminal] ${FAN_EXPECTED.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Terminal distribution histogram ── */

export function TerminalDistributionIllustration() {
  const bins = FAN_HISTOGRAM;
  const maxDensity = Math.max(...bins.map((b) => b.density), 0.001);
  const W = 720;
  const H = 200;
  const pad = 16;
  const barW = (W - pad * 2) / bins.length;

  return (
    <div className={`${panel} overflow-hidden`}>
      <div className={panelHead}>
        <span className={eyebrow}>Terminal price distribution · {fanRun.terminalPrices.length.toLocaleString()} outcomes</span>
        <span className="font-mono text-[9px] text-zinc-500">1Y horizon</span>
      </div>
      <div className="p-4 sm:p-6">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Terminal price histogram">
          {bins.map((bin, i) => {
            const h = (bin.density / maxDensity) * (H - pad * 2);
            const x = pad + i * barW;
            const y = H - pad - h;
            const inSpotBand = bin.start <= SPOT && bin.end >= SPOT;
            return (
              <rect
                key={i}
                x={x + 1}
                y={y}
                width={Math.max(1, barW - 2)}
                height={h}
                fill={inSpotBand ? 'rgba(210,180,140,0.75)' : 'rgba(210,180,140,0.28)'}
                rx="1"
              />
            );
          })}
          <line
            x1={pad}
            y1={H - pad}
            x2={W - pad}
            y2={H - pad}
            stroke="rgba(255,255,255,0.12)"
          />
        </svg>
        <div className="mt-3 flex flex-wrap justify-between gap-2 font-mono text-[10px] tabular-nums text-zinc-500">
          <span>p10 ${FAN_P10.toFixed(0)}</span>
          <span className="text-tan">spot ${SPOT}</span>
          <span>p90 ${FAN_P90.toFixed(0)}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Risk parameters ── */

export function RiskParametersIllustration() {
  const rows: [string, string, string][] = [
    ['Expected price · 1Y', `$${FAN_EXPECTED.toFixed(2)}`, `${((FAN_EXPECTED / SPOT - 1) * 100).toFixed(1)}% vs spot`],
    ['Probability up', `${(FAN_PROB_UP * 100).toFixed(1)}%`, 'paths finishing above spot'],
    ['10–90% band', `$${FAN_P10.toFixed(0)} – $${FAN_P90.toFixed(0)}`, 'where 80% of outcomes land'],
    ['Downside tail', `$${FAN_P10.toFixed(2)}`, '10th percentile · stop/size input'],
    ['Kelly size', `${((SIZING.recommendedSize / 100_000) * 100).toFixed(1)}%`, 'half-Kelly · capped'],
    ['Risk of ruin proxy', `${((1 - FAN_PROB_UP) * 100).toFixed(0)}%`, 'share of adverse terminal paths'],
  ];
  return (
    <div className={`${panel} overflow-hidden`}>
      <div className={panelHead}>
        <span className={eyebrow}>Derived risk parameters</span>
        <span className="font-mono text-[9px] text-moss">from distribution</span>
      </div>
      <div className="divide-y divide-white/[0.06]">
        {rows.map(([label, value, note]) => (
          <div key={label} className="flex items-center justify-between gap-4 px-5 py-4">
            <div>
              <p className="text-[14px] text-neutral-100">{label}</p>
              <p className="mt-0.5 text-[11px] text-zinc-500">{note}</p>
            </div>
            <span className="shrink-0 font-mono text-base tabular-nums text-tan">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Analytics engine modules ── */

export function AnalyticsEngineStrip() {
  const modules = [
    ['Monte Carlo', 'GBM paths · strategy replay · conviction under noise'],
    ['Black–Scholes', 'chain premiums · delta · greeks for strike selection'],
    ['Kelly criterion', 'position size from modeled edge'],
    ['GARCH / Bayesian', 'vol forecast · signal fusion · conviction update'],
    ['Trade evaluation', 'aggregates all modules → grade A–F'],
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {modules.map(([name, desc]) => (
        <div key={name} className={`${panel} px-4 py-5`}>
          <p className="sc-serif text-[13px] text-neutral-100">{name}</p>
          <p className="mt-2 text-[11px] leading-relaxed text-zinc-500">{desc}</p>
        </div>
      ))}
    </div>
  );
}

/* ── Options chain earn-picker ── */

function probTone(p: number): string {
  if (p >= 0.5) return 'text-moss';
  if (p >= 0.3) return 'text-tan';
  return 'text-zinc-400';
}

export function OptionsChainEarnPicker() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr] xl:items-start">
      <div className={`${panel} overflow-hidden`}>
        <div className={panelHead}>
          <span className={eyebrow}>Options chain · 90d calls · Monte Carlo + Black–Scholes</span>
          <span className="font-mono text-[9px] tabular-nums text-zinc-500">σ 28%</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-xs">
            <thead>
              <tr className="bg-white/[0.03] text-[9px] uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-2.5 font-medium">Strike</th>
                <th className="px-4 py-2.5 text-right font-medium">Premium</th>
                <th className="px-4 py-2.5 text-right font-medium">Delta</th>
                <th className="px-4 py-2.5 text-right font-medium">P(ITM)</th>
                <th className="px-4 py-2.5 text-right font-medium">Exp. return</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {CHAIN.map((row) => (
                <tr key={row.strike} className={row.strike === SPOT ? 'bg-tan/[0.06]' : undefined}>
                  <td className="px-4 py-3 font-mono tabular-nums text-neutral-100">{row.strike.toFixed(1)}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-zinc-300">${row.premium.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-zinc-400">{row.delta.toFixed(2)}</td>
                  <td className={`px-4 py-3 text-right font-mono tabular-nums ${probTone(row.probItm)}`}>
                    {(row.probItm * 100).toFixed(0)}%
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-tan">
                    {row.expectedReturn >= 0 ? '+' : ''}
                    {(row.expectedReturn * 100).toFixed(0)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={`${panel} overflow-hidden`}>
        <div className={panelHead}>
          <span className={eyebrow}>Pick how much you want to earn</span>
          <span className="font-mono text-[9px] text-zinc-500">target → strike</span>
        </div>
        <div className="divide-y divide-white/[0.06]">
          {EARN_TIERS.map(({ target, row }) => (
            <div key={target} className="px-5 py-5">
              <div className="flex items-baseline justify-between gap-4">
                <p className="font-mono text-xl tabular-nums text-neutral-100">
                  +{(target * 100).toFixed(0)}%
                  <span className="ml-2 text-[11px] font-normal text-zinc-500">target</span>
                </p>
                <span className="font-mono text-sm tabular-nums text-tan">${row.strike.toFixed(1)} call</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-zinc-500">
                <span>P(ITM) <span className={`font-mono ${probTone(row.probItm)}`}>{(row.probItm * 100).toFixed(0)}%</span></span>
                <span>premium <span className="font-mono text-zinc-300">${row.premium.toFixed(2)}</span></span>
                <span>max loss <span className="font-mono text-zinc-300">${row.premium.toFixed(2)}</span></span>
              </div>
            </div>
          ))}
        </div>
        <p className="border-t border-white/[0.06] px-5 py-4 text-[11px] leading-relaxed text-zinc-500">
          Name the return you want. The engine maps it to the strike whose simulated distribution
          targets it — and shows the probability you are paying for.
        </p>
      </div>
    </div>
  );
}

/**
 * Deterministic seeded mock equity series for Robinhood-style portfolio chart.
 * Last point always equals `endEquity`. Walk is generated backward then ordered left→right.
 */

import type { PaperChartRange } from './paperPortfolioRanges';

export type RobinhoodRange = PaperChartRange;

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedForSession(): number {
  if (typeof window === 'undefined') return 0x9e3779b9;
  const k = 'ge:rh-portfolio-seed';
  const raw = sessionStorage.getItem(k);
  if (raw) {
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) return (n >>> 0) || 1;
  }
  const next = (Math.floor(Math.random() * 0x7fffffff) || 1) >>> 0;
  sessionStorage.setItem(k, String(next));
  return next;
}

export function getPortfolioChartSessionSeed(): number {
  return seedForSession();
}

function rangeSeed(base: number, range: RobinhoodRange): number {
  let h = base ^ 0xdeadbeef;
  const s = range;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x9e3779b1);
  return h >>> 0;
}

function pointCount(range: RobinhoodRange): number {
  switch (range) {
    case 'live':
      return 0;
    case '1h':
      return 60;
    case '1d':
      return 78;
    case '1w':
      return 48;
    case '1m':
      return 30;
    case '3m':
      return 66;
    case '1y':
      return 52;
    case '5y':
      return 60;
    default:
      return 60;
  }
}

function pullbackFor(range: RobinhoodRange): number {
  switch (range) {
    case '1h':
      return 0.0045;
    case '1d':
      return 0.012;
    case '1w':
      return 0.028;
    case '1m':
      return 0.055;
    case '3m':
      return 0.09;
    case '1y':
      return 0.18;
    case '5y':
      return 0.42;
    default:
      return 0.012;
  }
}

/** Gaussian via Box–Muller */
function gaussianPair(rng: () => number): [number, number] {
  const u1 = Math.max(1e-12, rng());
  const u2 = rng();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);
  return [z0, z1];
}

/**
 * Equity series left→right; last value === endEquity (within float rounding).
 */
export function buildEquitySeriesForRange(
  range: RobinhoodRange,
  endEquity: number,
  sessionSeed: number,
): number[] {
  if (range === 'live') return [endEquity];
  const n = pointCount(range);
  if (n < 2) return [endEquity];
  const rng = mulberry32(rangeSeed(sessionSeed, range));
  const pull = pullbackFor(range);
  const startEquity = Math.round(endEquity * (1 - pull) * 100) / 100;

  const raw: number[] = new Array(n);
  raw[0] = startEquity;
  raw[n - 1] = endEquity;

  const volScale = Math.max(1, endEquity) * (pull * 0.22 + 0.0008);
  const driftPerStep = ((endEquity - startEquity) / (n - 1)) * 0.08;

  for (let i = 1; i < n - 1; i++) {
    const t = i / (n - 1);
    const bridge = Math.sin(Math.PI * t);
    const [g] = gaussianPair(rng);
    const linear = startEquity + (endEquity - startEquity) * t;
    const noise = g * volScale * bridge * 0.85 + (rng() - 0.5) * volScale * 0.12;
    const drift = driftPerStep * (i - (n - 1) / 2) * 0.15;
    raw[i] = linear + noise + drift;
  }

  raw[0] = startEquity;
  raw[n - 1] = endEquity;

  for (let pass = 0; pass < 2; pass++) {
    for (let i = 1; i < n - 1; i++) {
      raw[i] = Math.round(((raw[i - 1]! + raw[i]! * 2 + raw[i + 1]!) / 4) * 100) / 100;
    }
  }

  raw[0] = startEquity;
  raw[n - 1] = endEquity;
  return raw;
}

/** Last point of 1H series (same seed) — anchor for live ticks */
export function getOneHourLastEquity(endEquity: number, sessionSeed: number): number {
  const s = buildEquitySeriesForRange('1h', endEquity, sessionSeed);
  return s[s.length - 1] ?? endEquity;
}

export function appendLiveTick(prev: number[], endEquity: number, sessionSeed: number): number[] {
  const rng = mulberry32((rangeSeed(sessionSeed, 'live') + (prev.length | 0) * 9973) >>> 0);
  const last = prev.length ? prev[prev.length - 1]! : getOneHourLastEquity(endEquity, sessionSeed);
  const magnitude = 5 + rng() * 10;
  const sign = rng() > 0.38 ? 1 : -1;
  const pullToSpot = (endEquity - last) * 0.018;
  const next = Math.round((last + sign * magnitude + pullToSpot) * 100) / 100;
  const cap = 120;
  const base = prev.length >= cap ? prev.slice(-cap + 1) : [...prev];
  return [...base, next];
}

export const RANGE_PERIOD_LABEL: Record<RobinhoodRange, string> = {
  live: 'Live',
  '1h': 'Past hour',
  '1d': 'Today',
  '1w': 'Past week',
  '1m': 'Past month',
  '3m': 'Past quarter',
  '1y': 'Past year',
  '5y': 'Past 5 years',
};

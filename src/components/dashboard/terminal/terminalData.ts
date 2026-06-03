/**
 * Deterministic mock data for the terminal dashboard.
 *
 * Everything here is generated from a seeded PRNG keyed on the symbol so the
 * server and client render identical output (no hydration mismatch). When the
 * Go API and WebSocket feeds land, these generators are replaced by fetches —
 * the shapes are the contract.
 */

import { greeksService, type FullGreeks } from '@/services/greeksService';

/* ----------------------------- seeded RNG ----------------------------- */

function hashSeed(s: string): number {
  let h = 1779033703 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------- types -------------------------------- */

export type Moneyness = 'ITM' | 'ATM' | 'OTM';
export type Direction = 'LONG' | 'SHORT' | 'NEUTRAL';
export type VolRegime = 'COMPRESSED' | 'NORMAL' | 'ELEVATED' | 'HIGH' | 'SPIKE';
export type TrendRegime = 'TRENDING' | 'RANDOM_WALK' | 'MEAN_REVERTING';
export type Sentiment = 'POS' | 'NEG' | 'NEU';

export interface Candle {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
  vwap: number;
}

export interface GexBar {
  strike: number;
  gex: number; // signed dealer gamma exposure ($mm per 1% move)
}

export interface OptionRow extends FullGreeks {
  id: string;
  strike: number;
  type: 'CALL' | 'PUT';
  bid: number;
  ask: number;
  mid: number;
  lastTraded: number;
  volume: number;
  openInterest: number;
  iv: number;
  ivRank: number;
  moneyness: Moneyness;
}

export interface SignalRow {
  id: string;
  time: number;
  signalType: string;
  direction: Direction;
  confidence: number;
  regime: TrendRegime;
  ivRegime: VolRegime;
}

export interface NewsRow {
  id: string;
  time: number;
  source: string;
  headline: string;
  sentiment: Sentiment;
  impact: number;
}

export interface DarkPoolRow {
  id: string;
  time: number;
  prints: number;
  volume: number;
  pctOfTape: number;
  bias: Direction;
}

export interface RegimeSnapshot {
  volRegime: VolRegime;
  trendRegime: TrendRegime;
  hurst: number;
  realizedVol: number;
  impliedVol: number;
  rvIvSpread: number;
  skew: number; // 25d put IV - 25d call IV
  termSlope: number; // 30d IV / 90d IV
  dealerGexTotal: number; // $mm
  putCallRatio: number;
}

export interface SymbolSnapshot {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  candles: Candle[];
  gex: GexBar[];
  chain: OptionRow[];
  signals: SignalRow[];
  news: NewsRow[];
  darkPool: DarkPoolRow[];
  regime: RegimeSnapshot;
  expirations: string[];
}

export interface WatchItem {
  symbol: string;
  name: string;
  price: number;
  changePct: number;
  spark: number[];
}

export interface Position {
  id: string;
  symbol: string;
  type: 'CALL' | 'PUT';
  strike: number;
  expiration: string;
  qty: number;
  entryPrice: number;
  markPrice: number;
  unrealizedPnl: number;
  unrealizedPct: number;
  delta: number;
  theta: number;
  ivRank: number;
}

export interface ClosedTrade {
  id: string;
  symbol: string;
  type: 'CALL' | 'PUT';
  strike: number;
  expiration: string;
  entryTime: number;
  exitTime: number;
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  pnlPct: number;
  regimeAtEntry: string;
  ivRankAtEntry: number;
  holdMin: number;
}

export interface AccountSummary {
  portfolioValue: number;
  cash: number;
  openPositions: number;
  dayPnl: number;
  dayPnlPct: number;
  totalPnl: number;
  totalPnlPct: number;
}

/* --------------------------- universe config -------------------------- */

const UNIVERSE: Record<string, { name: string; price: number; vol: number }> = {
  SPY: { name: 'SPDR S&P 500 ETF', price: 512.4, vol: 0.14 },
  QQQ: { name: 'Invesco QQQ Trust', price: 438.9, vol: 0.18 },
  NVDA: { name: 'NVIDIA Corp', price: 121.3, vol: 0.46 },
  AAPL: { name: 'Apple Inc', price: 224.8, vol: 0.22 },
  TSLA: { name: 'Tesla Inc', price: 248.5, vol: 0.52 },
  AMD: { name: 'Advanced Micro Devices', price: 158.2, vol: 0.44 },
};

export const SYMBOLS = Object.keys(UNIVERSE);

const VOL_REGIMES: VolRegime[] = ['COMPRESSED', 'NORMAL', 'ELEVATED', 'HIGH', 'SPIKE'];
const TREND_REGIMES: TrendRegime[] = ['TRENDING', 'RANDOM_WALK', 'MEAN_REVERTING'];
const SIGNAL_TYPES = ['Gamma squeeze risk', 'Premium-rich', 'Momentum break', 'Mean reversion', 'Dealer flow', 'Skew shift'];
const NEWS_SOURCES = ['Reuters', 'Bloomberg', 'WSJ', 'CNBC', 'MarketWatch'];

/* ---------------------------- generators ------------------------------ */

const MINUTE = 60_000;

function genCandles(rng: () => number, base: number, vol: number): Candle[] {
  const out: Candle[] = [];
  let price = base * (1 - vol * 0.12);
  const start = Date.UTC(2026, 5, 2, 13, 30) - 60 * 5 * MINUTE;
  for (let i = 0; i < 78; i++) {
    const drift = (rng() - 0.46) * base * vol * 0.012;
    const o = price;
    const c = Math.max(1, o + drift);
    const h = Math.max(o, c) + rng() * base * vol * 0.006;
    const l = Math.min(o, c) - rng() * base * vol * 0.006;
    const v = Math.round(20_000 + rng() * 180_000);
    const vwap = (h + l + c) / 3;
    out.push({ t: start + i * 5 * MINUTE, o, h, l, c, v, vwap });
    price = c;
  }
  return out;
}

function strikesAround(price: number): number[] {
  const step = price > 300 ? 5 : price > 100 ? 2.5 : 1;
  const atm = Math.round(price / step) * step;
  const out: number[] = [];
  for (let i = -6; i <= 6; i++) out.push(+(atm + i * step).toFixed(2));
  return out;
}

function genChain(rng: () => number, price: number, vol: number): OptionRow[] {
  const rows: OptionRow[] = [];
  const T = 18 / 365; // ~18 days to expiry
  const r = 0.045;
  const strikes = strikesAround(price);
  for (const strike of strikes) {
    for (const type of ['CALL', 'PUT'] as const) {
      // vol smile: higher IV away from ATM, put skew
      const m = strike / price;
      const smile = vol * (1 + Math.abs(m - 1) * 1.6 + (type === 'PUT' ? (1 - m) * 0.4 : 0));
      const iv = Math.max(0.05, smile + (rng() - 0.5) * 0.02);
      const g = greeksService.calculateFullGreeks({
        symbol: 'X', strike, expiration: '', type, underlyingPrice: price,
        riskFreeRate: r, impliedVolatility: iv, timeToExpiration: T,
      });
      const mid = Math.max(0.02, g.price);
      const spread = Math.max(0.02, mid * (0.01 + rng() * 0.03));
      const bid = +Math.max(0.01, mid - spread / 2).toFixed(2);
      const ask = +(mid + spread / 2).toFixed(2);
      const moneyness: Moneyness =
        Math.abs(m - 1) < 0.006 ? 'ATM' : (type === 'CALL' ? (m < 1 ? 'ITM' : 'OTM') : (m > 1 ? 'ITM' : 'OTM'));
      rows.push({
        ...g,
        id: `${strike}-${type}`,
        strike,
        type,
        bid,
        ask,
        mid: +mid.toFixed(2),
        lastTraded: +(mid + (rng() - 0.5) * spread).toFixed(2),
        volume: Math.round(rng() * 40_000),
        openInterest: Math.round(rng() * 120_000),
        iv: +(iv * 100).toFixed(1),
        ivRank: +(rng() * 100).toFixed(0),
        moneyness,
      });
    }
  }
  return rows;
}

function genGex(chain: OptionRow[], price: number): GexBar[] {
  const byStrike = new Map<number, number>();
  for (const row of chain) {
    // dealers assumed long calls / short puts at low strikes, opposite at high
    const sign = row.type === 'CALL' ? 1 : -1;
    const dealerDir = row.strike < price ? -1 : 1;
    const gex = row.gamma * row.openInterest * 100 * price * sign * dealerDir * 1e-6;
    byStrike.set(row.strike, (byStrike.get(row.strike) ?? 0) + gex);
  }
  return [...byStrike.entries()]
    .map(([strike, gex]) => ({ strike, gex: +gex.toFixed(2) }))
    .sort((a, b) => a.strike - b.strike);
}

function genSignals(rng: () => number): SignalRow[] {
  const now = Date.UTC(2026, 5, 2, 20, 51);
  return Array.from({ length: 6 }, (_, i) => ({
    id: `sig-${i}`,
    time: now - i * 7 * MINUTE,
    signalType: SIGNAL_TYPES[Math.floor(rng() * SIGNAL_TYPES.length)],
    direction: (['LONG', 'SHORT', 'NEUTRAL'] as Direction[])[Math.floor(rng() * 3)],
    confidence: +(0.45 + rng() * 0.5).toFixed(2),
    regime: TREND_REGIMES[Math.floor(rng() * TREND_REGIMES.length)],
    ivRegime: VOL_REGIMES[Math.floor(rng() * VOL_REGIMES.length)],
  }));
}

const HEADLINES = [
  'Volatility compresses ahead of data print',
  'Options desks flag elevated near-term hedging',
  'Sector rotation accelerates into close',
  'Dealer positioning turns net short gamma',
  'Implied move widens into expiration',
  'Term structure flattens on macro relief',
];

function genNews(rng: () => number): NewsRow[] {
  const now = Date.UTC(2026, 5, 2, 20, 40);
  return Array.from({ length: 5 }, (_, i) => {
    const s = rng();
    return {
      id: `news-${i}`,
      time: now - i * 23 * MINUTE,
      source: NEWS_SOURCES[Math.floor(rng() * NEWS_SOURCES.length)],
      headline: HEADLINES[i % HEADLINES.length],
      sentiment: (s > 0.6 ? 'POS' : s < 0.35 ? 'NEG' : 'NEU') as Sentiment,
      impact: +(rng()).toFixed(2),
    };
  });
}

function genDarkPool(rng: () => number): DarkPoolRow[] {
  const now = Date.UTC(2026, 5, 2, 20, 49);
  return Array.from({ length: 6 }, (_, i) => ({
    id: `dp-${i}`,
    time: now - i * 4 * MINUTE,
    prints: Math.round(2 + rng() * 40),
    volume: Math.round(10_000 + rng() * 900_000),
    pctOfTape: +(8 + rng() * 34).toFixed(1),
    bias: (['LONG', 'SHORT', 'NEUTRAL'] as Direction[])[Math.floor(rng() * 3)],
  }));
}

function genRegime(rng: () => number, vol: number, gex: GexBar[]): RegimeSnapshot {
  const realizedVol = +(vol * (0.8 + rng() * 0.5) * 100).toFixed(1);
  const impliedVol = +(vol * (1 + rng() * 0.4) * 100).toFixed(1);
  const dealerGexTotal = +gex.reduce((a, b) => a + b.gex, 0).toFixed(1);
  const hurst = +(0.32 + rng() * 0.4).toFixed(2);
  return {
    volRegime: VOL_REGIMES[Math.min(4, Math.floor((impliedVol / 60) * 5))],
    trendRegime: hurst > 0.58 ? 'TRENDING' : hurst < 0.42 ? 'MEAN_REVERTING' : 'RANDOM_WALK',
    hurst,
    realizedVol,
    impliedVol,
    rvIvSpread: +(impliedVol - realizedVol).toFixed(1),
    skew: +(rng() * 6 + 1).toFixed(1),
    termSlope: +(0.85 + rng() * 0.4).toFixed(2),
    dealerGexTotal,
    putCallRatio: +(0.6 + rng() * 0.9).toFixed(2),
  };
}

/* ------------------------------ assembly ------------------------------ */

const cache = new Map<string, SymbolSnapshot>();

export function getSnapshot(symbol: string): SymbolSnapshot {
  const cached = cache.get(symbol);
  if (cached) return cached;

  const cfg = UNIVERSE[symbol] ?? { name: symbol, price: 100, vol: 0.3 };
  const rng = mulberry32(hashSeed(symbol));
  const candles = genCandles(rng, cfg.price, cfg.vol);
  const last = candles[candles.length - 1];
  const prevClose = candles[0].o;
  const chain = genChain(rng, last.c, cfg.vol);
  const gex = genGex(chain, last.c);

  const snap: SymbolSnapshot = {
    symbol,
    name: cfg.name,
    price: +last.c.toFixed(2),
    change: +(last.c - prevClose).toFixed(2),
    changePct: +(((last.c - prevClose) / prevClose) * 100).toFixed(2),
    candles,
    gex,
    chain,
    signals: genSignals(rng),
    news: genNews(rng),
    darkPool: genDarkPool(rng),
    regime: genRegime(rng, cfg.vol, gex),
    expirations: ['Jun 06', 'Jun 13', 'Jun 20', 'Jul 18', 'Sep 19'],
  };
  cache.set(symbol, snap);
  return snap;
}

export function getWatchlist(): WatchItem[] {
  return SYMBOLS.map((s) => {
    const snap = getSnapshot(s);
    const spark = snap.candles.slice(-24).map((c) => c.c);
    return { symbol: s, name: snap.name, price: snap.price, changePct: snap.changePct, spark };
  });
}

/* ----------------------- positions & trade history -------------------- */

const POS_EXPIRIES = ['Jun 13', 'Jun 20', 'Jul 18'];
const TREND_FULL = ['Trending', 'Random walk', 'Mean-reverting'];
const VOL_FULL = ['Compressed', 'Normal', 'Elevated', 'High', 'Spike'];

export function getPositions(): Position[] {
  const rng = mulberry32(hashSeed('positions'));
  const out: Position[] = [];
  for (let i = 0; i < ACCOUNT.openPositions; i++) {
    const sym = SYMBOLS[Math.floor(rng() * SYMBOLS.length)];
    const snap = getSnapshot(sym);
    const type: 'CALL' | 'PUT' = rng() > 0.5 ? 'CALL' : 'PUT';
    const strike = strikesAround(snap.price)[Math.floor(rng() * 7) + 3];
    const qty = (rng() > 0.5 ? 1 : -1) * (Math.floor(rng() * 8) + 1);
    const entryPrice = +(1 + rng() * 9).toFixed(2);
    const markPrice = +Math.max(0.02, entryPrice * (0.7 + rng() * 0.8)).toFixed(2);
    const unrealizedPnl = +((markPrice - entryPrice) * qty * 100).toFixed(0);
    out.push({
      id: `pos-${i}`,
      symbol: sym,
      type,
      strike,
      expiration: POS_EXPIRIES[Math.floor(rng() * POS_EXPIRIES.length)],
      qty,
      entryPrice,
      markPrice,
      unrealizedPnl,
      unrealizedPct: +(((markPrice - entryPrice) / entryPrice) * 100).toFixed(1),
      delta: +((type === 'CALL' ? 1 : -1) * rng() * Math.sign(qty || 1)).toFixed(2),
      theta: +(-(rng() * 0.4)).toFixed(3),
      ivRank: +(rng() * 100).toFixed(0),
    });
  }
  return out;
}

export function getTradeHistory(): ClosedTrade[] {
  const rng = mulberry32(hashSeed('history'));
  const now = Date.UTC(2026, 5, 2, 20, 0);
  const out: ClosedTrade[] = [];
  for (let i = 0; i < 60; i++) {
    const sym = SYMBOLS[Math.floor(rng() * SYMBOLS.length)];
    const snap = getSnapshot(sym);
    const type: 'CALL' | 'PUT' = rng() > 0.5 ? 'CALL' : 'PUT';
    const strike = strikesAround(snap.price)[Math.floor(rng() * 13)];
    const entryPrice = +(1 + rng() * 8).toFixed(2);
    const win = rng() > 0.43;
    const exitPrice = +Math.max(0.01, entryPrice * (win ? 1.1 + rng() * 1.4 : 0.1 + rng() * 0.8)).toFixed(2);
    const qty = Math.floor(rng() * 6) + 1;
    const pnl = +((exitPrice - entryPrice) * qty * 100).toFixed(0);
    const holdMin = Math.floor(5 + rng() * 2880);
    const entryTime = now - (i * 6 + rng() * 5) * 3_600_000;
    out.push({
      id: `ct-${i}`,
      symbol: sym,
      type,
      strike,
      expiration: POS_EXPIRIES[Math.floor(rng() * POS_EXPIRIES.length)],
      entryTime,
      exitTime: entryTime + holdMin * 60_000,
      entryPrice,
      exitPrice,
      pnl,
      pnlPct: +(((exitPrice - entryPrice) / entryPrice) * 100).toFixed(1),
      regimeAtEntry: `${VOL_FULL[Math.floor(rng() * 5)]} · ${TREND_FULL[Math.floor(rng() * 3)]}`,
      ivRankAtEntry: +(rng() * 100).toFixed(0),
      holdMin,
    });
  }
  return out.sort((a, b) => b.exitTime - a.exitTime);
}

/* ---------------------- options intelligence layer ------------------- */

export interface SurfaceCell {
  expDays: number;
  moneyness: number; // strike / spot
  iv: number; // %
}

export interface SkewPoint {
  expLabel: string;
  expDays: number;
  putIv: number; // 25-delta put IV
  callIv: number; // 25-delta call IV
  skew: number; // put - call
}

export interface TermPoint {
  expDays: number;
  atmIv: number; // %
}

export interface FlowMetrics {
  netCallVolume: number;
  netPutVolume: number;
  netCallOiChange: number;
  netPutOiChange: number;
  pcrVolume: number;
  pcrOpenInterest: number;
  unusualActivityScore: number; // 0..1
  deltaSqueezeRisk: number; // 0..1
  impliedMove: number; // $ from ATM straddle
  impliedMovePct: number;
  realizedMovePct: number; // historical realized on similar events
}

export interface OptionsIntel {
  symbol: string;
  surface: SurfaceCell[];
  skew: SkewPoint[];
  term: TermPoint[];
  flow: FlowMetrics;
}

const EXP_DAYS = [7, 14, 30, 60, 90, 180];
const EXP_LABELS = ['1w', '2w', '1m', '2m', '3m', '6m'];
const MONEYNESS_GRID = [0.9, 0.94, 0.97, 1.0, 1.03, 1.06, 1.1];

const intelCache = new Map<string, OptionsIntel>();

export function getOptionsIntel(symbol: string): OptionsIntel {
  const cached = intelCache.get(symbol);
  if (cached) return cached;

  const cfg = UNIVERSE[symbol] ?? { name: symbol, price: 100, vol: 0.3 };
  const snap = getSnapshot(symbol);
  const rng = mulberry32(hashSeed(`${symbol}-intel`));
  const baseVol = cfg.vol;

  // term structure: short-dated slightly elevated, long-dated mean
  const term: TermPoint[] = EXP_DAYS.map((d) => {
    const slope = 1 + (30 - d) / 600; // near-term richer
    return { expDays: d, atmIv: +(baseVol * slope * (0.95 + rng() * 0.1) * 100).toFixed(1) };
  });

  // surface: smile across moneyness for each expiry
  const surface: SurfaceCell[] = [];
  for (const d of EXP_DAYS) {
    const atm = term.find((t) => t.expDays === d)!.atmIv;
    for (const m of MONEYNESS_GRID) {
      const smile = Math.abs(m - 1) * (140 - d) * 0.6; // tighter smile far out
      const putBias = m < 1 ? (1 - m) * 30 : 0;
      surface.push({ expDays: d, moneyness: m, iv: +(atm + smile + putBias + (rng() - 0.5) * 2).toFixed(1) });
    }
  }

  // skew per expiry (25d put - 25d call)
  const skew: SkewPoint[] = EXP_DAYS.map((d, i) => {
    const atm = term[i].atmIv;
    const putIv = +(atm + 3 + rng() * 5).toFixed(1);
    const callIv = +(atm - 1 + rng() * 2).toFixed(1);
    return { expLabel: EXP_LABELS[i], expDays: d, putIv, callIv, skew: +(putIv - callIv).toFixed(1) };
  });

  // flow metrics derived from the chain
  const calls = snap.chain.filter((r) => r.type === 'CALL');
  const puts = snap.chain.filter((r) => r.type === 'PUT');
  const callVol = calls.reduce((a, r) => a + r.volume, 0);
  const putVol = puts.reduce((a, r) => a + r.volume, 0);
  const callOi = calls.reduce((a, r) => a + r.openInterest, 0);
  const putOi = puts.reduce((a, r) => a + r.openInterest, 0);
  const atmStraddle = snap.chain
    .filter((r) => r.moneyness === 'ATM')
    .reduce((a, r) => a + r.mid, 0);
  const impliedMove = +(atmStraddle || snap.price * 0.03).toFixed(2);
  const dealerGex = snap.regime.dealerGexTotal;

  const flow: FlowMetrics = {
    netCallVolume: callVol,
    netPutVolume: putVol,
    netCallOiChange: Math.round((rng() - 0.4) * 40_000),
    netPutOiChange: Math.round((rng() - 0.5) * 40_000),
    pcrVolume: +(putVol / Math.max(1, callVol)).toFixed(2),
    pcrOpenInterest: +(putOi / Math.max(1, callOi)).toFixed(2),
    unusualActivityScore: +(rng() * 0.6 + (putVol > callVol ? 0.2 : 0.1)).toFixed(2),
    // negative dealer gamma => higher squeeze risk
    deltaSqueezeRisk: +Math.min(1, Math.max(0, 0.5 - dealerGex / 200 + rng() * 0.2)).toFixed(2),
    impliedMove,
    impliedMovePct: +((impliedMove / snap.price) * 100).toFixed(2),
    realizedMovePct: +(((impliedMove / snap.price) * 100) * (0.7 + rng() * 0.6)).toFixed(2),
  };

  const intel: OptionsIntel = { symbol, surface, skew, term, flow };
  intelCache.set(symbol, intel);
  return intel;
}

/* --------------------------- options flow series --------------------- */

export interface FlowBar {
  t: number;
  callVol: number;
  putVol: number;
}

const flowCache = new Map<string, FlowBar[]>();

export function getOptionsFlow(symbol: string): FlowBar[] {
  const cached = flowCache.get(symbol);
  if (cached) return cached;
  const rng = mulberry32(hashSeed(`${symbol}-flow`));
  const snap = getSnapshot(symbol);
  const bars: FlowBar[] = snap.candles
    .filter((_, i) => i % 3 === 0)
    .map((c) => ({
      t: c.t,
      callVol: Math.round(2_000 + rng() * 28_000),
      putVol: Math.round(2_000 + rng() * 24_000),
    }));
  flowCache.set(symbol, bars);
  return bars;
}

export const ACCOUNT: AccountSummary = {
  portfolioValue: 248_410.32,
  cash: 86_204.18,
  openPositions: 7,
  dayPnl: 3_182.45,
  dayPnlPct: 1.29,
  totalPnl: 48_410.32,
  totalPnlPct: 24.2,
};

export const MARKET_OPEN = true;

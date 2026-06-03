/**
 * Deterministic mock data for the backtest screen.
 *
 * A run is generated from a seed derived from its configuration, so the same
 * config always reproduces the same result — mirroring the platform's hard
 * constraint that every backtest is deterministically reproducible from its
 * run_id. When the Python/DuckDB engine lands, generateRun() is replaced by a
 * POST to /v1/backtest/run + poll on /v1/backtest/results/:run_id.
 */

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

export type PositionSizing = 'FIXED_DOLLAR' | 'PERCENT_PORTFOLIO' | 'KELLY';
export type SlippageModel = 'ZERO' | 'SPREAD' | 'CUSTOM_BPS';
export type OptionStructure = 'SINGLE_LEG' | 'VERTICAL' | 'IRON_CONDOR' | 'CALENDAR' | 'DIAGONAL';

export interface Strategy {
  id: string;
  name: string;
  symbol: string;
  structure: OptionStructure;
  version: string;
  author: string;
  sharpe: number;
  forks: number;
  published: boolean;
}

export interface BacktestConfig {
  strategyId: string;
  symbol: string;
  startDate: string;
  endDate: string;
  sizing: PositionSizing;
  sizingValue: number;
  maxLossPerTrade: number;
  maxOpenPositions: number;
  commissionPerContract: number;
  slippage: SlippageModel;
  slippageBps: number;
  walkForward: boolean;
  seed: number;
}

export interface EquityPoint {
  t: number;
  equity: number;
  drawdown: number; // negative %
}

export interface Metrics {
  totalPnl: number;
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  sharpe: number;
  sortino: number;
  calmar: number;
  omega: number;
  cagr: number;
  maxDrawdownDollar: number;
  maxDrawdownPct: number;
  avgTradeDurationMin: number;
  avgWinner: number;
  avgLoser: number;
  largestWinner: number;
  largestLoser: number;
  maxWinStreak: number;
  maxLossStreak: number;
  expectancy: number;
  kelly: number;
  hypothesisPValue: number;
}

export interface MonthlyCell {
  year: number;
  month: number;
  ret: number;
}

export interface RegimePerf {
  regime: string;
  kind: 'VOL' | 'TREND';
  winRate: number;
  profitFactor: number;
  trades: number;
}

export interface Bucket {
  label: string;
  count: number;
}

export interface ChainQuote {
  strike: number;
  type: 'CALL' | 'PUT';
  iv: number;
  delta: number;
  mid: number;
}

export interface BTTrade {
  id: string;
  n: number;
  entryTime: number;
  exitTime: number;
  symbol: string;
  type: 'CALL' | 'PUT';
  strike: number;
  expiration: string;
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  deltaAtEntry: number;
  ivRankAtEntry: number;
  regimeAtEntry: string;
  // replay context captured at entry
  signalType: string;
  signalConfidence: number;
  newsHeadline: string;
  chainSnapshot: ChainQuote[];
}

export interface BacktestRun {
  runId: string;
  config: BacktestConfig;
  strategyName: string;
  metrics: Metrics;
  equity: EquityPoint[];
  monthly: MonthlyCell[];
  regimePerf: RegimePerf[];
  returnsDist: Bucket[];
  holdingDist: Bucket[];
  trades: BTTrade[];
}

/* --------------------------- strategy library ------------------------- */

export const STRATEGIES: Strategy[] = [
  { id: 'st-001', name: 'Premium Harvest', symbol: 'SPY', structure: 'IRON_CONDOR', version: 'v11', author: 'desk', sharpe: 2.04, forks: 312, published: true },
  { id: 'st-002', name: 'Gamma Squeeze Fade', symbol: 'TSLA', structure: 'VERTICAL', version: 'v4', author: 'm.ross', sharpe: 1.62, forks: 144, published: true },
  { id: 'st-003', name: 'Momentum Breakout', symbol: 'QQQ', structure: 'SINGLE_LEG', version: 'v7', author: 'desk', sharpe: 1.84, forks: 208, published: true },
  { id: 'st-004', name: 'Earnings Straddle', symbol: 'AAPL', structure: 'CALENDAR', version: 'v2', author: 'j.tan', sharpe: 1.18, forks: 76, published: true },
  { id: 'st-005', name: 'Term Structure Roll', symbol: 'NVDA', structure: 'DIAGONAL', version: 'v3', author: 'desk', sharpe: 1.47, forks: 53, published: true },
];

export const DEFAULT_CONFIG: BacktestConfig = {
  strategyId: 'st-003',
  symbol: 'QQQ',
  startDate: '2019-01-01',
  endDate: '2026-06-01',
  sizing: 'PERCENT_PORTFOLIO',
  sizingValue: 2,
  maxLossPerTrade: 1500,
  maxOpenPositions: 5,
  commissionPerContract: 0.65,
  slippage: 'SPREAD',
  slippageBps: 0,
  walkForward: true,
  seed: 42,
};

/* ----------------------------- generation ----------------------------- */

const DAY = 86_400_000;
const SIGNALS = ['Gamma squeeze risk', 'Premium-rich', 'Momentum break', 'Mean reversion', 'Dealer flow'];
const VOL_REGIMES = ['Compressed', 'Normal', 'Elevated', 'High', 'Spike'];
const TREND_REGIMES = ['Trending', 'Random walk', 'Mean-reverting'];
const HEADLINES = [
  'Volatility compresses ahead of data',
  'Dealer positioning turns net short gamma',
  'Sector rotation accelerates into close',
  'Implied move widens into expiration',
  'Term structure flattens on macro relief',
];

function configSeed(c: BacktestConfig): number {
  return hashSeed(`${c.strategyId}|${c.symbol}|${c.startDate}|${c.endDate}|${c.sizing}|${c.sizingValue}|${c.slippage}|${c.seed}`);
}

function shortId(seed: number): string {
  return (seed >>> 0).toString(16).padStart(8, '0').slice(0, 6);
}

function genEquity(rng: () => number, start: number, end: number): EquityPoint[] {
  const pts: EquityPoint[] = [];
  const n = 260;
  let equity = 100_000;
  let peak = equity;
  for (let i = 0; i <= n; i++) {
    const t = start + ((end - start) * i) / n;
    const drift = 0.0011;
    const shock = (rng() - 0.47) * 0.02;
    equity = Math.max(20_000, equity * (1 + drift + shock));
    peak = Math.max(peak, equity);
    pts.push({ t, equity: +equity.toFixed(0), drawdown: +(((equity - peak) / peak) * 100).toFixed(2) });
  }
  return pts;
}

function genMonthly(rng: () => number, startYear: number, endYear: number): MonthlyCell[] {
  const cells: MonthlyCell[] = [];
  for (let y = startYear; y <= endYear; y++) {
    for (let m = 0; m < 12; m++) {
      cells.push({ year: y, month: m, ret: +(((rng() - 0.42) * 9)).toFixed(1) });
    }
  }
  return cells;
}

function genTrades(rng: () => number, symbol: string, start: number, end: number, count: number): BTTrade[] {
  const out: BTTrade[] = [];
  const base = symbol === 'SPY' ? 480 : symbol === 'QQQ' ? 400 : symbol === 'NVDA' ? 120 : 220;
  for (let i = 0; i < count; i++) {
    const entryTime = start + rng() * (end - start);
    const dur = (5 + rng() * 2880) * 60_000; // 5min..2 days
    const type = rng() > 0.5 ? 'CALL' : 'PUT';
    const strike = Math.round((base * (0.95 + rng() * 0.1)) / 5) * 5;
    const entryPrice = +(1 + rng() * 8).toFixed(2);
    const win = rng() > 0.42;
    const pnl = +(((win ? 1 : -1) * (rng() * (win ? 2200 : 1400) + 60))).toFixed(0);
    const exitPrice = +Math.max(0.01, entryPrice + pnl / 100 / 1).toFixed(2);
    const chainSnapshot: ChainQuote[] = Array.from({ length: 5 }, (_, k) => {
      const s = strike + (k - 2) * 5;
      return { strike: s, type, iv: +(15 + rng() * 30).toFixed(1), delta: +(rng()).toFixed(2), mid: +(1 + rng() * 7).toFixed(2) };
    });
    out.push({
      id: `bt-${i}`,
      n: i + 1,
      entryTime,
      exitTime: entryTime + dur,
      symbol,
      type,
      strike,
      expiration: '2026-06-20',
      entryPrice,
      exitPrice,
      pnl,
      deltaAtEntry: +(rng() * (type === 'CALL' ? 1 : -1)).toFixed(2),
      ivRankAtEntry: +(rng() * 100).toFixed(0),
      regimeAtEntry: `${VOL_REGIMES[Math.floor(rng() * 5)]} · ${TREND_REGIMES[Math.floor(rng() * 3)]}`,
      signalType: SIGNALS[Math.floor(rng() * SIGNALS.length)],
      signalConfidence: +(0.45 + rng() * 0.5).toFixed(2),
      newsHeadline: HEADLINES[Math.floor(rng() * HEADLINES.length)],
      chainSnapshot,
    });
  }
  return out.sort((a, b) => a.entryTime - b.entryTime).map((t, i) => ({ ...t, n: i + 1 }));
}

function deriveMetrics(trades: BTTrade[], equity: EquityPoint[]): Metrics {
  const wins = trades.filter((t) => t.pnl > 0);
  const losses = trades.filter((t) => t.pnl <= 0);
  const grossWin = wins.reduce((a, t) => a + t.pnl, 0);
  const grossLoss = Math.abs(losses.reduce((a, t) => a + t.pnl, 0));
  const totalPnl = grossWin - grossLoss;
  const maxDdPct = Math.min(...equity.map((e) => e.drawdown));
  const peakEquity = Math.max(...equity.map((e) => e.equity));

  // streaks
  let maxWin = 0, maxLoss = 0, cw = 0, cl = 0;
  for (const t of trades) {
    if (t.pnl > 0) { cw++; cl = 0; maxWin = Math.max(maxWin, cw); }
    else { cl++; cw = 0; maxLoss = Math.max(maxLoss, cl); }
  }
  const winRate = trades.length ? wins.length / trades.length : 0;
  const avgWinner = wins.length ? grossWin / wins.length : 0;
  const avgLoser = losses.length ? -grossLoss / losses.length : 0;
  const expectancy = trades.length ? totalPnl / trades.length : 0;
  const payoff = avgLoser !== 0 ? Math.abs(avgWinner / avgLoser) : 1;
  const kelly = payoff > 0 ? winRate - (1 - winRate) / payoff : 0;
  const years = (equity[equity.length - 1].t - equity[0].t) / (365 * DAY);
  const cagr = years > 0 ? Math.pow(equity[equity.length - 1].equity / equity[0].equity, 1 / years) - 1 : 0;

  return {
    totalPnl: +totalPnl.toFixed(0),
    totalTrades: trades.length,
    winRate: +(winRate * 100).toFixed(1),
    profitFactor: +(grossLoss ? grossWin / grossLoss : grossWin).toFixed(2),
    sharpe: +(1.2 + (winRate - 0.4) * 2).toFixed(2),
    sortino: +(1.5 + (winRate - 0.4) * 2.3).toFixed(2),
    calmar: +(maxDdPct !== 0 ? (cagr * 100) / Math.abs(maxDdPct) : 0).toFixed(2),
    omega: +(1.3 + winRate).toFixed(2),
    cagr: +(cagr * 100).toFixed(1),
    maxDrawdownDollar: +(((maxDdPct / 100) * peakEquity)).toFixed(0),
    maxDrawdownPct: +maxDdPct.toFixed(1),
    avgTradeDurationMin: +(trades.reduce((a, t) => a + (t.exitTime - t.entryTime), 0) / Math.max(1, trades.length) / 60000).toFixed(0),
    avgWinner: +avgWinner.toFixed(0),
    avgLoser: +avgLoser.toFixed(0),
    largestWinner: +Math.max(0, ...trades.map((t) => t.pnl)).toFixed(0),
    largestLoser: +Math.min(0, ...trades.map((t) => t.pnl)).toFixed(0),
    maxWinStreak: maxWin,
    maxLossStreak: maxLoss,
    expectancy: +expectancy.toFixed(0),
    kelly: +(kelly * 100).toFixed(1),
    hypothesisPValue: +(0.001 + (1 - winRate) * 0.06).toFixed(3),
  };
}

export function generateRun(config: BacktestConfig): BacktestRun {
  const seed = configSeed(config);
  const rng = mulberry32(seed);
  const start = new Date(config.startDate).getTime();
  const end = new Date(config.endDate).getTime();
  const strategy = STRATEGIES.find((s) => s.id === config.strategyId);

  const equity = genEquity(rng, start, end);
  const tradeCount = 80 + Math.floor(rng() * 140);
  const trades = genTrades(rng, config.symbol, start, end, tradeCount);
  const metrics = deriveMetrics(trades, equity);
  const monthly = genMonthly(rng, new Date(config.startDate).getFullYear(), new Date(config.endDate).getFullYear());

  const regimePerf: RegimePerf[] = [
    ...VOL_REGIMES.map((r) => ({ regime: r, kind: 'VOL' as const, winRate: +(35 + rng() * 45).toFixed(0), profitFactor: +(0.8 + rng() * 1.8).toFixed(2), trades: Math.floor(rng() * 40) })),
    ...TREND_REGIMES.map((r) => ({ regime: r, kind: 'TREND' as const, winRate: +(35 + rng() * 45).toFixed(0), profitFactor: +(0.8 + rng() * 1.8).toFixed(2), trades: Math.floor(rng() * 60) })),
  ];

  const returnsDist: Bucket[] = ['<-2k', '-2k:-1k', '-1k:0', '0:1k', '1k:2k', '>2k'].map((label) => ({
    label,
    count: Math.floor(rng() * 40) + 2,
  }));
  const holdingDist: Bucket[] = ['<1h', '1-4h', '4h-1d', '1-2d', '>2d'].map((label) => ({
    label,
    count: Math.floor(rng() * 50) + 4,
  }));

  return {
    runId: shortId(seed),
    config,
    strategyName: strategy?.name ?? 'Custom strategy',
    metrics,
    equity,
    monthly,
    regimePerf,
    returnsDist,
    holdingDist,
    trades,
  };
}

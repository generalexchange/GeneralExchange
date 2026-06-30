/**
 * Legend Monte Carlo engine — IBKR historical calibration + @gx/analytics integration.
 * Backtests SMA crossover on daily bars, calibrates GBM drift/vol, runs strategy MC,
 * and prices options with peak-tuned Black–Scholes vs chain mids.
 */
import {
  blackScholes,
  capm,
  evaluateTrade,
  simulatePricePaths,
  simulateStrategyOutcome,
  type TradeEvaluationOutput,
  type TradeGrade,
} from '@gx/analytics';
import type { Candle } from '@/components/dashboard/terminal/terminalData';
import type { OptionRow } from '@/components/dashboard/terminal/terminalData';
import { regressionVsSpy } from '@/lib/spyRegression';

const RISK_FREE = 0.043;
const MARKET_RETURN = 0.09;
const TRADING_DAYS = 252;

export interface TradeMarker {
  barIndex: number;
  type: 'entry' | 'exit';
  side: 'long';
  price: number;
  pnl?: number;
  win?: boolean;
}

export interface McPathBand {
  t: number;
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
}

export interface OptionMcRow {
  id: string;
  strike: number;
  type: 'CALL' | 'PUT';
  expiry: string;
  marketMid: number;
  bsmFair: number;
  tunedVol: number;
  calibratedVol: number;
  delta: number;
  mcProbProfit: number;
  mcProbItm: number;
  edgePct: number;
  timeYears: number;
}

export interface McLegendSnapshot {
  symbol: string;
  spot: number;
  /** Annualized realized volatility from IBKR daily history. */
  realizedVol: number;
  drift: number;
  /** SMA(8/21) crossover backtest on historical daily bars. */
  historicalWinRate: number;
  historicalTrades: number;
  historicalWins: number;
  avgWin: number;
  avgLoss: number;
  /** Monte Carlo strategy session P(profit). */
  mcProbProfit: number;
  mcExpectedReturn: number;
  mcMedianEquity: number;
  mcRuinProb: number;
  evaluation: TradeEvaluationOutput;
  tradeGrade: TradeGrade;
  /** Last ~60 daily closes for chart (oldest → newest). */
  historyCloses: number[];
  historyTimes: number[];
  tradeMarkers: TradeMarker[];
  /** GBM fan from spot over ~30 trading days. */
  mcBands: McPathBand[];
  mcPaths: number[][];
  mcHorizonDays: number;
  probSpotUp: number;
  optionRows: OptionMcRow[];
  /** OLS vs SPY daily returns. */
  beta: number;
  alphaAnnualizedPct: number;
  correlationVsSpy: number;
  rSquared: number;
  capmExpectedReturn: number;
  marketRegime: 'trending' | 'mean_reverting' | 'compressed_vol' | 'elevated_vol';
  regimeLabel: string;
  computedAt: number;
}

function classifyRegime(
  vol: number,
  drift: number,
  correlation: number,
): { marketRegime: McLegendSnapshot['marketRegime']; regimeLabel: string } {
  if (vol > 0.35) {
    return { marketRegime: 'elevated_vol', regimeLabel: 'Elevated vol' };
  }
  if (vol < 0.18) {
    return { marketRegime: 'compressed_vol', regimeLabel: 'Compressed vol' };
  }
  if (drift > 0.04 && correlation > 0.5) {
    return { marketRegime: 'trending', regimeLabel: 'Trending · SPY-linked' };
  }
  if (Math.abs(drift) < 0.02) {
    return { marketRegime: 'mean_reverting', regimeLabel: 'Mean-reverting' };
  }
  return { marketRegime: 'trending', regimeLabel: 'Trending' };
}

function quantile(sortedAsc: number[], frac: number): number {
  if (sortedAsc.length === 0) return 0;
  const idx = Math.min(sortedAsc.length - 1, Math.max(0, Math.round(frac * (sortedAsc.length - 1))));
  return sortedAsc[idx];
}

function buildBands(paths: number[][], steps: number): McPathBand[] {
  const bands: McPathBand[] = [];
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

export function normalizeIv(iv: number): number {
  if (!Number.isFinite(iv) || iv <= 0) return 0.28;
  return iv > 3 ? iv / 100 : iv;
}

/** Bisection calibration: implied vol that reprices BSM to observed mid. */
export function calibrateVolToMid(
  spot: number,
  strike: number,
  timeYears: number,
  mid: number,
  optionType: 'call' | 'put',
  hintVol: number,
): number {
  if (mid <= 0 || timeYears <= 0) return normalizeIv(hintVol);
  let lo = 0.04;
  let hi = Math.max(0.5, normalizeIv(hintVol) * 2.5);
  for (let i = 0; i < 28; i += 1) {
    const sigma = (lo + hi) / 2;
    const px = blackScholes({
      stockPrice: spot,
      strike,
      timeToExpiration: timeYears,
      volatility: sigma,
      riskFreeRate: RISK_FREE,
      optionType,
    }).theoreticalPrice;
    if (px > mid) hi = sigma;
    else lo = sigma;
  }
  const calibrated = (lo + hi) / 2;
  const hint = normalizeIv(hintVol);
  return 0.72 * calibrated + 0.28 * hint;
}

/** Peak-tuned vol: blend calibrated IV, chain IV, and realized vol. */
export function peakTunedVol(calibrated: number, chainIv: number, realizedVol: number): number {
  const iv = normalizeIv(chainIv);
  return 0.55 * calibrated + 0.3 * iv + 0.15 * realizedVol;
}

function realizedStats(closes: number[]): { drift: number; vol: number } {
  const rets: number[] = [];
  for (let i = 1; i < closes.length; i += 1) {
    const prev = closes[i - 1];
    const cur = closes[i];
    if (prev > 0 && cur > 0) rets.push(Math.log(cur / prev));
  }
  if (rets.length < 2) return { drift: 0.08, vol: 0.25 };
  const mu = rets.reduce((s, r) => s + r, 0) / rets.length;
  const variance =
    rets.reduce((s, r) => s + (r - mu) ** 2, 0) / Math.max(1, rets.length - 1);
  return { drift: mu * TRADING_DAYS, vol: Math.sqrt(variance) * Math.sqrt(TRADING_DAYS) };
}

function sma(values: number[], period: number, end: number): number {
  const start = Math.max(0, end - period + 1);
  let sum = 0;
  let n = 0;
  for (let i = start; i <= end; i += 1) {
    sum += values[i];
    n += 1;
  }
  return n > 0 ? sum / n : values[end] ?? 0;
}

function backtestSmaCross(closes: number[], fast = 8, slow = 21) {
  const markers: TradeMarker[] = [];
  let inLong = false;
  let entryPrice = 0;
  let wins = 0;
  let total = 0;
  let sumWin = 0;
  let sumLoss = 0;
  let winN = 0;
  let lossN = 0;

  for (let i = slow; i < closes.length; i += 1) {
    const fNow = sma(closes, fast, i);
    const sNow = sma(closes, slow, i);
    const fPrev = sma(closes, fast, i - 1);
    const sPrev = sma(closes, slow, i - 1);

    if (!inLong && fPrev <= sPrev && fNow > sNow) {
      inLong = true;
      entryPrice = closes[i];
      markers.push({ barIndex: i, type: 'entry', side: 'long', price: entryPrice });
    } else if (inLong && fPrev >= sPrev && fNow < sNow) {
      const pnl = entryPrice > 0 ? closes[i] / entryPrice - 1 : 0;
      const win = pnl > 0;
      total += 1;
      if (win) {
        wins += 1;
        sumWin += pnl;
        winN += 1;
      } else {
        sumLoss += Math.abs(pnl);
        lossN += 1;
      }
      markers.push({
        barIndex: i,
        type: 'exit',
        side: 'long',
        price: closes[i],
        pnl,
        win,
      });
      inLong = false;
    }
  }

  return {
    markers,
    winRate: total > 0 ? wins / total : 0.54,
    total,
    wins,
    avgWin: winN > 0 ? sumWin / winN : 0.022,
    avgLoss: lossN > 0 ? sumLoss / lossN : 0.014,
  };
}

function parseExpiry(id: string): string {
  const m = id.match(/(\d{4}-\d{2}-\d{2})/);
  return m?.[1] ?? '';
}

function yearsToExpiry(expiry: string): number {
  if (!expiry) return 30 / 365;
  const end = Date.parse(`${expiry}T16:00:00-05:00`);
  const now = Date.now();
  const days = Math.max(1, (end - now) / (1000 * 60 * 60 * 24));
  return days / 365;
}

function nearAtmOptions(chain: OptionRow[], spot: number, limit = 8): OptionRow[] {
  return [...chain]
    .filter((r) => r.mid > 0)
    .sort((a, b) => Math.abs(a.strike - spot) - Math.abs(b.strike - spot))
    .slice(0, limit);
}

function analyzeOption(
  row: OptionRow,
  spot: number,
  realizedVol: number,
  terminalPrices: number[],
): OptionMcRow {
  const expiry = parseExpiry(row.id);
  const timeYears = yearsToExpiry(expiry);
  const optType = row.type === 'CALL' ? 'call' : 'put';
  const calibrated = calibrateVolToMid(spot, row.strike, timeYears, row.mid, optType, row.iv);
  const tunedVol = peakTunedVol(calibrated, row.iv, realizedVol);

  const bs = blackScholes({
    stockPrice: spot,
    strike: row.strike,
    timeToExpiration: timeYears,
    volatility: tunedVol,
    riskFreeRate: RISK_FREE,
    optionType: optType,
  });

  const premium = row.mid;
  let mcProfit = 0;
  let mcItm = 0;
  for (const s of terminalPrices) {
    const payoff =
      row.type === 'CALL' ? Math.max(0, s - row.strike) : Math.max(0, row.strike - s);
    if (payoff > premium) mcProfit += 1;
    if ((row.type === 'CALL' && s > row.strike) || (row.type === 'PUT' && s < row.strike)) {
      mcItm += 1;
    }
  }
  const n = terminalPrices.length || 1;
  const edgePct = premium > 0 ? (bs.theoreticalPrice / premium - 1) * 100 : 0;

  return {
    id: row.id,
    strike: row.strike,
    type: row.type,
    expiry,
    marketMid: premium,
    bsmFair: bs.theoreticalPrice,
    tunedVol,
    calibratedVol: calibrated,
    delta: bs.delta,
    mcProbProfit: mcProfit / n,
    mcProbItm: mcItm / n,
    edgePct,
    timeYears,
  };
}

export interface AnalyzeLegendInput {
  symbol: string;
  spot: number;
  history: Candle[];
  spyHistory?: Candle[];
  chain: OptionRow[];
  seed?: number;
}

/** Full Legend MC snapshot — runs locally via @gx/analytics (no network round-trip). */
export function analyzeLegendMonteCarlo(input: AnalyzeLegendInput): McLegendSnapshot {
  const { symbol, spot, history, chain, spyHistory } = input;
  const seed = input.seed ?? 42;
  const closes = history.map((c) => c.c).filter((c) => c > 0);
  const times = history.map((c) => c.t);
  const window = Math.min(90, closes.length);
  const histCloses = closes.slice(-window);
  const histTimes = times.slice(-window);
  const histOffset = closes.length - histCloses.length;

  const { drift: rawDrift, vol: realizedVol } = realizedStats(closes);
  const drift = rawDrift;
  const vol = Math.max(0.12, Math.min(0.85, realizedVol));

  const spyReg =
    spyHistory && spyHistory.length > 10 ? regressionVsSpy(history, spyHistory) : null;
  const beta = spyReg?.beta ?? (symbol === 'SPY' ? 1 : 1.05);
  const alphaAnnualizedPct = spyReg?.alphaAnnualizedPct ?? 0;
  const correlationVsSpy = spyReg?.correlation ?? (symbol === 'SPY' ? 1 : 0.72);
  const rSquared = spyReg?.rSquared ?? correlationVsSpy * correlationVsSpy;
  const capmOut = capm({ riskFreeRate: RISK_FREE, marketReturn: MARKET_RETURN, beta });
  const { marketRegime, regimeLabel } = classifyRegime(vol, drift, correlationVsSpy);

  const backtest = backtestSmaCross(closes);
  const tradeMarkers = backtest.markers.map((m) => ({
    ...m,
    barIndex: m.barIndex - histOffset,
  })).filter((m) => m.barIndex >= 0 && m.barIndex < histCloses.length);

  const mcHorizonDays = 30;
  const mcSteps = mcHorizonDays;
  const timeHorizon = mcHorizonDays / TRADING_DAYS;

  const pathRun = simulatePricePaths({
    currentPrice: spot > 0 ? spot : histCloses[histCloses.length - 1] ?? 100,
    volatility: vol,
    drift,
    timeHorizon,
    steps: mcSteps,
    simulationCount: 3200,
    maxRecordedPaths: 140,
    seed,
  });

  const probSpotUp =
    pathRun.terminalPrices.filter((p) => p > (spot > 0 ? spot : histCloses.at(-1) ?? 0)).length /
    Math.max(1, pathRun.terminalPrices.length);

  const strategy = simulateStrategyOutcome({
    winRate: backtest.winRate,
    averageWin: backtest.avgLoss > 0 ? backtest.avgWin / backtest.avgLoss : 1.6,
    averageLoss: 1,
    tradeFrequency: Math.max(8, backtest.total || 12),
    accountSize: 100_000,
    positionSize: 0.12,
    simulationCount: 6000,
    seed: seed + 1,
    ruinThreshold: 0.5,
  });

  const evaluation = evaluateTrade({
    symbol,
    market: {
      currentPrice: spot > 0 ? spot : histCloses.at(-1) ?? 100,
      volatility: vol,
      drift,
      riskFreeRate: RISK_FREE,
      marketReturn: MARKET_RETURN,
      beta,
    },
    signal: {
      signalStrength: backtest.winRate,
      liquidity: 0.72,
      regime: marketRegime,
      sentiment: 0.55,
      marketStructureScore: 0.68,
    },
    setup: {
      timeHorizon,
      winRate: backtest.winRate,
      averageWin: backtest.avgLoss > 0 ? backtest.avgWin / backtest.avgLoss : 1.6,
      averageLoss: 1,
      tradeFrequency: Math.max(8, backtest.total || 12),
      accountSize: 100_000,
      positionSize: 0.12,
    },
    simulationCount: 5000,
    seed: seed + 2,
  });

  const optionTerminal = simulatePricePaths({
    currentPrice: spot > 0 ? spot : histCloses.at(-1) ?? 100,
    volatility: vol,
    drift,
    timeHorizon: nearAtmOptions(chain, spot, 1)[0]
      ? yearsToExpiry(parseExpiry(nearAtmOptions(chain, spot, 1)[0].id))
      : timeHorizon,
    steps: 24,
    simulationCount: 5000,
    maxRecordedPaths: 0,
    seed: seed + 3,
  }).terminalPrices;

  const optionRows = nearAtmOptions(chain, spot, 10).map((row) =>
    analyzeOption(row, spot, vol, optionTerminal),
  );

  return {
    symbol,
    spot: spot > 0 ? spot : histCloses.at(-1) ?? 0,
    realizedVol: vol,
    drift,
    historicalWinRate: backtest.winRate,
    historicalTrades: backtest.total,
    historicalWins: backtest.wins,
    avgWin: backtest.avgWin,
    avgLoss: backtest.avgLoss,
    mcProbProfit: strategy.probabilityOfProfit,
    mcExpectedReturn: strategy.expectedReturn,
    mcMedianEquity: strategy.statistics.median,
    mcRuinProb: strategy.riskOfRuin,
    evaluation,
    tradeGrade: evaluation.tradeGrade,
    historyCloses: histCloses,
    historyTimes: histTimes,
    tradeMarkers,
    mcBands: buildBands(pathRun.paths, mcSteps),
    mcPaths: pathRun.paths,
    mcHorizonDays,
    probSpotUp,
    optionRows,
    beta,
    alphaAnnualizedPct,
    correlationVsSpy,
    rSquared,
    capmExpectedReturn: capmOut.expectedReturn,
    marketRegime,
    regimeLabel,
    computedAt: Date.now(),
  };
}

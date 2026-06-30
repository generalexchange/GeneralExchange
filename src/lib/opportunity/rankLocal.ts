import { canUseIbkrDirect } from '@/lib/api/marketRouting';
import { mapPolygonChain } from '@/lib/api/mapLiveData';
import { ibkrOptionsChain, ibkrQuote, ibkrCandles } from '@/lib/api/ibkrDirect';
import { synthCandles, synthOptionsChain, synthQuote } from '@/lib/market/webSynth';
import { smaCrossBacktest } from '@/lib/monteCarloLegend/analyze';
import { mapCandleRows } from '@/lib/api/mapLiveData';
import type { OptionRow } from '@/components/dashboard/terminal/terminalData';
import type { DiscoverResponse, RankedContract } from './types';
import { TRADEABLE_SYMBOLS } from '@/data/symbols';

const WEIGHTS: Record<string, number> = {
  expected_return: 0.22,
  probability_of_profit: 0.22,
  historical_edge: 0.18,
  liquidity: 0.12,
  spread_quality: 0.12,
  gamma_positioning: 0.08,
  monte_carlo: 0.06,
};

function norm(x: number, lo: number, hi: number) {
  if (hi <= lo) return 0.5;
  return Math.max(0, Math.min(1, (x - lo) / (hi - lo)));
}

function dte(expiration: string) {
  const exp = new Date(expiration.slice(0, 10));
  const now = new Date();
  return Math.ceil((exp.getTime() - now.getTime()) / 86_400_000);
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function boxMuller(rng: () => number) {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function mcContract(spot: number, row: OptionRow, premium: number, dteDays: number, seed: number) {
  const vol = Math.max(0.08, row.iv > 3 ? row.iv / 100 : row.iv || 0.25);
  const t = Math.max(dteDays, 1) / 365;
  const n = 2000;
  const rng = seededRandom(seed);
  let itm = 0;
  let profitable = 0;
  let payoffSum = 0;
  for (let i = 0; i < n; i++) {
    const z = boxMuller(rng);
    const terminal = spot * Math.exp((-0.5 * vol * vol) * t + vol * Math.sqrt(t) * z);
    const intrinsic =
      row.type === 'CALL' ? Math.max(terminal - row.strike, 0) : Math.max(row.strike - terminal, 0);
    if (intrinsic > 0) itm++;
    if (intrinsic > premium) profitable++;
    payoffSum += intrinsic;
  }
  return {
    probabilityProfitable: profitable / n,
    probabilityITM: itm / n,
    expectedPayoff: payoffSum / n,
  };
}

function parseExpiration(id: string): string {
  return id.match(/(\d{4}-\d{2}-\d{2})/)?.[1] ?? '';
}

async function marketQuote(symbol: string) {
  return canUseIbkrDirect() ? ibkrQuote(symbol) : synthQuote(symbol);
}

async function marketChain(symbol: string) {
  return canUseIbkrDirect() ? ibkrOptionsChain(symbol) : synthOptionsChain(symbol);
}

async function marketCandles(symbol: string, interval: string, limit: number) {
  return canUseIbkrDirect() ? ibkrCandles(symbol, interval, limit) : synthCandles(symbol, interval, limit);
}

async function historicalWinRate(symbol: string): Promise<{ winRate: number; bullish: boolean }> {
  try {
    const res = await marketCandles(symbol, '1d', 126);
    const rows = mapCandleRows(res.data ?? []);
    const closes = rows.map((c) => c.c).filter((c) => c > 0);
    if (closes.length < 25) return { winRate: 0.5, bullish: true };
    const bt = smaCrossBacktest(closes);
    const bullish = closes.at(-1)! > closes.at(-21)!;
    const winRate = bt.total > 0 ? bt.winRate : bullish ? 0.58 : 0.42;
    return { winRate, bullish };
  } catch {
    return { winRate: 0.5, bullish: true };
  }
}

function historicalEdgeFactor(
  row: OptionRow,
  hist: { winRate: number; bullish: boolean },
): number {
  const aligned =
    (row.type === 'CALL' && hist.bullish) || (row.type === 'PUT' && !hist.bullish);
  return norm(aligned ? hist.winRate : 1 - hist.winRate, 0.4, 0.7);
}

function scoreRow(
  row: OptionRow,
  spot: number,
  symbol: string,
  hist: { winRate: number; bullish: boolean },
  seed: number,
): RankedContract | null {
  const expiration = parseExpiration(row.id);
  const dteVal = expiration ? dte(expiration) : 999;
  if (dteVal < 7 || dteVal > 45) return null;
  if (row.openInterest < 10 || row.mid < 0.05) return null;
  const spread = row.ask - row.bid || row.mid * 0.1;
  const spreadPct = spread / row.mid;
  if (spreadPct > 0.18) return null;

  const mc = mcContract(spot, row, row.mid, dteVal, seed);
  const expectedReturn = Math.max(0, (mc.expectedPayoff - row.mid) * 100 * mc.probabilityProfitable);
  const histEdge = historicalEdgeFactor(row, hist);

  const factors = {
    expected_return: norm(expectedReturn, 0, 2500),
    probability_of_profit: mc.probabilityProfitable,
    historical_edge: histEdge,
    liquidity: norm(Math.log1p(row.volume) + Math.log1p(row.openInterest), 0, 12),
    spread_quality: norm(1 - spreadPct, 0.82, 1),
    gamma_positioning: norm(Math.abs(row.gamma) * row.openInterest, 0, 500),
    monte_carlo: norm(mc.probabilityProfitable * 0.6 + mc.probabilityITM * 0.4, 0, 1),
  };
  const composite = Object.entries(factors).reduce((s, [k, v]) => s + v * (WEIGHTS[k] ?? 0.1), 0);

  const tradeHint =
    row.type === 'CALL'
      ? hist.bullish
        ? 'Historical SMA trend + MC favor calls'
        : 'Contrarian call — low historical alignment'
      : hist.bullish
        ? 'Contrarian put vs SMA trend'
        : 'Historical SMA trend + MC favor puts';

  return {
    id: `${symbol}-${row.type}-${row.strike}-${expiration}`,
    symbol,
    optionType: row.type,
    strike: row.strike,
    expiration,
    bid: row.bid,
    ask: row.ask,
    mid: row.mid,
    volume: row.volume,
    openInterest: row.openInterest,
    iv: row.iv,
    delta: row.delta,
    gamma: row.gamma,
    theta: row.theta,
    vega: row.vega,
    dte: dteVal,
    spreadPct,
    spot,
    expectedReturn: Math.round(expectedReturn * 100) / 100,
    confidence: Math.round(Math.min(99, Math.max(52, composite * 100)) * 10) / 10,
    probabilityOfProfit: Math.round(mc.probabilityProfitable * 1000) / 10,
    compositeScore: Math.round(composite * 10000) / 10000,
    factorScores: {
      expected_return: factors.expected_return,
      probability_of_profit: factors.probability_of_profit,
      historical_edge: factors.historical_edge,
      liquidity: factors.liquidity,
      spread_quality: factors.spread_quality,
      gamma_positioning: factors.gamma_positioning,
      monte_carlo: factors.monte_carlo,
    },
    monteCarlo: {
      probabilityITM: Math.round(mc.probabilityITM * 1000) / 10,
      probabilityProfitable: Math.round(mc.probabilityProfitable * 1000) / 10,
      expectedPayoff: Math.round(mc.expectedPayoff * 10000) / 10000,
      blackScholesPrice: row.mid,
    },
    analysis: {
      rationale: `${tradeHint}. ${row.type} $${row.strike.toFixed(1)} exp ${expiration} · IBKR chain mid $${row.mid.toFixed(2)} · hist win ${(hist.winRate * 100).toFixed(0)}%.`,
      rankFactors: {
        expected_return: factors.expected_return,
        probability_of_profit: factors.probability_of_profit,
        historical_edge: factors.historical_edge,
        liquidity: factors.liquidity,
        spread_quality: factors.spread_quality,
        gamma_positioning: factors.gamma_positioning,
        monte_carlo: factors.monte_carlo,
      },
      weights: WEIGHTS,
    },
  };
}

export async function discoverOpportunitiesLocal(
  symbols: string[] = [...TRADEABLE_SYMBOLS],
  includeChain = false,
): Promise<DiscoverResponse> {
  const opportunities: RankedContract[] = [];

  for (const symbol of symbols) {
    try {
      const [chainRes, quoteRes, hist] = await Promise.all([
        marketChain(symbol),
        marketQuote(symbol),
        historicalWinRate(symbol),
      ]);
      const spot =
        (quoteRes.data as { price?: number } | undefined)?.price ??
        (chainRes.data?.[0] as { underlying_price?: number } | undefined)?.underlying_price ??
        0;
      if (!spot || spot <= 0) continue;

      const rows = mapPolygonChain(chainRes.data ?? [], spot);
      const seed = symbol.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      const ranked = rows
        .map((r) => scoreRow(r, spot, symbol, hist, seed + r.strike))
        .filter((r): r is RankedContract => r != null)
        .sort((a, b) => b.compositeScore - a.compositeScore);

      if (!ranked.length) continue;
      const top = ranked[0];
      if (includeChain) top.chain = ranked.slice(0, 25);
      opportunities.push(top);
    } catch {
      /* skip symbol without IBKR data */
    }
  }

  opportunities.sort((a, b) => b.expectedReturn - a.expectedReturn || b.compositeScore - a.compositeScore);
  return { opportunities, generatedAt: new Date().toISOString(), ml: { weights: WEIGHTS } };
}

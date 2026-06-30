import { mapPolygonChain } from '@/lib/api/mapLiveData';
import { ibkrOptionsChain, ibkrQuote } from '@/lib/api/ibkrDirect';
import type { OptionRow } from '@/components/dashboard/terminal/terminalData';
import type { DiscoverResponse, RankedContract } from './types';

const SYMBOLS = ['SPY', 'QQQ', 'AAPL', 'MSFT', 'NVDA', 'TSLA'] as const;
const WEIGHTS: Record<string, number> = {
  expected_return: 0.25,
  probability_of_profit: 0.25,
  liquidity: 0.15,
  spread_quality: 0.15,
  gamma_positioning: 0.1,
  monte_carlo: 0.1,
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

function mcContract(spot: number, row: OptionRow, premium: number, dteDays: number) {
  const vol = Math.max(0.08, row.iv / 100 || 0.25);
  const t = Math.max(dteDays, 1) / 365;
  const n = 2000;
  let itm = 0;
  let profitable = 0;
  let payoffSum = 0;
  for (let i = 0; i < n; i++) {
    const z = boxMuller();
    const terminal = spot * Math.exp((-0.5 * vol * vol) * t + vol * Math.sqrt(t) * z);
    const intrinsic =
      row.type === 'CALL' ? Math.max(terminal - row.strike, 0) : Math.max(row.strike - terminal, 0);
    if (intrinsic > 0) itm++;
    if (intrinsic > premium) profitable++;
    payoffSum += intrinsic;
  }
  const prob = profitable / n;
  const probItm = itm / n;
  return {
    probabilityProfitable: prob,
    probabilityITM: probItm,
    expectedPayoff: payoffSum / n,
  };
}

function boxMuller() {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function parseExpiration(id: string): string {
  return id.match(/(\d{4}-\d{2}-\d{2})/)?.[1] ?? '';
}

function scoreRow(row: OptionRow, spot: number, symbol: string): RankedContract | null {
  const expiration = parseExpiration(row.id);
  const dteVal = expiration ? dte(expiration) : 999;
  if (dteVal < 7 || dteVal > 45) return null;
  if (row.openInterest < 10 || row.mid < 0.05) return null;
  const spread = row.ask - row.bid || row.mid * 0.1;
  const spreadPct = spread / row.mid;
  if (spreadPct > 0.18) return null;

  const mc = mcContract(spot, row, row.mid, dteVal);
  const expectedReturn = Math.max(0, (mc.expectedPayoff - row.mid) * 100 * mc.probabilityProfitable);
  const factors = {
    expected_return: norm(expectedReturn, 0, 2500),
    probability_of_profit: mc.probabilityProfitable,
    liquidity: norm(Math.log1p(row.volume) + Math.log1p(row.openInterest), 0, 12),
    spread_quality: norm(1 - spreadPct, 0.82, 1),
    gamma_positioning: norm(Math.abs(row.gamma) * row.openInterest, 0, 500),
    monte_carlo: norm(mc.probabilityProfitable * 0.6 + mc.probabilityITM * 0.4, 0, 1),
  };
  const composite = Object.entries(factors).reduce((s, [k, v]) => s + v * (WEIGHTS[k] ?? 0.1), 0);

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
    factorScores: factors,
    monteCarlo: {
      probabilityITM: Math.round(mc.probabilityITM * 1000) / 10,
      probabilityProfitable: Math.round(mc.probabilityProfitable * 1000) / 10,
      expectedPayoff: Math.round(mc.expectedPayoff * 10000) / 10000,
      blackScholesPrice: row.mid,
    },
    analysis: {
      rationale: `Top ${row.type} $${row.strike.toFixed(1)} — ranked on return, profit odds, liquidity, spread, gamma, and Monte Carlo.`,
      rankFactors: factors,
      weights: WEIGHTS,
    },
  };
}

export async function discoverOpportunitiesLocal(
  symbols: string[] = [...SYMBOLS],
  includeChain = false,
): Promise<DiscoverResponse> {
  const settled = await Promise.all(
    symbols.map(async (symbol) => {
      try {
        const [chainRes, quoteRes] = await Promise.all([
          ibkrOptionsChain(symbol),
          ibkrQuote(symbol),
        ]);
        const spot =
          (quoteRes.data as { price?: number } | undefined)?.price ??
          (chainRes.data?.[0] as { underlying_price?: number } | undefined)?.underlying_price ??
          0;
        const rows = mapPolygonChain(chainRes.data ?? [], spot);
        const ranked = rows
          .map((r) => scoreRow(r, spot, symbol))
          .filter((r): r is RankedContract => r != null)
          .sort((a, b) => b.compositeScore - a.compositeScore);

        if (!ranked.length) return null;
        const top = ranked[0];
        if (includeChain) top.chain = ranked.slice(0, 25);
        return top;
      } catch (err) {
        return {
          id: `${symbol}-err`,
          symbol,
          optionType: 'CALL' as const,
          strike: 0,
          expiration: '',
          bid: 0,
          ask: 0,
          mid: 0,
          volume: 0,
          openInterest: 0,
          iv: 0,
          delta: 0,
          gamma: 0,
          theta: 0,
          vega: 0,
          dte: 0,
          expectedReturn: 0,
          confidence: 0,
          probabilityOfProfit: 0,
          compositeScore: 0,
          factorScores: {
            expected_return: 0,
            probability_of_profit: 0,
            liquidity: 0,
            spread_quality: 0,
            gamma_positioning: 0,
            monte_carlo: 0,
          },
          monteCarlo: {
            probabilityITM: 0,
            probabilityProfitable: 0,
            expectedPayoff: 0,
            blackScholesPrice: 0,
          },
          analysis: { rationale: '', rankFactors: {} as RankedContract['factorScores'], weights: WEIGHTS },
          error: err instanceof Error ? err.message : 'discover_failed',
        } satisfies RankedContract;
      }
    }),
  );

  const opportunities = settled.filter((o): o is RankedContract => o != null);
  opportunities.sort((a, b) => b.compositeScore - a.compositeScore);
  return { opportunities, generatedAt: new Date().toISOString(), ml: { weights: WEIGHTS } };
}

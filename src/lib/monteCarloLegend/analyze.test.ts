import { describe, expect, it } from 'vitest';
import { analyzeLegendMonteCarlo, smaCrossBacktest } from '@/lib/monteCarloLegend/analyze';
import type { Candle } from '@/components/dashboard/terminal/terminalData';

function syntheticCandles(n: number, start = 100, drift = 0.002): Candle[] {
  const out: Candle[] = [];
  let p = start;
  for (let i = 0; i < n; i += 1) {
    p *= 1 + drift + (Math.sin(i / 5) * 0.003);
    out.push({ t: Date.now() - (n - i) * 86_400_000, o: p, h: p * 1.01, l: p * 0.99, c: p, v: 1e6, vwap: p });
  }
  return out;
}

describe('analyzeLegendMonteCarlo', () => {
  it('produces finite beta and win rate from IBKR-style history', () => {
    const history = syntheticCandles(90, 240);
    const spyHistory = syntheticCandles(90, 500, 0.001);
    const snap = analyzeLegendMonteCarlo({
      symbol: 'TSLA',
      spot: history.at(-1)!.c,
      history,
      spyHistory,
      chain: [
        {
          id: 'TSLA-CALL-250-2026-07-18',
          type: 'CALL',
          strike: 250,
          bid: 8,
          ask: 8.4,
          mid: 8.2,
          lastTraded: 8.2,
          iv: 45,
          ivRank: 50,
          moneyness: 'ATM',
          delta: 0.52,
          gamma: 0.02,
          theta: -0.08,
          vega: 0.3,
          volume: 1200,
          openInterest: 4500,
        },
      ],
      sentiment: {
        symbol: 'TSLA',
        headlines: [{ title: 'Tesla beats delivery estimates' }],
        sentiment: 0.4,
        impact: 0.5,
        regime: 'RISK_ON',
        institutionalBias: 0.62,
        fetchedAt: Date.now(),
      },
    });

    expect(snap.beta).toBeGreaterThan(0);
    expect(snap.historicalWinRate).toBeGreaterThan(0);
    expect(snap.historicalWinRate).toBeLessThanOrEqual(1);
    expect(snap.institutionalBuyProb).toBeGreaterThan(0);
    expect(snap.optionRows.length).toBeGreaterThan(0);
    expect(Number.isFinite(snap.mcProbProfit)).toBe(true);
  });

  it('sma backtest returns zero win rate without trades', () => {
    const flat = syntheticCandles(30, 100, 0);
    const bt = smaCrossBacktest(flat.map((c) => c.c));
    expect(bt.total).toBe(0);
    expect(bt.winRate).toBe(0);
  });
});

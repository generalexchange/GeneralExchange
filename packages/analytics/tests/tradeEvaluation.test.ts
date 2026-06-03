import { describe, expect, it } from 'vitest';
import { TradeEvaluationEngine, evaluateTrade } from '../src/scoring';
import type { TradeEvaluationInput } from '../src/types';

const goodTrade: TradeEvaluationInput = {
  symbol: 'NVDA',
  market: { currentPrice: 100, volatility: 0.22, drift: 0.12, riskFreeRate: 0.04, marketReturn: 0.1, beta: 1.1 },
  signal: {
    signalStrength: 0.85,
    liquidity: 0.9,
    regime: 'trending',
    sentiment: 0.6,
    marketStructureScore: 0.8,
    buyVolume: 70,
    sellVolume: 30,
  },
  setup: {
    strike: 105,
    timeHorizon: 0.5,
    winRate: 0.58,
    averageWin: 2,
    averageLoss: 1,
    tradeFrequency: 80,
    accountSize: 250_000,
    positionSize: 0.01,
  },
  simulationCount: 3000,
  seed: 42,
};

const poorTrade: TradeEvaluationInput = {
  ...goodTrade,
  symbol: 'WEAK',
  market: { ...goodTrade.market, volatility: 0.7, drift: -0.05 },
  signal: { ...goodTrade.signal, signalStrength: 0.2, liquidity: 0.3, regime: 'elevated_vol', sentiment: 0.05, marketStructureScore: 0.2 },
  setup: { ...goodTrade.setup, winRate: 0.32, averageWin: 1, averageLoss: 1.2 },
};

describe('TradeEvaluationEngine', () => {
  it('is deterministic for a fixed seed', () => {
    const a = evaluateTrade(goodTrade);
    const b = evaluateTrade(goodTrade);
    expect(a).toEqual(b);
  });

  it('returns every scorecard field within expected bounds', () => {
    const out = evaluateTrade(goodTrade);
    for (const v of [
      out.probabilityOfProfit,
      out.convictionScore,
      out.confidenceScore,
      out.noiseScore,
      out.expectedDrawdown,
      out.valuationScore,
      out.riskScore,
      out.liquidityScore,
    ]) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
    expect(out.positionSizingRecommendation).toBeGreaterThanOrEqual(0);
    expect(['A', 'B', 'C', 'D', 'F']).toContain(out.tradeGrade);
  });

  it('grades a strong setup higher than a weak one', () => {
    const good = evaluateTrade(goodTrade);
    const poor = evaluateTrade(poorTrade);
    const order = { A: 4, B: 3, C: 2, D: 1, F: 0 } as const;
    expect(order[good.tradeGrade]).toBeGreaterThan(order[poor.tradeGrade]);
    expect(good.convictionScore).toBeGreaterThan(poor.convictionScore);
    expect(good.riskScore).toBeLessThan(poor.riskScore);
  });

  it('projects to a dashboard DTO', () => {
    const dto = new TradeEvaluationEngine().toDashboard(goodTrade);
    expect(dto.symbol).toBe('NVDA');
    expect(dto).toHaveProperty('conviction');
    expect(dto).toHaveProperty('noise');
    expect(dto).toHaveProperty('grade');
  });
});

import { describe, expect, it } from 'vitest';
import { forecastVolatility } from '../src/garch';
import { combineSignals, updateProbability } from '../src/bayesian';
import { kellyCriterion } from '../src/kelly';
import { sharpeRatios } from '../src/sharpe';
import { capm } from '../src/capm';
import { discountedCashFlow } from '../src/dcf';
import { shannonEntropy } from '../src/entropy';
import { orderFlow } from '../src/order-flow';
import { riskOfRuin } from '../src/risk-of-ruin';

describe('GARCH', () => {
  it('forecasts a non-negative annualized volatility and classifies regime', () => {
    const returns = Array.from({ length: 60 }, (_v, i) => Math.sin(i) * 0.01);
    const out = forecastVolatility({ returns, horizon: 5, periodsPerYear: 252 });
    expect(out.forecastVolatility).toBeGreaterThanOrEqual(0);
    expect(out.confidenceBand.lower).toBeLessThanOrEqual(out.confidenceBand.upper);
    expect(['low', 'normal', 'elevated', 'extreme']).toContain(out.volatilityRegime);
  });

  it('throws with insufficient data', () => {
    expect(() => forecastVolatility({ returns: [0.01] })).toThrow(RangeError);
  });
});

describe('Bayesian', () => {
  it('raises the posterior when evidence is informative', () => {
    const out = updateProbability({ prior: 0.5, likelihood: 0.9, falsePositiveRate: 0.2 });
    expect(out.posteriorProbability).toBeGreaterThan(0.5);
    expect(out.confidenceAdjustment).toBeGreaterThan(0);
  });

  it('combines multiple bullish signals into stronger conviction', () => {
    const out = combineSignals([0.6, 0.65, 0.7], 0.5);
    expect(out.posteriorProbability).toBeGreaterThan(0.7);
  });
});

describe('Kelly', () => {
  it('sizes a positive-edge bet and floors negative edge at zero', () => {
    const good = kellyCriterion({ winProbability: 0.6, averageWin: 2, averageLoss: 1, accountSize: 100_000 });
    expect(good.optimalFraction).toBeGreaterThan(0);
    expect(good.recommendedSize).toBeGreaterThan(0);

    const bad = kellyCriterion({ winProbability: 0.3, averageWin: 1, averageLoss: 1, accountSize: 100_000 });
    expect(bad.optimalFraction).toBeLessThan(0);
    expect(bad.recommendedSize).toBe(0);
  });
});

describe('Sharpe / Sortino', () => {
  it('computes positive ratios for a positive-drift series', () => {
    const returns = [0.01, 0.02, -0.005, 0.015, 0.008, -0.002, 0.012];
    const out = sharpeRatios({ returns, periodsPerYear: 252 });
    expect(out.sharpe).toBeGreaterThan(0);
    expect(out.sortino).toBeGreaterThanOrEqual(out.sharpe - 1e-9);
  });
});

describe('CAPM', () => {
  it('applies E[R] = Rf + β(Rm − Rf)', () => {
    const out = capm({ riskFreeRate: 0.03, marketReturn: 0.1, beta: 1.2 });
    expect(out.expectedReturn).toBeCloseTo(0.03 + 1.2 * 0.07, 10);
    expect(out.marketPremium).toBeCloseTo(0.07, 10);
  });

  it('estimates beta from return series when not given', () => {
    const market = [0.01, -0.02, 0.03, -0.01, 0.02];
    const asset = market.map((m) => 2 * m); // beta ≈ 2
    const out = capm({ riskFreeRate: 0.02, marketReturn: 0.09, assetReturns: asset, marketReturns: market });
    expect(out.beta).toBeCloseTo(2, 4);
  });
});

describe('DCF', () => {
  it('flags undervaluation with a positive margin of safety', () => {
    const out = discountedCashFlow({
      cashFlows: [10, 11, 12, 13, 14],
      discountRate: 0.1,
      terminalGrowth: 0.03,
      currentPrice: 100,
    });
    expect(out.intrinsicValue).toBeGreaterThan(0);
    expect(out.valuationGap).toBeCloseTo(out.intrinsicValue - 100, 6);
  });
});

describe('Entropy', () => {
  it('is ~0 for a concentrated distribution and ~1 for a uniform one', () => {
    const concentrated = shannonEntropy({ distribution: [100, 0, 0, 0] });
    const uniform = shannonEntropy({ distribution: [25, 25, 25, 25] });
    expect(concentrated.entropyScore).toBeCloseTo(0, 6);
    expect(concentrated.signalClarity).toBeCloseTo(1, 6);
    expect(uniform.entropyScore).toBeCloseTo(1, 6);
  });
});

describe('Order flow', () => {
  it('computes pressure and imbalance from volume', () => {
    const out = orderFlow({ buyVolume: 75, sellVolume: 25, bidDepth: 60, askDepth: 40 });
    expect(out.buyPressure).toBeCloseTo(0.75, 6);
    expect(out.imbalance).toBeCloseTo(0.5, 6);
    expect(out.liquidityPressure).toBeCloseTo(0.2, 6);
  });

  it('is neutral with no volume', () => {
    const out = orderFlow({ buyVolume: 0, sellVolume: 0 });
    expect(out.buyPressure).toBe(0.5);
    expect(out.imbalance).toBe(0);
  });
});

describe('Risk of ruin', () => {
  it('reports near-certain ruin for negative edge and survival for positive edge', () => {
    const negative = riskOfRuin({ winRate: 0.3, payoffRatio: 1, riskPerTrade: 0.1 });
    expect(negative.probabilityOfRuin).toBe(1);

    const positive = riskOfRuin({ winRate: 0.6, payoffRatio: 1.5, riskPerTrade: 0.02 });
    expect(positive.probabilityOfRuin).toBeLessThan(1);
    expect(positive.survivalProbability).toBeGreaterThan(0);
  });
});

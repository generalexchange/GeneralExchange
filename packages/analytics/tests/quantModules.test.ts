import { describe, expect, it } from 'vitest';
import { analyzeCorrelation } from '../src/correlation';
import { analyzeWinRate } from '../src/win-rate';
import { analyzeGraham } from '../src/graham';

describe('correlation', () => {
  it('returns perfect self-correlation and diversification for independent series', () => {
    const a = Array.from({ length: 30 }, (_, i) => 100 + i * 0.5 + Math.sin(i) * 2);
    const b = Array.from({ length: 30 }, (_, i) => 50 + i * 0.1 + Math.cos(i) * 3);
    const out = analyzeCorrelation({ pricesBySymbol: { AAA: a, BBB: b }, benchmark: 'BBB' });
    expect(out.pearson.AAA.AAA).toBe(1);
    expect(out.diversificationScore).toBeGreaterThan(0);
    expect(out.rollingBeta?.AAA).toBeDefined();
  });
});

describe('win-rate', () => {
  it('computes Wilson CI and Bayesian posterior', () => {
    const out = analyzeWinRate({ pnls: [1, -0.5, 1, 1, -0.3, 0.8] });
    expect(out.winRate).toBeCloseTo(4 / 6, 4);
    expect(out.wilson95.low).toBeLessThan(out.wilson95.point);
    expect(out.wilson95.high).toBeGreaterThan(out.wilson95.point);
    expect(out.bayesian.posteriorMean).toBeGreaterThan(0);
  });
});

describe('graham', () => {
  it('computes Graham number and margin of safety', () => {
    const out = analyzeGraham({
      price: 80,
      eps: 5,
      bvps: 40,
      growthRate: 7,
      aaaBondYield: 4.5,
      currentRatio: 2.5,
      yearsPositiveEarnings: 10,
      pe: 12,
      pb: 1.2,
      paysDividend: true,
    });
    expect(out.grahamNumber).toBeGreaterThan(0);
    expect(out.intrinsicValue).toBeGreaterThan(0);
    expect(out.defensive.passed).toBeGreaterThan(0);
  });
});

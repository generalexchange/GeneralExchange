import { describe, expect, it } from 'vitest';
import {
  MonteCarloEngine,
  simulatePricePaths,
  simulateStrategyOutcome,
  simulateTradeQuality,
} from '../src/monte-carlo';
import { SeededRandom } from '../src/shared/random';
import { mean, standardDeviation } from '../src/shared/statistics';

describe('SeededRandom + MonteCarloEngine', () => {
  it('reproduces identical streams for identical seeds', () => {
    const a = Array.from({ length: 10 }, ((r) => () => r.next())(new SeededRandom(123)));
    const b = Array.from({ length: 10 }, ((r) => () => r.next())(new SeededRandom(123)));
    expect(a).toEqual(b);
  });

  it('produces approximately standard-normal draws', () => {
    const rng = new SeededRandom(99);
    const draws = Array.from({ length: 20000 }, () => rng.nextNormal());
    expect(mean(draws)).toBeCloseTo(0, 1);
    expect(standardDeviation(draws)).toBeCloseTo(1, 1);
  });

  it('rejects invalid trial counts', () => {
    const engine = new MonteCarloEngine({ seed: 1 });
    expect(() => engine.run(0, (r) => r.next())).toThrow(RangeError);
    expect(() => engine.run(1.5, (r) => r.next())).toThrow(RangeError);
  });
});

describe('Price path simulation (Type A)', () => {
  const base = {
    currentPrice: 100,
    volatility: 0.2,
    drift: 0.05,
    timeHorizon: 1,
    steps: 50,
    simulationCount: 5000,
    seed: 2024,
  };

  it('is deterministic and tracks the GBM mean', () => {
    const a = simulatePricePaths(base);
    const b = simulatePricePaths(base);
    expect(a.terminalPrices).toEqual(b.terminalPrices);
    const theoretical = base.currentPrice * Math.exp(base.drift * base.timeHorizon);
    expect(a.expectedPrice).toBeGreaterThan(theoretical * 0.95);
    expect(a.expectedPrice).toBeLessThan(theoretical * 1.05);
  });

  it('collapses to deterministic price at zero volatility', () => {
    const out = simulatePricePaths({ ...base, volatility: 0 });
    expect(out.statistics.standardDeviation).toBeCloseTo(0, 6);
  });
});

describe('Strategy outcome simulation (Type B)', () => {
  const base = {
    winRate: 0.55,
    averageWin: 2,
    averageLoss: 1,
    tradeFrequency: 100,
    accountSize: 100_000,
    positionSize: 0.01,
    simulationCount: 5000,
    seed: 77,
  };

  it('keeps probabilities in [0,1] and rewards positive edge', () => {
    const out = simulateStrategyOutcome(base);
    expect(out.probabilityOfProfit).toBeGreaterThan(0.5);
    expect(out.riskOfRuin).toBeGreaterThanOrEqual(0);
    expect(out.riskOfRuin).toBeLessThanOrEqual(1);
  });

  it('a negative-edge strategy loses more often than not', () => {
    const out = simulateStrategyOutcome({ ...base, winRate: 0.3, averageWin: 1, averageLoss: 1 });
    expect(out.probabilityOfProfit).toBeLessThan(0.5);
    expect(out.expectedReturn).toBeLessThan(0);
  });
});

describe('Trade quality simulation (Type C)', () => {
  const strong = {
    signalStrength: 0.9,
    volatility: 0.15,
    liquidity: 0.95,
    regime: 'trending' as const,
    sentiment: 0.7,
    marketStructureScore: 0.85,
    simulationCount: 4000,
    seed: 555,
  };

  it('scores strong setups highly with bounded outputs', () => {
    const out = simulateTradeQuality(strong);
    expect(out.convictionScore).toBeGreaterThanOrEqual(0);
    expect(out.convictionScore).toBeLessThanOrEqual(1);
    expect(out.qualityRating).toBe('high');
  });
});

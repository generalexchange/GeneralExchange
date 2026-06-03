import { MonteCarloEngine } from './engine';
import {
  FEATURE_NOISE_SD,
  estimateRisk,
  gbmPath,
  gbmTerminal,
  perturbFeatures,
  rateQuality,
  scoreConviction,
} from './models';
import {
  confidenceInterval,
  distribution,
  mean,
  percentileBands,
  standardDeviation,
  summarize,
} from '../shared/statistics';
import type {
  PricePathInput,
  PricePathOutput,
  StrategySimulationInput,
  StrategySimulationOutput,
  TradeQualityInput,
  TradeQualityOutput,
} from './types';

const DEFAULT_STEPS = 252;
const DEFAULT_MAX_RECORDED_PATHS = 200;

/* ---------------- Type A — Price Path ---------------- */

export class PricePathSimulation {
  run(input: PricePathInput): PricePathOutput {
    if (input.currentPrice <= 0) throw new RangeError('currentPrice must be positive');
    if (input.volatility < 0) throw new RangeError('volatility must be non-negative');
    if (input.timeHorizon <= 0) throw new RangeError('timeHorizon must be positive');

    const steps = input.steps ?? DEFAULT_STEPS;
    const maxRecordedPaths = Math.min(
      input.maxRecordedPaths ?? DEFAULT_MAX_RECORDED_PATHS,
      input.simulationCount,
    );
    const dt = input.timeHorizon / steps;
    const engine = new MonteCarloEngine({ seed: input.seed });
    const paths: number[][] = [];

    const terminalPrices = engine.run(input.simulationCount, (random, index) => {
      if (index < maxRecordedPaths) {
        const path = gbmPath(input.currentPrice, input.drift, input.volatility, dt, steps, random);
        paths.push(path);
        return path[path.length - 1];
      }
      return gbmTerminal(input.currentPrice, input.drift, input.volatility, input.timeHorizon, random.nextNormal());
    });

    return {
      paths,
      terminalPrices,
      expectedPrice: mean(terminalPrices),
      percentileBands: percentileBands(terminalPrices),
      distribution: distribution(terminalPrices),
      statistics: summarize(terminalPrices),
      dt,
    };
  }
}

export function simulatePricePaths(input: PricePathInput): PricePathOutput {
  return new PricePathSimulation().run(input);
}

/* ---------------- Type B — Strategy Outcome ---------------- */

interface StrategyTrial {
  finalEquity: number;
  maxDrawdown: number;
  ruined: boolean;
}

export class StrategyOutcomeSimulation {
  run(input: StrategySimulationInput): StrategySimulationOutput {
    if (input.winRate < 0 || input.winRate > 1) throw new RangeError('winRate must be in [0, 1]');
    if (input.accountSize <= 0) throw new RangeError('accountSize must be positive');
    if (input.positionSize < 0 || input.positionSize > 1) {
      throw new RangeError('positionSize must be a fraction in [0, 1]');
    }
    if (!Number.isInteger(input.tradeFrequency) || input.tradeFrequency <= 0) {
      throw new RangeError('tradeFrequency must be a positive integer');
    }

    const ruinEquity = input.accountSize * (input.ruinThreshold ?? 0);
    const engine = new MonteCarloEngine({ seed: input.seed });

    const trials = engine.run<StrategyTrial>(input.simulationCount, (random) => {
      let equity = input.accountSize;
      let peak = equity;
      let maxDrawdown = 0;
      let ruined = false;
      for (let t = 0; t < input.tradeFrequency; t += 1) {
        const risk = equity * input.positionSize;
        equity += random.bernoulli(input.winRate) ? risk * input.averageWin : -risk * input.averageLoss;
        if (equity > peak) peak = equity;
        const drawdown = peak > 0 ? (peak - equity) / peak : 0;
        if (drawdown > maxDrawdown) maxDrawdown = drawdown;
        if (equity <= ruinEquity) {
          ruined = true;
          equity = Math.max(equity, 0);
        }
      }
      return { finalEquity: equity, maxDrawdown, ruined };
    });

    const finalEquities = trials.map((t) => t.finalEquity);
    const profitable = trials.reduce((n, t) => n + (t.finalEquity > input.accountSize ? 1 : 0), 0);
    const ruinCount = trials.reduce((n, t) => n + (t.ruined ? 1 : 0), 0);

    return {
      probabilityOfProfit: profitable / trials.length,
      expectedReturn: mean(finalEquities) / input.accountSize - 1,
      expectedDrawdown: mean(trials.map((t) => t.maxDrawdown)),
      riskOfRuin: ruinCount / trials.length,
      finalEquities,
      percentileBands: percentileBands(finalEquities),
      distribution: distribution(finalEquities),
      statistics: summarize(finalEquities),
    };
  }
}

export function simulateStrategyOutcome(input: StrategySimulationInput): StrategySimulationOutput {
  return new StrategyOutcomeSimulation().run(input);
}

/* ---------------- Type C — Trade Quality ---------------- */

export class TradeQualitySimulation {
  run(input: TradeQualityInput): TradeQualityOutput {
    const engine = new MonteCarloEngine({ seed: input.seed });
    const convictions = engine.run(input.simulationCount, (random) =>
      scoreConviction(perturbFeatures(input, () => random.normal(0, FEATURE_NOISE_SD))),
    );

    const convictionScore = mean(convictions);
    const noiseScore = Math.min(1, standardDeviation(convictions) / 0.25);

    return {
      convictionScore,
      confidenceInterval: confidenceInterval(convictions, 0.95),
      noiseScore,
      expectedRisk: estimateRisk(input, convictionScore),
      qualityRating: rateQuality(convictionScore, noiseScore),
      statistics: summarize(convictions),
    };
  }
}

export function simulateTradeQuality(input: TradeQualityInput): TradeQualityOutput {
  return new TradeQualitySimulation().run(input);
}

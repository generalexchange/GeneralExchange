import type { SeededRandom } from '../shared/random';
import { clamp01 } from '../shared/statistics';
import type { MarketRegime } from '../shared/types';
import type { QualityRating, TradeQualityInput } from './types';

/* ---------------- Geometric Brownian Motion ---------------- */

/** Single GBM step: S(t+dt) = S(t)·exp((μ−½σ²)dt + σ√dt·Z). */
export function gbmStep(prev: number, mu: number, sigma: number, dt: number, shock: number): number {
  return prev * Math.exp((mu - 0.5 * sigma * sigma) * dt + sigma * Math.sqrt(dt) * shock);
}

/** Full GBM path of length `steps + 1` (index 0 is the start price). */
export function gbmPath(
  startPrice: number,
  mu: number,
  sigma: number,
  dt: number,
  steps: number,
  random: SeededRandom,
): number[] {
  const path = new Array<number>(steps + 1);
  path[0] = startPrice;
  for (let i = 1; i <= steps; i += 1) path[i] = gbmStep(path[i - 1], mu, sigma, dt, random.nextNormal());
  return path;
}

/** Closed-form terminal GBM draw (cheap when intermediate points aren't needed). */
export function gbmTerminal(
  startPrice: number,
  mu: number,
  sigma: number,
  timeHorizon: number,
  shock: number,
): number {
  return startPrice * Math.exp((mu - 0.5 * sigma * sigma) * timeHorizon + sigma * Math.sqrt(timeHorizon) * shock);
}

/* ---------------- Placeholder conviction model ---------------- */
/*
 * Transparent, hand-tuned scoring — NOT a trained model. Replace
 * `scoreConviction` / `estimateRisk` when real features arrive; the simulation
 * harness, noise treatment, types, and outputs stay identical.
 */

const REGIME_FACTOR: Record<MarketRegime, number> = {
  trending: 1.1,
  compressed_vol: 1.05,
  mean_reverting: 0.95,
  elevated_vol: 0.8,
  unknown: 0.9,
};

const WEIGHTS = {
  signalStrength: 0.4,
  marketStructureScore: 0.25,
  liquidity: 0.2,
  sentimentMagnitude: 0.15,
} as const;

export function scoreConviction(input: {
  signalStrength: number;
  volatility: number;
  liquidity: number;
  regime: MarketRegime;
  sentiment: number;
  marketStructureScore: number;
}): number {
  const base =
    WEIGHTS.signalStrength * clamp01(input.signalStrength) +
    WEIGHTS.marketStructureScore * clamp01(input.marketStructureScore) +
    WEIGHTS.liquidity * clamp01(input.liquidity) +
    WEIGHTS.sentimentMagnitude * clamp01(Math.abs(input.sentiment));
  const regimeAdjusted = base * REGIME_FACTOR[input.regime];
  const volatilityDrag = 1 - 0.5 * clamp01(input.volatility);
  return clamp01(regimeAdjusted * volatilityDrag);
}

export function estimateRisk(input: { volatility: number; liquidity: number }, conviction: number): number {
  const liquidityRisk = 1 - clamp01(input.liquidity);
  return clamp01(0.55 * clamp01(input.volatility) + 0.25 * liquidityRisk + 0.2 * (1 - conviction));
}

export function rateQuality(conviction: number, noiseScore: number): QualityRating {
  if (noiseScore > 0.5) return 'noise';
  if (conviction >= 0.66) return 'high';
  if (conviction >= 0.4) return 'medium';
  return 'low';
}

export const FEATURE_NOISE_SD = 0.05;

export function perturbFeatures(
  input: Pick<
    TradeQualityInput,
    'signalStrength' | 'volatility' | 'liquidity' | 'sentiment' | 'marketStructureScore' | 'regime'
  >,
  noise: () => number,
) {
  return {
    signalStrength: clamp01(input.signalStrength + noise()),
    volatility: clamp01(input.volatility + noise()),
    liquidity: clamp01(input.liquidity + noise()),
    sentiment: Math.max(-1, Math.min(1, input.sentiment + noise())),
    marketStructureScore: clamp01(input.marketStructureScore + noise()),
    regime: input.regime,
  };
}

import { clamp01 } from '../shared/statistics';
import type { TradeGrade } from '../types/dashboard';

/**
 * Composite trade score → letter grade. Weights are explicit and tunable;
 * they encode the platform's current opinion of what makes a trade good:
 * probability and conviction dominate, risk/noise penalize, valuation tilts.
 */
export interface GradeComponents {
  probabilityOfProfit: number;
  convictionScore: number;
  confidenceScore: number;
  noiseScore: number;
  riskScore: number;
  valuationScore: number;
}

const WEIGHTS = {
  probabilityOfProfit: 0.3,
  convictionScore: 0.25,
  confidenceScore: 0.15,
  valuationScore: 0.1,
  riskPenalty: 0.12,
  noisePenalty: 0.08,
} as const;

/** Returns a 0-1 composite score. */
export function compositeScore(c: GradeComponents): number {
  const positive =
    WEIGHTS.probabilityOfProfit * clamp01(c.probabilityOfProfit) +
    WEIGHTS.convictionScore * clamp01(c.convictionScore) +
    WEIGHTS.confidenceScore * clamp01(c.confidenceScore) +
    WEIGHTS.valuationScore * clamp01(c.valuationScore);
  const penalty =
    WEIGHTS.riskPenalty * clamp01(c.riskScore) + WEIGHTS.noisePenalty * clamp01(c.noiseScore);
  return clamp01(positive - penalty + (WEIGHTS.riskPenalty + WEIGHTS.noisePenalty) * 0.5);
}

export function toGrade(score: number): TradeGrade {
  if (score >= 0.8) return 'A';
  if (score >= 0.65) return 'B';
  if (score >= 0.5) return 'C';
  if (score >= 0.35) return 'D';
  return 'F';
}

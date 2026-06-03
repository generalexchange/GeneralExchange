/**
 * Kelly criterion position sizing.
 *
 *   f* = (b·p − q) / b ,  where p = win prob, q = 1 − p, b = win/loss payoff ratio
 *
 * Fractional Kelly (half/quarter) is the practical default because full Kelly is
 * highly sensitive to estimation error in p and b.
 */

export interface KellyInput {
  /** Win probability (0-1). */
  winProbability: number;
  /** Average win in currency or R. */
  averageWin: number;
  /** Average loss in currency or R (positive magnitude). */
  averageLoss: number;
  /** Account equity, used to translate the fraction into a size. */
  accountSize: number;
  /** Hard cap on the recommended fraction (default 0.25 → quarter of equity). */
  maxFraction?: number;
}

export interface KellyOutput {
  /** Full Kelly fraction (can be negative → no edge → don't bet). */
  optimalFraction: number;
  halfKelly: number;
  quarterKelly: number;
  /** Capital to deploy: clamped half-Kelly × accountSize, floored at 0. */
  recommendedSize: number;
}

export function kellyCriterion(input: KellyInput): KellyOutput {
  if (input.averageLoss <= 0) throw new RangeError('averageLoss must be positive');
  const p = Math.min(1, Math.max(0, input.winProbability));
  const q = 1 - p;
  const b = input.averageWin / input.averageLoss;

  const optimalFraction = b > 0 ? (b * p - q) / b : 0;
  const halfKelly = optimalFraction / 2;
  const quarterKelly = optimalFraction / 4;

  const maxFraction = input.maxFraction ?? 0.25;
  // Recommend half-Kelly, clamped to [0, maxFraction]. Negative edge → 0.
  const recommendedFraction = Math.min(Math.max(0, halfKelly), maxFraction);

  return {
    optimalFraction,
    halfKelly,
    quarterKelly,
    recommendedSize: recommendedFraction * input.accountSize,
  };
}

/**
 * Analytic risk of ruin.
 *
 * Uses the classic gambler's-ruin approximation driven by per-trade edge:
 *
 *   edge = p·b − (1−p)      (expected R per trade, with payoff ratio b)
 *   ROR  ≈ ((1 − edge)/(1 + edge))^units    for edge > 0
 *
 * where `units` is how many max-loss increments of risk capital the account can
 * absorb (≈ 1 / riskPerTrade). For non-positive edge, ruin is effectively
 * certain over a long enough horizon. This complements the Monte Carlo strategy
 * simulation, which estimates ruin empirically.
 */

export interface RiskOfRuinInput {
  /** Win probability (0-1). */
  winRate: number;
  /** Reward-to-risk payoff ratio b (averageWin / averageLoss). */
  payoffRatio: number;
  /** Fraction of capital risked per trade (0-1). */
  riskPerTrade: number;
}

export interface RiskOfRuinOutput {
  probabilityOfRuin: number;
  survivalProbability: number;
  /** Expected number of trades before ruin (Infinity when ruin is unlikely). */
  expectedLongevity: number;
}

export function riskOfRuin(input: RiskOfRuinInput): RiskOfRuinOutput {
  const p = Math.min(1, Math.max(0, input.winRate));
  const b = Math.max(0, input.payoffRatio);
  const risk = Math.min(1, Math.max(1e-6, input.riskPerTrade));

  const edge = p * b - (1 - p);
  const units = Math.max(1, Math.round(1 / risk));

  let probabilityOfRuin: number;
  if (edge <= 0) {
    probabilityOfRuin = 1;
  } else {
    const ratio = (1 - edge) / (1 + edge);
    probabilityOfRuin = Math.min(1, Math.max(0, Math.pow(Math.max(0, ratio), units)));
  }

  const survivalProbability = 1 - probabilityOfRuin;
  // Crude expected-longevity proxy: with positive edge, expected trades to grow
  // out of the ruin zone scales with capital units / edge.
  const expectedLongevity = edge <= 0 ? units / Math.max(1e-6, 1 - p) : units / edge;

  return { probabilityOfRuin, survivalProbability, expectedLongevity };
}

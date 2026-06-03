import { clamp01 } from '../shared/statistics';

/**
 * Bayesian probability updating.
 *
 * `updateProbability` is exact Bayes' rule. `combineSignals` fuses independent
 * signal probabilities in log-odds space (naive-Bayes style), which is a sound
 * default until a calibrated joint model replaces it.
 */

export interface BayesianUpdateInput {
  /** Prior probability of the hypothesis (0-1). */
  prior: number;
  /** P(evidence | hypothesis) — true positive rate (0-1). */
  likelihood: number;
  /** P(evidence | ¬hypothesis) — false positive rate (0-1). */
  falsePositiveRate: number;
}

export interface BayesianOutput {
  posteriorProbability: number;
  /** Signed change vs. the prior (posterior − prior). */
  confidenceAdjustment: number;
  /** Posterior re-expressed as a 0-1 conviction score. */
  updatedConviction: number;
}

export function updateProbability(input: BayesianUpdateInput): BayesianOutput {
  const prior = clamp01(input.prior);
  const likelihood = clamp01(input.likelihood);
  const fpr = clamp01(input.falsePositiveRate);

  const numerator = likelihood * prior;
  const evidence = numerator + fpr * (1 - prior);
  const posterior = evidence === 0 ? prior : numerator / evidence;

  return {
    posteriorProbability: posterior,
    confidenceAdjustment: posterior - prior,
    updatedConviction: posterior,
  };
}

const logit = (p: number): number => {
  const c = Math.min(1 - 1e-9, Math.max(1e-9, p));
  return Math.log(c / (1 - c));
};
const sigmoid = (x: number): number => 1 / (1 + Math.exp(-x));

/**
 * Combine independent signal probabilities into a single posterior. Each signal
 * may carry a weight (default 1). Returns the fused conviction and its delta
 * from the base prior.
 */
export function combineSignals(signals: number[], prior = 0.5, weights?: number[]): BayesianOutput {
  if (signals.length === 0) throw new RangeError('combineSignals requires at least one signal');
  let logOdds = logit(prior);
  for (let i = 0; i < signals.length; i += 1) {
    const w = weights?.[i] ?? 1;
    logOdds += w * (logit(signals[i]) - logit(prior));
  }
  const posterior = sigmoid(logOdds);
  return {
    posteriorProbability: posterior,
    confidenceAdjustment: posterior - prior,
    updatedConviction: posterior,
  };
}

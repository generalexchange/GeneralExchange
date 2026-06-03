/**
 * Information-theory metrics. Shannon entropy of a probability distribution is
 * normalized to [0,1] (divided by log of the support size) so it can serve as
 * the dashboard's primary noise driver: high entropy = diffuse/uncertain =
 * noisy; low entropy = concentrated = clear signal.
 */

export interface EntropyInput {
  /**
   * Either a probability distribution (will be normalized to sum to 1) or a set
   * of raw weights/counts. Negative values are treated as 0.
   */
  distribution: number[];
}

export interface EntropyOutput {
  /** Normalized Shannon entropy (0 = certain, 1 = maximally uncertain). */
  entropyScore: number;
  /** Alias of entropyScore for the dashboard's noise channel. */
  noiseScore: number;
  /** 1 − entropyScore. */
  signalClarity: number;
}

export function shannonEntropy(input: EntropyInput): EntropyOutput {
  const weights = input.distribution.map((w) => (w > 0 ? w : 0));
  const total = weights.reduce((s, w) => s + w, 0);

  if (total === 0 || weights.length <= 1) {
    // No information / single outcome → zero entropy → maximal clarity.
    return { entropyScore: 0, noiseScore: 0, signalClarity: 1 };
  }

  let h = 0;
  for (const w of weights) {
    if (w <= 0) continue;
    const p = w / total;
    h -= p * Math.log(p);
  }

  const maxEntropy = Math.log(weights.length);
  const entropyScore = maxEntropy === 0 ? 0 : h / maxEntropy;
  return { entropyScore, noiseScore: entropyScore, signalClarity: 1 - entropyScore };
}

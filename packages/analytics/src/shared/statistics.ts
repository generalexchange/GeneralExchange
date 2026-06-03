import type {
  ConfidenceInterval,
  DistributionBin,
  PercentileBand,
  SummaryStatistics,
} from './types';

const Z_SCORES: Record<string, number> = {
  '0.8': 1.2815515655446004,
  '0.9': 1.6448536269514722,
  '0.95': 1.959963984540054,
  '0.99': 2.5758293035489004,
};

function assertNonEmpty(samples: readonly number[]): void {
  if (samples.length === 0) throw new RangeError('statistics require at least one sample');
}

export function mean(samples: readonly number[]): number {
  assertNonEmpty(samples);
  let total = 0;
  for (const x of samples) total += x;
  return total / samples.length;
}

export function sortedCopy(samples: readonly number[]): number[] {
  return [...samples].sort((a, b) => a - b);
}

export function medianSorted(sorted: readonly number[]): number {
  assertNonEmpty(sorted);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

export function median(samples: readonly number[]): number {
  return medianSorted(sortedCopy(samples));
}

/** Variance. Sample (n-1) estimator by default; population (n) when requested. */
export function variance(samples: readonly number[], population = false): number {
  assertNonEmpty(samples);
  const n = samples.length;
  if (n === 1) return 0;
  const mu = mean(samples);
  let sumSq = 0;
  for (const x of samples) {
    const d = x - mu;
    sumSq += d * d;
  }
  return sumSq / (population ? n : n - 1);
}

export function standardDeviation(samples: readonly number[], population = false): number {
  return Math.sqrt(variance(samples, population));
}

/**
 * Downside deviation relative to a minimum acceptable return (MAR). Only
 * returns below the MAR contribute. Used by the Sortino ratio.
 */
export function downsideDeviation(samples: readonly number[], mar = 0): number {
  assertNonEmpty(samples);
  let sumSq = 0;
  for (const x of samples) {
    const shortfall = Math.min(0, x - mar);
    sumSq += shortfall * shortfall;
  }
  return Math.sqrt(sumSq / samples.length);
}

export function covariance(a: readonly number[], b: readonly number[]): number {
  if (a.length !== b.length) throw new RangeError('covariance requires equal-length series');
  assertNonEmpty(a);
  if (a.length === 1) return 0;
  const ma = mean(a);
  const mb = mean(b);
  let sum = 0;
  for (let i = 0; i < a.length; i += 1) sum += (a[i] - ma) * (b[i] - mb);
  return sum / (a.length - 1);
}

export function percentileSorted(sorted: readonly number[], p: number): number {
  assertNonEmpty(sorted);
  if (p <= 0) return sorted[0];
  if (p >= 100) return sorted[sorted.length - 1];
  const rank = (p / 100) * (sorted.length - 1);
  const low = Math.floor(rank);
  const high = Math.ceil(rank);
  if (low === high) return sorted[low];
  const weight = rank - low;
  return sorted[low] * (1 - weight) + sorted[high] * weight;
}

export function percentile(samples: readonly number[], p: number): number {
  return percentileSorted(sortedCopy(samples), p);
}

export const DEFAULT_PERCENTILES = [5, 25, 50, 75, 95] as const;

export function percentileBands(
  samples: readonly number[],
  percentiles: readonly number[] = DEFAULT_PERCENTILES,
): PercentileBand[] {
  const sorted = sortedCopy(samples);
  return percentiles.map((p) => ({ percentile: p, value: percentileSorted(sorted, p) }));
}

export function confidenceInterval(samples: readonly number[], level = 0.95): ConfidenceInterval {
  assertNonEmpty(samples);
  const estimate = mean(samples);
  const z = Z_SCORES[String(level)] ?? Z_SCORES['0.95'];
  const standardError = standardDeviation(samples) / Math.sqrt(samples.length);
  const margin = z * standardError;
  return { level, estimate, lower: estimate - margin, upper: estimate + margin };
}

export function distribution(samples: readonly number[], binCount = 20): DistributionBin[] {
  assertNonEmpty(samples);
  const sorted = sortedCopy(samples);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const total = sorted.length;

  if (min === max || binCount <= 1) {
    return [{ start: min, end: max, count: total, density: 1 }];
  }

  const width = (max - min) / binCount;
  const bins: DistributionBin[] = Array.from({ length: binCount }, (_unused, i) => ({
    start: min + i * width,
    end: i === binCount - 1 ? max : min + (i + 1) * width,
    count: 0,
    density: 0,
  }));

  for (const x of sorted) {
    let idx = Math.floor((x - min) / width);
    if (idx >= binCount) idx = binCount - 1;
    if (idx < 0) idx = 0;
    bins[idx].count += 1;
  }
  for (const bin of bins) bin.density = bin.count / total;
  return bins;
}

export function summarize(
  samples: readonly number[],
  percentiles: readonly number[] = DEFAULT_PERCENTILES,
): SummaryStatistics {
  const sorted = sortedCopy(samples);
  return {
    count: sorted.length,
    mean: mean(sorted),
    median: medianSorted(sorted),
    variance: variance(sorted),
    standardDeviation: standardDeviation(sorted),
    min: sorted[0],
    max: sorted[sorted.length - 1],
    percentiles: percentiles.map((p) => ({ percentile: p, value: percentileSorted(sorted, p) })),
  };
}

/* --- Gaussian helpers (shared by Black–Scholes and elsewhere) --- */

/** Error function (Abramowitz & Stegun 7.1.26 approximation). */
export function erf(x: number): number {
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-x * x);
  return x >= 0 ? y : -y;
}

/** Standard normal cumulative distribution function. */
export function normalCdf(x: number): number {
  return 0.5 * (1 + erf(x / Math.SQRT2));
}

/** Standard normal probability density function. */
export function normalPdf(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

export function clamp(x: number, min: number, max: number): number {
  return x < min ? min : x > max ? max : x;
}

export const clamp01 = (x: number): number => clamp(x, 0, 1);

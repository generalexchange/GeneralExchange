/** Shared statistical value objects produced by the aggregation layer. */

export interface PercentileBand {
  percentile: number;
  value: number;
}

export interface ConfidenceInterval {
  /** Confidence level as a fraction, e.g. 0.95 for 95%. */
  level: number;
  lower: number;
  upper: number;
  /** Point estimate the interval is centered on (typically the mean). */
  estimate: number;
}

export interface DistributionBin {
  start: number;
  end: number;
  count: number;
  /** count / total — the empirical probability mass for this bin. */
  density: number;
}

export interface SummaryStatistics {
  count: number;
  mean: number;
  median: number;
  variance: number;
  standardDeviation: number;
  min: number;
  max: number;
  percentiles: PercentileBand[];
}

/** Coarse market regime label, extended as the warehouse feeds richer states. */
export type MarketRegime =
  | 'trending'
  | 'mean_reverting'
  | 'compressed_vol'
  | 'elevated_vol'
  | 'unknown';

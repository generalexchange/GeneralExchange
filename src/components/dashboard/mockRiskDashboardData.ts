/**
 * Mock risk analytics for the Risk dashboard tab.
 * Replace with API payloads from Monte Carlo / stress engines when wired.
 */

export type RiskLevel = 'safe' | 'moderate' | 'high';

export type RiskMetrics = {
  survivalProbability: number;
  expectedReturn: number;
  maxDrawdown: number;
  var95: number;
  fragilityScore: number;
};

export type RiskMetricTrend = {
  label: string;
  deltaLabel: string;
  tone: 'positive' | 'negative' | 'neutral';
};

export type MonteCarloPathPoint = {
  day: number;
  label: string;
  median: number;
  p5: number;
  p95: number;
  worst: number;
  best: number;
  /** p95 − p5 for stacked area band */
  spread: number;
};

export type DrawdownBin = {
  binLabel: string;
  count: number;
  binMidPct: number;
};

export type StressSeverity = 'low' | 'moderate' | 'high';

export type StressTestScenario = {
  id: string;
  name: string;
  description: string;
  pnlImpactPct: number;
  probabilityAdjustmentPts: number;
  severity: StressSeverity;
};

export type RiskNarrative = {
  headline: string;
  uncertainty: string;
  volatilityFragility: string;
  tailDependence: string;
};

/** Raw path matrix: each inner array is one simulated equity path (normalized to 100). */
export const MOCK_MONTE_CARLO_PATHS: number[][] = (() => {
  const paths = 48;
  const days = 63;
  const out: number[][] = [];
  for (let p = 0; p < paths; p++) {
    const drift = -0.02 + (p / paths) * 0.09;
    const vol = 0.012 + (p % 7) * 0.0015;
    let v = 100;
    const row: number[] = [v];
    for (let d = 1; d < days; d++) {
      const shock = Math.sin(d * 0.31 + p) * vol + drift * 0.35;
      v = Math.max(72, v * (1 + shock));
      row.push(Number(v.toFixed(2)));
    }
    out.push(row);
  }
  return out;
})();

export function buildMonteCarloSeriesFromPaths(paths: number[][]): MonteCarloPathPoint[] {
  if (paths.length === 0 || paths[0].length === 0) return [];
  const T = paths[0].length;
  const series: MonteCarloPathPoint[] = [];
  for (let t = 0; t < T; t++) {
    const slice = paths.map((row) => row[t]).sort((a, b) => a - b);
    const n = slice.length;
    const q = (p: number) => slice[Math.min(n - 1, Math.max(0, Math.floor(p * (n - 1))))];
    const p5 = q(0.05);
    const p95 = q(0.95);
    series.push({
      day: t,
      label: t % 9 === 0 ? `D${t}` : '',
      median: q(0.5),
      p5,
      p95,
      worst: slice[0],
      best: slice[n - 1],
      spread: Math.max(0, p95 - p5),
    });
  }
  return series;
}

export const MOCK_RISK_METRICS: RiskMetrics = {
  survivalProbability: 78.4,
  expectedReturn: 6.2,
  maxDrawdown: 14.8,
  var95: 3.1,
  fragilityScore: 38,
};

export const MOCK_RISK_TRENDS: Record<keyof RiskMetrics, RiskMetricTrend> = {
  survivalProbability: { label: 'vs prior run', deltaLabel: '+2.1 pts', tone: 'positive' },
  expectedReturn: { label: 'median path', deltaLabel: '+0.4 pts', tone: 'positive' },
  maxDrawdown: { label: 'p95 band', deltaLabel: '−0.6 pts', tone: 'positive' },
  var95: { label: '1-day horizon', deltaLabel: '+0.2 pts', tone: 'negative' },
  fragilityScore: { label: 'regime vol', deltaLabel: '−4', tone: 'positive' },
};

export function buildDrawdownHistogramFromDistribution(values: number[]): DrawdownBin[] {
  const bins = 12;
  const sorted = [...values].sort((a, b) => a - b);
  const lo = sorted[0];
  const hi = sorted[sorted.length - 1];
  const step = (hi - lo) / bins || 1;
  const counts = new Array(bins).fill(0);
  for (const v of values) {
    const i = Math.min(bins - 1, Math.max(0, Math.floor((v - lo) / step)));
    counts[i]++;
  }
  return counts.map((count, i) => ({
    binLabel: `${(lo + i * step).toFixed(1)}%`,
    count,
    binMidPct: lo + (i + 0.5) * step,
  }));
}

export const MOCK_DRAWDOWN_DISTRIBUTION: number[] = (() => {
  const n = 2000;
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const u = Math.pow(Math.random(), 1.8);
    out.push(-(2 + u * 22 + Math.random() * 4));
  }
  return out;
})();

export const MOCK_STRESS_SCENARIOS: StressTestScenario[] = [
  {
    id: 'crash',
    name: 'Market Crash (−10%)',
    description: 'Instantaneous equity shock with elevated correlation across factors.',
    pnlImpactPct: -8.4,
    probabilityAdjustmentPts: -11.2,
    severity: 'high',
  },
  {
    id: 'vol',
    name: 'Volatility Spike (+50%)',
    description: 'VIX-style vol surface lift; widens tails on short gamma structures.',
    pnlImpactPct: -4.1,
    probabilityAdjustmentPts: -6.8,
    severity: 'moderate',
  },
  {
    id: 'chop',
    name: 'Sideways Chop Market',
    description: 'Mean-reverting noise; hurts trend-following entries.',
    pnlImpactPct: -1.9,
    probabilityAdjustmentPts: -2.4,
    severity: 'low',
  },
  {
    id: 'liq',
    name: 'Liquidity Shock',
    description: 'Widened spreads and slippage model on thin depth.',
    pnlImpactPct: -3.6,
    probabilityAdjustmentPts: -5.1,
    severity: 'moderate',
  },
];

export const MOCK_RISK_NARRATIVE: RiskNarrative = {
  headline: 'Simulation-based readout (QuantConnect path + Monte Carlo engine placeholder)',
  uncertainty:
    'Under the current parameterization, roughly four in five Monte Carlo paths remain above the survival threshold through the full horizon. Return mass is centered slightly positive, but the left tail still carries meaningful mass—consistent with a strategy that harvests small edges while occasionally paying for correlation shocks.',
  volatilityFragility:
    'Fragility sits in the moderate band: a +50% volatility regime does not wipe the book in most draws, but it compresses the probability of finishing above the hurdle rate. The model is more sensitive to vol level shifts than to a slow grind lower, which suggests sizing and convexity hedges matter more than directional beta alone.',
  tailDependence:
    'Returns are moderately tail-dependent: kurtosis in the simulated PnL distribution exceeds a Gaussian baseline. Stress overlays (crash / liquidity) move survival probability more than marginal drift assumptions—an indicator that tail scenarios, not mean forecasts, dominate risk budgeting for this book.',
};

export function riskLevelForFragility(score: number): RiskLevel {
  if (score <= 35) return 'safe';
  if (score <= 60) return 'moderate';
  return 'high';
}

export function riskBadgeLabel(level: RiskLevel): string {
  if (level === 'safe') return 'Safe';
  if (level === 'moderate') return 'Moderate';
  return 'High risk';
}

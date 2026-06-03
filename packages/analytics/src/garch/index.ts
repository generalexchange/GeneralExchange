import { standardDeviation } from '../shared/statistics';

/**
 * GARCH(1,1) volatility forecasting — PLACEHOLDER.
 *
 * Implements the canonical GARCH(1,1) recursion so the contract and outputs are
 * real, but the parameters (omega/alpha/beta) are supplied or defaulted rather
 * than fit via MLE. Swap `forecastVolatility` for a fitted estimator later; the
 * output contract stays identical.
 *
 *   σ²(t) = ω + α·ε²(t-1) + β·σ²(t-1)
 */

export type VolatilityRegime = 'low' | 'normal' | 'elevated' | 'extreme';

export interface GarchParams {
  /** Long-run variance weight. */
  omega: number;
  /** Reaction to last shock. */
  alpha: number;
  /** Persistence of prior variance. */
  beta: number;
}

export interface GarchInput {
  /** Periodic (e.g. daily) return series, most recent last. */
  returns: number[];
  /** Forecast horizon in periods. */
  horizon?: number;
  /** Periods per year used to annualize (default 252). */
  periodsPerYear?: number;
  /** Optional explicit GARCH params; defaults to a typical equity calibration. */
  params?: GarchParams;
}

export interface GarchOutput {
  /** Annualized volatility forecast at the horizon. */
  forecastVolatility: number;
  volatilityRegime: VolatilityRegime;
  /** Annualized ±1σ band around the forecast. */
  confidenceBand: { lower: number; upper: number };
}

const DEFAULT_PARAMS: GarchParams = { omega: 0.000002, alpha: 0.08, beta: 0.9 };

function classifyRegime(annualizedVol: number): VolatilityRegime {
  if (annualizedVol < 0.12) return 'low';
  if (annualizedVol < 0.25) return 'normal';
  if (annualizedVol < 0.5) return 'elevated';
  return 'extreme';
}

export function forecastVolatility(input: GarchInput): GarchOutput {
  if (input.returns.length < 2) {
    throw new RangeError('GARCH requires at least 2 return observations');
  }
  const params = input.params ?? DEFAULT_PARAMS;
  const horizon = input.horizon ?? 1;
  const periodsPerYear = input.periodsPerYear ?? 252;

  // Seed conditional variance with the sample variance, then run the recursion.
  let variance = standardDeviation(input.returns) ** 2;
  for (let i = 1; i < input.returns.length; i += 1) {
    const shock = input.returns[i] - input.returns[i - 1];
    variance = params.omega + params.alpha * shock * shock + params.beta * variance;
  }

  // Multi-step: mean-revert variance toward its long-run level.
  const persistence = params.alpha + params.beta;
  const longRun = persistence < 1 ? params.omega / (1 - persistence) : variance;
  let forecast = variance;
  for (let h = 0; h < horizon; h += 1) {
    forecast = longRun + persistence * (forecast - longRun);
  }

  const periodVol = Math.sqrt(Math.max(forecast, 0));
  const annualized = periodVol * Math.sqrt(periodsPerYear);
  // ±1σ band: a coarse parametric spread proportional to the level.
  const bandWidth = annualized * 0.2;

  return {
    forecastVolatility: annualized,
    volatilityRegime: classifyRegime(annualized),
    confidenceBand: { lower: Math.max(0, annualized - bandWidth), upper: annualized + bandWidth },
  };
}

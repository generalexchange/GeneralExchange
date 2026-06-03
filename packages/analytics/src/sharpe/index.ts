import { downsideDeviation, mean, standardDeviation } from '../shared/statistics';

/**
 * Risk-adjusted return ratios: Sharpe (total volatility) and Sortino (downside
 * volatility only). Ratios are annualized when `periodsPerYear` is supplied.
 */

export interface SharpeInput {
  /** Periodic returns (e.g. daily), as decimals. */
  returns: number[];
  /** Periodic risk-free rate as a decimal (default 0). */
  riskFreeRate?: number;
  /** Periods per year for annualization (e.g. 252). Omit to leave per-period. */
  periodsPerYear?: number;
  /** Minimum acceptable return for Sortino's downside (default = risk-free). */
  minimumAcceptableReturn?: number;
}

export interface SharpeOutput {
  sharpe: number;
  sortino: number;
  /** Mean excess return over the risk-free rate (annualized if requested). */
  riskAdjustedReturn: number;
}

export function sharpeRatios(input: SharpeInput): SharpeOutput {
  if (input.returns.length < 2) throw new RangeError('Sharpe/Sortino require at least 2 returns');
  const rf = input.riskFreeRate ?? 0;
  const mar = input.minimumAcceptableReturn ?? rf;
  const scale = input.periodsPerYear ? Math.sqrt(input.periodsPerYear) : 1;
  const returnScale = input.periodsPerYear ?? 1;

  const excess = input.returns.map((r) => r - rf);
  const meanExcess = mean(excess);
  const sd = standardDeviation(input.returns);
  const dd = downsideDeviation(input.returns, mar);

  return {
    sharpe: sd === 0 ? 0 : (meanExcess / sd) * scale,
    sortino: dd === 0 ? 0 : ((mean(input.returns) - mar) / dd) * scale,
    riskAdjustedReturn: meanExcess * returnScale,
  };
}

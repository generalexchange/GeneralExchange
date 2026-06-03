import { covariance, variance } from '../shared/statistics';

/**
 * Capital Asset Pricing Model.
 *
 *   E[R] = Rf + β·(E[Rm] − Rf)
 *
 * `beta` may be supplied directly or estimated from paired asset/market return
 * series via cov(asset, market) / var(market).
 */

export interface CapmInput {
  riskFreeRate: number;
  /** Expected market return as a decimal. */
  marketReturn: number;
  /** Asset beta. Provide directly, or omit and pass return series instead. */
  beta?: number;
  /** Asset periodic returns (used to estimate beta if `beta` is omitted). */
  assetReturns?: number[];
  /** Market periodic returns (used to estimate beta if `beta` is omitted). */
  marketReturns?: number[];
}

export interface CapmOutput {
  expectedReturn: number;
  beta: number;
  /** Market risk premium: E[Rm] − Rf. */
  marketPremium: number;
  /** Required return (equal to expectedReturn under CAPM). */
  requiredReturn: number;
}

export function capm(input: CapmInput): CapmOutput {
  let beta = input.beta;
  if (beta === undefined) {
    if (!input.assetReturns || !input.marketReturns) {
      throw new RangeError('capm requires either `beta` or both asset and market return series');
    }
    const marketVar = variance(input.marketReturns);
    beta = marketVar === 0 ? 0 : covariance(input.assetReturns, input.marketReturns) / marketVar;
  }

  const marketPremium = input.marketReturn - input.riskFreeRate;
  const expectedReturn = input.riskFreeRate + beta * marketPremium;
  return { expectedReturn, beta, marketPremium, requiredReturn: expectedReturn };
}

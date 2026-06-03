import { normalCdf, normalPdf } from '../shared/statistics';

export type OptionType = 'call' | 'put';

export interface BlackScholesInput {
  /** Underlying spot price. */
  stockPrice: number;
  /** Strike price. */
  strike: number;
  /** Time to expiration in years. */
  timeToExpiration: number;
  /** Annualized volatility as a decimal (0.2 = 20%). */
  volatility: number;
  /** Annualized risk-free rate as a decimal (0.05 = 5%). */
  riskFreeRate: number;
  /** Continuous dividend yield as a decimal (default 0). */
  dividendYield?: number;
  /** Option type (default 'call'). */
  optionType?: OptionType;
}

export interface BlackScholesOutput {
  theoreticalPrice: number;
  /** ∂Price/∂Spot. */
  delta: number;
  /** ∂²Price/∂Spot². */
  gamma: number;
  /** ∂Price/∂Time, per year (negative for long options). */
  theta: number;
  /** ∂Price/∂Volatility, per 1.00 (100%) change in vol. */
  vega: number;
  /** ∂Price/∂Rate, per 1.00 (100%) change in rate. */
  rho: number;
}

/**
 * Black–Scholes–Merton European option pricing with full first-order greeks
 * (plus gamma). Dividend yield is supported via the Merton extension.
 *
 * Edge cases: when time or volatility collapse to ~0, the option is worth its
 * discounted intrinsic value and greeks degenerate to 0 (delta steps to the
 * exercise indicator), which is returned explicitly rather than producing NaNs.
 */
export function blackScholes(input: BlackScholesInput): BlackScholesOutput {
  const { stockPrice: S, strike: K, timeToExpiration: T, volatility: sigma, riskFreeRate: r } = input;
  const q = input.dividendYield ?? 0;
  const isCall = (input.optionType ?? 'call') === 'call';

  if (T <= 0 || sigma <= 0) {
    const discountedIntrinsic = isCall
      ? Math.max(0, S * Math.exp(-q * Math.max(T, 0)) - K * Math.exp(-r * Math.max(T, 0)))
      : Math.max(0, K * Math.exp(-r * Math.max(T, 0)) - S * Math.exp(-q * Math.max(T, 0)));
    const inTheMoney = isCall ? S > K : S < K;
    return {
      theoreticalPrice: discountedIntrinsic,
      delta: inTheMoney ? (isCall ? 1 : -1) : 0,
      gamma: 0,
      theta: 0,
      vega: 0,
      rho: 0,
    };
  }

  const sqrtT = Math.sqrt(T);
  const d1 = (Math.log(S / K) + (r - q + 0.5 * sigma * sigma) * T) / (sigma * sqrtT);
  const d2 = d1 - sigma * sqrtT;

  const discountR = Math.exp(-r * T);
  const discountQ = Math.exp(-q * T);
  const pdfD1 = normalPdf(d1);

  const gamma = (discountQ * pdfD1) / (S * sigma * sqrtT);
  const vega = S * discountQ * pdfD1 * sqrtT;

  if (isCall) {
    const Nd1 = normalCdf(d1);
    const Nd2 = normalCdf(d2);
    const theoreticalPrice = S * discountQ * Nd1 - K * discountR * Nd2;
    const delta = discountQ * Nd1;
    const theta =
      (-(S * discountQ * pdfD1 * sigma) / (2 * sqrtT)) -
      r * K * discountR * Nd2 +
      q * S * discountQ * Nd1;
    const rho = K * T * discountR * Nd2;
    return { theoreticalPrice, delta, gamma, theta, vega, rho };
  }

  const Nnegd1 = normalCdf(-d1);
  const Nnegd2 = normalCdf(-d2);
  const theoreticalPrice = K * discountR * Nnegd2 - S * discountQ * Nnegd1;
  const delta = -discountQ * Nnegd1;
  const theta =
    (-(S * discountQ * pdfD1 * sigma) / (2 * sqrtT)) +
    r * K * discountR * Nnegd2 -
    q * S * discountQ * Nnegd1;
  const rho = -K * T * discountR * Nnegd2;
  return { theoreticalPrice, delta, gamma, theta, vega, rho };
}

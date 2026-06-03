/**
 * Black-Scholes-Merton (dividend-free) option pricing with the full first- and
 * second-order Greek set. Ported verbatim from the general.exchange web project
 * `greeksService.ts` so the desktop terminal reports identical numbers.
 *
 * Conventions:
 *  - vega is per 1% (0.01) change in volatility
 *  - theta, charm, and color are reported per calendar day
 *  - all other Greeks are per unit / per year as standard
 */

export type ContractType = 'CALL' | 'PUT';

export interface OptionContract {
  strike: number;
  underlyingPrice: number;
  riskFreeRate: number;
  impliedVolatility: number;
  /** time to expiration in years */
  timeToExpiration: number;
  type: ContractType;
}

export interface FullGreeks {
  delta: number;
  gamma: number;
  theta: number; // per day
  vega: number; // per 1% vol
  rho: number; // per 1% rate
  lambda: number; // elasticity
  epsilon: number; // dividend rho (q = 0)
  charm: number; // dDelta/dTime, per day
  vanna: number; // dDelta/dVol
  volga: number; // dVega/dVol (vomma)
  speed: number; // dGamma/dSpot
  zomma: number; // dGamma/dVol
  color: number; // dGamma/dTime, per day
  price: number; // theoretical option price
}

const YEAR = 365;

/** Abramowitz & Stegun error-function approximation. */
function erf(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x >= 0 ? 1 : -1;
  const ax = Math.abs(x);
  const t = 1.0 / (1.0 + p * ax);
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
  return sign * y;
}

const N = (x: number) => 0.5 * (1 + erf(x / Math.SQRT2));
const phi = (x: number) => Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);

export function calculateFullGreeks(option: OptionContract): FullGreeks {
  const { underlyingPrice: S, strike: K, timeToExpiration: T, riskFreeRate: r, impliedVolatility: sigma, type } = option;
  const isCall = type === 'CALL';

  if (T <= 0 || sigma <= 0) {
    const delta = isCall ? (S > K ? 1 : 0) : S < K ? -1 : 0;
    return {
      delta, gamma: 0, theta: 0, vega: 0, rho: 0, lambda: 0, epsilon: 0,
      charm: 0, vanna: 0, volga: 0, speed: 0, zomma: 0, color: 0,
      price: Math.max(isCall ? S - K : K - S, 0),
    };
  }

  const sqrtT = Math.sqrt(T);
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrtT);
  const d2 = d1 - sigma * sqrtT;
  const disc = Math.exp(-r * T);

  const delta = isCall ? N(d1) : N(d1) - 1;
  const gamma = phi(d1) / (S * sigma * sqrtT);
  const vega = (S * phi(d1) * sqrtT) / 100;
  const thetaYr = isCall
    ? -(S * phi(d1) * sigma) / (2 * sqrtT) - r * K * disc * N(d2)
    : -(S * phi(d1) * sigma) / (2 * sqrtT) + r * K * disc * N(-d2);
  const theta = thetaYr / YEAR;
  const rho = (isCall ? K * T * disc * N(d2) : -K * T * disc * N(-d2)) / 100;

  const price = isCall ? S * N(d1) - K * disc * N(d2) : K * disc * N(-d2) - S * N(-d1);
  const lambda = price !== 0 ? delta * (S / price) : 0;
  const epsilon = isCall ? -S * T * N(d1) : S * T * N(-d1);

  const charmYr = -phi(d1) * ((2 * r * T - d2 * sigma * sqrtT) / (2 * T * sigma * sqrtT));
  const charm = charmYr / YEAR;
  const vanna = -phi(d1) * (d2 / sigma);
  const volga = vega * ((d1 * d2) / sigma);
  const speed = -(gamma / S) * (d1 / (sigma * sqrtT) + 1);
  const zomma = gamma * ((d1 * d2 - 1) / sigma);
  const colorYr =
    (-phi(d1) / (2 * S * T * sigma * sqrtT)) *
    (2 * r * T + 1 + (d1 * (2 * r * T - d2 * sigma * sqrtT)) / (sigma * sqrtT));
  const color = colorYr / YEAR;

  return { delta, gamma, theta, vega, rho, lambda, epsilon, charm, vanna, volga, speed, zomma, color, price };
}

/** Convenience: years remaining until an ISO expiration date. */
export function yearsToExpiration(expirationIso: string, now = Date.now()): number {
  const exp = new Date(expirationIso).getTime();
  return Math.max(0, (exp - now) / (YEAR * 24 * 60 * 60 * 1000));
}

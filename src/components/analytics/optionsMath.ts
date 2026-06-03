/**
 * Options position math for the analytic visuals (payoff + scenario grid).
 *
 * Built on the shared Black-Scholes greeksService so the frontend payoff /
 * scenario surfaces use the exact same pricing as the options chain. Models a
 * single-leg long position of `qty` contracts (100 multiplier) at premium
 * `entryPremium`; sign of qty handles long/short.
 */

import { greeksService, type FullGreeks } from '@/services/greeksService';

export const MULTIPLIER = 100;
const RISK_FREE = 0.045;

export interface PositionSpec {
  strike: number;
  type: 'CALL' | 'PUT';
  spot: number;
  iv: number; // decimal (e.g. 0.25), NOT percent
  tDays: number; // calendar days to expiration
  entryPremium: number; // per-share option price paid
  qty: number; // contracts; negative = short
}

/** Intrinsic value at expiration for one share of the option. */
export function intrinsic(spec: PositionSpec, spotAtExpiry: number): number {
  return spec.type === 'CALL'
    ? Math.max(spotAtExpiry - spec.strike, 0)
    : Math.max(spec.strike - spotAtExpiry, 0);
}

/** Theoretical option price at a given spot / vol / time (years). */
export function theoPrice(spec: PositionSpec, spot: number, iv: number, tYears: number): number {
  const g: FullGreeks = greeksService.calculateFullGreeks({
    symbol: 'X',
    strike: spec.strike,
    expiration: '',
    type: spec.type,
    underlyingPrice: spot,
    riskFreeRate: RISK_FREE,
    impliedVolatility: Math.max(0.001, iv),
    timeToExpiration: Math.max(1e-6, tYears),
  });
  return g.price;
}

/** Full greeks at the current spot/vol/time (for scenario contributions). */
export function greeksAt(spec: PositionSpec, spot: number, iv: number, tYears: number): FullGreeks {
  return greeksService.calculateFullGreeks({
    symbol: 'X',
    strike: spec.strike,
    expiration: '',
    type: spec.type,
    underlyingPrice: spot,
    riskFreeRate: RISK_FREE,
    impliedVolatility: Math.max(0.001, iv),
    timeToExpiration: Math.max(1e-6, tYears),
  });
}

/** Position PnL at expiration for a terminal spot. */
export function payoffAtExpiry(spec: PositionSpec, spotAtExpiry: number): number {
  return (intrinsic(spec, spotAtExpiry) - spec.entryPremium) * MULTIPLIER * spec.qty;
}

/** Position PnL right now (mark-to-model) at a hypothetical spot. */
export function payoffNow(spec: PositionSpec, spot: number): number {
  const tYears = spec.tDays / 365;
  return (theoPrice(spec, spot, spec.iv, tYears) - spec.entryPremium) * MULTIPLIER * spec.qty;
}

/** Implied 1σ move in dollars over the life of the option. */
export function impliedMove(spec: PositionSpec): number {
  return spec.spot * spec.iv * Math.sqrt(spec.tDays / 365);
}

/** Breakeven spot prices at expiration (single-leg has one). */
export function breakevens(spec: PositionSpec): number[] {
  return spec.type === 'CALL' ? [spec.strike + spec.entryPremium] : [spec.strike - spec.entryPremium];
}

export interface ScenarioCell {
  dPricePct: number; // x: % change in underlying
  dVolPts: number; // y: change in IV, in vol points (e.g. +5 = +5%)
  pnl: number;
  deltaContribution: number;
  vegaContribution: number;
  thetaContribution: number;
}

/**
 * Two-dimensional risk matrix: PnL across underlying % change × IV change, with
 * estimated greek contributions. Time is rolled forward `holdDays` to make the
 * theta contribution meaningful.
 */
export function scenarioMatrix(
  spec: PositionSpec,
  priceSteps = [-15, -12, -9, -6, -3, 0, 3, 6, 9, 12, 15],
  volSteps = [10, 8, 6, 4, 2, 0, -2, -4, -6, -8, -10],
  holdDays = 1,
): ScenarioCell[] {
  const tYears = spec.tDays / 365;
  const newTYears = Math.max(1e-6, (spec.tDays - holdDays) / 365);
  const g0 = greeksAt(spec, spec.spot, spec.iv, tYears);
  const out: ScenarioCell[] = [];
  for (const dVolPts of volSteps) {
    for (const dPricePct of priceSteps) {
      const spot = spec.spot * (1 + dPricePct / 100);
      const iv = Math.max(0.001, spec.iv + dVolPts / 100);
      const value = theoPrice(spec, spot, iv, newTYears);
      const pnl = (value - spec.entryPremium) * MULTIPLIER * spec.qty;
      const dS = spec.spot * (dPricePct / 100);
      out.push({
        dPricePct,
        dVolPts,
        pnl,
        deltaContribution: g0.delta * dS * MULTIPLIER * spec.qty,
        vegaContribution: g0.vega * dVolPts * MULTIPLIER * spec.qty,
        thetaContribution: g0.theta * holdDays * MULTIPLIER * spec.qty,
      });
    }
  }
  return out;
}

import { describe, expect, it } from 'vitest';
import { blackScholes } from '../src/black-scholes';

describe('Black–Scholes', () => {
  // Textbook reference: S=100, K=100, T=1, σ=0.2, r=0.05 (no dividend).
  const ref = {
    stockPrice: 100,
    strike: 100,
    timeToExpiration: 1,
    volatility: 0.2,
    riskFreeRate: 0.05,
  };

  it('prices an ATM call near the analytic value (≈10.45)', () => {
    const out = blackScholes({ ...ref, optionType: 'call' });
    expect(out.theoreticalPrice).toBeCloseTo(10.4506, 2);
    expect(out.delta).toBeCloseTo(0.6368, 2);
  });

  it('prices an ATM put near the analytic value (≈5.57)', () => {
    const out = blackScholes({ ...ref, optionType: 'put' });
    expect(out.theoreticalPrice).toBeCloseTo(5.5735, 2);
    expect(out.delta).toBeCloseTo(-0.3632, 2);
  });

  it('satisfies put–call parity: C − P = S − K·e^(−rT)', () => {
    const call = blackScholes({ ...ref, optionType: 'call' });
    const put = blackScholes({ ...ref, optionType: 'put' });
    const parity = ref.stockPrice - ref.strike * Math.exp(-ref.riskFreeRate * ref.timeToExpiration);
    expect(call.theoreticalPrice - put.theoreticalPrice).toBeCloseTo(parity, 4);
  });

  it('shares gamma and vega across calls and puts', () => {
    const call = blackScholes({ ...ref, optionType: 'call' });
    const put = blackScholes({ ...ref, optionType: 'put' });
    expect(call.gamma).toBeCloseTo(put.gamma, 6);
    expect(call.vega).toBeCloseTo(put.vega, 6);
    expect(call.gamma).toBeGreaterThan(0);
    expect(call.vega).toBeGreaterThan(0);
  });

  it('returns discounted intrinsic value with zero greeks at expiry', () => {
    const out = blackScholes({ ...ref, timeToExpiration: 0, stockPrice: 110, optionType: 'call' });
    expect(out.theoreticalPrice).toBeCloseTo(10, 6);
    expect(out.gamma).toBe(0);
    expect(out.vega).toBe(0);
  });
});

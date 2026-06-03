/**
 * Discounted Cash Flow valuation with a Gordon-growth terminal value.
 *
 *   IV = Σ CF_t / (1+r)^t  +  TV / (1+r)^N
 *   TV = CF_N·(1+g) / (r − g)
 *
 * When `sharesOutstanding` is provided the intrinsic value is per-share so it
 * can be compared directly with `currentPrice`.
 */

export interface DcfInput {
  /** Projected cash flows, period 1..N. */
  cashFlows: number[];
  /** Discount rate (e.g. WACC) as a decimal. */
  discountRate: number;
  /** Terminal growth rate as a decimal (default 0 → no terminal value). */
  terminalGrowth?: number;
  /** If provided, intrinsic value is divided into a per-share figure. */
  sharesOutstanding?: number;
  /** Current market price (per share, or total if no share count) for the gap. */
  currentPrice?: number;
}

export interface DcfOutput {
  intrinsicValue: number;
  /** (intrinsic − price) / intrinsic, or 0 when price/intrinsic unavailable. */
  marginOfSafety: number;
  /** intrinsic − price (positive = undervalued). */
  valuationGap: number;
}

export function discountedCashFlow(input: DcfInput): DcfOutput {
  if (input.cashFlows.length === 0) throw new RangeError('cashFlows must not be empty');
  if (input.discountRate <= 0) throw new RangeError('discountRate must be positive');

  const r = input.discountRate;
  const g = input.terminalGrowth ?? 0;

  let pv = 0;
  input.cashFlows.forEach((cf, i) => {
    pv += cf / Math.pow(1 + r, i + 1);
  });

  if (g > 0 && g < r) {
    const lastCf = input.cashFlows[input.cashFlows.length - 1];
    const terminalValue = (lastCf * (1 + g)) / (r - g);
    pv += terminalValue / Math.pow(1 + r, input.cashFlows.length);
  }

  const intrinsicValue = input.sharesOutstanding ? pv / input.sharesOutstanding : pv;
  const price = input.currentPrice;
  const valuationGap = price === undefined ? 0 : intrinsicValue - price;
  const marginOfSafety =
    price === undefined || intrinsicValue === 0 ? 0 : (intrinsicValue - price) / intrinsicValue;

  return { intrinsicValue, marginOfSafety, valuationGap };
}

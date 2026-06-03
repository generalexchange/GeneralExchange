import { clamp01 } from '../shared/statistics';

/**
 * Order-flow pressure metrics — PLACEHOLDER architecture.
 *
 * Computes simple, well-defined ratios from volume + book depth so the contract
 * is real and testable. Replace with tape/quote-derived microstructure
 * features (sweeps, dark prints, queue dynamics) when a feed is connected; the
 * output shape stays the same.
 */

export interface OrderFlowInput {
  /** Aggregated buy-side volume over the window. */
  buyVolume: number;
  /** Aggregated sell-side volume over the window. */
  sellVolume: number;
  /** Optional resting bid depth (size). */
  bidDepth?: number;
  /** Optional resting ask depth (size). */
  askDepth?: number;
}

export interface OrderFlowOutput {
  /** Buy share of traded volume (0-1). */
  buyPressure: number;
  /** Sell share of traded volume (0-1). */
  sellPressure: number;
  /** Net imbalance (−1 all sells … +1 all buys). */
  imbalance: number;
  /** Book-side liquidity pressure (−1 ask-heavy … +1 bid-heavy), 0 if no depth. */
  liquidityPressure: number;
}

export function orderFlow(input: OrderFlowInput): OrderFlowOutput {
  const buy = Math.max(0, input.buyVolume);
  const sell = Math.max(0, input.sellVolume);
  const totalVolume = buy + sell;

  const buyPressure = totalVolume === 0 ? 0.5 : buy / totalVolume;
  const sellPressure = totalVolume === 0 ? 0.5 : sell / totalVolume;
  const imbalance = totalVolume === 0 ? 0 : (buy - sell) / totalVolume;

  let liquidityPressure = 0;
  if (input.bidDepth !== undefined && input.askDepth !== undefined) {
    const bid = Math.max(0, input.bidDepth);
    const ask = Math.max(0, input.askDepth);
    const depth = bid + ask;
    liquidityPressure = depth === 0 ? 0 : (bid - ask) / depth;
  }

  return {
    buyPressure: clamp01(buyPressure),
    sellPressure: clamp01(sellPressure),
    imbalance,
    liquidityPressure,
  };
}

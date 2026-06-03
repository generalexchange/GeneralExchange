import type { MarketRegime } from '../shared/types';

/**
 * Inputs to the master TradeEvaluationEngine. Grouped by source so future
 * providers can populate each block independently.
 */
export interface TradeEvaluationInput {
  symbol: string;

  market: {
    currentPrice: number;
    /** Annualized volatility (decimal). */
    volatility: number;
    /** Annualized drift/expected return (decimal). */
    drift: number;
    riskFreeRate: number;
    /** Expected market return for CAPM (decimal). */
    marketReturn: number;
    /** Asset beta. */
    beta: number;
  };

  signal: {
    signalStrength: number;
    liquidity: number;
    regime: MarketRegime;
    sentiment: number;
    marketStructureScore: number;
    /** Optional order-flow volumes for pressure metrics. */
    buyVolume?: number;
    sellVolume?: number;
  };

  setup: {
    /** Option strike (if evaluating an options trade). */
    strike?: number;
    /** Time to expiration / horizon in years. */
    timeHorizon: number;
    winRate: number;
    averageWin: number;
    averageLoss: number;
    tradeFrequency: number;
    accountSize: number;
    /** Fraction of equity risked per trade (0-1). */
    positionSize: number;
  };

  /** Optional projected cash flows for a DCF valuation overlay. */
  valuation?: {
    cashFlows: number[];
    discountRate: number;
    terminalGrowth?: number;
    sharesOutstanding?: number;
  };

  /** Monte Carlo trial count (default 10_000). */
  simulationCount?: number;
  /** RNG seed for deterministic evaluation. */
  seed?: number;
}

export type TradeGrade = 'A' | 'B' | 'C' | 'D' | 'F';

/** Full evaluation output aggregated across all models. */
export interface TradeEvaluationOutput {
  expectedReturn: number;
  probabilityOfProfit: number;
  convictionScore: number;
  confidenceScore: number;
  noiseScore: number;
  expectedDrawdown: number;
  valuationScore: number;
  riskScore: number;
  liquidityScore: number;
  positionSizingRecommendation: number;
  tradeGrade: TradeGrade;
}

/**
 * Compact, UI-facing DTO the dashboard renders. A projection of the full
 * evaluation — no engine types leak into the view layer.
 */
export interface DashboardAnalytics {
  symbol: string;
  expectedReturn: number;
  conviction: number;
  confidence: number;
  risk: number;
  noise: number;
  valuation: number;
  volatility: number;
  positionSize: number;
  probabilityOfProfit: number;
  grade: TradeGrade;
}

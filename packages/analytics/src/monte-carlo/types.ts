import type {
  ConfidenceInterval,
  DistributionBin,
  MarketRegime,
  PercentileBand,
  SummaryStatistics,
} from '../shared/types';

/** Options shared by every simulation. A fixed `seed` makes a run deterministic. */
export interface SimulationOptions {
  simulationCount: number;
  seed?: number;
}

/* Type A — Price Path (GBM) */
export interface PricePathInput extends SimulationOptions {
  currentPrice: number;
  /** Annualized volatility as a decimal (0.2 = 20%). */
  volatility: number;
  /** Annualized drift as a decimal (0.07 = 7%). */
  drift: number;
  /** Horizon in years. */
  timeHorizon: number;
  /** Discrete steps per path (default 252). */
  steps?: number;
  /** Cap on retained full paths; aggregates still use all trials. */
  maxRecordedPaths?: number;
}

export interface PricePathOutput {
  paths: number[][];
  terminalPrices: number[];
  expectedPrice: number;
  percentileBands: PercentileBand[];
  distribution: DistributionBin[];
  statistics: SummaryStatistics;
  dt: number;
}

/* Type B — Strategy Outcome */
export interface StrategySimulationInput extends SimulationOptions {
  /** Win probability (0-1). */
  winRate: number;
  /** Reward R-multiple on a win (2 = 2R). */
  averageWin: number;
  /** Loss R-multiple on a loss (1 = 1R). */
  averageLoss: number;
  /** Trades per trial. */
  tradeFrequency: number;
  accountSize: number;
  /** Fraction of current equity risked per trade (0-1). */
  positionSize: number;
  /** Equity fraction (0-1) at/below which a trial is "ruined" (default 0). */
  ruinThreshold?: number;
}

export interface StrategySimulationOutput {
  probabilityOfProfit: number;
  expectedReturn: number;
  expectedDrawdown: number;
  riskOfRuin: number;
  finalEquities: number[];
  percentileBands: PercentileBand[];
  distribution: DistributionBin[];
  statistics: SummaryStatistics;
}

/* Type C — Trade Quality / Conviction */
export type QualityRating = 'high' | 'medium' | 'low' | 'noise';

export interface TradeQualityInput extends SimulationOptions {
  signalStrength: number;
  volatility: number;
  liquidity: number;
  regime: MarketRegime;
  /** Directional sentiment (-1 … +1). */
  sentiment: number;
  marketStructureScore: number;
}

export interface TradeQualityOutput {
  convictionScore: number;
  confidenceInterval: ConfidenceInterval;
  noiseScore: number;
  expectedRisk: number;
  qualityRating: QualityRating;
  statistics: SummaryStatistics;
}

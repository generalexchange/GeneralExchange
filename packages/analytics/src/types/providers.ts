/**
 * API-ready data-source contracts for future integration. Interfaces only — no
 * live connections. Concrete adapters (Polygon.io, options/sentiment/economic
 * feeds, warehouse) implement these; the engine depends only on the interfaces.
 */

export interface OhlcvBar {
  t: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/** Equities/aggregates feed — future impl: Polygon.io. */
export interface PolygonAdapter {
  readonly name: string;
  getLastTrade(symbol: string): Promise<{ symbol: string; price: number; t: string }>;
  getAggregates(symbol: string, from: string, to: string): Promise<OhlcvBar[]>;
}

export interface OptionContractQuote {
  symbol: string;
  underlying: string;
  strike: number;
  expiration: string;
  type: 'call' | 'put';
  bid: number;
  ask: number;
  impliedVolatility: number;
  openInterest: number;
}

/** Options chain + greeks feed. */
export interface OptionsFeedProvider {
  readonly name: string;
  getChain(underlying: string, expiration?: string): Promise<OptionContractQuote[]>;
}

/** Sentiment feed — future impl: news/flow sentiment service. */
export interface SentimentFeedProvider {
  readonly name: string;
  getSentiment(symbol: string): Promise<{ symbol: string; sentiment: number; confidence: number }>;
}

/** Macro/economic data feed (rates, CPI, etc.). */
export interface EconomicDataProvider {
  readonly name: string;
  getRiskFreeRate(): Promise<number>;
  getSeries(seriesId: string): Promise<{ seriesId: string; observations: { t: string; value: number }[] }>;
}

/** Aggregate of all external integrations the platform may wire up. */
export interface ExternalDataRegistry {
  polygon?: PolygonAdapter;
  options?: OptionsFeedProvider;
  sentiment?: SentimentFeedProvider;
  economic?: EconomicDataProvider;
}

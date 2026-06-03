import type { MarketRegime } from '../shared/types';
import type { PricePathInput, TradeQualityInput } from './types';

/* ---------------- Data-source contracts ---------------- */

export interface Quote {
  symbol: string;
  price: number;
  asOf: string;
}

export interface VolatilityEstimate {
  symbol: string;
  annualizedVolatility: number;
  annualizedDrift: number;
  lookbackDays: number;
}

export interface SignalSnapshot {
  symbol: string;
  signalStrength: number;
  marketStructureScore: number;
  liquidity: number;
  regime: MarketRegime;
  asOf: string;
}

export interface SentimentSnapshot {
  symbol: string;
  sentiment: number;
  confidence: number;
  asOf: string;
}

export interface MarketDataProvider {
  readonly name: string;
  getQuote(symbol: string): Promise<Quote>;
  getVolatilityEstimate(symbol: string, lookbackDays?: number): Promise<VolatilityEstimate>;
}

export interface SignalProvider {
  readonly name: string;
  getSignalSnapshot(symbol: string): Promise<SignalSnapshot>;
}

export interface SentimentProvider {
  readonly name: string;
  getSentimentSnapshot(symbol: string): Promise<SentimentSnapshot>;
}

export interface ProviderRegistry {
  marketData?: MarketDataProvider;
  signals?: SignalProvider;
  sentiment?: SentimentProvider;
}

/* ---------------- Deterministic placeholders ---------------- */

function hashSymbol(symbol: string): number {
  let h = 2166136261;
  for (let i = 0; i < symbol.length; i += 1) {
    h ^= symbol.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function spread(hash: number, salt: number, min: number, max: number): number {
  const v = ((hash ^ Math.imul(salt, 0x9e3779b9)) >>> 0) / 4294967296;
  return min + v * (max - min);
}

const nowIso = (): string => new Date().toISOString();

export class PlaceholderMarketDataProvider implements MarketDataProvider {
  readonly name = 'placeholder-market-data';
  async getQuote(symbol: string): Promise<Quote> {
    const h = hashSymbol(symbol);
    return { symbol, price: Number(spread(h, 1, 20, 500).toFixed(2)), asOf: nowIso() };
  }
  async getVolatilityEstimate(symbol: string, lookbackDays = 252): Promise<VolatilityEstimate> {
    const h = hashSymbol(symbol);
    return {
      symbol,
      annualizedVolatility: Number(spread(h, 2, 0.12, 0.6).toFixed(4)),
      annualizedDrift: Number(spread(h, 3, -0.05, 0.18).toFixed(4)),
      lookbackDays,
    };
  }
}

export class PlaceholderSignalProvider implements SignalProvider {
  readonly name = 'placeholder-signals';
  async getSignalSnapshot(symbol: string): Promise<SignalSnapshot> {
    const h = hashSymbol(symbol);
    const regimes: MarketRegime[] = ['trending', 'mean_reverting', 'compressed_vol', 'elevated_vol'];
    return {
      symbol,
      signalStrength: Number(spread(h, 4, 0.2, 0.95).toFixed(3)),
      marketStructureScore: Number(spread(h, 5, 0.3, 0.9).toFixed(3)),
      liquidity: Number(spread(h, 6, 0.25, 0.99).toFixed(3)),
      regime: regimes[h % regimes.length],
      asOf: nowIso(),
    };
  }
}

export class PlaceholderSentimentProvider implements SentimentProvider {
  readonly name = 'placeholder-sentiment';
  async getSentimentSnapshot(symbol: string): Promise<SentimentSnapshot> {
    const h = hashSymbol(symbol);
    return {
      symbol,
      sentiment: Number(spread(h, 7, -0.8, 0.8).toFixed(3)),
      confidence: Number(spread(h, 8, 0.4, 0.95).toFixed(3)),
      asOf: nowIso(),
    };
  }
}

export function createPlaceholderRegistry() {
  return {
    marketData: new PlaceholderMarketDataProvider(),
    signals: new PlaceholderSignalProvider(),
    sentiment: new PlaceholderSentimentProvider(),
  };
}

/* ---------------- Adapters: snapshots → simulation inputs ---------------- */

export async function buildPricePathInput(
  symbol: string,
  marketData: MarketDataProvider,
  overrides: Pick<PricePathInput, 'simulationCount'> &
    Partial<Pick<PricePathInput, 'seed' | 'timeHorizon' | 'steps' | 'maxRecordedPaths'>>,
): Promise<PricePathInput> {
  const [quote, vol] = await Promise.all([
    marketData.getQuote(symbol),
    marketData.getVolatilityEstimate(symbol),
  ]);
  return {
    currentPrice: quote.price,
    volatility: vol.annualizedVolatility,
    drift: vol.annualizedDrift,
    timeHorizon: overrides.timeHorizon ?? 1,
    steps: overrides.steps,
    maxRecordedPaths: overrides.maxRecordedPaths,
    simulationCount: overrides.simulationCount,
    seed: overrides.seed,
  };
}

export async function buildTradeQualityInput(
  symbol: string,
  signals: SignalProvider,
  sentiment: SentimentProvider,
  marketData: MarketDataProvider,
  overrides: Pick<TradeQualityInput, 'simulationCount'> & Partial<Pick<TradeQualityInput, 'seed'>>,
): Promise<TradeQualityInput> {
  const [signal, sent, vol] = await Promise.all([
    signals.getSignalSnapshot(symbol),
    sentiment.getSentimentSnapshot(symbol),
    marketData.getVolatilityEstimate(symbol),
  ]);
  return {
    signalStrength: signal.signalStrength,
    volatility: Math.min(1, vol.annualizedVolatility),
    liquidity: signal.liquidity,
    regime: signal.regime,
    sentiment: sent.sentiment,
    marketStructureScore: signal.marketStructureScore,
    simulationCount: overrides.simulationCount,
    seed: overrides.seed,
  };
}

export function requireProvider<K extends keyof ProviderRegistry>(
  registry: ProviderRegistry,
  key: K,
): NonNullable<ProviderRegistry[K]> {
  const provider = registry[key];
  if (!provider) throw new Error(`ProviderRegistry is missing required provider: "${String(key)}"`);
  return provider as NonNullable<ProviderRegistry[K]>;
}

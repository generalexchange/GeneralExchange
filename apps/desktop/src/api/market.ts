import { apiClient } from '@/api/client';
import type {
  Candle,
  ChartInterval,
  GexLevel,
  OptionsChainSnapshot,
  OptionsSurface,
  SymbolQuote,
} from '@/types/market';
import type { RegimeState } from '@/types/signals';

export const marketApi = {
  quote: (symbol: string, signal?: AbortSignal) =>
    apiClient.get<SymbolQuote>(`/v1/market/${symbol}/quote`, signal),

  candles: (symbol: string, interval: ChartInterval, signal?: AbortSignal) =>
    apiClient.get<Candle[]>(`/v1/market/${symbol}/candles?interval=${interval}`, signal),

  chain: (symbol: string, signal?: AbortSignal) =>
    apiClient.get<OptionsChainSnapshot>(`/v1/market/${symbol}/chain`, signal),

  surface: (symbol: string, signal?: AbortSignal) =>
    apiClient.get<OptionsSurface>(`/v1/market/${symbol}/surface`, signal),

  gex: (symbol: string, signal?: AbortSignal) =>
    apiClient.get<GexLevel[]>(`/v1/market/${symbol}/gex`, signal),

  regime: (symbol: string, signal?: AbortSignal) =>
    apiClient.get<RegimeState>(`/v1/market/${symbol}/regime`, signal),

  search: (query: string, signal?: AbortSignal) =>
    apiClient.get<{ symbol: string; name: string }[]>(`/v1/market/search?q=${encodeURIComponent(query)}`, signal),
};

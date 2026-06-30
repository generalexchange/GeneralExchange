import { canUseIbkrDirect } from '@/lib/api/marketRouting';
import { mapPolygonChain } from '@/lib/api/mapLiveData';
import { ibkrOptionsChain, ibkrQuote, ibkrCandles } from '@/lib/api/ibkrDirect';
import { synthCandles, synthOptionsChain, synthQuote } from '@/lib/market/webSynth';
import { mapCandleRows } from '@/lib/api/mapLiveData';
import type { DiscoverResponse } from './types';
import { TRADEABLE_SYMBOLS } from '@/data/symbols';
import {
  historicalWinRateFromCloses,
  rankChainRows,
  WEIGHTS,
} from './rankCore';

async function marketQuote(symbol: string) {
  return canUseIbkrDirect() ? ibkrQuote(symbol) : synthQuote(symbol);
}

async function marketChain(symbol: string) {
  return canUseIbkrDirect() ? ibkrOptionsChain(symbol) : synthOptionsChain(symbol);
}

async function marketCandles(symbol: string, interval: string, limit: number) {
  return canUseIbkrDirect() ? ibkrCandles(symbol, interval, limit) : synthCandles(symbol, interval, limit);
}

async function discoverOneSymbol(symbol: string, includeChain: boolean) {
  const [chainRes, quoteRes, candleRes] = await Promise.all([
    marketChain(symbol),
    marketQuote(symbol),
    marketCandles(symbol, '1d', 126),
  ]);
  const spot =
    (quoteRes.data as { price?: number } | undefined)?.price ??
    (chainRes.data?.[0] as { underlying_price?: number } | undefined)?.underlying_price ??
    0;
  if (!spot || spot <= 0) return null;

  const closes = mapCandleRows(candleRes.data ?? [])
    .map((c) => c.c)
    .filter((c) => c > 0);
  const hist = historicalWinRateFromCloses(closes);
  const rows = mapPolygonChain(chainRes.data ?? [], spot);
  return rankChainRows(rows, spot, symbol, hist, includeChain);
}

export async function discoverOpportunitiesLocal(
  symbols: string[] = [...TRADEABLE_SYMBOLS],
  includeChain = false,
): Promise<DiscoverResponse> {
  const unique = [...new Set(symbols.map((s) => s.toUpperCase()))];
  const settled = await Promise.allSettled(unique.map((sym) => discoverOneSymbol(sym, includeChain)));

  const opportunities = settled
    .filter((r): r is PromiseFulfilledResult<NonNullable<Awaited<ReturnType<typeof discoverOneSymbol>>>> =>
      r.status === 'fulfilled' && r.value != null,
    )
    .map((r) => r.value);

  opportunities.sort((a, b) => b.expectedReturn - a.expectedReturn || b.compositeScore - a.compositeScore);
  return { opportunities, generatedAt: new Date().toISOString(), ml: { weights: WEIGHTS } };
}

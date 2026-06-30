/**
 * Browser-safe opportunity discovery — uses fetchV1 (IBKR on desktop, API on web).
 */
import { fetchV1 } from '@/lib/api/v1Fetch';
import { mapCandleRows, mapPolygonChain, type CandleRow } from '@/lib/api/mapLiveData';
import { readJsonResponse } from '@/lib/api/readJsonResponse';
import { TRADEABLE_SYMBOLS } from '@/data/symbols';
import type { DiscoverResponse, RankedContract } from './types';
import { historicalWinRateFromCloses, rankChainRows, WEIGHTS } from './rankCore';

async function discoverOneSymbol(symbol: string, includeChain: boolean): Promise<RankedContract | null> {
  const sym = symbol.toUpperCase();
  const [chainRes, quoteRes, candleRes] = await Promise.all([
    fetchV1(`/options/chain/${encodeURIComponent(sym)}`),
    fetchV1(`/quote/${encodeURIComponent(sym)}`),
    fetchV1(`/candles/${encodeURIComponent(sym)}/1d?limit=126`),
  ]);

  const chainJson = await readJsonResponse<{ data?: Parameters<typeof mapPolygonChain>[0] }>(chainRes);
  const quoteJson = await readJsonResponse<{ data?: { price?: number } }>(quoteRes);
  const candleJson = await readJsonResponse<{ data?: CandleRow[] }>(candleRes);

  const spot =
    quoteJson.data?.price ??
    (chainJson.data?.[0] as { underlying_price?: number } | undefined)?.underlying_price ??
    0;
  if (!spot || spot <= 0) return null;

  const closes = mapCandleRows(candleJson.data ?? [])
    .map((c) => c.c)
    .filter((c) => c > 0);
  const hist = historicalWinRateFromCloses(closes);
  const rows = mapPolygonChain(chainJson.data ?? [], spot);
  return rankChainRows(rows, spot, sym, hist, includeChain);
}

export async function discoverOpportunitiesClient(
  symbols: string[] = [...TRADEABLE_SYMBOLS],
  includeChain = false,
): Promise<DiscoverResponse> {
  const unique = [...new Set(symbols.map((s) => s.toUpperCase()))];
  const settled = await Promise.allSettled(unique.map((sym) => discoverOneSymbol(sym, includeChain)));

  const opportunities: RankedContract[] = [];
  for (const result of settled) {
    if (result.status === 'fulfilled' && result.value) {
      opportunities.push(result.value);
    }
  }

  opportunities.sort((a, b) => b.expectedReturn - a.expectedReturn || b.compositeScore - a.compositeScore);
  return { opportunities, generatedAt: new Date().toISOString(), ml: { weights: WEIGHTS } };
}

export async function analyzeOpportunityClient(symbol: string): Promise<RankedContract | null> {
  const result = await discoverOpportunitiesClient([symbol], true);
  return result.opportunities[0] ?? null;
}

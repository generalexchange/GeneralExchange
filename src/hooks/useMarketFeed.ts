'use client';

import { useEffect } from 'react';
import { isMarketWsConfigured, subscribeMarketWs } from '@/services/wsClient';
import { seedQuoteFromRest, useSymbolQuote } from '@/store/marketState';

/** REST snapshot → WebSocket live updates for one symbol. */
export function useMarketFeed(symbol: string) {
  const quote = useSymbolQuote(symbol);

  useEffect(() => subscribeMarketWs(), []);

  useEffect(() => {
    if (!isMarketWsConfigured()) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`/api/v1/ticks/${symbol}?limit=1`, { cache: 'no-store' });
        if (!res.ok || cancelled) return;
        const json = (await res.json()) as { data?: { price: number; timestamp?: string }[] };
        const tick = json.data?.[0];
        if (tick?.price != null) {
          seedQuoteFromRest(
            symbol,
            tick.price,
            tick.timestamp ? Date.parse(tick.timestamp) : Date.now(),
          );
        }
      } catch {
        /* WS will still drive updates */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [symbol]);

  return quote;
}

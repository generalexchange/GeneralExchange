'use client';

import { useEffect, useState } from 'react';
import { getMarketState, seedQuoteFromRest, useSymbolQuote } from '@/store/marketState';
import { isWsConnected, subscribeMarketWs } from '@/services/wsClient';
import { fetchV1 } from '@/lib/api/v1Fetch';

const REST_FALLBACK_MS = 30_000;

/** SPY quote for Market Temperature — WebSocket-first, REST fallback only. */
export function useSpyMarketFeed() {
  const quote = useSymbolQuote('SPY');
  const [loading, setLoading] = useState(true);

  useEffect(() => subscribeMarketWs(), []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const wsPrice = getMarketState().quotes.SPY?.price ?? 0;
      if (wsPrice > 0 && isWsConnected()) {
        if (!cancelled) setLoading(false);
        return;
      }
      try {
        const res = await fetchV1('/quote/SPY', { cache: 'no-store' });
        if (!res.ok || cancelled) return;
        const json = (await res.json()) as {
          data: {
            price: number;
            prevClose: number;
            change: number;
            changePct: number;
            timestamp?: number | string;
          };
        };
        const q = json.data;
        seedQuoteFromRest('SPY', {
          price: q.price,
          prevClose: q.prevClose,
          change: q.change,
          changePct: q.changePct,
          timestamp: q.timestamp ? Date.parse(String(q.timestamp)) : Date.now(),
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    const id = window.setInterval(load, REST_FALLBACK_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (quote?.price && quote.price > 0) setLoading(false);
  }, [quote?.price]);

  return { quote, loading };
}

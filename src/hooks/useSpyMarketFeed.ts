'use client';

import { useEffect, useState } from 'react';
import { seedQuoteFromRest, useSymbolQuote } from '@/store/marketState';
import { subscribeMarketWs } from '@/services/wsClient';

/** High-frequency SPY quote for Market Temperature (always SPY). */
export function useSpyMarketFeed(pollMs = 1000) {
  const quote = useSymbolQuote('SPY');
  const [loading, setLoading] = useState(true);

  useEffect(() => subscribeMarketWs(), []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch('/api/v1/quote/SPY', { cache: 'no-store' });
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

    load();
    const id = window.setInterval(load, pollMs);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [pollMs]);

  return { quote, loading };
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import { isMarketWsConfigured, subscribeMarketWs } from '@/services/wsClient';
import { seedCandlesFromRest, seedQuoteFromRest, useSymbolQuote } from '@/store/marketState';
import type { Candle } from '@/components/dashboard/terminal/terminalData';

type QuotePayload = {
  symbol: string;
  price: number;
  prevClose: number;
  change: number;
  changePct: number;
  afterHoursChange?: number;
  afterHoursChangePct?: number;
  timestamp?: number | string;
};

type CandleRow = {
  open_time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  vwap?: number;
};

function toCandle(row: CandleRow): Candle {
  return {
    t: Date.parse(row.open_time),
    o: row.open,
    h: row.high,
    l: row.low,
    c: row.close,
    v: row.volume,
    vwap: row.vwap ?? (row.open + row.close) / 2,
  };
}

/** REST snapshot + WebSocket live updates for quote and 1D chart candles. */
export function useMarketFeed(symbol: string) {
  const quote = useSymbolQuote(symbol);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [source, setSource] = useState<string | null>(null);

  useEffect(() => subscribeMarketWs(), []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [qRes, cRes] = await Promise.all([
          fetch(`/api/v1/quote/${symbol}`, { cache: 'no-store' }),
          fetch(`/api/v1/candles/${symbol}/5m?limit=78`, { cache: 'no-store' }),
        ]);

        if (cancelled) return;

        if (qRes.ok) {
          const qJson = (await qRes.json()) as { data: QuotePayload; source?: string };
          const q = qJson.data;
          setSource(qJson.source ?? null);
          seedQuoteFromRest(symbol, {
            price: q.price,
            prevClose: q.prevClose,
            change: q.change,
            changePct: q.changePct,
            afterHoursChange: q.afterHoursChange,
            afterHoursChangePct: q.afterHoursChangePct,
            timestamp: q.timestamp ? Date.parse(String(q.timestamp)) : Date.now(),
          });
        }

        if (cRes.ok) {
          const cJson = (await cRes.json()) as { data: CandleRow[]; source?: string };
          const rows = cJson.data ?? [];
          const mapped = rows.map(toCandle).filter((c) => c.t > 0);
          setCandles(mapped);
          seedCandlesFromRest(symbol, '5m', mapped);
        }
      } catch {
        /* WS may still update */
      }
    }

    load();
    const id = window.setInterval(load, 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [symbol]);

  return useMemo(
    () => ({
      quote,
      candles,
      live: Boolean(quote && isMarketWsConfigured()),
      source: quote?.source ?? source,
    }),
    [quote, candles, source],
  );
}

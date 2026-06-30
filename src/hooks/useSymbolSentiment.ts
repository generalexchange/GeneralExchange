'use client';

import { useEffect, useState } from 'react';
import { fetchV1 } from '@/lib/api/v1Fetch';
import { readJsonResponse } from '@/lib/api/readJsonResponse';
import type { SymbolSentimentSnapshot } from '@/lib/sentiment/fetchNewsFeed';
import { useIbkrCachePulse } from '@/hooks/useIbkrCachePulse';

const REFRESH_MS = 180_000;

export function useSymbolSentiment(symbol: string, beta = 1) {
  const [snapshot, setSnapshot] = useState<SymbolSentimentSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const cachePulse = useIbkrCachePulse();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await fetchV1(`/sentiment/${encodeURIComponent(symbol)}?beta=${beta}`);
        if (!res.ok) throw new Error(`sentiment ${res.status}`);
        const json = await readJsonResponse<{ data?: SymbolSentimentSnapshot }>(res);
        if (!cancelled && json.data) setSnapshot(json.data);
      } catch {
        if (!cancelled) setSnapshot(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    const id = window.setInterval(() => {
      void (async () => {
        try {
          const res = await fetchV1(`/sentiment/${encodeURIComponent(symbol)}?beta=${beta}`);
          if (!res.ok) return;
          const json = await readJsonResponse<{ data?: SymbolSentimentSnapshot }>(res);
          if (!cancelled && json.data) setSnapshot(json.data);
        } catch {
          /* keep last snapshot */
        }
      })();
    }, REFRESH_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [symbol, beta, cachePulse]);

  return { snapshot, loading };
}

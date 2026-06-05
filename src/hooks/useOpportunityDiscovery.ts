'use client';

import { useCallback, useEffect, useState } from 'react';
import type { DiscoverResponse, OutcomesResponse, RankedContract } from '@/lib/opportunity/types';
import { TRADEABLE_SYMBOLS } from '@/data/symbols';

const REFRESH_MS = 60_000;

export function useOpportunityDiscovery() {
  const [opportunities, setOpportunities] = useState<RankedContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/opportunity/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols: [...TRADEABLE_SYMBOLS] }),
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`discover ${res.status}`);
      const data = (await res.json()) as DiscoverResponse;
      setOpportunities(data.opportunities.filter((o) => !o.error));
      setGeneratedAt(data.generatedAt);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = window.setInterval(refresh, REFRESH_MS);
    return () => window.clearInterval(id);
  }, [refresh]);

  return { opportunities, loading, error, generatedAt, refresh };
}

export function useOpportunityAnalysis(symbol: string | null) {
  const [analysis, setAnalysis] = useState<RankedContract | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!symbol) {
      setAnalysis(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch('/api/v1/opportunity/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol, includeChain: true }),
      cache: 'no-store',
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: RankedContract) => {
        if (!cancelled) setAnalysis(data);
      })
      .catch(() => {
        if (!cancelled) setAnalysis(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [symbol]);

  return { analysis, loading };
}

export function useExpiredOutcomes(enabled: boolean) {
  const [data, setData] = useState<OutcomesResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setLoading(true);
    fetch('/api/v1/opportunity/outcomes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ limit: 40 }),
      cache: 'no-store',
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((json: OutcomesResponse) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { data, loading };
}

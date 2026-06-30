'use client';

import { useEffect, useState } from 'react';
import { mapCandleRows, type CandleRow } from '@/lib/api/mapLiveData';
import { readJsonResponse } from '@/lib/api/readJsonResponse';
import { fetchV1 } from '@/lib/api/v1Fetch';
import { useIbkrCachePulse } from '@/hooks/useIbkrCachePulse';
import {
  normalizedVsSpy,
  regressionVsSpy,
  type NormalizedSeries,
  type SpyRegression,
} from '@/lib/spyRegression';
import type { Candle } from '@/components/dashboard/terminal/terminalData';

function mapRows(rows: CandleRow[]): Candle[] {
  return mapCandleRows(rows);
}

async function fetchDailyCandles(symbol: string, limit = 126): Promise<Candle[]> {
  const res = await fetchV1(`/candles/${symbol}/1d?limit=${limit}`, { cache: 'no-store' });
  if (!res.ok) return [];
  try {
    const json = await readJsonResponse<{ data: CandleRow[] }>(res);
    return mapRows(json.data ?? []);
  } catch {
    return [];
  }
}

export type SpyRegressionState = {
  regression: SpyRegression | null;
  series: NormalizedSeries | null;
  live: boolean;
  loading: boolean;
  error: string | null;
  beta: number | null;
};

/** Historical alpha, beta, correlation vs SPY from IBKR daily bars — no static fallbacks. */
export function useSpyRegression(symbol: string): SpyRegressionState {
  const cachePulse = useIbkrCachePulse();
  const [regression, setRegression] = useState<SpyRegression | null>(null);
  const [series, setSeries] = useState<NormalizedSeries | null>(null);
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const hadRegression = regression != null;
    if (!hadRegression) setLoading(true);
    setError(null);

    (async () => {
      const sym = symbol.toUpperCase();
      const [symCandles, spyCandles] = await Promise.all([
        fetchDailyCandles(sym),
        fetchDailyCandles('SPY'),
      ]);
      if (cancelled) return;

      if (symCandles.length < 20 || spyCandles.length < 20) {
        setRegression(null);
        setSeries(null);
        setLive(false);
        setError('Need 20+ IBKR daily bars for SPY regression');
        setLoading(false);
        return;
      }

      const reg = regressionVsSpy(symCandles, spyCandles);
      const norm = normalizedVsSpy(symCandles, spyCandles);

      if (reg) {
        setRegression(reg);
        setSeries(norm);
        setLive(true);
        setError(null);
      } else {
        setRegression(null);
        setSeries(null);
        setLive(false);
        setError('Regression unavailable — check IBKR history alignment');
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [symbol, cachePulse]); // eslint-disable-line react-hooks/exhaustive-deps -- stale-while-revalidate

  return {
    regression,
    series,
    live,
    loading,
    error,
    beta: regression?.beta ?? null,
  };
}

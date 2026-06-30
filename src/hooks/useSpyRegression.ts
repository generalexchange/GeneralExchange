'use client';

import { useEffect, useState } from 'react';
import { betaVsSpy } from '@/config/symbolBeta';
import { mapCandleRows, type CandleRow } from '@/lib/api/mapLiveData';
import { readJsonResponse } from '@/lib/api/readJsonResponse';
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
  const res = await fetch(`/api/v1/candles/${symbol}/1d?limit=${limit}`, { cache: 'no-store' });
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
  beta: number;
};

/** Historical alpha, beta, correlation vs SPY from IBKR daily bars. */
export function useSpyRegression(symbol: string): SpyRegressionState {
  const fallbackBeta = betaVsSpy(symbol);
  const [regression, setRegression] = useState<SpyRegression | null>(null);
  const [series, setSeries] = useState<NormalizedSeries | null>(null);
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    (async () => {
      const sym = symbol.toUpperCase();
      const [symCandles, spyCandles] = await Promise.all([
        fetchDailyCandles(sym),
        fetchDailyCandles('SPY'),
      ]);
      if (cancelled) return;

      const reg = regressionVsSpy(symCandles, spyCandles);
      const norm = normalizedVsSpy(symCandles, spyCandles);

      if (reg) {
        setRegression(reg);
        setSeries(norm);
        setLive(true);
      } else {
        setRegression({
          beta: fallbackBeta,
          alphaDaily: 0,
          alphaAnnualizedPct: 0,
          correlation: sym === 'SPY' ? 1 : 0.75,
          rSquared: sym === 'SPY' ? 1 : 0.56,
          sampleDays: 0,
        });
        setSeries(null);
        setLive(false);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [symbol, fallbackBeta]);

  return {
    regression,
    series,
    live,
    loading,
    beta: regression?.beta ?? fallbackBeta,
  };
}

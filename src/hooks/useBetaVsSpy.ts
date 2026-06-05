'use client';

import { useEffect, useState } from 'react';
import { betaFromCandles } from '@/lib/betaFromCandles';
import { betaVsSpy } from '@/config/symbolBeta';
import { mapCandleRows, type CandleRow } from '@/lib/api/mapLiveData';
import { readJsonResponse } from '@/lib/api/readJsonResponse';
import type { Candle } from '@/components/dashboard/terminal/terminalData';

function mapRows(rows: CandleRow[]): Candle[] {
  return mapCandleRows(rows).map((c) => ({
    t: c.t,
    o: c.o,
    h: c.h,
    l: c.l,
    c: c.c,
    v: c.v,
    vwap: c.vwap,
  }));
}

async function fetchDailyCandles(symbol: string): Promise<Candle[]> {
  const res = await fetch(`/api/v1/candles/${symbol}/1d?limit=90`, { cache: 'no-store' });
  if (!res.ok) return [];
  try {
    const json = await readJsonResponse<{ data: CandleRow[] }>(res);
    return mapRows(json.data ?? []);
  } catch {
    return [];
  }
}

/** Live beta vs SPY from IBKR daily bars; falls back to static table. */
export function useBetaVsSpy(symbol: string): { beta: number; live: boolean; loading: boolean } {
  const fallback = betaVsSpy(symbol);
  const [beta, setBeta] = useState(fallback);
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const fallback = betaVsSpy(symbol);

    (async () => {
      const [symCandles, spyCandles] = await Promise.all([
        fetchDailyCandles(symbol),
        fetchDailyCandles('SPY'),
      ]);
      if (cancelled) return;
      const computed = betaFromCandles(symCandles, spyCandles);
      if (computed != null && Number.isFinite(computed)) {
        setBeta(computed);
        setLive(true);
      } else {
        setBeta(fallback);
        setLive(false);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [symbol]);

  return { beta, live, loading };
}

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchV1 } from '@/lib/api/v1Fetch';
import { mapCandleRows, type CandleRow } from '@/lib/api/mapLiveData';
import { readJsonResponse } from '@/lib/api/readJsonResponse';
import {
  analyzeLegendMonteCarlo,
  type McLegendSnapshot,
} from '@/lib/monteCarloLegend/analyze';
import type { OptionRow } from '@/components/dashboard/terminal/terminalData';

const REFRESH_MS = 45_000;
const HISTORY_LIMIT = 126;

export type MonteCarloLegendStream = {
  snapshot: McLegendSnapshot | null;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
  refresh: () => void;
};

export function useMonteCarloLegendStream(
  symbol: string,
  spot: number,
  chain: OptionRow[],
  options?: { refreshMs?: number; enabled?: boolean },
): MonteCarloLegendStream {
  const refreshMs = options?.refreshMs ?? REFRESH_MS;
  const enabled = options?.enabled ?? true;
  const [snapshot, setSnapshot] = useState<McLegendSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const runId = useRef(0);

  const chainSig = chain
    .slice(0, 12)
    .map((r) => `${r.id}:${r.mid.toFixed(2)}`)
    .join('|');

  const run = useCallback(async () => {
    if (!enabled || !symbol) return;
    const id = ++runId.current;
    setLoading(true);
    setError(null);

    try {
      const [symRes, spyRes] = await Promise.all([
        fetchV1(`/candles/${encodeURIComponent(symbol)}/1d?limit=${HISTORY_LIMIT}`),
        fetchV1('/candles/SPY/1d?limit=126'),
      ]);
      const symJson = await readJsonResponse<{ data?: CandleRow[]; error?: string }>(symRes);
      if (!symRes.ok) throw new Error(symJson.error ?? `history ${symRes.status}`);
      const history = mapCandleRows(symJson.data ?? []);
      if (history.length < 20) throw new Error('Insufficient IBKR history for Monte Carlo calibration');

      let spyHistory: ReturnType<typeof mapCandleRows> = [];
      if (spyRes.ok) {
        const spyJson = await readJsonResponse<{ data?: CandleRow[] }>(spyRes);
        spyHistory = mapCandleRows(spyJson.data ?? []);
      }

      const next = analyzeLegendMonteCarlo({
        symbol,
        spot,
        history,
        spyHistory,
        chain,
        seed: 20260629 + symbol.charCodeAt(0),
      });

      if (id !== runId.current) return;
      setSnapshot(next);
      setLastUpdated(next.computedAt);
    } catch (err) {
      if (id !== runId.current) return;
      setError(err instanceof Error ? err.message : 'Monte Carlo stream failed');
    } finally {
      if (id === runId.current) setLoading(false);
    }
    // chain content tracked via chainSig to avoid re-run on every poll reference change
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chainSig is the stable fingerprint
  }, [symbol, spot, chainSig, enabled]);

  useEffect(() => {
    void run();
    if (!enabled) return;
    const timer = window.setInterval(() => void run(), refreshMs);
    return () => window.clearInterval(timer);
  }, [run, refreshMs, enabled]);

  return { snapshot, loading, error, lastUpdated, refresh: run };
}

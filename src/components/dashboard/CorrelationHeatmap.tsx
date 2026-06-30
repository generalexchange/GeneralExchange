'use client';

import { useEffect, useState } from 'react';
import { analyzeCorrelation, type CorrelationOutput } from '@gx/analytics';
import { fetchV1 } from '@/lib/api/v1Fetch';
import { mapCandleRows, type CandleRow } from '@/lib/api/mapLiveData';
import { readJsonResponse } from '@/lib/api/readJsonResponse';
import { divergingColor } from '@/components/charts/chartTokens';
import { LegendPanelSkeleton } from '@/components/dashboard/LegendPanelSkeleton';
import { useIbkrCachePulse } from '@/hooks/useIbkrCachePulse';

const WATCH = ['SPY', 'QQQ', 'AAPL', 'NVDA', 'MSFT'] as const;

async function fetchCloses(symbol: string): Promise<number[]> {
  const res = await fetchV1(`/candles/${symbol}/1d?limit=90`);
  if (!res.ok) return [];
  const json = await readJsonResponse<{ data?: CandleRow[] }>(res);
  return mapCandleRows(json.data ?? []).map((c) => c.c).filter((c) => c > 0);
}

export function CorrelationHeatmap({ highlight }: { highlight: string }) {
  const [out, setOut] = useState<CorrelationOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const cachePulse = useIbkrCachePulse();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const symbols = [...new Set([highlight.toUpperCase(), ...WATCH])].slice(0, 6);
      const entries = await Promise.all(symbols.map(async (s) => [s, await fetchCloses(s)] as const));
      const pricesBySymbol = Object.fromEntries(entries.filter(([, p]) => p.length > 5));
      const result = analyzeCorrelation({ pricesBySymbol, benchmark: 'SPY' });
      if (!cancelled) {
        setOut(result);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [highlight, cachePulse]);

  if (loading) {
    return <LegendPanelSkeleton label="Correlation matrix · IBKR" rows={4} height={24} />;
  }
  if (!out || out.symbols.length < 2) {
    return (
      <div className="rounded-lg border border-white/10 bg-dark-gray/90 p-3 font-mono text-[9px] text-zinc-500">
        Need more IBKR history for correlation
      </div>
    );
  }

  const syms = out.symbols;

  return (
    <section className="rounded-lg border border-white/10 bg-dark-gray/90 p-3 shadow-lg backdrop-blur-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400">Correlation</h3>
        <span className="font-mono text-[9px] text-tan">
          Div {(out.diversificationScore * 100).toFixed(0)}%
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[200px] border-collapse font-mono text-[8px]">
          <thead>
            <tr>
              <th className="p-0.5 text-zinc-600" />
              {syms.map((s) => (
                <th key={s} className={`p-0.5 ${s === highlight ? 'text-tan' : 'text-zinc-500'}`}>
                  {s.slice(0, 4)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {syms.map((row) => (
              <tr key={row}>
                <td className={`p-0.5 ${row === highlight ? 'text-tan' : 'text-zinc-500'}`}>{row.slice(0, 4)}</td>
                {syms.map((col) => {
                  const v = out.pearson[row]?.[col] ?? 0;
                  return (
                    <td
                      key={col}
                      className="p-0.5 text-center tabular-nums"
                      style={{ backgroundColor: divergingColor(v), color: '#e4e4e7' }}
                      title={`${row}·${col} ρ=${v.toFixed(2)}`}
                    >
                      {v.toFixed(2)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {out.rollingBeta?.[highlight] != null ? (
        <p className="mt-1.5 font-mono text-[8px] text-zinc-600">
          β({highlight}) = {out.rollingBeta[highlight].toFixed(2)} vs SPY
        </p>
      ) : null}
    </section>
  );
}

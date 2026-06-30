'use client';

import React, { useMemo } from 'react';
import { useGreekHistory } from '@/hooks/useGreekHistory';
import type { OptionRow } from '@/components/dashboard/terminal/terminalData';
import { LegendPanelSkeleton } from '@/components/dashboard/LegendPanelSkeleton';

type DualLayerGreekVizProps = {
  symbol: string;
  chain: OptionRow[];
};

function GreekSparkline({
  series,
}: {
  series: { name: string; live: number[]; predicted: number[]; divergence: string };
}) {
  const w = 200;
  const h = 44;
  const pad = 4;
  const all = [...series.predicted, ...series.live];
  const min = Math.min(...all);
  const max = Math.max(...all);
  const span = max - min || 0.01;

  const toPath = (vals: number[]) => {
    const step = (w - pad * 2) / Math.max(1, vals.length - 1);
    const y = (v: number) => pad + (h - pad * 2) * (1 - (v - min) / span);
    return vals.map((v, i) => `${pad + i * step},${y(v).toFixed(2)}`).join(' ');
  };

  const borderClass =
    series.divergence === 'extreme'
      ? 'border-rose-500/50'
      : series.divergence === 'moderate'
        ? 'border-amber-400/40'
        : 'border-white/10';

  const label = series.name === 'delta' ? 'Δ Delta' : series.name === 'theta' ? 'Θ Theta' : 'ν Vega';

  return (
    <div className={`rounded-md border bg-charcoal/40 p-2 ${borderClass}`}>
      <div className="mb-1 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">{label}</span>
        {series.divergence !== 'none' && (
          <span
            className={`rounded px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wide ${
              series.divergence === 'extreme' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/15 text-amber-200'
            }`}
          >
            {series.divergence === 'extreme' ? 'Divergence' : 'Signal'}
          </span>
        )}
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-11 w-full" preserveAspectRatio="none" aria-hidden>
        <polyline fill="none" stroke="currentColor" strokeDasharray="4 3" strokeWidth="1.5" className="text-zinc-500/70" points={toPath(series.predicted)} />
        <polyline fill="none" stroke="currentColor" strokeWidth="2" className="text-tan" points={toPath(series.live)} />
      </svg>
      <div className="mt-1 flex justify-between font-mono text-[9px] tabular-nums text-zinc-600">
        <span>EMA forecast</span>
        <span className="text-zinc-400">IBKR live</span>
      </div>
    </div>
  );
}

export function DualLayerGreekViz({ symbol, chain }: DualLayerGreekVizProps) {
  const atm = useMemo(() => {
    const calls = chain.filter((r) => r.type === 'CALL' && r.mid > 0);
    if (!calls.length) return chain.find((r) => r.mid > 0);
    return calls.reduce((best, r) =>
      Math.abs(r.strike - (chain[0]?.strike ?? r.strike)) < Math.abs(best.strike - (chain[0]?.strike ?? best.strike))
        ? r
        : best,
    calls[0]);
  }, [chain]);

  const { series, hasHistory } = useGreekHistory(symbol, atm);

  const cardBorder =
    series.some((s) => s.divergence === 'extreme')
      ? 'border-rose-500/40'
      : series.some((s) => s.divergence === 'moderate')
        ? 'border-amber-400/30'
        : 'border-white/10';

  if (!atm) {
    return (
      <section className="rounded-lg border border-white/10 bg-dark-gray/90 p-3">
        <p className="font-mono text-[10px] text-zinc-500">Greek projections require IBKR options chain</p>
      </section>
    );
  }

  if (!hasHistory) {
    return <LegendPanelSkeleton label="Greek history · IBKR chain poll" rows={3} height={44} />;
  }

  return (
    <section className={`rounded-lg border bg-dark-gray/90 p-3 shadow-lg backdrop-blur-sm ${cardBorder}`}>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400">Greek projections</h3>
        <span className="font-mono text-[9px] text-zinc-600">
          ATM ${atm.strike.toFixed(0)} · live IBKR
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {series.map((s) => (
          <GreekSparkline key={s.name} series={s} />
        ))}
      </div>
    </section>
  );
}

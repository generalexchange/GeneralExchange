'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { mockGreekSeries, type GreekSeries } from '@/data/greekPathsMock';
import type { OptionRow } from '@/components/dashboard/terminal/terminalData';

type DualLayerGreekVizProps = {
  symbol: string;
  chain: OptionRow[];
};

function GreekSparkline({ series }: { series: GreekSeries }) {
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
        <polyline
          fill="none"
          stroke="currentColor"
          strokeDasharray="4 3"
          strokeWidth="1.5"
          className="text-zinc-500/70"
          points={toPath(series.predicted)}
        />
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-tan"
          points={toPath(series.live)}
        />
      </svg>
      <div className="mt-1 flex justify-between font-mono text-[9px] tabular-nums text-zinc-600">
        <span>Predicted</span>
        <span className="text-zinc-400">Live</span>
      </div>
    </div>
  );
}

export function DualLayerGreekViz({ symbol, chain }: DualLayerGreekVizProps) {
  const atm = useMemo(() => {
    const calls = chain.filter((r) => r.type === 'CALL' && r.moneyness === 'ATM');
    return calls[0] ?? chain[0];
  }, [chain]);

  const [series, setSeries] = useState<GreekSeries[]>(() =>
    mockGreekSeries(symbol, atm ? { delta: atm.delta, theta: atm.theta, vega: atm.vega } : undefined),
  );

  useEffect(() => {
    setSeries(mockGreekSeries(symbol, atm ? { delta: atm.delta, theta: atm.theta, vega: atm.vega } : undefined));
    const id = window.setInterval(() => {
      setSeries(mockGreekSeries(symbol, atm ? { delta: atm.delta, theta: atm.theta, vega: atm.vega } : undefined));
    }, 2000);
    return () => window.clearInterval(id);
  }, [symbol, atm]);

  const cardBorder =
    series.some((s) => s.divergence === 'extreme')
      ? 'border-rose-500/40'
      : series.some((s) => s.divergence === 'moderate')
        ? 'border-amber-400/30'
        : 'border-white/10';

  return (
    <article className={`break-inside-avoid rounded-lg border bg-dark-gray/70 p-4 ${cardBorder}`}>
      <header className="mb-3">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400">Greek Trajectories</h3>
        <p className="mt-0.5 font-mono text-xs text-zinc-300">{symbol} · 5m horizon</p>
      </header>
      <div className="space-y-2">
        {series.map((s) => (
          <GreekSparkline key={s.name} series={s} />
        ))}
      </div>
      <p className="mt-3 font-mono text-[9px] leading-relaxed text-zinc-600">
        Dashed = Monte Carlo projection · Solid = live options feed
      </p>
    </article>
  );
}

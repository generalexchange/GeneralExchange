'use client';

import React, { useMemo } from 'react';
import { Line, LineChart, ResponsiveContainer, YAxis } from 'recharts';
import { useSpyRegression } from '@/hooks/useSpyRegression';

type SpyRiskPanelProps = {
  symbol: string;
};

function Metric({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: 'moss' | 'rose' | 'tan';
}) {
  const color =
    accent === 'moss' ? 'text-moss' : accent === 'rose' ? 'text-rose-400' : accent === 'tan' ? 'text-tan' : 'text-zinc-200';
  return (
    <div className="rounded border border-white/10 bg-charcoal/40 px-2 py-1.5">
      <p className="font-mono text-[8px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`font-mono text-sm tabular-nums ${color}`}>{value}</p>
      {sub ? <p className="font-mono text-[8px] text-zinc-600">{sub}</p> : null}
    </div>
  );
}

export function SpyRiskPanel({ symbol }: SpyRiskPanelProps) {
  const { regression, series, live, loading } = useSpyRegression(symbol);

  const chartData = useMemo(() => {
    if (!series) return [];
    return series.dates.map((d, i) => ({
      i,
      symbol: series.symbol[i],
      spy: series.spy[i],
      label: d.slice(5),
    }));
  }, [series]);

  const alphaAccent =
    regression && regression.alphaAnnualizedPct > 0.05
      ? 'moss'
      : regression && regression.alphaAnnualizedPct < -0.05
        ? 'rose'
        : undefined;

  return (
    <section className="rounded-lg border border-white/10 bg-dark-gray/90 p-3 shadow-lg backdrop-blur-sm">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400">Risk vs SPY</h3>
          <p className="font-mono text-[9px] text-zinc-600">
            {loading
              ? 'Loading historical…'
              : live && regression
                ? `${regression.sampleDays}d IBKR daily bars`
                : 'Static fallback'}
          </p>
        </div>
        {live && !loading ? (
          <span className="font-mono text-[9px] uppercase tracking-wide text-moss">live</span>
        ) : null}
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        <Metric
          label="Beta"
          value={loading ? '…' : (regression?.beta ?? 1).toFixed(2)}
          sub="vs SPY"
        />
        <Metric
          label="Alpha"
          value={loading ? '…' : `${regression?.alphaAnnualizedPct != null && regression.alphaAnnualizedPct >= 0 ? '+' : ''}${(regression?.alphaAnnualizedPct ?? 0).toFixed(1)}%`}
          sub="ann."
          accent={alphaAccent}
        />
        <Metric
          label="Corr"
          value={loading ? '…' : (regression?.correlation ?? 0).toFixed(2)}
          sub={regression ? `R² ${regression.rSquared.toFixed(2)}` : undefined}
        />
      </div>

      <div className="mt-2 h-20 overflow-hidden rounded border border-white/5 bg-charcoal/50">
        {chartData.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <YAxis hide domain={['auto', 'auto']} />
              <Line
                type="monotone"
                dataKey="spy"
                stroke="#71717a"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="symbol"
                stroke="#d2b48c"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center font-mono text-[9px] text-zinc-600">
            {loading ? 'Computing…' : 'Need more daily history'}
          </div>
        )}
      </div>

      <div className="mt-1.5 flex justify-between font-mono text-[8px] text-zinc-600">
        <span className="text-tan">{symbol}</span>
        <span>SPY</span>
      </div>
      <p className="mt-1 font-mono text-[8px] leading-relaxed text-zinc-600">
        Alpha = excess return vs CAPM (β·SPY). Correlation = daily return co-movement.
      </p>
    </section>
  );
}

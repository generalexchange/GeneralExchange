'use client';

import React from 'react';
import { QuotePriceChart } from '@/components/dashboard/QuotePriceChart';
import { betaVsSpy } from '@/config/symbolBeta';
import { useSpyMarketFeed } from '@/hooks/useSpyMarketFeed';
import type { Candle } from '@/components/dashboard/terminal/terminalData';

type MarketTemperatureProps = {
  selectedSymbol: string;
  spyCandles: Candle[];
  spyLive: boolean;
};

export function MarketTemperature({ selectedSymbol, spyCandles, spyLive }: MarketTemperatureProps) {
  const { quote, loading } = useSpyMarketFeed(1000);
  const price = quote?.price ?? 0;
  const change = quote?.change ?? 0;
  const changePct = quote?.changePct ?? 0;
  const up = change >= 0;
  const beta = betaVsSpy(selectedSymbol);

  return (
    <section className="rounded-lg border border-white/10 bg-dark-gray/90 p-4 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">Market Temperature</span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-moss">
          {spyLive && <span className="h-1.5 w-1.5 animate-pulse-live rounded-full bg-moss" aria-hidden />}
          Live
        </span>
      </div>

      <p className="mt-3 font-display text-2xl font-semibold tracking-tight text-tan">SPY</p>

      <p className="mt-1 font-mono text-3xl tabular-nums tracking-tight text-zinc-50">
        {loading && !price ? '—' : `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
      </p>

      <p className={`mt-1 font-mono text-sm tabular-nums ${up ? 'text-moss' : 'text-rose-400'}`}>
        {change >= 0 ? '+' : ''}
        {change.toFixed(2)} ({changePct >= 0 ? '+' : ''}
        {changePct.toFixed(2)}%) Today
      </p>

      <div className="mt-3 flex items-baseline justify-between border-t border-white/10 pt-3">
        <span className="text-[10px] uppercase tracking-wider text-zinc-500">Beta vs SPY</span>
        <span className="font-mono text-sm tabular-nums text-zinc-200">{beta.toFixed(2)}</span>
      </div>
      <p className="mt-0.5 text-right font-mono text-[9px] text-zinc-600">{selectedSymbol}</p>

      <div className="mt-3 h-16 overflow-hidden rounded-md border border-white/5 bg-charcoal/50">
        {spyCandles.length > 0 ? (
          <QuotePriceChart
            candles={spyCandles}
            up={up}
            prevClose={quote?.prevClose ?? price - change}
            theme="dark"
            height={64}
            showTooltip={false}
          />
        ) : (
          <div className="flex h-full items-center justify-center font-mono text-[10px] text-zinc-600">Loading SPY tape…</div>
        )}
      </div>
    </section>
  );
}

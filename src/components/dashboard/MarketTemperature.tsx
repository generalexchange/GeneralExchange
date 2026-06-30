'use client';

import React from 'react';
import { QuotePriceChart } from '@/components/dashboard/QuotePriceChart';
import { AnimatedPrice, AnimatedSignedChange } from '@/components/dashboard/AnimatedPrice';
import { useSpyMarketFeed } from '@/hooks/useSpyMarketFeed';
import { SpyRiskPanel } from '@/components/dashboard/SpyRiskPanel';
import type { Candle } from '@/components/dashboard/terminal/terminalData';

type MarketTemperatureProps = {
  selectedSymbol: string;
  spyCandles: Candle[];
  spyLive: boolean;
  spyLoading?: boolean;
};

export function MarketTemperature({ selectedSymbol, spyCandles, spyLive, spyLoading }: MarketTemperatureProps) {
  const { quote, loading } = useSpyMarketFeed();
  const price = quote?.price ?? 0;
  const change = quote?.change ?? 0;
  const changePct = quote?.changePct ?? 0;
  const up = change >= 0;

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

      <p className="mt-1 font-mono text-3xl tracking-tight text-zinc-50">
        {loading && !price ? (
          '—'
        ) : price > 0 ? (
          <AnimatedPrice value={price} prefix="$" decimals={2} durationMs={240} />
        ) : (
          'No data'
        )}
      </p>

      <p className={`mt-1 font-mono text-sm ${up ? 'text-moss' : 'text-rose-400'}`}>
        <AnimatedSignedChange value={change} className={up ? 'text-moss' : 'text-rose-400'} />
        {' '}
        (<AnimatedSignedChange value={changePct} isPct className={up ? 'text-moss' : 'text-rose-400'} />) Today
      </p>

      <div className="mt-3 h-16 overflow-hidden rounded-md border border-white/5 bg-charcoal/50">
        {spyCandles.length > 0 ? (
          <QuotePriceChart
            candles={spyCandles}
            up={up}
            prevClose={quote?.prevClose ?? price - change}
            theme="dark"
            height={64}
            showTooltip={false}
            extendedHours
            live={spyLive && price > 0}
          />
        ) : (
          <div className="flex h-full items-center justify-center font-mono text-[10px] text-zinc-600">
            {loading || spyLoading ? 'Loading SPY tape…' : 'No SPY data available'}
          </div>
        )}
      </div>

      <div className="mt-3">
        <SpyRiskPanel symbol={selectedSymbol} />
      </div>
    </section>
  );
}

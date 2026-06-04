import React from 'react';
import { useMarketStore } from '@/stores/marketStore';
import { useUiStore } from '@/stores/uiStore';
import { formatPrice, formatPercent } from '@/lib/format';

const RH_UP = '#00C805';
const RH_DOWN = '#FF5000';

/** Robinhood-style quote block — large price, daily change, no chart. */
export const StockQuoteHero: React.FC = () => {
  const symbol = useUiStore((s) => s.activeSymbol);
  const quote = useMarketStore((s) => s.quote);

  if (!quote) {
    return (
      <div className="flex flex-1 flex-col justify-center px-8 py-12">
        <span className="font-display text-lg text-zinc-400">{symbol}</span>
        <span className="mt-2 font-sans text-5xl tabular-nums text-zinc-600">—</span>
      </div>
    );
  }

  const up = quote.change >= 0;
  const color = up ? RH_UP : RH_DOWN;
  const statusLabel =
    quote.marketStatus === 'open'
      ? 'Market open'
      : quote.marketStatus === 'post'
        ? 'After hours'
        : quote.marketStatus === 'pre'
          ? 'Pre-market'
          : 'Closed';

  return (
    <div className="flex flex-1 flex-col justify-center px-8 py-10" data-tour="stock-quote">
      <span className="font-display text-lg text-zinc-400">{symbol}</span>
      <span className="mt-2 font-sans text-[3.5rem] font-normal leading-none tabular-nums tracking-tight text-neutral-50">
        {formatPrice(quote.last)}
      </span>
      <span className="mt-3 text-lg tabular-nums" style={{ color }}>
        {up ? '+' : ''}
        {formatPrice(Math.abs(quote.change))} ({formatPercent(quote.changePct, 2, true)}){' '}
        <span className="text-base text-zinc-500">Today</span>
      </span>
      <span className="mt-1 text-[11px] uppercase tracking-wider text-zinc-500">{statusLabel}</span>
    </div>
  );
};

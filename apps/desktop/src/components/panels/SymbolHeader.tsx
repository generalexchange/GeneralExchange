import React from 'react';
import { useMarketStore } from '@/stores/marketStore';
import { useUiStore } from '@/stores/uiStore';
import type { ChartInterval } from '@/types/market';
import { formatPrice, formatSignedCurrency, formatPercent, pnlColorClass } from '@/lib/format';

const INTERVALS: ChartInterval[] = ['1m', '5m', '15m', '1h', '1d'];

const STATUS_LABEL: Record<string, string> = {
  pre: 'Pre-market',
  open: 'Market open',
  post: 'After hours',
  closed: 'Closed',
};

export const SymbolHeader: React.FC = () => {
  const symbol = useUiStore((s) => s.activeSymbol);
  const quote = useMarketStore((s) => s.quote);
  const setInterval = useUiStore((s) => s.setActiveInterval);
  const interval = useUiStore((s) => s.activeInterval);

  return (
    <div className="flex h-12 items-center justify-between border-b border-white/[0.06] px-4">
      <div className="flex items-baseline gap-4">
        <span className="tabular font-display text-xl text-neutral-50">{symbol}</span>
        <span className="tabular text-lg text-neutral-100">{quote ? formatPrice(quote.last) : '—'}</span>
        {quote && (
          <span className={`tabular text-[13px] ${pnlColorClass(quote.change)}`}>
            {formatSignedCurrency(quote.change)} ({formatPercent(quote.changePct, 2, true)})
          </span>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          {INTERVALS.map((iv) => (
            <button
              key={iv}
              onClick={() => setInterval(iv)}
              className={`rounded px-2 py-0.5 text-[11px] ${
                interval === iv ? 'bg-brass/20 text-tan' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {iv}
            </button>
          ))}
        </div>
        {quote && (
          <span className="text-[11px] uppercase tracking-wider text-zinc-500">{STATUS_LABEL[quote.marketStatus]}</span>
        )}
      </div>
    </div>
  );
};

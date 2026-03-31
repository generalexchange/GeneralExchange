import React from 'react';
import type { OrderBookLevel } from './mockMlDashboardData';

interface OrderBookPreviewProps {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
}

export const OrderBookPreview: React.FC<OrderBookPreviewProps> = ({ bids, asks }) => {
  const maxSize = Math.max(...bids.map((b) => b.size), ...asks.map((a) => a.size), 1);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-4 sm:p-5 h-full min-h-[200px] flex flex-col shadow-lg shadow-black/25 transition-all hover:border-emerald-500/20">
      <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-sky-400/90 mb-1">Order book</p>
      <p className="text-xs text-zinc-500 mb-4">Mock depth · top of book preview</p>
      <div className="grid grid-cols-2 gap-3 flex-1 text-[11px] sm:text-xs">
        <div>
          <p className="text-emerald-400/90 font-semibold mb-2 uppercase tracking-wider">Bids</p>
          <ul className="space-y-1.5">
            {bids.slice(0, 6).map((b, i) => (
              <li
                key={`b-${i}`}
                className="relative overflow-hidden rounded-md border border-white/5 px-2 py-1.5 font-mono tabular-nums transition-colors hover:border-emerald-500/30"
                title={`Size ${b.size}`}
              >
                <span
                  className="absolute inset-y-0 left-0 bg-emerald-500/15 pointer-events-none"
                  style={{ width: `${(b.size / maxSize) * 100}%` }}
                />
                <span className="relative flex justify-between gap-2 text-zinc-200">
                  <span>{b.price.toFixed(2)}</span>
                  <span className="text-zinc-500">{b.size.toLocaleString()}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-rose-400/90 font-semibold mb-2 uppercase tracking-wider">Asks</p>
          <ul className="space-y-1.5">
            {asks.slice(0, 6).map((a, i) => (
              <li
                key={`a-${i}`}
                className="relative overflow-hidden rounded-md border border-white/5 px-2 py-1.5 font-mono tabular-nums transition-colors hover:border-rose-500/30"
                title={`Size ${a.size}`}
              >
                <span
                  className="absolute inset-y-0 right-0 bg-rose-500/15 pointer-events-none"
                  style={{ width: `${(a.size / maxSize) * 100}%` }}
                />
                <span className="relative flex justify-between gap-2 text-zinc-200">
                  <span>{a.price.toFixed(2)}</span>
                  <span className="text-zinc-500">{a.size.toLocaleString()}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

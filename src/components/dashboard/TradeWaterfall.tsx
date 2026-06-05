'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSymbolTape } from '@/store/marketState';
import { subscribeMarketWs, subscribeWsStatus } from '@/services/wsClient';

function fmtTime(ts: number) {
  return new Date(ts).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

type TradeWaterfallProps = {
  symbol: string;
  className?: string;
};

/** Scrolling tape of live WebSocket prints — waterfall style. */
export function TradeWaterfall({ symbol, className = '' }: TradeWaterfallProps) {
  const tape = useSymbolTape(symbol);
  const [connected, setConnected] = useState(false);

  useEffect(() => subscribeMarketWs(), []);
  useEffect(() => subscribeWsStatus(setConnected), []);

  const rows = useMemo(() => [...tape].reverse().slice(0, 40), [tape]);

  return (
    <section
      className={`overflow-hidden rounded-lg border border-white/10 bg-dark-gray/90 ${className}`}
    >
      <header className="flex items-center justify-between border-b border-white/10 px-3 py-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400">
          Live tape · {symbol}
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wide text-zinc-500">
          <span
            className={`h-1.5 w-1.5 rounded-full ${connected ? 'animate-pulse-live bg-moss' : 'bg-zinc-600'}`}
          />
          {connected ? 'WS live' : 'WS offline'}
        </span>
      </header>

      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-dark-gray/95 to-transparent pointer-events-none z-10" />
        <ul className="h-full overflow-y-auto px-2 py-1 font-mono text-[11px] tabular-nums">
          {rows.length === 0 ? (
            <li className="flex h-full items-center justify-center text-center text-[10px] text-zinc-600">
              {connected ? 'Waiting for trades…' : 'Connecting to WebSocket…'}
            </li>
          ) : (
            rows.map((row, i) => {
              const prev = rows[i + 1];
              const up = !prev || row.price >= prev.price;
              return (
                <li
                  key={row.id}
                  className={`flex items-center justify-between border-b border-white/[0.04] py-1 ${
                    i === 0 ? 'bg-white/[0.03]' : ''
                  }`}
                >
                  <span className="text-zinc-600">{fmtTime(row.timestamp)}</span>
                  <span className={up ? 'text-moss' : 'text-rose-400'}>
                    ${row.price.toFixed(2)}
                  </span>
                  <span className="text-zinc-500">{row.size ? Math.round(row.size) : '—'}</span>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </section>
  );
}

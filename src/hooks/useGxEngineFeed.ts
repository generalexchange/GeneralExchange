'use client';

import { useMemo } from 'react';
import { useGxStore } from '@/stores/gxStore';
import type { CandleEvent, SignalEvent } from '@gx/event-schema';

export function useGxEngineFeed(symbol: string) {
  const connectionStatus = useGxStore((s) => s.connectionStatus);
  const ticker = useGxStore((s) => s.tickers[symbol]);
  const candles1m = useGxStore((s) => s.candles[symbol]?.['1m'] ?? []);
  const signals = useGxStore((s) => s.signals);
  const portfolio = useGxStore((s) => s.portfolio);

  const symbolSignals = useMemo(
    () => signals.filter((s) => s.symbol === symbol).slice(0, 5),
    [signals, symbol],
  );

  const connected = connectionStatus === 'connected';
  const tickLive = connected && Boolean(ticker?.price && ticker.price > 0);

  return {
    connectionStatus,
    connected,
    tickLive,
    ticker,
    candles1m: candles1m as CandleEvent[],
    signals: symbolSignals as SignalEvent[],
    portfolio,
  };
}

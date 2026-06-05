/**
 * Live market WebSocket wiring (unified server).
 *
 * Connects to NEXT_PUBLIC_WS_URL (same server in dev + prod):
 *   ws://localhost:3001/ws          (local)
 *   wss://general.exchange/ws       (production)
 *
 * When unset the hook stays dormant; REST polling drives the UI.
 */

'use client';

import { useEffect } from 'react';
import type { Candle, OptionRow } from '@/components/dashboard/terminal/terminalData';
import { isMarketWsConfigured } from '@/services/wsClient';
import { subscribeMarketState, getMarketState } from '@/store/marketState';

export interface MarketStreamHandlers {
  onCandle?: (candle: Candle, replaceLast: boolean) => void;
  onChainDelta?: (delta: { add?: OptionRow[]; update?: OptionRow[]; remove?: OptionRow[] }) => void;
  onPrice?: (symbol: string, price: number) => void;
}

function toTerminalCandle(
  c: { open_time: number; open: number; high: number; low: number; close: number; volume: number; vwap: number },
): Candle {
  return {
    t: c.open_time,
    o: c.open,
    h: c.high,
    l: c.low,
    c: c.close,
    v: c.volume,
    vwap: c.vwap,
  };
}

export function useMarketStream(symbol: string, interval: string, handlers: MarketStreamHandlers): void {
  useEffect(() => {
    if (!isMarketWsConfigured()) return;

    const unsubState = subscribeMarketState(() => {
      const { quotes, candles } = getMarketState();
      const q = quotes[symbol];
      if (q) handlers.onPrice?.(symbol, q.price);

      const key = `${symbol}:${interval}`;
      const bars = candles[key];
      const last = bars?.[bars.length - 1];
      if (last) {
        handlers.onCandle?.(toTerminalCandle(last), true);
      }
    });

    return () => {
      unsubState();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, interval]);
}

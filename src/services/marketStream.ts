/**
 * Live market WebSocket wiring.
 *
 * Connects the dashboard's streaming visuals to the Go WebSocket server:
 *   candles → ws://host/v1/stream/candles/:symbol/:interval  (incremental
 *             ECharts append via PriceChart.pushCandle)
 *   options → ws://host/v1/stream/options/:symbol            (AG Grid
 *             applyTransactionAsync delta)
 *
 * The base URL comes from NEXT_PUBLIC_WS_URL (e.g. ws://localhost:8081). When it
 * is unset — the default in local/mock development — the hook stays completely
 * dormant: it opens no sockets and logs nothing, so the deterministic mock data
 * drives the UI without reconnect noise. The moment the env var points at a live
 * Go WS server, every visual begins streaming with no further code changes.
 */

'use client';

import { useEffect } from 'react';
import type { Candle, OptionRow } from '@/components/dashboard/terminal/terminalData';

const WS_BASE = process.env.NEXT_PUBLIC_WS_URL;

export interface MarketStreamHandlers {
  /** A new or updated forming candle for the active symbol/interval. */
  onCandle?: (candle: Candle, replaceLast: boolean) => void;
  /** A partial options-chain delta: rows to add / update / remove. */
  onChainDelta?: (delta: { add?: OptionRow[]; update?: OptionRow[]; remove?: OptionRow[] }) => void;
}

/**
 * Subscribe to the candle + options streams for a symbol. No-op when
 * NEXT_PUBLIC_WS_URL is unset. Reconnects with capped backoff while mounted.
 */
export function useMarketStream(symbol: string, interval: string, handlers: MarketStreamHandlers): void {
  useEffect(() => {
    if (!WS_BASE || typeof window === 'undefined') return;

    const sockets: WebSocket[] = [];
    let closed = false;

    const connect = (path: string, onMessage: (data: unknown) => void) => {
      let attempt = 0;
      let ws: WebSocket | null = null;
      const open = () => {
        if (closed) return;
        ws = new WebSocket(`${WS_BASE}${path}`);
        sockets.push(ws);
        ws.onmessage = (ev) => {
          try {
            onMessage(JSON.parse(ev.data));
          } catch {
            /* ignore malformed frames */
          }
        };
        ws.onclose = () => {
          if (closed) return;
          attempt = Math.min(attempt + 1, 5);
          window.setTimeout(open, 1000 * attempt);
        };
        ws.onerror = () => ws?.close();
      };
      open();
    };

    connect(`/v1/stream/candles/${symbol}/${interval}`, (data) => {
      const msg = data as { candle?: Candle; replaceLast?: boolean } & Partial<Candle>;
      const candle = msg.candle ?? (typeof msg.c === 'number' ? (msg as Candle) : null);
      if (candle) handlers.onCandle?.(candle, Boolean(msg.replaceLast));
    });

    connect(`/v1/stream/options/${symbol}`, (data) => {
      const msg = data as { add?: OptionRow[]; update?: OptionRow[]; remove?: OptionRow[] };
      handlers.onChainDelta?.(msg);
    });

    return () => {
      closed = true;
      for (const s of sockets) s.close();
    };
    // handlers is intentionally read fresh on each (symbol, interval) subscription
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, interval]);
}

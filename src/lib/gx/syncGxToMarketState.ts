/**
 * Bridge gx-engine events into the existing marketState store so Legend panels
 * (quote hero, charts, pulse, temperature) update without per-panel rewrites.
 */
import type { CandleEvent, MarketDataEvent } from '@gx/event-schema';
import { applyCandleUpdate, applyMarketUpdate } from '@/store/marketState';

const GX_INTERVALS = new Set(['1s', '5s', '15s', '1m', '5m', '15m', '1h', '1d']);

export function gxIntervalToChart(interval: string): string {
  return GX_INTERVALS.has(interval) ? interval : '1m';
}

export function syncGxMarketData(event: MarketDataEvent): void {
  if (!event.symbol || !event.price) return;
  const ts =
    event.ts_exchange > 1_000_000_000_000
      ? Math.floor(event.ts_exchange / 1000)
      : event.ts_exchange > 1_000_000_000
        ? event.ts_exchange
        : Date.now();

  applyMarketUpdate({
    symbol: event.symbol,
    price: event.price,
    volume: event.last_sz > 0 ? event.last_sz : undefined,
    timestamp: ts,
    source: 'gx-engine',
  });
}

export function syncGxCandle(event: CandleEvent): void {
  if (!event.symbol) return;
  const ts =
    event.ts_exchange > 1_000_000_000_000
      ? event.ts_exchange
      : event.ts_exchange > 1_000_000_000
        ? event.ts_exchange * 1000
        : Date.now();

  applyCandleUpdate(
    {
      symbol: event.symbol,
      interval: gxIntervalToChart(event.interval),
      open_time: ts,
      open: event.open,
      high: event.high,
      low: event.low,
      close: event.close,
      volume: event.volume,
      vwap: event.vwap,
    },
    !event.is_final,
  );
}

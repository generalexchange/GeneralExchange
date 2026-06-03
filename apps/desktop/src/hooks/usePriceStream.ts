import { useEffect } from 'react';
import { wsManager } from '@/services/websocket';
import { useMarketStore } from '@/stores/marketStore';
import { useSignalStore } from '@/stores/signalStore';
import { Topics, symbolTopics } from '@/lib/constants';
import type { ChartInterval } from '@/types/market';

/**
 * Point the single WebSocket connection at a symbol's live streams. The manager
 * routes inbound ticks / candles / chain straight into the market store; this
 * hook only manages which symbol's topics are active and clears stale state on
 * a symbol change.
 */
export function usePriceStream(symbol: string, interval: ChartInterval): void {
  useEffect(() => {
    useMarketStore.getState().resetForSymbol();
    useSignalStore.getState().resetForSymbol();
    wsManager.setSymbolTopics(symbolTopics(symbol, interval));
    return () => {
      // Leaving the symbol entirely; the next effect run resubscribes.
      wsManager.setSymbolTopics([]);
    };
  }, [symbol, interval]);
}

/** Convenience accessor for the candle topic of the active symbol. */
export function candleTopic(symbol: string, interval: ChartInterval): string {
  return Topics.candles(symbol, interval);
}

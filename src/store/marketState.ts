/**
 * Central in-memory market state — updated only via WebSocket messages.
 * UI components subscribe through hooks; never mutate from outside wsClient.
 */
'use client';

import { useSyncExternalStore } from 'react';
import type { CandleUpdate, MarketUpdate } from '@/lib/ws/types';

export type SymbolQuote = MarketUpdate & { change?: number; changePct?: number };

type MarketState = {
  quotes: Record<string, SymbolQuote>;
  candles: Record<string, CandleUpdate[]>;
};

const MAX_CANDLES = 500;

let state: MarketState = { quotes: {}, candles: {} };
const listeners = new Set<() => void>();

function emit() {
  for (const fn of listeners) fn();
}

export function subscribeMarketState(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getMarketState(): MarketState {
  return state;
}

export function applyMarketUpdate(update: MarketUpdate) {
  const prev = state.quotes[update.symbol]?.price;
  const change = prev != null ? update.price - prev : 0;
  const changePct = prev != null && prev !== 0 ? (change / prev) * 100 : 0;
  state = {
    ...state,
    quotes: {
      ...state.quotes,
      [update.symbol]: { ...update, change, changePct },
    },
  };
  emit();
}

export function applyCandleUpdate(candle: CandleUpdate, replaceLast = true) {
  const key = `${candle.symbol}:${candle.interval}`;
  const prev = state.candles[key] ?? [];
  const last = prev[prev.length - 1];
  let next: CandleUpdate[];
  if (replaceLast && last && last.open_time === candle.open_time) {
    next = [...prev.slice(0, -1), candle];
  } else {
    next = [...prev, candle];
  }
  if (next.length > MAX_CANDLES) next = next.slice(-MAX_CANDLES);
  state = { ...state, candles: { ...state.candles, [key]: next } };
  emit();
}

/** Hydrate initial quote from REST snapshot (once per symbol, before WS overrides). */
export function seedQuoteFromRest(symbol: string, price: number, timestamp?: number) {
  if (state.quotes[symbol]) return;
  applyMarketUpdate({
    symbol,
    price,
    timestamp: timestamp ?? Date.now(),
    source: 'polygon',
  });
}

export function useSymbolQuote(symbol: string): SymbolQuote | null {
  return useSyncExternalStore(
    subscribeMarketState,
    () => getMarketState().quotes[symbol] ?? null,
    () => null,
  );
}

export function useSymbolCandles(symbol: string, interval: string): CandleUpdate[] {
  const key = `${symbol}:${interval}`;
  return useSyncExternalStore(
    subscribeMarketState,
    () => getMarketState().candles[key] ?? [],
    () => [],
  );
}

export function resetMarketState() {
  state = { quotes: {}, candles: {} };
  emit();
}

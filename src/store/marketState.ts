/**
 * Central in-memory market state — updated via WebSocket + REST snapshots.
 */
'use client';

import { useSyncExternalStore } from 'react';
import type { CandleUpdate, MarketUpdate } from '@/lib/ws/types';
import type { Candle } from '@/components/dashboard/terminal/terminalData';

export type SymbolQuote = MarketUpdate & {
  prevClose?: number;
  change?: number;
  changePct?: number;
  afterHoursChange?: number;
  afterHoursChangePct?: number;
};

type MarketState = {
  quotes: Record<string, SymbolQuote>;
  candles: Record<string, CandleUpdate[]>;
};

const MAX_CANDLES = 500;
const EMPTY_CANDLES: CandleUpdate[] = [];

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
  const existing = state.quotes[update.symbol];
  const prevClose = existing?.prevClose ?? existing?.price ?? update.price;
  const change = update.price - prevClose;
  const changePct = prevClose ? (change / prevClose) * 100 : 0;

  state = {
    ...state,
    quotes: {
      ...state.quotes,
      [update.symbol]: {
        ...existing,
        ...update,
        prevClose,
        change,
        changePct,
        afterHoursChange: existing?.afterHoursChange,
        afterHoursChangePct: existing?.afterHoursChangePct,
        source: update.source ?? existing?.source ?? 'ws',
      },
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

/** Hydrate quote from Polygon REST (day change vs prev close). */
export function seedQuoteFromRest(
  symbol: string,
  payload: {
    price: number;
    prevClose: number;
    change: number;
    changePct: number;
    afterHoursChange?: number;
    afterHoursChangePct?: number;
    timestamp?: number;
  },
) {
  state = {
    ...state,
    quotes: {
      ...state.quotes,
      [symbol]: {
        symbol,
        price: payload.price,
        prevClose: payload.prevClose,
        change: payload.change,
        changePct: payload.changePct,
        afterHoursChange: payload.afterHoursChange,
        afterHoursChangePct: payload.afterHoursChangePct,
        timestamp: payload.timestamp ?? Date.now(),
        source: 'polygon',
      },
    },
  };
  emit();
}

/** Hydrate intraday candles for the Robinhood chart. */
export function seedCandlesFromRest(symbol: string, interval: string, rows: Candle[]) {
  const key = `${symbol}:${interval}`;
  const mapped: CandleUpdate[] = rows.map((c) => ({
    symbol,
    interval,
    open_time: c.t,
    open: c.o,
    high: c.h,
    low: c.l,
    close: c.c,
    volume: c.v,
    vwap: c.vwap,
  }));
  state = { ...state, candles: { ...state.candles, [key]: mapped } };
  emit();
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
    () => getMarketState().candles[key] ?? EMPTY_CANDLES,
    () => EMPTY_CANDLES,
  );
}

export function resetMarketState() {
  state = { quotes: {}, candles: {} };
  emit();
}

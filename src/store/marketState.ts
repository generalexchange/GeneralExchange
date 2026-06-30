/**
 * Central in-memory market state — updated via WebSocket + REST snapshots.
 */
'use client';

import { useSyncExternalStore } from 'react';
import type { CandleUpdate, MarketStreamUpdate, MarketUpdate } from '@/lib/ws/types';
import type { Candle } from '@/components/dashboard/terminal/terminalData';
import { CANDLE_RING_CAPACITY, TAPE_RING_CAPACITY } from '@/config/marketFeedCache';

export type SymbolQuote = MarketUpdate & {
  prevClose?: number;
  sessionOpen?: number;
  change?: number;
  changePct?: number;
  afterHoursChange?: number;
  afterHoursChangePct?: number;
  change1m?: number;
  change5m?: number;
  change15m?: number;
  rsi?: number;
  vwap?: number;
  volatility?: number;
  momentumScore?: number;
  streamSeq?: number;
};

export type TapePrint = {
  id: string;
  symbol: string;
  price: number;
  size?: number;
  timestamp: number;
};

type MarketState = {
  quotes: Record<string, SymbolQuote>;
  candles: Record<string, CandleUpdate[]>;
  tape: Record<string, TapePrint[]>;
};

const MAX_CANDLES = CANDLE_RING_CAPACITY;
const MAX_TAPE = TAPE_RING_CAPACITY;
const EMPTY_CANDLES: CandleUpdate[] = [];
const EMPTY_TAPE: TapePrint[] = [];

let state: MarketState = { quotes: {}, candles: {}, tape: {} };
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

export function applyMarketStreamUpdate(update: MarketStreamUpdate) {
  const existing = state.quotes[update.symbol];
  const prevClose =
    update.prev_close && update.prev_close > 0
      ? update.prev_close
      : existing?.prevClose != null && existing.prevClose > 0
        ? existing.prevClose
        : undefined;
  const change = prevClose != null ? update.price - prevClose : existing?.change;
  const changePct =
    prevClose != null && prevClose > 0
      ? ((update.price - prevClose) / prevClose) * 100
      : existing?.changePct;

  applyMarketUpdate({
    symbol: update.symbol,
    price: update.price,
    volume: update.volume,
    timestamp: update.timestamp,
    source: 'ibkr',
  });

  const q = getMarketState().quotes[update.symbol];
  if (!q) return;

  state = {
    ...getMarketState(),
    quotes: {
      ...getMarketState().quotes,
      [update.symbol]: {
        ...q,
        prevClose,
        change,
        changePct,
        change1m: update.change_1m ?? q.change1m,
        change5m: update.change_5m ?? q.change5m,
        change15m: update.change_15m ?? q.change15m,
        rsi: update.rsi ?? q.rsi,
        vwap: update.vwap ?? q.vwap,
        volatility: update.volatility ?? q.volatility,
        momentumScore: update.momentum_score ?? q.momentumScore,
        streamSeq: update.seq ?? q.streamSeq,
      },
    },
  };
  emit();
}

/** Hydrate from /ws/market snapshot (instant state on connect). */
export function applyMarketSnapshot(snapshot: MarketStreamUpdate & { candles_1m?: CandleUpdate[] }) {
  applyMarketStreamUpdate(snapshot);
  if (snapshot.candles_1m?.length) {
    const sym = snapshot.symbol;
    const key = `${sym}:1m`;
    state = {
      ...getMarketState(),
      candles: { ...getMarketState().candles, [key]: snapshot.candles_1m.slice(-MAX_CANDLES) },
    };
    emit();
  }
}

export function applyMarketUpdate(update: MarketUpdate) {
  const existing = state.quotes[update.symbol];
  const prevClose =
    existing?.prevClose != null && existing.prevClose > 0 ? existing.prevClose : undefined;
  const change = prevClose != null ? update.price - prevClose : existing?.change;
  const changePct =
    prevClose != null && prevClose > 0
      ? ((update.price - prevClose) / prevClose) * 100
      : existing?.changePct;

  const print: TapePrint = {
    id: `${update.symbol}-${update.timestamp}-${update.price}`,
    symbol: update.symbol,
    price: update.price,
    size: update.volume,
    timestamp: update.timestamp,
  };
  const prevTape = state.tape[update.symbol] ?? [];
  const nextTape = [...prevTape, print].slice(-MAX_TAPE);

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
        source: update.source ?? existing?.source ?? 'ibkr',
      },
    },
    tape: { ...state.tape, [update.symbol]: nextTape },
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
    sessionOpen?: number;
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
        sessionOpen: payload.sessionOpen,
        change: payload.change,
        changePct: payload.changePct,
        afterHoursChange: payload.afterHoursChange,
        afterHoursChangePct: payload.afterHoursChangePct,
        timestamp: payload.timestamp ?? Date.now(),
        source: 'ibkr',
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

export function useSymbolTape(symbol: string): TapePrint[] {
  return useSyncExternalStore(
    subscribeMarketState,
    () => getMarketState().tape[symbol] ?? EMPTY_TAPE,
    () => EMPTY_TAPE,
  );
}

export function resetMarketState() {
  state = { quotes: {}, candles: {}, tape: {} };
  emit();
}

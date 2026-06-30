/**
 * High-frequency cache between IBKR WebSocket and UI state.
 * Ring buffer + dedupe + micro-batch → latest snapshot per symbol.
 */
import type { MarketStreamUpdate, MarketUpdate } from '@/lib/ws/types';
import {
  MICRO_BATCH_MS,
  TICK_DEDUPE_MS,
  TICK_RING_CAPACITY,
  VISUAL_TRAIL_POINTS,
} from '@/config/marketFeedCache';

export type MarketSnapshot = {
  symbol: string;
  lastPrice: number;
  bid: number | null;
  ask: number | null;
  volumeDelta: number;
  timestamp: number;
  seq: number;
};

type RawTick = {
  price: number;
  volume?: number;
  timestamp: number;
  bid?: number;
  ask?: number;
};

type SymbolBuffer = {
  ring: RawTick[];
  ringHead: number;
  ringSize: number;
  lastEmitPrice: number;
  lastEmitAt: number;
  pending: RawTick | null;
  lastStream: MarketStreamUpdate | null;
  volumeAcc: number;
  snapshot: MarketSnapshot;
};

const buffers = new Map<string, SymbolBuffer>();
let flushTimer: ReturnType<typeof setTimeout> | null = null;
const flushListeners = new Set<(snapshots: MarketSnapshot[]) => void>();
let seq = 0;

function emptySnapshot(symbol: string): MarketSnapshot {
  return {
    symbol,
    lastPrice: 0,
    bid: null,
    ask: null,
    volumeDelta: 0,
    timestamp: 0,
    seq: 0,
  };
}

function getBuffer(symbol: string): SymbolBuffer {
  const sym = symbol.toUpperCase();
  let buf = buffers.get(sym);
  if (!buf) {
    buf = {
      ring: new Array(TICK_RING_CAPACITY),
      ringHead: 0,
      ringSize: 0,
      lastEmitPrice: NaN,
      lastEmitAt: 0,
      pending: null,
      lastStream: null,
      volumeAcc: 0,
      snapshot: emptySnapshot(sym),
    };
    buffers.set(sym, buf);
  }
  return buf;
}

function pushRing(buf: SymbolBuffer, tick: RawTick) {
  buf.ring[buf.ringHead] = tick;
  buf.ringHead = (buf.ringHead + 1) % TICK_RING_CAPACITY;
  if (buf.ringSize < TICK_RING_CAPACITY) buf.ringSize += 1;
}

function scheduleFlush() {
  if (flushTimer != null) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flushMicroBatch();
  }, MICRO_BATCH_MS);
}

function flushMicroBatch() {
  const out: MarketSnapshot[] = [];

  for (const [sym, buf] of buffers) {
    if (!buf.pending) continue;

    const tick = buf.pending;
    buf.pending = null;
    const now = tick.timestamp;
    const samePrice = tick.price === buf.lastEmitPrice;
    const tooSoon = now - buf.lastEmitAt < TICK_DEDUPE_MS;
    if (samePrice && tooSoon) continue;

    seq += 1;
    buf.lastEmitPrice = tick.price;
    buf.lastEmitAt = now;

    const snap: MarketSnapshot = {
      symbol: sym,
      lastPrice: tick.price,
      bid: tick.bid ?? buf.snapshot.bid,
      ask: tick.ask ?? buf.snapshot.ask,
      volumeDelta: buf.volumeAcc,
      timestamp: now,
      seq,
    };
    buf.volumeAcc = 0;
    buf.snapshot = snap;
    out.push(snap);
  }

  if (out.length) {
    for (const fn of flushListeners) fn(out);
  }
}

export function ingestMarketUpdate(update: MarketUpdate) {
  const buf = getBuffer(update.symbol);
  const tick: RawTick = {
    price: update.price,
    volume: update.volume,
    timestamp: update.timestamp ?? Date.now(),
  };

  const dup =
    tick.price === buf.lastEmitPrice && tick.timestamp - buf.lastEmitAt < TICK_DEDUPE_MS;
  if (dup) return;

  pushRing(buf, tick);
  if (update.volume) buf.volumeAcc += update.volume;
  buf.pending = tick;
  scheduleFlush();
}

export function ingestMarketStreamUpdate(update: MarketStreamUpdate) {
  const buf = getBuffer(update.symbol);
  buf.lastStream = update;
  const tick: RawTick = {
    price: update.price,
    volume: update.volume,
    timestamp: update.timestamp ?? Date.now(),
  };

  const dup =
    tick.price === buf.lastEmitPrice && tick.timestamp - buf.lastEmitAt < TICK_DEDUPE_MS;
  if (!dup) {
    pushRing(buf, tick);
    if (update.volume) buf.volumeAcc += update.volume;
    buf.pending = tick;
    scheduleFlush();
  }

  seq += 1;
  buf.snapshot = {
    symbol: update.symbol.toUpperCase(),
    lastPrice: update.price,
    bid: buf.snapshot.bid,
    ask: buf.snapshot.ask,
    volumeDelta: buf.volumeAcc,
    timestamp: tick.timestamp,
    seq,
  };
}

export function consumePendingStream(symbol: string): MarketStreamUpdate | null {
  const buf = buffers.get(symbol.toUpperCase());
  if (!buf?.lastStream) return null;
  const stream = buf.lastStream;
  buf.lastStream = null;
  return stream;
}

export function getMarketSnapshot(symbol: string): MarketSnapshot | null {
  const buf = buffers.get(symbol.toUpperCase());
  if (!buf || !buf.snapshot.lastPrice) return null;
  return buf.snapshot;
}

export function getVisualTrail(symbol: string, maxPoints = VISUAL_TRAIL_POINTS): RawTick[] {
  const buf = buffers.get(symbol.toUpperCase());
  if (!buf || buf.ringSize === 0) return [];

  const n = Math.min(maxPoints, buf.ringSize);
  const out: RawTick[] = [];
  let idx = (buf.ringHead - 1 + TICK_RING_CAPACITY) % TICK_RING_CAPACITY;
  for (let i = 0; i < n; i++) {
    const t = buf.ring[idx];
    if (t) out.unshift(t);
    idx = (idx - 1 + TICK_RING_CAPACITY) % TICK_RING_CAPACITY;
  }
  return out;
}

/** Called once per micro-batch with merged snapshots — wire to marketState. */
export function onMicroBatchFlush(listener: (snapshots: MarketSnapshot[]) => void): () => void {
  flushListeners.add(listener);
  return () => flushListeners.delete(listener);
}

export function resetMarketTickBuffer() {
  buffers.clear();
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = null;
  seq = 0;
}

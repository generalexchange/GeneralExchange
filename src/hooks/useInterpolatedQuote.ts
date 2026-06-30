'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { PRICE_SMOOTH_ALPHA, TARGET_UI_FPS } from '@/config/marketFeedCache';
import { getMarketSnapshot, onMicroBatchFlush } from '@/lib/marketTickBuffer';

type SmoothQuote = {
  price: number;
  displayPrice: number;
  timestamp: number;
  seq: number;
};

const smoothBySymbol = new Map<string, SmoothQuote>();
const rafListeners = new Set<() => void>();
let rafId: number | null = null;
let lastRaf = 0;
const minFrameMs = 1000 / TARGET_UI_FPS;

function tickRaf(now: number) {
  rafId = null;
  if (now - lastRaf < minFrameMs) {
    rafId = requestAnimationFrame(tickRaf);
    return;
  }
  lastRaf = now;

  for (const [sym, s] of smoothBySymbol) {
    const snap = getMarketSnapshot(sym);
    if (snap && snap.seq !== s.seq) {
      s.price = snap.lastPrice;
      s.timestamp = snap.timestamp;
      s.seq = snap.seq;
    }
    const delta = s.price - s.displayPrice;
    if (Math.abs(delta) > 0.0001) {
      s.displayPrice += delta * PRICE_SMOOTH_ALPHA;
    } else {
      s.displayPrice = s.price;
    }
  }

  for (const fn of rafListeners) fn();
  if (rafListeners.size) rafId = requestAnimationFrame(tickRaf);
}

function ensureRaf() {
  if (rafId == null) rafId = requestAnimationFrame(tickRaf);
}

function subscribeSmooth(fn: () => void) {
  rafListeners.add(fn);
  ensureRaf();
  return () => {
    rafListeners.delete(fn);
    if (!rafListeners.size && rafId != null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };
}

function getSmooth(symbol: string): SmoothQuote {
  const sym = symbol.toUpperCase();
  let s = smoothBySymbol.get(sym);
  if (!s) {
    const snap = getMarketSnapshot(sym);
    const p = snap?.lastPrice ?? 0;
    s = { price: p, displayPrice: p, timestamp: snap?.timestamp ?? 0, seq: snap?.seq ?? 0 };
    smoothBySymbol.set(sym, s);
  }
  return s;
}

/** Frame-smoothed quote — React updates at rAF (~60 FPS), not per IBKR tick. */
export function useInterpolatedQuote(symbol: string) {
  useEffect(() => {
    return onMicroBatchFlush((snaps) => {
      for (const snap of snaps) {
        if (snap.symbol !== symbol.toUpperCase()) continue;
        const s = getSmooth(snap.symbol);
        s.price = snap.lastPrice;
        s.timestamp = snap.timestamp;
        s.seq = snap.seq;
      }
    });
  }, [symbol]);

  return useSyncExternalStore(
    subscribeSmooth,
    () => getSmooth(symbol),
    () => getSmooth(symbol),
  );
}

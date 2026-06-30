'use client';

import { useEffect, useRef } from 'react';
import { MarketSignalAnalyser } from '@gx/analytics';
import { getMarketState, subscribeMarketState } from '@/store/marketState';

export type PulseClockSample = ReturnType<MarketSignalAnalyser['sample']> & {
  displayPrice: number;
  rawPrice: number;
};

const analysers = new Map<string, MarketSignalAnalyser>();

function getAnalyser(symbol: string): MarketSignalAnalyser {
  let a = analysers.get(symbol);
  if (!a) {
    a = new MarketSignalAnalyser(96);
    analysers.set(symbol, a);
  }
  return a;
}

/** rAF-interpolated tick stream → analyser sample ref (no per-frame React state). */
export function usePulseClock(symbol: string) {
  const sampleRef = useRef<PulseClockSample | null>(null);
  const interp = useRef({ from: 0, to: 0, at: 0, lastSize: 0 });
  const lastStorePrice = useRef(0);

  useEffect(() => {
    const analyser = getAnalyser(symbol);
    let raf = 0;

    const onStore = () => {
      const q = getMarketState().quotes[symbol];
      if (!q?.price || q.price <= 0) return;
      if (q.price === lastStorePrice.current) return;
      const now = performance.now();
      interp.current = {
        from: interp.current.to > 0 ? interp.current.to : q.price,
        to: q.price,
        at: now,
        lastSize: q.volume ?? 0,
      };
      lastStorePrice.current = q.price;
      analyser.push(q.price, q.volume ?? 0);
    };

    onStore();
    const unsub = subscribeMarketState(onStore);

    const frame = (now: number) => {
      const { from, to, at, lastSize } = interp.current;
      const span = 280;
      const t = at > 0 ? Math.min(1, (now - at) / span) : 1;
      const display = from + (to - from) * t;
      if (to > 0 && t < 1) analyser.push(display, lastSize * 0.5);
      else analyser.idle();

      const displayPrice = display > 0 ? display : to;
      if (displayPrice > 0) {
        sampleRef.current = {
          ...analyser.sample(),
          displayPrice,
          rawPrice: to > 0 ? to : displayPrice,
        };
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      unsub();
      cancelAnimationFrame(raf);
    };
  }, [symbol]);

  return sampleRef;
}

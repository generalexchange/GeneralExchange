'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { OptionRow } from '@/components/dashboard/terminal/terminalData';

export type GreekSnapshot = {
  t: number;
  delta: number;
  theta: number;
  vega: number;
};

export type GreekSeriesLive = {
  name: 'delta' | 'theta' | 'vega';
  live: number[];
  predicted: number[];
  divergence: 'none' | 'moderate' | 'signal' | 'extreme';
};

const MAX_POINTS = 24;

function divergence(live: number[], predicted: number[]): GreekSeriesLive['divergence'] {
  if (live.length < 3 || predicted.length < 3) return 'none';
  const l = live[live.length - 1];
  const p = predicted[predicted.length - 1];
  const span = Math.max(Math.abs(p), 0.01);
  const ratio = Math.abs(l - p) / span;
  if (ratio > 0.35) return 'extreme';
  if (ratio > 0.18) return 'moderate';
  if (ratio > 0.08) return 'signal';
  return 'none';
}

/** Rolling ATM greek history from live IBKR chain polls — no mock paths. */
export function useGreekHistory(symbol: string, atm: OptionRow | undefined) {
  const bufferRef = useRef<GreekSnapshot[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!atm) return;
    const snap: GreekSnapshot = {
      t: Date.now(),
      delta: atm.delta,
      theta: atm.theta,
      vega: atm.vega,
    };
    const buf = bufferRef.current;
    const last = buf[buf.length - 1];
    if (!last || Math.abs(last.delta - snap.delta) > 1e-6 || Date.now() - last.t > 1500) {
      buf.push(snap);
      if (buf.length > MAX_POINTS) buf.shift();
      setTick((n) => n + 1);
    }
  }, [atm, atm?.delta, atm?.theta, atm?.vega]);

  useEffect(() => {
    bufferRef.current = [];
    setTick(0);
  }, [symbol]);

  const series = useMemo((): GreekSeriesLive[] => {
    const buf = bufferRef.current;
    if (buf.length < 2) return [];

    const deltas = buf.map((b) => b.delta);
    const thetas = buf.map((b) => b.theta);
    const vegas = buf.map((b) => b.vega);

    const ema = (vals: number[], alpha = 0.35) => {
      const out: number[] = [];
      let e = vals[0];
      for (const v of vals) {
        e = alpha * v + (1 - alpha) * e;
        out.push(e);
      }
      return out;
    };

    const predDelta = ema(deltas);
    const predTheta = ema(thetas);
    const predVega = ema(vegas);

    return [
      { name: 'delta', live: deltas, predicted: predDelta, divergence: divergence(deltas, predDelta) },
      { name: 'theta', live: thetas, predicted: predTheta, divergence: divergence(thetas, predTheta) },
      { name: 'vega', live: vegas, predicted: predVega, divergence: divergence(vegas, predVega) },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tick drives recompute
  }, [tick, atm]);

  return { series, hasHistory: bufferRef.current.length >= 2 };
}

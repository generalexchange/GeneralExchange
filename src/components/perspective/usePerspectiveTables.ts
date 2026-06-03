/**
 * Perspective table lifecycle hook.
 *
 * Spins up a Perspective WASM worker and two tables — a tick ring buffer and a
 * keyed options-chain table — only while Advanced Analytics mode is active, and
 * tears everything down when it deactivates. Tables hold the live data in the
 * WASM columnar store; the viewer reads from them directly.
 *
 * This module must only ever be imported from a client component loaded with
 * ssr:false (the WASM runtime is browser-only).
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import type { Client, Table } from '@finos/perspective';

const TICK_LIMIT = 5000;

const TICK_SCHEMA = {
  time: 'string',
  symbol: 'string',
  price: 'float',
  size: 'integer',
  side: 'string',
} as const;

const CHAIN_SCHEMA = {
  id: 'string',
  type: 'string',
  strike: 'float',
  bid: 'float',
  ask: 'float',
  mid: 'float',
  volume: 'integer',
  openInterest: 'integer',
  iv: 'float',
  ivRank: 'float',
  delta: 'float',
  gamma: 'float',
  theta: 'float',
  vega: 'float',
  moneyness: 'string',
} as const;

export interface TickRow {
  time: string;
  symbol: string;
  price: number;
  size: number;
  side: string;
}

export interface ChainRow {
  id: string;
  type: string;
  strike: number;
  bid: number;
  ask: number;
  mid: number;
  volume: number;
  openInterest: number;
  iv: number;
  ivRank: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  moneyness: string;
}

export interface PerspectiveTables {
  ready: boolean;
  error: string | null;
  tickTable: Table | null;
  chainTable: Table | null;
  updateTicks: (rows: TickRow[]) => void;
  updateChain: (rows: ChainRow[]) => void;
}

export function usePerspectiveTables(active: boolean): PerspectiveTables {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<Client | null>(null);
  const tickRef = useRef<Table | null>(null);
  const chainRef = useRef<Table | null>(null);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    (async () => {
      try {
        const perspective = (await import('@finos/perspective')).default;
        const client = await perspective.worker();
        if (cancelled) return;
        clientRef.current = client;
        // Schema objects are accepted at runtime; cast to satisfy the data-input type.
        const tick = await client.table(TICK_SCHEMA as unknown as Record<string, unknown[]>, { limit: TICK_LIMIT });
        const chain = await client.table(CHAIN_SCHEMA as unknown as Record<string, unknown[]>, { index: 'id' });
        if (cancelled) {
          await tick.delete();
          await chain.delete();
          return;
        }
        tickRef.current = tick;
        chainRef.current = chain;
        setReady(true);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to initialize Perspective');
      }
    })();

    return () => {
      cancelled = true;
      setReady(false);
      const t = tickRef.current;
      const c = chainRef.current;
      tickRef.current = null;
      chainRef.current = null;
      clientRef.current = null;
      void t?.delete().catch(() => undefined);
      void c?.delete().catch(() => undefined);
    };
  }, [active]);

  return {
    ready,
    error,
    tickTable: tickRef.current,
    chainTable: chainRef.current,
    updateTicks: (rows) => {
      void tickRef.current?.update(rows as unknown as Record<string, unknown>[]).catch(() => undefined);
    },
    updateChain: (rows) => {
      void chainRef.current?.update(rows as unknown as Record<string, unknown>[]).catch(() => undefined);
    },
  };
}

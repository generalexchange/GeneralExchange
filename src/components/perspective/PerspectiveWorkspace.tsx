/**
 * Advanced Analytics — Apache Perspective workspace.
 *
 * Replaces the dashboard center panel when Advanced Analytics mode is active.
 * The user can build their own pivots, cross-tabs, and streaming aggregations
 * over the live options-chain and tick tables. The viewer config is persisted to
 * localStorage and restored on return.
 *
 * This component is the ONLY place Perspective is imported, and it is always
 * loaded via next/dynamic with ssr:false so the large WASM binary never lands in
 * the initial bundle and never executes on the server.
 */

'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import '@finos/perspective-viewer';
import '@finos/perspective-viewer-datagrid';
import '@finos/perspective-viewer-d3fc';
import '@finos/perspective-viewer/dist/css/pro-dark.css';
import type { HTMLPerspectiveViewerElement } from '@finos/perspective-viewer';
import { usePerspectiveTables, type ChainRow, type TickRow } from './usePerspectiveTables';

const STORAGE_KEY = 'ge.perspective.config.v1';
type TableKind = 'chain' | 'ticks';

export default function PerspectiveWorkspace({
  symbol,
  chainRows,
  basePrice,
}: {
  symbol: string;
  chainRows: ChainRow[];
  basePrice: number;
}) {
  const { ready, error, tickTable, chainTable, updateChain, updateTicks } = usePerspectiveTables(true);
  const viewerRef = useRef<HTMLPerspectiveViewerElement | null>(null);
  const [kind, setKind] = useState<TableKind>('chain');
  const loadedKind = useRef<TableKind | null>(null);
  const priceRef = useRef(basePrice);

  // Push the current chain snapshot into the keyed chain table.
  useEffect(() => {
    if (ready) updateChain(chainRows);
  }, [ready, chainRows, updateChain]);

  // Simulate a live tick stream while active (replaced by the tick WebSocket).
  useEffect(() => {
    if (!ready) return;
    priceRef.current = basePrice;
    const id = window.setInterval(() => {
      const rows: TickRow[] = [];
      for (let i = 0; i < 8; i++) {
        priceRef.current = Math.max(0.5, priceRef.current * (1 + (Math.random() - 0.5) * 0.0008));
        rows.push({
          time: new Date().toISOString(),
          symbol,
          price: +priceRef.current.toFixed(2),
          size: Math.round(1 + Math.random() * 500),
          side: Math.random() > 0.5 ? 'BUY' : 'SELL',
        });
      }
      updateTicks(rows);
    }, 1000);
    return () => window.clearInterval(id);
  }, [ready, symbol, basePrice, updateTicks]);

  // Load the selected table into the viewer and restore persisted config.
  const loadTable = useCallback(
    async (next: TableKind) => {
      const viewer = viewerRef.current;
      const table = next === 'chain' ? chainTable : tickTable;
      if (!viewer || !table) return;
      await viewer.load(table);
      loadedKind.current = next;
      const saved = typeof window !== 'undefined' ? window.localStorage.getItem(`${STORAGE_KEY}.${next}`) : null;
      if (saved) {
        try {
          await viewer.restore(JSON.parse(saved));
        } catch {
          /* ignore malformed persisted config */
        }
      } else {
        await viewer.restore({ plugin: 'Datagrid' });
      }
    },
    [chainTable, tickTable],
  );

  useEffect(() => {
    if (ready) void loadTable(kind);
  }, [ready, kind, loadTable]);

  // Persist the viewer configuration on unmount. We intentionally read the live
  // ref at teardown time (the latest config), so the ref-in-cleanup rule is
  // deliberately suppressed here.
  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const viewer = viewerRef.current;
      const k = loadedKind.current;
      if (!viewer || !k) return;
      void viewer
        .save()
        .then((cfg) => window.localStorage.setItem(`${STORAGE_KEY}.${k}`, JSON.stringify(cfg)))
        .catch(() => undefined);
    };
  }, []);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center">
        <div>
          <p className="font-mono text-xs text-rose-400">Perspective failed to initialize</p>
          <p className="mt-1 font-mono text-[10px] text-zinc-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-white/[0.08] bg-white/[0.03] px-3 py-1.5">
        <span className="sc-serif text-[10px] tracking-[0.16em] text-zinc-400">ADVANCED ANALYTICS · PERSPECTIVE</span>
        <div className="flex items-center gap-1">
          {(['chain', 'ticks'] as TableKind[]).map((k) => (
            <button
              key={k}
              onClick={() => setKind(k)}
              className={`rounded px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide transition-colors ${
                kind === k ? 'bg-tan/15 text-tan' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {k === 'chain' ? 'Options Chain' : 'Tick Stream'}
            </button>
          ))}
        </div>
      </div>
      <div className="relative min-h-0 flex-1">
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="animate-pulse font-mono text-[11px] text-zinc-500">loading WASM engine…</span>
          </div>
        )}
        <perspective-viewer ref={viewerRef} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
}

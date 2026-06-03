/**
 * Position analysis overlay.
 *
 * Opened when a strike is selected in the options chain. Composes the three
 * Visx risk visuals — payoff at expiration, the 2D scenario grid, and the
 * volatility smile for the expiration — from the selected contract using the
 * shared Black-Scholes service.
 */

'use client';

import React, { useMemo } from 'react';
import { X } from 'lucide-react';
import { PayoffDiagram } from './PayoffDiagram';
import { ScenarioGrid } from './ScenarioGrid';
import { VolatilitySmile, type SmilePoint } from './VolatilitySmile';
import type { PositionSpec } from './optionsMath';
import type { OptionRow } from '../dashboard/terminal/terminalData';

const EXP_DAYS = 18;

export function PositionAnalysis({
  row,
  chain,
  spot,
  symbol,
  onClose,
}: {
  row: OptionRow | null;
  chain: OptionRow[];
  spot: number;
  symbol: string;
  onClose: () => void;
}) {
  const spec = useMemo<PositionSpec | null>(() => {
    if (!row) return null;
    return {
      strike: row.strike,
      type: row.type,
      spot,
      iv: row.iv / 100,
      tDays: EXP_DAYS,
      entryPremium: row.mid,
      qty: 1,
    };
  }, [row, spot]);

  const smile = useMemo<SmilePoint[]>(() => {
    const byStrike = new Map<number, number>();
    for (const r of chain) {
      const isOtm = r.strike < spot ? r.type === 'PUT' : r.type === 'CALL';
      if (isOtm || !byStrike.has(r.strike)) byStrike.set(r.strike, r.iv);
    }
    return [...byStrike.entries()].map(([strike, iv]) => ({ strike, iv })).sort((a, b) => a.strike - b.strike);
  }, [chain, spot]);

  if (!row || !spec) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-tan/25 bg-charcoal shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-white/[0.08] bg-white/[0.03] px-4 py-2.5">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-sm text-neutral-100">{symbol}</span>
            <span className="font-mono text-xs text-tan">
              {row.strike} {row.type}
            </span>
            <span className="font-mono text-[11px] text-zinc-500">
              {EXP_DAYS}d · mid {row.mid.toFixed(2)} · IV {row.iv.toFixed(1)}% · Δ {row.delta.toFixed(2)}
            </span>
          </div>
          <button onClick={onClose} className="rounded p-1 text-zinc-400 transition-colors hover:text-zinc-100">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-y-auto p-3 lg:grid-cols-2">
          <section className="flex flex-col">
            <h4 className="sc-serif mb-1 px-1 text-[10px] tracking-[0.16em] text-zinc-400">PAYOFF AT EXPIRATION</h4>
            <div className="h-[240px] rounded-md border border-white/[0.08] bg-charcoal/70">
              <PayoffDiagram spec={spec} />
            </div>
          </section>
          <section className="flex flex-col">
            <h4 className="sc-serif mb-1 px-1 text-[10px] tracking-[0.16em] text-zinc-400">SCENARIO GRID · PRICE × IV</h4>
            <div className="h-[240px] rounded-md border border-white/[0.08] bg-charcoal/70">
              <ScenarioGrid spec={spec} />
            </div>
          </section>
          <section className="flex flex-col lg:col-span-2">
            <h4 className="sc-serif mb-1 px-1 text-[10px] tracking-[0.16em] text-zinc-400">VOLATILITY SMILE</h4>
            <div className="h-[200px] rounded-md border border-white/[0.08] bg-charcoal/70">
              <VolatilitySmile points={smile} spot={spot} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useMemo, useState } from 'react';
import type { OptionRow } from '@/components/dashboard/terminal/terminalData';
import { AnimatedPrice } from '@/components/dashboard/AnimatedPrice';
import { chainExpirations } from '@/lib/api/mapLiveData';

type LegendOptionsFeedProps = {
  symbol: string;
  spot: number;
  chain: OptionRow[];
  loading?: boolean;
  live?: boolean;
};

function nearMoneyRows(chain: OptionRow[], spot: number, count = 12) {
  const byStrike = new Map<number, { call?: OptionRow; put?: OptionRow }>();
  for (const row of chain) {
    const bucket = byStrike.get(row.strike) ?? {};
    if (row.type === 'CALL') bucket.call = row;
    else bucket.put = row;
    byStrike.set(row.strike, bucket);
  }
  return [...byStrike.entries()]
    .map(([strike, sides]) => ({ strike, ...sides }))
    .sort((a, b) => Math.abs(a.strike - spot) - Math.abs(b.strike - spot))
    .slice(0, count)
    .sort((a, b) => a.strike - b.strike);
}

export function LegendOptionsFeed({ symbol, spot, chain, loading, live }: LegendOptionsFeedProps) {
  const [side, setSide] = useState<'ALL' | 'CALL' | 'PUT'>('ALL');
  const expirations = useMemo(() => chainExpirations(chain), [chain]);
  const [expiry, setExpiry] = useState<string>('');

  const filteredChain = useMemo(() => {
    if (!expiry) return chain;
    return chain.filter((r) => r.id.includes(expiry));
  }, [chain, expiry]);

  const rows = useMemo(() => nearMoneyRows(filteredChain, spot, 14), [filteredChain, spot]);

  const activeExpiry = expiry || expirations[0] || '';

  return (
    <section className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0f1014]">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] px-4 py-3">
        <div>
          <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Options feed</h2>
          <p className="mt-0.5 text-[13px] text-zinc-300">
            {symbol} · near-the-money
            {live ? (
              <span className="ml-2 inline-flex items-center gap-1 text-emerald-400/90">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                live
              </span>
            ) : null}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {expirations.length > 0 ? (
            <select
              value={activeExpiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="rounded-md border border-white/[0.1] bg-black/30 px-2 py-1 font-mono text-[11px] text-tan outline-none"
            >
              {expirations.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          ) : null}
          {(['ALL', 'CALL', 'PUT'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setSide(f)}
              className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wide ${
                side === f ? 'bg-tan/20 text-tan' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      {loading && !chain.length ? (
        <p className="px-4 py-8 text-center font-mono text-[12px] text-zinc-600">Loading options chain…</p>
      ) : !chain.length ? (
        <p className="px-4 py-8 text-center font-mono text-[12px] text-zinc-600">
          Connect IBKR for live options quotes.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse font-mono text-[11px] tabular-nums">
            <thead>
              <tr className="border-b border-white/[0.06] text-[9px] uppercase tracking-wider text-zinc-600">
                {(side === 'ALL' || side === 'CALL') && (
                  <>
                    <th className="px-3 py-2 text-right font-medium text-moss/80">Call bid</th>
                    <th className="px-3 py-2 text-right font-medium text-moss">Call mid</th>
                    <th className="px-3 py-2 text-right font-medium text-moss/80">Call ask</th>
                  </>
                )}
                <th className="px-3 py-2 text-center font-medium text-zinc-400">Strike</th>
                {(side === 'ALL' || side === 'PUT') && (
                  <>
                    <th className="px-3 py-2 text-left font-medium text-rose-400/80">Put bid</th>
                    <th className="px-3 py-2 text-left font-medium text-rose-400">Put mid</th>
                    <th className="px-3 py-2 text-left font-medium text-rose-400/80">Put ask</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ strike, call, put }) => {
                const atm = spot > 0 && Math.abs(strike - spot) / spot < 0.008;
                return (
                  <tr
                    key={strike}
                    className={`border-b border-white/[0.04] transition-colors hover:bg-white/[0.03] ${
                      atm ? 'bg-tan/[0.06]' : ''
                    }`}
                  >
                    {(side === 'ALL' || side === 'CALL') && (
                      <>
                        <td className="px-3 py-2 text-right text-zinc-400">
                          {call ? <AnimatedPrice value={call.bid} prefix="$" decimals={2} durationMs={200} /> : '—'}
                        </td>
                        <td className="px-3 py-2 text-right font-semibold text-moss">
                          {call ? <AnimatedPrice value={call.mid} prefix="$" decimals={2} durationMs={200} /> : '—'}
                        </td>
                        <td className="px-3 py-2 text-right text-zinc-400">
                          {call ? <AnimatedPrice value={call.ask} prefix="$" decimals={2} durationMs={200} /> : '—'}
                        </td>
                      </>
                    )}
                    <td className="px-3 py-2 text-center text-[12px] font-semibold text-zinc-200">
                      ${strike.toFixed(strike % 1 === 0 ? 0 : 2)}
                    </td>
                    {(side === 'ALL' || side === 'PUT') && (
                      <>
                        <td className="px-3 py-2 text-left text-zinc-400">
                          {put ? <AnimatedPrice value={put.bid} prefix="$" decimals={2} durationMs={200} /> : '—'}
                        </td>
                        <td className="px-3 py-2 text-left font-semibold text-rose-400">
                          {put ? <AnimatedPrice value={put.mid} prefix="$" decimals={2} durationMs={200} /> : '—'}
                        </td>
                        <td className="px-3 py-2 text-left text-zinc-400">
                          {put ? <AnimatedPrice value={put.ask} prefix="$" decimals={2} durationMs={200} /> : '—'}
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

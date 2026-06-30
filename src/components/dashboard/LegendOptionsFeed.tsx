'use client';

import React, { useMemo, useState } from 'react';
import type { OptionRow } from '@/components/dashboard/terminal/terminalData';
import { chainExpirations } from '@/lib/api/mapLiveData';
import { analyzeChainRow } from '@/lib/options/chainAnalytics';

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

function fmtPrice(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function WinRateBar({ pct }: { pct: number }) {
  const width = Math.round(Math.min(100, Math.max(0, pct * 100)));
  const positive = pct >= 0.52;
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1.5 w-14 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${positive ? 'bg-[#00C805]' : 'bg-zinc-600'}`}
          style={{ width: `${width}%` }}
        />
      </div>
      <span className={`font-mono text-[9px] tabular-nums ${positive ? 'text-moss' : 'text-zinc-500'}`}>
        {(pct * 100).toFixed(0)}%
      </span>
    </div>
  );
}

function OptionSideCell({
  row,
  spot,
  seed,
  align,
}: {
  row?: OptionRow;
  spot: number;
  seed: number;
  align: 'left' | 'right';
}) {
  if (!row || row.mid <= 0) {
    return (
      <>
        <td className={`px-2 py-2 ${align === 'right' ? 'text-right' : 'text-left'} text-zinc-700`}>—</td>
        <td className={`px-2 py-2 ${align === 'right' ? 'text-right' : 'text-left'} text-zinc-700`}>—</td>
        <td className={`px-2 py-2 ${align === 'right' ? 'text-right' : 'text-left'} text-zinc-700`}>—</td>
        <td className={`px-2 py-2 ${align === 'right' ? 'text-right' : 'text-left'} text-zinc-700`}>—</td>
      </>
    );
  }
  const a = analyzeChainRow(row, spot, seed + row.strike);
  const textAlign = align === 'right' ? 'text-right' : 'text-left';
  const color = row.type === 'CALL' ? 'text-moss' : 'text-rose-400';
  return (
    <>
      <td className={`px-2 py-2 ${textAlign} tabular-nums text-zinc-400`}>${fmtPrice(row.bid)}</td>
      <td className={`px-2 py-2 ${textAlign} tabular-nums font-semibold ${color}`}>${fmtPrice(row.mid)}</td>
      <td className={`px-2 py-2 ${textAlign} tabular-nums text-zinc-400`}>${fmtPrice(row.ask)}</td>
      <td className={`px-2 py-2 ${textAlign}`}>
        <div className="space-y-0.5">
          <p className={`font-mono text-[9px] tabular-nums ${a.edgePct >= 0 ? 'text-tan' : 'text-zinc-500'}`}>
            BSM ${fmtPrice(a.bsmFair)}
          </p>
          <WinRateBar pct={a.mcProbProfit} />
        </div>
      </td>
    </>
  );
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
  const seed = symbol.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const activeExpiry = expiry || expirations[0] || '';

  const positiveCount = useMemo(() => {
    if (!spot || !filteredChain.length) return 0;
    return filteredChain.filter((r) => {
      if (r.mid <= 0) return false;
      return analyzeChainRow(r, spot, seed + r.strike).positiveWinSignal;
    }).length;
  }, [filteredChain, spot, seed]);

  return (
    <section className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0f1014]">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] px-4 py-3">
        <div>
          <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Options feed</h2>
          <p className="mt-0.5 text-[13px] text-zinc-300">
            {symbol} · IBKR live · BSM + Monte Carlo
            {live ? (
              <span className="ml-2 font-mono text-[10px] text-emerald-400/90">· connected</span>
            ) : null}
          </p>
          {positiveCount > 0 ? (
            <p className="mt-1 font-mono text-[9px] text-moss">
              {positiveCount} contracts with MC P(profit) ≥ 52% &amp; fair BSM edge
            </p>
          ) : null}
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
        <p className="px-4 py-8 text-center font-mono text-[12px] text-zinc-600">Loading IBKR options chain…</p>
      ) : !chain.length ? (
        <p className="px-4 py-8 text-center font-mono text-[12px] text-zinc-600">
          No options chain — check IBKR Gateway connection.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse font-mono text-[11px] tabular-nums">
            <thead>
              <tr className="border-b border-white/[0.06] text-[9px] uppercase tracking-wider text-zinc-600">
                {(side === 'ALL' || side === 'CALL') && (
                  <>
                    <th className="px-2 py-2 text-right font-medium text-moss/80">Bid</th>
                    <th className="px-2 py-2 text-right font-medium text-moss">Mid</th>
                    <th className="px-2 py-2 text-right font-medium text-moss/80">Ask</th>
                    <th className="px-2 py-2 text-right font-medium text-moss/70">BSM · MC win</th>
                  </>
                )}
                <th className="px-2 py-2 text-center font-medium text-zinc-400">Strike</th>
                {(side === 'ALL' || side === 'PUT') && (
                  <>
                    <th className="px-2 py-2 text-left font-medium text-rose-400/80">Bid</th>
                    <th className="px-2 py-2 text-left font-medium text-rose-400">Mid</th>
                    <th className="px-2 py-2 text-left font-medium text-rose-400/80">Ask</th>
                    <th className="px-2 py-2 text-left font-medium text-rose-400/70">BSM · MC win</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ strike, call, put }) => {
                const atm = spot > 0 && Math.abs(strike - spot) / spot < 0.008;
                const callSignal = call && spot > 0 && analyzeChainRow(call, spot, seed + call.strike).positiveWinSignal;
                const putSignal = put && spot > 0 && analyzeChainRow(put, spot, seed + put.strike).positiveWinSignal;
                return (
                  <tr
                    key={strike}
                    className={`border-b border-white/[0.04] hover:bg-white/[0.03] ${
                      atm ? 'bg-tan/[0.06]' : callSignal || putSignal ? 'bg-emerald-950/20' : ''
                    }`}
                  >
                    {(side === 'ALL' || side === 'CALL') && (
                      <OptionSideCell row={call} spot={spot} seed={seed} align="right" />
                    )}
                    <td className="px-2 py-2 text-center text-[12px] font-semibold text-zinc-200">
                      ${strike.toFixed(strike % 1 === 0 ? 0 : 2)}
                    </td>
                    {(side === 'ALL' || side === 'PUT') && (
                      <OptionSideCell row={put} spot={spot} seed={seed} align="left" />
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

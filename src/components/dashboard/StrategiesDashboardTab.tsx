'use client';

import React from 'react';
import { GitBranch, Play, ShieldCheck } from 'lucide-react';

type StrategyRow = {
  id: string;
  name: string;
  projectId: string;
  leanVersion: string;
  lastBacktest: string;
  sharpe: number;
  status: 'live' | 'research' | 'archived';
  nodes: string;
};

const MOCK_STRATEGIES: StrategyRow[] = [
  {
    id: '1',
    name: 'PairsMeanReversionQC',
    projectId: 'PRJ-88421',
    leanVersion: '2.5.0',
    lastBacktest: '2026-04-12 06:14 UTC',
    sharpe: 1.42,
    status: 'research',
    nodes: 'MI325X · 4 vCPU',
  },
  {
    id: '2',
    name: 'VolTargetEquityETF',
    projectId: 'PRJ-77102',
    leanVersion: '2.5.0',
    lastBacktest: '2026-04-11 19:40 UTC',
    sharpe: 0.98,
    status: 'live',
    nodes: 'MI325X · 8 vCPU',
  },
  {
    id: '3',
    name: 'FuturesMomentumRoll',
    projectId: 'PRJ-66091',
    leanVersion: '2.4.1',
    lastBacktest: '2026-04-09 14:22 UTC',
    sharpe: 0.76,
    status: 'research',
    nodes: 'CPU · 2 vCPU',
  },
  {
    id: '4',
    name: 'CreditSpreadScanner',
    projectId: 'PRJ-55188',
    leanVersion: '2.5.0',
    lastBacktest: '2026-04-08 11:05 UTC',
    sharpe: 1.05,
    status: 'archived',
    nodes: '—',
  },
];

function statusPill(status: StrategyRow['status']) {
  if (status === 'live')
    return 'bg-emerald-500/15 text-emerald-300/95 border-emerald-500/35';
  if (status === 'research') return 'bg-amber-500/12 text-amber-200/90 border-amber-500/30';
  return 'bg-zinc-500/10 text-zinc-500 border-zinc-600/35';
}

export function StrategiesDashboardTab() {
  return (
    <div className="space-y-8">
      <header className="border-b border-white/[0.06] pb-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-institutional-green/90 mb-2">
          QuantConnect · Lean
        </p>
        <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">Strategies</h1>
        <p className="text-sm text-zinc-500 mt-2 max-w-3xl leading-relaxed">
          Bound projects, Lean versions, and last cloud backtest fingerprints. Wire this table to your organization API
          when available—mock rows only.
        </p>
      </header>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-sm border border-institutional-green/40 bg-institutional-green/15 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-tan hover:bg-institutional-green/25 transition-colors"
        >
          <Play size={14} strokeWidth={2} aria-hidden />
          New strategy
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-sm border border-white/[0.1] bg-white/[0.03] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-300 hover:border-white/20 transition-colors"
        >
          <GitBranch size={14} strokeWidth={2} aria-hidden />
          Import from Git
        </button>
      </div>

      <section
        className="rounded-2xl border border-white/[0.07] bg-[#090909]/80 backdrop-blur-xl overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]"
        aria-labelledby="strategies-table-title"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-5 py-4 border-b border-white/[0.06]">
          <div>
            <h2 id="strategies-table-title" className="text-sm font-semibold text-white">
              Project registry
            </h2>
            <p className="text-[11px] text-zinc-600 mt-0.5">Sortable columns and filters ship with API integration.</p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-zinc-500">
            <ShieldCheck size={14} className="text-tan/70 shrink-0" aria-hidden />
            Policy attestation: mock OK
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[720px]">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] uppercase tracking-wider text-zinc-500">
                <th className="px-4 sm:px-5 py-3 font-semibold">Strategy</th>
                <th className="px-4 py-3 font-semibold">Project</th>
                <th className="px-4 py-3 font-semibold">Lean</th>
                <th className="px-4 py-3 font-semibold">Last backtest</th>
                <th className="px-4 py-3 font-semibold text-right">Sharpe</th>
                <th className="px-4 sm:px-5 py-3 font-semibold">Status</th>
                <th className="px-4 sm:px-5 py-3 font-semibold">Compute</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_STRATEGIES.map((row) => (
                <tr key={row.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 sm:px-5 py-3.5 font-medium text-zinc-100">{row.name}</td>
                  <td className="px-4 py-3.5 text-zinc-500 font-mono text-xs">{row.projectId}</td>
                  <td className="px-4 py-3.5 text-zinc-400">{row.leanVersion}</td>
                  <td className="px-4 py-3.5 text-zinc-500 text-xs tabular-nums">{row.lastBacktest}</td>
                  <td className="px-4 py-3.5 text-right tabular-nums text-zinc-300">{row.sharpe.toFixed(2)}</td>
                  <td className="px-4 sm:px-5 py-3.5">
                    <span className={`inline-block text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded border ${statusPill(row.status)}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 sm:px-5 py-3.5 text-xs text-zinc-500">{row.nodes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

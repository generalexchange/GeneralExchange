/**
 * Backtest — the crown jewel. Full-page experience: strategy selection,
 * parameter configuration, run controls with a date-by-date progress
 * indicator, the complete results surface, and the trade replay viewer.
 *
 * Today the run is simulated against deterministic mock data. The config shape
 * is the exact payload for POST /v1/backtest/run; results map to backtest_runs
 * + backtest_trades in ClickHouse.
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Play, Square, Download, Share2, Save, GitFork } from 'lucide-react';
import { ProfileMenu } from '../components/ProfileMenu';
import {
  MetricsTable,
  RegimeBreakdown,
  Distribution,
  ReplayViewer,
  Panel,
} from '../components/backtest/panels';
import { PnLCurve } from '../components/analytics/PnLCurve';
import { MonthlyReturnHeatmap } from '../components/charts/MonthlyReturnHeatmap';
import { BacktestTradesGrid } from '../components/grids/BacktestTradesGrid';
import {
  DEFAULT_CONFIG,
  STRATEGIES,
  generateRun,
  type BacktestConfig,
  type BacktestRun,
  type PositionSizing,
  type SlippageModel,
} from '../components/backtest/backtestData';

type Status = 'idle' | 'running' | 'complete';

const field = 'w-full rounded border border-white/[0.1] bg-white/[0.03] px-2 py-1.5 text-[11px] text-neutral-100 outline-none focus:border-brass/40';
const label = 'text-[9px] uppercase tracking-wider text-zinc-500';

function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-tan/20 bg-charcoal/95 backdrop-blur-xl">
      <div className="mx-auto flex h-12 max-w-[1800px] items-center justify-between px-3 sm:px-5">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-display text-base tracking-tight text-neutral-100">general.exchange</Link>
          <nav className="hidden items-center gap-1 md:flex">
            {[['Dashboard', '/dashboard'], ['Backtest', '/backspace'], ['Options', '/options'], ['Risk', '/risk-management']].map(([l, h]) => (
              <Link key={l} href={h} className={`rounded px-2.5 py-1 text-[12px] tracking-wide transition-colors ${l === 'Backtest' ? 'bg-white/[0.06] text-tan' : 'text-zinc-400 hover:text-zinc-100'}`}>{l}</Link>
            ))}
          </nav>
        </div>
        <ProfileMenu />
      </div>
    </header>
  );
}

export const Backspace: React.FC = () => {
  const [config, setConfig] = useState<BacktestConfig>(DEFAULT_CONFIG);
  const [status, setStatus] = useState<Status>('idle');
  const [progress, setProgress] = useState(0);
  const [run, setRun] = useState<BacktestRun | null>(null);
  const timer = useRef<number | null>(null);

  const set = <K extends keyof BacktestConfig>(k: K, v: BacktestConfig[K]) => setConfig((c) => ({ ...c, [k]: v }));

  const selectStrategy = (id: string) => {
    const s = STRATEGIES.find((x) => x.id === id);
    setConfig((c) => ({ ...c, strategyId: id, symbol: s?.symbol ?? c.symbol }));
  };

  const startRun = () => {
    setStatus('running');
    setProgress(0);
    const startTs = Date.now();
    const DURATION = 2400;
    timer.current = window.setInterval(() => {
      const p = Math.min(1, (Date.now() - startTs) / DURATION);
      setProgress(p);
      if (p >= 1) {
        if (timer.current) window.clearInterval(timer.current);
        setRun(generateRun(config));
        setStatus('complete');
      }
    }, 60);
  };

  const cancelRun = () => {
    if (timer.current) window.clearInterval(timer.current);
    setStatus(run ? 'complete' : 'idle');
    setProgress(0);
  };

  useEffect(() => () => { if (timer.current) window.clearInterval(timer.current); }, []);

  const currentDate = (() => {
    const s = new Date(config.startDate).getTime();
    const e = new Date(config.endDate).getTime();
    return new Date(s + (e - s) * progress).toISOString().slice(0, 10);
  })();

  return (
    <div className="min-h-screen bg-charcoal text-zinc-100">
      <Header />
      <main className="mx-auto max-w-[1800px] px-2 py-3 sm:px-3">
        <div className="flex flex-col gap-3 xl:flex-row">
          {/* ---------------- config column ---------------- */}
          <div className="flex w-full flex-col gap-3 xl:w-80 xl:shrink-0">
            <Panel title="Strategy">
              <div className="max-h-56 overflow-auto">
                <ul className="divide-y divide-white/[0.05]">
                  {STRATEGIES.map((s) => (
                    <li key={s.id}>
                      <button
                        onClick={() => selectStrategy(s.id)}
                        className={`flex w-full items-center justify-between px-3 py-2 text-left transition-colors hover:bg-white/[0.04] ${config.strategyId === s.id ? 'bg-brass/[0.08]' : ''}`}
                      >
                        <div className="min-w-0">
                          <p className={`text-[12px] ${config.strategyId === s.id ? 'text-tan' : 'text-neutral-100'}`}>{s.name}</p>
                          <p className="font-mono text-[9px] tabular text-zinc-500">{s.symbol} · {s.structure.replace('_', ' ').toLowerCase()} · {s.version}</p>
                        </div>
                        <span className="shrink-0 font-mono text-[10px] tabular text-moss">SR {s.sharpe}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t border-white/[0.08] p-2">
                <button className="flex w-full items-center justify-center gap-1.5 rounded border border-white/10 py-1.5 text-[10px] text-zinc-400 hover:border-brass/40 hover:text-tan">
                  <GitFork className="h-3 w-3" /> Build new strategy
                </button>
              </div>
            </Panel>

            <Panel title="Parameters">
              <div className="grid grid-cols-2 gap-2 p-3">
                <div className="col-span-2">
                  <p className={label}>Symbol</p>
                  <input className={field} value={config.symbol} onChange={(e) => set('symbol', e.target.value.toUpperCase())} />
                </div>
                <div>
                  <p className={label}>Start</p>
                  <input type="date" className={field} value={config.startDate} onChange={(e) => set('startDate', e.target.value)} />
                </div>
                <div>
                  <p className={label}>End</p>
                  <input type="date" className={field} value={config.endDate} onChange={(e) => set('endDate', e.target.value)} />
                </div>
                <div className="col-span-2">
                  <p className={label}>Position sizing</p>
                  <select className={field} value={config.sizing} onChange={(e) => set('sizing', e.target.value as PositionSizing)}>
                    <option value="FIXED_DOLLAR">Fixed dollar</option>
                    <option value="PERCENT_PORTFOLIO">% of portfolio</option>
                    <option value="KELLY">Kelly fraction</option>
                  </select>
                </div>
                <div>
                  <p className={label}>{config.sizing === 'FIXED_DOLLAR' ? 'Dollars' : config.sizing === 'KELLY' ? 'Kelly ×' : 'Percent'}</p>
                  <input type="number" className={field} value={config.sizingValue} onChange={(e) => set('sizingValue', +e.target.value)} />
                </div>
                <div>
                  <p className={label}>Max loss / trade</p>
                  <input type="number" className={field} value={config.maxLossPerTrade} onChange={(e) => set('maxLossPerTrade', +e.target.value)} />
                </div>
                <div>
                  <p className={label}>Max open</p>
                  <input type="number" className={field} value={config.maxOpenPositions} onChange={(e) => set('maxOpenPositions', +e.target.value)} />
                </div>
                <div>
                  <p className={label}>Commission / ct</p>
                  <input type="number" step="0.01" className={field} value={config.commissionPerContract} onChange={(e) => set('commissionPerContract', +e.target.value)} />
                </div>
                <div className="col-span-2">
                  <p className={label}>Slippage model</p>
                  <select className={field} value={config.slippage} onChange={(e) => set('slippage', e.target.value as SlippageModel)}>
                    <option value="ZERO">Zero</option>
                    <option value="SPREAD">Estimated from spread</option>
                    <option value="CUSTOM_BPS">Custom basis points</option>
                  </select>
                </div>
                {config.slippage === 'CUSTOM_BPS' && (
                  <div className="col-span-2">
                    <p className={label}>Slippage (bps)</p>
                    <input type="number" className={field} value={config.slippageBps} onChange={(e) => set('slippageBps', +e.target.value)} />
                  </div>
                )}
                <label className="col-span-2 flex cursor-pointer items-center justify-between rounded border border-white/[0.08] bg-white/[0.02] px-2 py-1.5">
                  <span className="text-[10px] text-zinc-300">Walk-forward validation</span>
                  <input type="checkbox" checked={config.walkForward} onChange={(e) => set('walkForward', e.target.checked)} className="accent-[#C9A96E]" />
                </label>
                <div className="col-span-2">
                  <p className={label}>Random seed</p>
                  <input type="number" className={field} value={config.seed} onChange={(e) => set('seed', +e.target.value)} />
                </div>
              </div>
            </Panel>

            {/* run controls */}
            <div className="rounded-md border border-white/[0.08] bg-charcoal/70 p-3">
              {status !== 'running' ? (
                <button onClick={startRun} className="flex w-full items-center justify-center gap-2 rounded-md border border-brass bg-black py-2.5 text-[12px] font-semibold tracking-wide text-tan transition-colors hover:bg-neutral-950 hover:text-brass">
                  <Play className="h-3.5 w-3.5" /> Run backtest
                </button>
              ) : (
                <button onClick={cancelRun} className="flex w-full items-center justify-center gap-2 rounded-md border border-rose-400/60 bg-black py-2.5 text-[12px] font-semibold tracking-wide text-rose-400 transition-colors hover:bg-neutral-950">
                  <Square className="h-3.5 w-3.5" /> Cancel
                </button>
              )}
              {status === 'running' && (
                <div className="mt-3">
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div className="h-full rounded-full bg-tan transition-[width] duration-75" style={{ width: `${progress * 100}%` }} />
                  </div>
                  <p className="mt-1.5 flex items-center justify-between font-mono text-[9px] tabular text-zinc-500">
                    <span>processing {currentDate}</span>
                    <span>{(progress * 100).toFixed(0)}%</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ---------------- results column ---------------- */}
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            {status === 'idle' && !run && (
              <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-md border border-dashed border-white/[0.1] text-center">
                <p className="font-display text-2xl text-neutral-200">The proving ground</p>
                <p className="mt-2 max-w-md text-sm text-zinc-500">
                  Configure a strategy and parameters, then run it against history. Every result is reproducible from its run id.
                </p>
              </div>
            )}

            {run && (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-white/[0.08] bg-charcoal/70 px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-[13px] text-neutral-100">{run.strategyName} <span className="text-zinc-500">·</span> {run.config.symbol}</p>
                    <p className="font-mono text-[9px] tabular text-zinc-500">
                      {run.config.startDate} → {run.config.endDate} · run {run.runId} · seed {run.config.seed}{run.config.walkForward ? ' · walk-forward' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[
                      [Download, 'CSV'],
                      [Save, 'Store'],
                      [Share2, 'Share'],
                    ].map(([Icon, txt], idx) => {
                      const I = Icon as typeof Download;
                      return (
                        <button key={idx} className="flex items-center gap-1 rounded border border-white/10 px-2 py-1 text-[10px] text-zinc-400 hover:border-brass/40 hover:text-tan">
                          <I className="h-3 w-3" /> {txt as string}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Panel title="EQUITY · CUMULATIVE PnL & DRAWDOWN (brush to zoom)" className="h-[300px]">
                  <PnLCurve equity={run.equity} />
                </Panel>
                <MetricsTable metrics={run.metrics} />

                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                  <Panel title="MONTHLY RETURNS" className="h-[300px]">
                    <MonthlyReturnHeatmap cells={run.monthly} />
                  </Panel>
                  <RegimeBreakdown regimePerf={run.regimePerf} />
                </div>

                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                  <Distribution title="Trade return distribution" buckets={run.returnsDist} />
                  <Distribution title="Holding period distribution" buckets={run.holdingDist} accent="#3f9d57" />
                </div>

                <Panel title={`ALL TRADES · ${run.trades.length}`} className="h-[360px]">
                  <BacktestTradesGrid trades={run.trades} />
                </Panel>

                <ReplayViewer trades={run.trades} />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

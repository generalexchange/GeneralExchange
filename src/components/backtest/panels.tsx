/**
 * Backtest result panels — equity/drawdown, metrics, monthly heatmap, regime
 * breakdown, distributions, top trades, and the trade replay viewer.
 */

'use client';

import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type {
  Metrics,
  MonthlyCell,
  RegimePerf,
  Bucket,
  BTTrade,
  EquityPoint,
} from './backtestData';

const MOSS = '#3f9d57';
const ROSE = '#f47272';
const BRASS = '#C9A96E';

const fmt = (n: number, d = 2) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const signed = (n: number, d = 0) => `${n >= 0 ? '+' : ''}${fmt(n, d)}`;
const usd = (n: number) => `${n < 0 ? '-' : ''}$${fmt(Math.abs(n), 0)}`;
const pnlColor = (n: number) => (n >= 0 ? 'text-moss' : 'text-rose-400');
const fmtDate = (t: number) => new Date(t).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: '2-digit', timeZone: 'UTC' });
const fmtDateTime = (t: number) =>
  new Date(t).toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' });

export function Panel({ title, right, children, className = '' }: { title: string; right?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`flex flex-col overflow-hidden rounded-md border border-white/[0.08] bg-charcoal/70 ${className}`}>
      <header className="flex shrink-0 items-center justify-between border-b border-white/[0.08] bg-white/[0.03] px-3 py-1.5">
        <h3 className="sc-serif text-[10px] tracking-[0.16em] text-zinc-400">{title}</h3>
        {right}
      </header>
      <div className="min-h-0 flex-1">{children}</div>
    </section>
  );
}

/* -------------------- equity curve + drawdown overlay ----------------- */

export function EquityCurvePanel({ equity, runId }: { equity: EquityPoint[]; runId: string }) {
  const W = 900, H = 300, padL = 4, padR = 52, ddH = 70, eqH = H - ddH - 14;
  const eqVals = equity.map((e) => e.equity);
  const hi = Math.max(...eqVals), lo = Math.min(...eqVals);
  const ddLo = Math.min(...equity.map((e) => e.drawdown));
  const n = equity.length;
  const x = (i: number) => padL + (i / (n - 1)) * (W - padL - padR);
  const ey = (v: number) => 8 + ((hi - v) / (hi - lo || 1)) * eqH;
  const dy = (v: number) => eqH + 16 + (v / (ddLo || -1)) * ddH;

  const eqPath = equity.map((e, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${ey(e.equity).toFixed(1)}`).join(' ');
  const eqFill = `${eqPath} L ${x(n - 1).toFixed(1)} ${eqH + 8} L ${padL} ${eqH + 8} Z`;
  const ddFill = equity.map((e, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${dy(e.drawdown).toFixed(1)}`).join(' ') + ` L ${x(n - 1).toFixed(1)} ${eqH + 16} L ${padL} ${eqH + 16} Z`;

  return (
    <Panel
      title="Equity curve & drawdown"
      right={<span className="font-mono text-[9px] tabular text-zinc-500">run · {runId}</span>}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-[300px] w-full" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="eqgrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(63,157,87,0.3)" />
            <stop offset="100%" stopColor="rgba(63,157,87,0)" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={padL} y1={8 + f * eqH} x2={W - padR} y2={8 + f * eqH} stroke="rgba(255,255,255,0.05)" />
        ))}
        {[hi, (hi + lo) / 2, lo].map((v, i) => (
          <text key={i} x={W - padR + 4} y={ey(v) + 3} fill="rgba(148,163,184,0.7)" fontSize="9" fontFamily="ui-monospace, monospace">
            {(v / 1000).toFixed(0)}k
          </text>
        ))}
        <path d={eqFill} fill="url(#eqgrad)" />
        <path d={eqPath} fill="none" stroke={MOSS} strokeWidth="1.4" />
        {/* drawdown band */}
        <path d={ddFill} fill="rgba(244,114,114,0.18)" stroke={ROSE} strokeWidth="0.9" />
        <text x={padL} y={eqH + 14} fill="rgba(148,163,184,0.7)" fontSize="9" fontFamily="ui-monospace, monospace">DRAWDOWN</text>
        <text x={W - padR + 4} y={dy(ddLo) + 3} fill={ROSE} fontSize="9" fontFamily="ui-monospace, monospace">{fmt(ddLo, 0)}%</text>
      </svg>
    </Panel>
  );
}

/* ---------------------------- metrics table --------------------------- */

const METRIC_GROUPS: { group: string; items: [string, (m: Metrics) => string, ((m: Metrics) => string) | undefined][] }[] = [
  {
    group: 'Returns',
    items: [
      ['Total P&L', (m) => usd(m.totalPnl), (m) => pnlColor(m.totalPnl)],
      ['CAGR', (m) => `${signed(m.cagr, 1)}%`, (m) => pnlColor(m.cagr)],
      ['Expectancy / trade', (m) => usd(m.expectancy), (m) => pnlColor(m.expectancy)],
      ['Total trades', (m) => `${m.totalTrades}`, undefined],
    ],
  },
  {
    group: 'Risk-adjusted',
    items: [
      ['Sharpe', (m) => fmt(m.sharpe), undefined],
      ['Sortino', (m) => fmt(m.sortino), undefined],
      ['Calmar', (m) => fmt(m.calmar), undefined],
      ['Omega', (m) => fmt(m.omega), undefined],
    ],
  },
  {
    group: 'Quality',
    items: [
      ['Win rate', (m) => `${fmt(m.winRate, 1)}%`, undefined],
      ['Profit factor', (m) => fmt(m.profitFactor), undefined],
      ['Avg winner', (m) => usd(m.avgWinner), () => 'text-moss'],
      ['Avg loser', (m) => usd(m.avgLoser), () => 'text-rose-400'],
      ['Largest winner', (m) => usd(m.largestWinner), () => 'text-moss'],
      ['Largest loser', (m) => usd(m.largestLoser), () => 'text-rose-400'],
      ['Max win streak', (m) => `${m.maxWinStreak}`, undefined],
      ['Max loss streak', (m) => `${m.maxLossStreak}`, undefined],
    ],
  },
  {
    group: 'Drawdown & sizing',
    items: [
      ['Max drawdown', (m) => `${fmt(m.maxDrawdownPct, 1)}%`, () => 'text-rose-400'],
      ['Max drawdown ($)', (m) => usd(m.maxDrawdownDollar), () => 'text-rose-400'],
      ['Avg duration', (m) => `${m.avgTradeDurationMin}m`, undefined],
      ['Kelly fraction', (m) => `${fmt(m.kelly, 1)}%`, undefined],
    ],
  },
];

export function MetricsTable({ metrics }: { metrics: Metrics }) {
  const significant = metrics.hypothesisPValue < 0.05;
  return (
    <Panel title="Trade statistics" className="h-full">
      <div className="grid grid-cols-2 gap-px bg-white/[0.05] sm:grid-cols-4">
        {METRIC_GROUPS.map((g) => (
          <div key={g.group} className="bg-charcoal/80 p-3">
            <p className="mb-2 text-[9px] uppercase tracking-wider text-zinc-500">{g.group}</p>
            <dl className="space-y-1.5">
              {g.items.map(([label, val, tone]) => (
                <div key={label} className="flex items-baseline justify-between gap-2">
                  <dt className="text-[10px] text-zinc-500">{label}</dt>
                  <dd className={`font-mono text-[11px] tabular ${tone ? tone(metrics) : 'text-neutral-100'}`}>{val(metrics)}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
      <div className={`flex items-center gap-2 border-t border-white/[0.08] px-3 py-2 text-[10px] ${significant ? 'text-moss' : 'text-tan'}`}>
        <span className={`inline-block h-1.5 w-1.5 rounded-full ${significant ? 'bg-moss' : 'bg-tan'}`} />
        Hypothesis test: strategy performs {significant ? 'above' : 'no better than'} random
        <span className="ml-auto font-mono tabular text-zinc-500">p = {fmt(metrics.hypothesisPValue, 3)}</span>
      </div>
    </Panel>
  );
}

/* --------------------------- monthly heatmap -------------------------- */

const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

export function MonthlyHeatmap({ monthly }: { monthly: MonthlyCell[] }) {
  const years = useMemo(() => [...new Set(monthly.map((c) => c.year))].sort(), [monthly]);
  const max = Math.max(...monthly.map((c) => Math.abs(c.ret)), 1);
  const get = (y: number, m: number) => monthly.find((c) => c.year === y && c.month === m);
  return (
    <Panel title="Monthly returns">
      <div className="overflow-auto p-3">
        <table className="border-separate" style={{ borderSpacing: '2px' }}>
          <thead>
            <tr>
              <th className="w-8" />
              {MONTHS.map((m, i) => (
                <th key={i} className="px-1 text-[8px] font-medium text-zinc-600">{m}</th>
              ))}
              <th className="px-1 text-[8px] font-medium text-zinc-600">Yr</th>
            </tr>
          </thead>
          <tbody>
            {years.map((y) => {
              const yearTotal = monthly.filter((c) => c.year === y).reduce((a, c) => a + c.ret, 0);
              return (
                <tr key={y}>
                  <td className="pr-1 text-right font-mono text-[9px] tabular text-zinc-500">{y}</td>
                  {MONTHS.map((_, m) => {
                    const cell = get(y, m);
                    if (!cell) return <td key={m} className="h-5 w-7 rounded-[2px] bg-white/[0.02]" />;
                    const pos = cell.ret >= 0;
                    const a = (Math.abs(cell.ret) / max) * 0.7 + 0.12;
                    return (
                      <td
                        key={m}
                        title={`${y}-${m + 1}: ${cell.ret}%`}
                        className="h-5 w-7 rounded-[2px] text-center font-mono text-[8px] tabular text-white/80"
                        style={{ backgroundColor: pos ? `rgba(63,157,87,${a})` : `rgba(244,114,114,${a})` }}
                      >
                        {cell.ret}
                      </td>
                    );
                  })}
                  <td className={`px-1 text-right font-mono text-[9px] tabular ${pnlColor(yearTotal)}`}>{signed(yearTotal, 0)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* -------------------------- regime breakdown -------------------------- */

export function RegimeBreakdown({ regimePerf }: { regimePerf: RegimePerf[] }) {
  const vol = regimePerf.filter((r) => r.kind === 'VOL');
  const trend = regimePerf.filter((r) => r.kind === 'TREND');
  const Row = (r: RegimePerf) => (
    <div key={r.regime} className="flex items-center gap-2 px-3 py-1.5">
      <span className="w-24 shrink-0 text-[10px] text-zinc-400">{r.regime}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
        <div className="h-full rounded-full" style={{ width: `${r.winRate}%`, backgroundColor: r.winRate >= 50 ? MOSS : ROSE }} />
      </div>
      <span className="w-9 shrink-0 text-right font-mono text-[9px] tabular text-zinc-300">{r.winRate}%</span>
      <span className={`w-9 shrink-0 text-right font-mono text-[9px] tabular ${r.profitFactor >= 1 ? 'text-moss' : 'text-rose-400'}`}>{fmt(r.profitFactor)}</span>
    </div>
  );
  return (
    <Panel title="Performance by regime" right={<span className="font-mono text-[8px] text-zinc-600">win% · PF</span>}>
      <div className="grid grid-cols-1 divide-y divide-white/[0.05] sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <div>
          <p className="px-3 pt-2 text-[9px] uppercase tracking-wider text-zinc-600">Volatility regime</p>
          {vol.map(Row)}
        </div>
        <div>
          <p className="px-3 pt-2 text-[9px] uppercase tracking-wider text-zinc-600">Trend regime</p>
          {trend.map(Row)}
        </div>
      </div>
    </Panel>
  );
}

/* --------------------------- distributions ---------------------------- */

export function Distribution({ title, buckets, accent = BRASS }: { title: string; buckets: Bucket[]; accent?: string }) {
  const max = Math.max(...buckets.map((b) => b.count), 1);
  return (
    <Panel title={title} className="h-full">
      <div className="flex h-[140px] items-end gap-2 p-3">
        {buckets.map((b) => (
          <div key={b.label} className="flex flex-1 flex-col items-center gap-1">
            <span className="font-mono text-[8px] tabular text-zinc-500">{b.count}</span>
            <div className="w-full rounded-t-[2px]" style={{ height: `${(b.count / max) * 96}px`, backgroundColor: accent, opacity: 0.65 }} />
            <span className="text-center text-[8px] text-zinc-600">{b.label}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ----------------------------- top trades ----------------------------- */

export function TopTrades({ trades }: { trades: BTTrade[] }) {
  const sorted = [...trades].sort((a, b) => b.pnl - a.pnl);
  const top = sorted.slice(0, 4);
  const bottom = sorted.slice(-4).reverse();
  const Row = (t: BTTrade) => (
    <li key={t.id} className="flex items-center justify-between gap-2 px-3 py-1.5 font-mono text-[10px] tabular">
      <span className="text-zinc-400">{t.symbol} {t.strike}{t.type[0]}</span>
      <span className="text-zinc-600">{fmtDate(t.entryTime)}</span>
      <span className={`w-16 text-right ${pnlColor(t.pnl)}`}>{usd(t.pnl)}</span>
    </li>
  );
  return (
    <Panel title="Top trades">
      <div className="grid grid-cols-2 divide-x divide-white/[0.05]">
        <div>
          <p className="px-3 pt-2 text-[9px] uppercase tracking-wider text-moss">Winners</p>
          <ul>{top.map(Row)}</ul>
        </div>
        <div>
          <p className="px-3 pt-2 text-[9px] uppercase tracking-wider text-rose-400">Losers</p>
          <ul>{bottom.map(Row)}</ul>
        </div>
      </div>
    </Panel>
  );
}

/* ---------------------------- replay viewer --------------------------- */

export function ReplayViewer({ trades }: { trades: BTTrade[] }) {
  const [i, setI] = useState(0);
  const t = trades[i];
  if (!t) return null;
  const prev = () => setI((v) => Math.max(0, v - 1));
  const next = () => setI((v) => Math.min(trades.length - 1, v + 1));

  return (
    <Panel
      title="Replay viewer"
      right={
        <div className="flex items-center gap-2">
          <button onClick={prev} disabled={i === 0} className="rounded p-0.5 text-zinc-400 hover:bg-white/5 hover:text-zinc-100 disabled:opacity-30">
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <span className="font-mono text-[9px] tabular text-zinc-500">trade {t.n} / {trades.length}</span>
          <button onClick={next} disabled={i === trades.length - 1} className="rounded p-0.5 text-zinc-400 hover:bg-white/5 hover:text-zinc-100 disabled:opacity-30">
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-px bg-white/[0.05] lg:grid-cols-3">
        {/* entry / exit */}
        <div className="bg-charcoal/80 p-3">
          <p className="mb-2 text-[9px] uppercase tracking-wider text-zinc-500">Trade</p>
          <p className="font-mono text-sm tabular text-neutral-100">
            {t.symbol} {t.strike} <span className={t.type === 'CALL' ? 'text-moss' : 'text-rose-400'}>{t.type}</span>
          </p>
          <dl className="mt-2 space-y-1 font-mono text-[10px] tabular">
            {[
              ['Entry', `${fmtDateTime(t.entryTime)} @ ${fmt(t.entryPrice)}`],
              ['Exit', `${fmtDateTime(t.exitTime)} @ ${fmt(t.exitPrice)}`],
              ['Δ at entry', fmt(t.deltaAtEntry)],
              ['IV rank', `${t.ivRankAtEntry}`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-2">
                <dt className="text-zinc-500">{k}</dt>
                <dd className="text-zinc-200">{v}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-2 border-t border-white/[0.06] pt-1">
              <dt className="text-zinc-500">Realized P&L</dt>
              <dd className={pnlColor(t.pnl)}>{usd(t.pnl)}</dd>
            </div>
          </dl>
        </div>

        {/* context */}
        <div className="bg-charcoal/80 p-3">
          <p className="mb-2 text-[9px] uppercase tracking-wider text-zinc-500">Context at entry</p>
          <div className="space-y-2 text-[10px]">
            <div>
              <p className="text-zinc-500">Regime</p>
              <p className="text-tan">{t.regimeAtEntry}</p>
            </div>
            <div>
              <p className="text-zinc-500">Signal</p>
              <p className="text-zinc-200">{t.signalType} · <span className="text-tan">{(t.signalConfidence * 100).toFixed(0)}%</span></p>
            </div>
            <div>
              <p className="text-zinc-500">News</p>
              <p className="leading-snug text-zinc-300">{t.newsHeadline}</p>
            </div>
          </div>
        </div>

        {/* chain snapshot */}
        <div className="bg-charcoal/80 p-3">
          <p className="mb-2 text-[9px] uppercase tracking-wider text-zinc-500">Chain at entry</p>
          <table className="w-full font-mono text-[9px] tabular">
            <thead>
              <tr className="text-[8px] uppercase text-zinc-600">
                <th className="text-left font-medium">Strike</th>
                <th className="text-right font-medium">IV</th>
                <th className="text-right font-medium">Δ</th>
                <th className="text-right font-medium">Mid</th>
              </tr>
            </thead>
            <tbody>
              {t.chainSnapshot.map((q) => {
                const isTrade = q.strike === t.strike;
                return (
                  <tr key={q.strike} className={isTrade ? 'text-tan' : 'text-zinc-400'}>
                    <td className="py-0.5 text-left">{q.strike}{isTrade ? ' ◂' : ''}</td>
                    <td className="py-0.5 text-right">{fmt(q.iv, 1)}</td>
                    <td className="py-0.5 text-right">{fmt(q.delta)}</td>
                    <td className="py-0.5 text-right">{fmt(q.mid)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Panel>
  );
}

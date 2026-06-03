/**
 * Terminal dashboard panels. Dense, Bloomberg-grade surfaces over the mock
 * data layer. Each panel takes plain data props so it can later be fed by the
 * Go API / WebSocket streams without structural change.
 */

'use client';

import React, { useMemo, useState } from 'react';
import { ArrowDownUp, X } from 'lucide-react';
import type {
  Candle,
  GexBar,
  OptionRow,
  SignalRow,
  NewsRow,
  DarkPoolRow,
  RegimeSnapshot,
  WatchItem,
  AccountSummary,
} from './terminalData';

/* ------------------------------ helpers ------------------------------- */

const MOSS = '#3f9d57';
const ROSE = '#f47272';
const BRASS = '#C9A96E';

const fmt = (n: number, d = 2) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtCompact = (n: number) => Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
const fmtTime = (t: number) =>
  new Date(t).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' });
const signed = (n: number, d = 2) => `${n >= 0 ? '+' : ''}${fmt(n, d)}`;
const pnlColor = (n: number) => (n >= 0 ? 'text-moss' : 'text-rose-400');

export function Panel({
  title,
  right,
  children,
  className = '',
  bodyClassName = '',
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={`flex min-h-0 flex-col overflow-hidden rounded-md border border-white/[0.08] bg-charcoal/70 ${className}`}
    >
      <header className="flex shrink-0 items-center justify-between border-b border-white/[0.08] bg-white/[0.03] px-3 py-1.5">
        <h3 className="sc-serif text-[10px] tracking-[0.16em] text-zinc-400">{title}</h3>
        {right}
      </header>
      <div className={`min-h-0 flex-1 ${bodyClassName}`}>{children}</div>
    </section>
  );
}

const dotColor = (b: string) => (b === 'LONG' ? MOSS : b === 'SHORT' ? ROSE : 'rgba(148,163,184,0.6)');

/* ---------------------------- price chart ----------------------------- */

export function PriceChart({ symbol, candles, price, change, changePct }: {
  symbol: string;
  candles: Candle[];
  price: number;
  change: number;
  changePct: number;
}) {
  const W = 900;
  const H = 280;
  const padL = 4;
  const padR = 46;
  const volH = 52;
  const priceH = H - volH - 8;

  const { hi, lo, maxVol } = useMemo(() => {
    let hi = -Infinity, lo = Infinity, maxVol = 0;
    for (const c of candles) {
      hi = Math.max(hi, c.h);
      lo = Math.min(lo, c.l);
      maxVol = Math.max(maxVol, c.v);
    }
    return { hi, lo, maxVol };
  }, [candles]);

  const n = candles.length;
  const innerW = W - padL - padR;
  const cw = innerW / n;
  const x = (i: number) => padL + i * cw + cw / 2;
  const y = (p: number) => 6 + ((hi - p) / (hi - lo || 1)) * priceH;
  const vy = (v: number) => priceH + 8 + (volH - (v / (maxVol || 1)) * volH);

  const vwapPath = candles.map((c, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${y(c.vwap).toFixed(1)}`).join(' ');
  const up = change >= 0;

  return (
    <Panel
      title={`${symbol} · 5m`}
      right={
        <div className="flex items-baseline gap-2 font-mono text-[11px] tabular">
          <span className="text-neutral-100">{fmt(price)}</span>
          <span className={pnlColor(change)}>
            {signed(change)} ({signed(changePct)}%)
          </span>
        </div>
      }
      className="h-full"
      bodyClassName="p-2"
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" preserveAspectRatio="none" aria-hidden>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={padL} y1={6 + f * priceH} x2={W - padR} y2={6 + f * priceH} stroke="rgba(255,255,255,0.05)" />
        ))}
        {/* price axis labels */}
        {[hi, (hi + lo) / 2, lo].map((p, i) => (
          <text key={i} x={W - padR + 4} y={y(p) + 3} fill="rgba(148,163,184,0.7)" fontSize="9" fontFamily="ui-monospace, monospace">
            {fmt(p, 0)}
          </text>
        ))}
        {/* volume bars */}
        {candles.map((c, i) => (
          <rect
            key={`v${i}`}
            x={x(i) - cw * 0.3}
            y={vy(c.v)}
            width={cw * 0.6}
            height={priceH + 8 + volH - vy(c.v)}
            fill={c.c >= c.o ? 'rgba(63,157,87,0.35)' : 'rgba(244,114,114,0.3)'}
          />
        ))}
        {/* candles */}
        {candles.map((c, i) => {
          const col = c.c >= c.o ? MOSS : ROSE;
          const yo = y(c.o), yc = y(c.c);
          return (
            <g key={`c${i}`}>
              <line x1={x(i)} y1={y(c.h)} x2={x(i)} y2={y(c.l)} stroke={col} strokeWidth="1" />
              <rect
                x={x(i) - cw * 0.32}
                y={Math.min(yo, yc)}
                width={cw * 0.64}
                height={Math.max(1, Math.abs(yc - yo))}
                fill={col}
              />
            </g>
          );
        })}
        {/* VWAP */}
        <path d={vwapPath} fill="none" stroke={BRASS} strokeWidth="1.1" strokeDasharray="4 3" opacity="0.9" />
        {/* last price marker */}
        <line x1={padL} y1={y(price)} x2={W - padR} y2={y(price)} stroke={up ? MOSS : ROSE} strokeWidth="0.6" strokeOpacity="0.5" />
      </svg>
      <div className="flex items-center gap-3 px-1 pt-1 text-[9px] text-zinc-500">
        <span className="flex items-center gap-1"><span className="inline-block h-[2px] w-3" style={{ background: BRASS }} /> VWAP</span>
        <span>Vol {fmtCompact(candles[candles.length - 1]?.v ?? 0)}</span>
      </div>
    </Panel>
  );
}

/* --------------------------- GEX by strike ---------------------------- */

export function GexByStrike({ gex, price }: { gex: GexBar[]; price: number }) {
  const max = Math.max(...gex.map((g) => Math.abs(g.gex)), 0.01);
  return (
    <Panel title="Dealer gamma exposure · by strike" right={<span className="font-mono text-[9px] text-zinc-500">$mm / 1%</span>}>
      <div className="space-y-[3px] p-2">
        {gex.map((g) => {
          const pos = g.gex >= 0;
          const w = (Math.abs(g.gex) / max) * 50;
          const nearPrice = Math.abs(g.strike - price) < (price > 300 ? 3 : 1.5);
          return (
            <div key={g.strike} className="flex items-center gap-1 font-mono text-[9px] tabular">
              <span className={`w-12 shrink-0 text-right ${nearPrice ? 'text-tan' : 'text-zinc-500'}`}>{fmt(g.strike, 0)}</span>
              <div className="relative flex h-3 flex-1 items-center">
                <div className="absolute left-1/2 h-full w-px bg-white/10" />
                <div
                  className="absolute h-2 rounded-[1px]"
                  style={{
                    [pos ? 'left' : 'right']: '50%',
                    width: `${w}%`,
                    backgroundColor: pos ? 'rgba(63,157,87,0.6)' : 'rgba(244,114,114,0.55)',
                  }}
                />
              </div>
              <span className={`w-10 shrink-0 ${pos ? 'text-moss' : 'text-rose-400'}`}>{signed(g.gex, 1)}</span>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

/* -------------------------- options chain ----------------------------- */

type SortKey = keyof Pick<OptionRow, 'strike' | 'volume' | 'openInterest' | 'iv' | 'delta' | 'gamma' | 'theta' | 'vega'>;

const CHAIN_COLS: { key: SortKey | 'bid' | 'ask' | 'mid' | 'lastTraded' | 'charm' | 'vanna' | 'ivRank'; label: string; d?: number }[] = [
  { key: 'bid', label: 'Bid' },
  { key: 'ask', label: 'Ask' },
  { key: 'mid', label: 'Mid' },
  { key: 'lastTraded', label: 'Last' },
  { key: 'volume', label: 'Vol', d: 0 },
  { key: 'openInterest', label: 'OI', d: 0 },
  { key: 'delta', label: 'Δ', d: 3 },
  { key: 'gamma', label: 'Γ', d: 4 },
  { key: 'theta', label: 'Θ', d: 3 },
  { key: 'vega', label: 'V', d: 3 },
  { key: 'charm', label: 'Charm', d: 4 },
  { key: 'vanna', label: 'Vanna', d: 3 },
  { key: 'iv', label: 'IV', d: 1 },
  { key: 'ivRank', label: 'IVR', d: 0 },
];

const moneynessColor = (m: string) =>
  m === 'ATM' ? 'bg-brass/[0.07]' : m === 'ITM' ? 'bg-moss/[0.05]' : '';

export function OptionsChainPanel({ chain, onSelect }: { chain: OptionRow[]; onSelect: (row: OptionRow) => void }) {
  const [filter, setFilter] = useState<'ALL' | 'CALL' | 'PUT'>('ALL');
  const [sortKey, setSortKey] = useState<SortKey>('strike');
  const [asc, setAsc] = useState(true);

  const rows = useMemo(() => {
    const f = chain.filter((r) => (filter === 'ALL' ? true : r.type === filter));
    return [...f].sort((a, b) => (asc ? 1 : -1) * ((a[sortKey] as number) - (b[sortKey] as number)));
  }, [chain, filter, sortKey, asc]);

  const setSort = (k: SortKey) => {
    if (k === sortKey) setAsc((v) => !v);
    else {
      setSortKey(k);
      setAsc(true);
    }
  };

  return (
    <Panel
      title="Options chain"
      right={
        <div className="flex items-center gap-1">
          {(['ALL', 'CALL', 'PUT'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded px-1.5 py-0.5 text-[9px] font-medium tracking-wide transition-colors ${
                filter === f ? 'bg-brass/20 text-tan' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      }
      bodyClassName="overflow-auto"
    >
      <table className="w-full min-w-[760px] border-collapse text-left font-mono text-[10px] tabular">
        <thead className="sticky top-0 z-10 bg-charcoal">
          <tr className="text-[9px] uppercase tracking-wide text-zinc-500">
            <th className="px-2 py-1.5 font-medium">Type</th>
            <ThSort label="Strike" active={sortKey === 'strike'} asc={asc} onClick={() => setSort('strike')} />
            {CHAIN_COLS.map((c) => {
              const sortable = ['volume', 'openInterest', 'iv', 'delta', 'gamma', 'theta', 'vega'].includes(c.key);
              return sortable ? (
                <ThSort
                  key={c.key}
                  label={c.label}
                  active={sortKey === (c.key as SortKey)}
                  asc={asc}
                  onClick={() => setSort(c.key as SortKey)}
                />
              ) : (
                <th key={c.key} className="px-2 py-1.5 text-right font-medium">{c.label}</th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.id}
              onClick={() => onSelect(r)}
              className={`cursor-pointer border-b border-white/[0.04] transition-colors hover:bg-white/[0.05] ${moneynessColor(r.moneyness)}`}
            >
              <td className="px-2 py-1.5">
                <span className={r.type === 'CALL' ? 'text-moss' : 'text-rose-400'}>{r.type === 'CALL' ? 'C' : 'P'}</span>
              </td>
              <td className="px-2 py-1.5 text-neutral-100">{fmt(r.strike, 0)}</td>
              {CHAIN_COLS.map((c) => (
                <td key={c.key} className="px-2 py-1.5 text-right text-zinc-300">
                  {fmt(r[c.key as keyof OptionRow] as number, c.d ?? 2)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}

function ThSort({ label, active, asc, onClick }: { label: string; active: boolean; asc: boolean; onClick: () => void }) {
  return (
    <th className="px-2 py-1.5 text-right font-medium">
      <button onClick={onClick} className={`inline-flex items-center gap-0.5 ${active ? 'text-tan' : 'hover:text-zinc-300'}`}>
        {label}
        {active && <ArrowDownUp className={`h-2.5 w-2.5 ${asc ? '' : 'rotate-180'}`} />}
      </button>
    </th>
  );
}

/* ---------------------------- signal feed ----------------------------- */

export function SignalFeed({ signals }: { signals: SignalRow[] }) {
  return (
    <Panel title="Signal feed" bodyClassName="overflow-auto">
      <ul className="divide-y divide-white/[0.05]">
        {signals.map((s) => (
          <li key={s.id} className="flex items-center justify-between gap-3 px-3 py-2">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-[11px] text-neutral-100">
                <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dotColor(s.direction) }} />
                {s.signalType}
                <span className="text-zinc-600">·</span>
                <span className="text-zinc-400">{s.direction}</span>
              </p>
              <p className="mt-0.5 font-mono text-[9px] tabular text-zinc-500">
                {fmtTime(s.time)} · {s.regime} · {s.ivRegime}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <div className="h-1 w-14 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-tan" style={{ width: `${s.confidence * 100}%` }} />
              </div>
              <p className="mt-0.5 font-mono text-[9px] tabular text-tan">{(s.confidence * 100).toFixed(0)}%</p>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* --------------------------- regime panel ----------------------------- */

const regimeTone = (r: string) =>
  r === 'COMPRESSED' || r === 'NORMAL' || r === 'TRENDING'
    ? 'text-moss'
    : r === 'SPIKE' || r === 'HIGH' || r === 'MEAN_REVERTING'
    ? 'text-rose-400'
    : 'text-tan';

function RegimeRow({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-1.5">
      <span className="text-[10px] text-zinc-500">{label}</span>
      <span className={`font-mono text-[11px] tabular ${tone ?? 'text-neutral-100'}`}>{value}</span>
    </div>
  );
}

export function RegimePanel({ regime }: { regime: RegimeSnapshot }) {
  return (
    <Panel title="Regime">
      <div className="divide-y divide-white/[0.04]">
        <RegimeRow label="Volatility regime" value={regime.volRegime} tone={regimeTone(regime.volRegime)} />
        <RegimeRow label="Trend regime" value={regime.trendRegime.replace('_', ' ')} tone={regimeTone(regime.trendRegime)} />
        <RegimeRow label="Hurst exponent" value={fmt(regime.hurst)} tone={regime.hurst > 0.58 ? 'text-moss' : regime.hurst < 0.42 ? 'text-rose-400' : 'text-tan'} />
        <RegimeRow label="Realized vol" value={`${fmt(regime.realizedVol, 1)}%`} />
        <RegimeRow label="Implied vol" value={`${fmt(regime.impliedVol, 1)}%`} />
        <RegimeRow label="RV − IV spread" value={`${signed(regime.rvIvSpread, 1)}%`} tone={pnlColor(regime.rvIvSpread)} />
        <RegimeRow label="25Δ skew" value={`${fmt(regime.skew, 1)} pts`} />
        <RegimeRow label="Term slope (30/90)" value={fmt(regime.termSlope)} tone={regime.termSlope < 1 ? 'text-rose-400' : 'text-moss'} />
        <RegimeRow label="Put/Call ratio" value={fmt(regime.putCallRatio)} />
        <RegimeRow label="Dealer GEX total" value={`${signed(regime.dealerGexTotal, 1)}mm`} tone={pnlColor(regime.dealerGexTotal)} />
      </div>
    </Panel>
  );
}

/* ----------------------------- news feed ------------------------------ */

const sentimentTone = (s: string) => (s === 'POS' ? 'text-moss' : s === 'NEG' ? 'text-rose-400' : 'text-zinc-400');

export function NewsFeed({ news }: { news: NewsRow[] }) {
  return (
    <Panel title="News" bodyClassName="overflow-auto">
      <ul className="divide-y divide-white/[0.05]">
        {news.map((n) => (
          <li key={n.id} className="px-3 py-2">
            <p className="text-[11px] leading-snug text-zinc-200">{n.headline}</p>
            <p className="mt-1 flex items-center gap-2 font-mono text-[9px] tabular text-zinc-500">
              <span>{fmtTime(n.time)}</span>
              <span>·</span>
              <span>{n.source}</span>
              <span className={`ml-auto ${sentimentTone(n.sentiment)}`}>{n.sentiment}</span>
            </p>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* ------------------------- dark pool monitor -------------------------- */

export function DarkPoolMonitor({ rows }: { rows: DarkPoolRow[] }) {
  return (
    <Panel title="Dark pool activity" bodyClassName="overflow-auto">
      <table className="w-full border-collapse font-mono text-[9px] tabular">
        <thead>
          <tr className="text-[8px] uppercase tracking-wide text-zinc-500">
            <th className="px-3 py-1 text-left font-medium">Time</th>
            <th className="px-2 py-1 text-right font-medium">Prints</th>
            <th className="px-2 py-1 text-right font-medium">Volume</th>
            <th className="px-2 py-1 text-right font-medium">% tape</th>
            <th className="px-3 py-1 text-right font-medium">Bias</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((d) => (
            <tr key={d.id} className="border-b border-white/[0.04] text-zinc-300">
              <td className="px-3 py-1.5 text-left text-zinc-500">{fmtTime(d.time)}</td>
              <td className="px-2 py-1.5 text-right">{d.prints}</td>
              <td className="px-2 py-1.5 text-right">{fmtCompact(d.volume)}</td>
              <td className={`px-2 py-1.5 text-right ${d.pctOfTape > 25 ? 'text-tan' : ''}`}>{fmt(d.pctOfTape, 1)}</td>
              <td className="px-3 py-1.5 text-right">
                <span style={{ color: dotColor(d.bias) }}>{d.bias}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}

/* ------------------------------ left rail ----------------------------- */

export function LeftRail({
  watchlist,
  selected,
  onSelect,
  account,
  marketOpen,
}: {
  watchlist: WatchItem[];
  selected: string;
  onSelect: (s: string) => void;
  account: AccountSummary;
  marketOpen: boolean;
}) {
  const [q, setQ] = useState('');
  const filtered = watchlist.filter((w) => w.symbol.includes(q.toUpperCase()) || w.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <aside className="flex w-full flex-col gap-3 lg:w-60 lg:shrink-0">
      <div className="flex items-center justify-between rounded-md border border-white/[0.08] bg-charcoal/70 px-3 py-2">
        <span className="text-[10px] uppercase tracking-wider text-zinc-500">Market</span>
        <span className={`flex items-center gap-1.5 text-[10px] font-medium ${marketOpen ? 'text-moss' : 'text-rose-400'}`}>
          <span className={`inline-block h-1.5 w-1.5 rounded-full ${marketOpen ? 'bg-moss' : 'bg-rose-400'} ${marketOpen ? 'animate-pulse' : ''}`} />
          {marketOpen ? 'OPEN' : 'CLOSED'}
        </span>
      </div>

      <Panel title="Watchlist" bodyClassName="overflow-auto">
        <div className="border-b border-white/[0.06] p-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search symbol…"
            className="w-full rounded border border-white/[0.08] bg-white/[0.03] px-2 py-1.5 text-[11px] text-white placeholder:text-zinc-600 outline-none focus:border-brass/40"
          />
        </div>
        <ul>
          {filtered.map((w) => (
            <li key={w.symbol}>
              <button
                onClick={() => onSelect(w.symbol)}
                className={`flex w-full items-center justify-between px-3 py-2 text-left transition-colors hover:bg-white/[0.04] ${
                  selected === w.symbol ? 'bg-brass/[0.08]' : ''
                }`}
              >
                <div className="min-w-0">
                  <p className={`text-[12px] font-medium ${selected === w.symbol ? 'text-tan' : 'text-neutral-100'}`}>{w.symbol}</p>
                  <p className="truncate text-[9px] text-zinc-500">{w.name}</p>
                </div>
                <div className="shrink-0 text-right font-mono text-[10px] tabular">
                  <p className="text-zinc-300">{fmt(w.price)}</p>
                  <p className={pnlColor(w.changePct)}>{signed(w.changePct)}%</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Account">
        <div className="space-y-2 p-3">
          <div>
            <p className="text-[9px] uppercase tracking-wider text-zinc-500">Paper portfolio</p>
            <p className="font-mono text-lg tabular text-neutral-100">${fmt(account.portfolioValue)}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 font-mono text-[10px] tabular">
            <Stat label="Cash" value={`$${fmtCompact(account.cash)}`} />
            <Stat label="Open" value={`${account.openPositions}`} />
            <Stat label="Day P&L" value={`${signed(account.dayPnl, 0)}`} tone={pnlColor(account.dayPnl)} />
            <Stat label="Total P&L" value={`${signed(account.totalPnl, 0)}`} tone={pnlColor(account.totalPnl)} />
          </div>
        </div>
      </Panel>
    </aside>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded border border-white/[0.06] bg-white/[0.02] px-2 py-1.5">
      <p className="text-[8px] uppercase tracking-wider text-zinc-500">{label}</p>
      <p className={`mt-0.5 ${tone ?? 'text-neutral-100'}`}>{value}</p>
    </div>
  );
}

/* -------------------------- position builder -------------------------- */

export function PositionBuilder({ row, symbol, onClose }: { row: OptionRow | null; symbol: string; onClose: () => void }) {
  const [qty, setQty] = useState(1);
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  if (!row) return null;

  const cost = row.mid * qty * 100 * (side === 'BUY' ? 1 : -1);
  const greekRows: [string, number, number][] = [
    ['Delta', row.delta, 3],
    ['Gamma', row.gamma, 4],
    ['Theta / day', row.theta, 3],
    ['Vega', row.vega, 3],
    ['Charm', row.charm, 4],
    ['Vanna', row.vanna, 3],
    ['Volga', row.volga, 3],
    ['Speed', row.speed, 5],
    ['Zomma', row.zomma, 4],
    ['Color', row.color, 5],
  ];

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="h-full w-full max-w-sm overflow-auto border-l border-white/[0.1] bg-charcoal p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="sc-serif text-[10px] tracking-[0.16em] text-zinc-400">Position builder</p>
            <p className="mt-1 font-mono text-base tabular text-neutral-100">
              {symbol} {fmt(row.strike, 0)}{' '}
              <span className={row.type === 'CALL' ? 'text-moss' : 'text-rose-400'}>{row.type}</span>
            </p>
          </div>
          <button onClick={onClose} className="rounded p-1 text-zinc-500 hover:bg-white/5 hover:text-zinc-200">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 font-mono text-[11px] tabular">
          <Stat label="Bid" value={fmt(row.bid)} />
          <Stat label="Mid" value={fmt(row.mid)} />
          <Stat label="Ask" value={fmt(row.ask)} />
          <Stat label="IV" value={`${fmt(row.iv, 1)}%`} />
          <Stat label="IV rank" value={`${row.ivRank}`} />
          <Stat label="OI" value={fmtCompact(row.openInterest)} />
        </div>

        <div className="mt-4 flex items-center gap-2">
          {(['BUY', 'SELL'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSide(s)}
              className={`flex-1 rounded-md border py-2 text-[11px] font-semibold tracking-wide transition-colors ${
                side === s
                  ? s === 'BUY'
                    ? 'border-moss bg-moss/15 text-moss'
                    : 'border-rose-400 bg-rose-400/15 text-rose-400'
                  : 'border-white/10 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between rounded-md border border-white/[0.08] bg-white/[0.02] px-3 py-2">
          <span className="text-[11px] text-zinc-400">Contracts</span>
          <div className="flex items-center gap-3 font-mono text-sm tabular">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-6 w-6 rounded border border-white/10 text-zinc-300 hover:bg-white/5">−</button>
            <span className="w-8 text-center text-neutral-100">{qty}</span>
            <button onClick={() => setQty((q) => q + 1)} className="h-6 w-6 rounded border border-white/10 text-zinc-300 hover:bg-white/5">+</button>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between px-1 font-mono text-[11px] tabular">
          <span className="text-zinc-500">Net {side === 'BUY' ? 'debit' : 'credit'}</span>
          <span className={pnlColor(-cost)}>${fmt(Math.abs(cost))}</span>
        </div>

        <div className="mt-4 rounded-md border border-white/[0.08]">
          <p className="border-b border-white/[0.08] bg-white/[0.03] px-3 py-1.5 sc-serif text-[10px] tracking-[0.16em] text-zinc-400">
            Sensitivities (per contract)
          </p>
          <div className="divide-y divide-white/[0.04]">
            {greekRows.map(([label, val, d]) => (
              <div key={label} className="flex items-center justify-between px-3 py-1.5 font-mono text-[10px] tabular">
                <span className="text-zinc-500">{label}</span>
                <span className="text-zinc-200">{fmt(val, d)}</span>
              </div>
            ))}
          </div>
        </div>

        <button className="mt-4 w-full rounded-md border border-brass bg-black py-2.5 text-[12px] font-semibold tracking-wide text-tan transition-colors hover:bg-neutral-950 hover:text-brass">
          Submit paper order
        </button>
        <p className="mt-2 text-center text-[9px] text-zinc-600">Paper trading · no live execution</p>
      </div>
    </div>
  );
}

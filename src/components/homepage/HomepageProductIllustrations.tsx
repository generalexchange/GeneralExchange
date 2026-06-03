/**
 * Homepage product-UI illustrations.
 *
 * These are mock surfaces, not live components — they exist to let the product
 * "show, not tell" on the commercial homepage. Charcoal / brass / moss only,
 * tabular mono for figures. No third-party logos, no infrastructure jargon.
 */

'use client';

import React, { useId } from 'react';

const BRASS = '#C9A96E';
const MOSS = 'rgba(46,90,58,0.95)';
const ROSE = 'rgba(244,114,114,0.9)';
const LINE = 'rgba(255,255,255,0.12)';
const DIM = 'rgba(148,163,184,0.7)';

const panel =
  'rounded-lg border border-white/[0.08] bg-charcoal/60 shadow-[0_24px_48px_-28px_rgba(0,0,0,0.55)]';
const panelHead =
  'flex items-center justify-between border-b border-white/[0.08] bg-white/[0.04] px-4 py-2.5';
const eyebrow = 'sc-serif text-[10px] text-zinc-400';

/* ------------------------------------------------------------------ */
/* Section II — Backtesting: PnL curve + drawdown + heatmap + regimes  */
/* ------------------------------------------------------------------ */

function EquityCurve() {
  const uid = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 460 200" className="h-auto w-full" aria-hidden>
      <defs>
        <linearGradient id={`eq-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(46,90,58,0.34)" />
          <stop offset="100%" stopColor="rgba(46,90,58,0)" />
        </linearGradient>
      </defs>
      {[40, 80, 120, 160].map((y) => (
        <line key={y} x1="34" y1={y} x2="448" y2={y} stroke={LINE} strokeWidth="0.75" />
      ))}
      {/* equity curve */}
      <path
        d="M34 162 L78 150 L120 156 L162 128 L206 134 L250 96 L292 108 L336 70 L380 78 L424 44 L448 38"
        fill="none"
        stroke={MOSS}
        strokeWidth="1.6"
      />
      <path
        d="M34 162 L78 150 L120 156 L162 128 L206 134 L250 96 L292 108 L336 70 L380 78 L424 44 L448 38 L448 184 L34 184 Z"
        fill={`url(#eq-${uid})`}
      />
      {/* drawdown overlay (negative band) */}
      <path
        d="M34 184 L78 184 L120 188 L162 184 L206 190 L250 184 L292 191 L336 184 L380 187 L424 184 L448 184"
        fill="none"
        stroke={ROSE}
        strokeWidth="1"
        strokeOpacity="0.8"
      />
      <text x="34" y="16" fill={DIM} fontSize="8.5" fontFamily="ui-monospace, monospace">
        EQUITY
      </text>
      <text x="402" y="16" fill={BRASS} fontSize="8.5" fontFamily="ui-monospace, monospace">
        +148.6%
      </text>
    </svg>
  );
}

function MonthlyHeatmap() {
  // 12 cells, value -> color. Deterministic mock returns.
  const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  const vals = [2.1, -1.3, 4.4, 1.0, -0.6, 3.2, 5.1, -2.4, 1.8, 6.0, 0.4, 3.7];
  return (
    <div className="grid grid-cols-12 gap-1">
      {vals.map((v, i) => {
        const pos = v >= 0;
        const a = Math.min(Math.abs(v) / 6, 1) * 0.7 + 0.12;
        const bg = pos ? `rgba(46,90,58,${a})` : `rgba(244,114,114,${a})`;
        return (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="h-7 w-full rounded-[3px]" style={{ backgroundColor: bg }} title={`${v}%`} />
            <span className="text-[8px] text-zinc-600">{months[i]}</span>
          </div>
        );
      })}
    </div>
  );
}

const REGIMES = [
  { label: 'Compressed vol', win: 71, color: MOSS },
  { label: 'Trending', win: 64, color: MOSS },
  { label: 'Elevated vol', win: 52, color: BRASS },
  { label: 'Mean-reverting', win: 38, color: ROSE },
];

export function BacktestIllustration() {
  return (
    <div className={`${panel} overflow-hidden`}>
      <div className={panelHead}>
        <span className={eyebrow}>Backtest · Momentum Breakout · QQQ · 2019–2026</span>
        <span className="font-mono text-[9px] text-zinc-500 tabular">run · a3f9c1</span>
      </div>
      <div className="grid gap-px bg-white/[0.06] sm:grid-cols-2">
        <div className="bg-charcoal/80 p-4">
          <p className="mb-2 text-[9px] uppercase tracking-wider text-zinc-500">Equity & drawdown</p>
          <EquityCurve />
        </div>
        <div className="bg-charcoal/80 p-4">
          <p className="mb-3 text-[9px] uppercase tracking-wider text-zinc-500">Monthly returns</p>
          <MonthlyHeatmap />
          <p className="mb-2 mt-5 text-[9px] uppercase tracking-wider text-zinc-500">By environment</p>
          <div className="space-y-2">
            {REGIMES.map((r) => (
              <div key={r.label} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-[10px] text-zinc-400">{r.label}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
                  <div className="h-full rounded-full" style={{ width: `${r.win}%`, backgroundColor: r.color }} />
                </div>
                <span className="w-8 shrink-0 text-right font-mono text-[10px] tabular text-zinc-300">{r.win}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 divide-x divide-white/[0.06] border-t border-white/[0.06] sm:grid-cols-4">
        {[
          ['Sharpe', '1.84'],
          ['Profit factor', '2.31'],
          ['Max drawdown', '-11.4%'],
          ['Win rate', '58.2%'],
        ].map(([k, v]) => (
          <div key={k} className="px-4 py-3">
            <p className="text-[9px] uppercase tracking-wider text-zinc-500">{k}</p>
            <p className="mt-0.5 font-mono text-sm tabular text-neutral-100">{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section III — Execution integration + options/warehouse surfaces     */
/* ------------------------------------------------------------------ */

export function ExecutionIntegrationIllustration() {
  return (
    <div className={`${panel} overflow-hidden`}>
      <div className={panelHead}>
        <span className={eyebrow}>Execution layer · Interactive Brokers</span>
        <span className="rounded-full border border-moss/40 bg-moss/10 px-2 py-0.5 text-[9px] font-medium text-moss">
          LIVE QUOTES
        </span>
      </div>
      <div className="grid gap-px bg-white/[0.06] lg:grid-cols-[0.9fr_1.1fr]">
        <div className="bg-charcoal/80 p-4">
          <p className="mb-3 text-[9px] uppercase tracking-wider text-zinc-500">Wallet view · account context</p>
          <div className="rounded border border-white/[0.08] bg-black/25">
            <div className="flex items-center justify-between border-b border-white/[0.08] px-3 py-2.5">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500">Portfolio</span>
              <span className="font-mono text-[11px] tabular text-moss">$1,284,220</span>
            </div>
            <div className="space-y-2.5 px-3 py-3 text-[12px]">
              {[
                ['Buying power', '$392,110'],
                ['Available margin', '$188,440'],
                ['Daily P&L', '+$12,842'],
                ['Open risk', '$71,300'],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-4">
                  <span className="text-zinc-500">{k}</span>
                  <span className="font-mono tabular text-zinc-300">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-charcoal/80 p-4">
          <p className="mb-3 text-[9px] uppercase tracking-wider text-zinc-500">Options chain · live contract pricing</p>
          <table className="w-full table-fixed text-left text-xs">
            <thead>
              <tr className="bg-white/[0.03] text-[9px] uppercase tracking-wider text-zinc-500">
                <th className="px-2.5 py-2 font-medium">Strike</th>
                <th className="px-2.5 py-2 font-medium">Bid</th>
                <th className="px-2.5 py-2 font-medium">Ask</th>
                <th className="px-2.5 py-2 font-medium">Last</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {[
                ['470', '12.10', '12.45', '12.40'],
                ['475', '8.65', '8.92', '8.85'],
                ['480', '5.46', '5.72', '5.60'],
                ['485', '3.04', '3.22', '3.15'],
                ['490', '1.54', '1.69', '1.62'],
              ].map(([strike, bid, ask, last]) => (
                <tr key={strike}>
                  <td className="px-2.5 py-2.5 font-mono tabular text-neutral-100">{strike}</td>
                  <td className="px-2.5 py-2.5 font-mono tabular text-zinc-300">{bid}</td>
                  <td className="px-2.5 py-2.5 font-mono tabular text-zinc-300">{ask}</td>
                  <td className="px-2.5 py-2.5 font-mono tabular text-tan">{last}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-[10px] text-zinc-500">Quotes shown before order submission for price-aware execution.</p>
        </div>
      </div>
    </div>
  );
}

const CHAIN = [
  { strike: '470', moneyness: 'ITM', last: '12.40', vol: '8.2k', iv: '18.4' },
  { strike: '475', moneyness: 'ITM', last: '8.85', vol: '14.1k', iv: '17.9' },
  { strike: '480', moneyness: 'ATM', last: '5.60', vol: '31.7k', iv: '17.2' },
  { strike: '485', moneyness: 'OTM', last: '3.15', vol: '22.4k', iv: '17.6' },
  { strike: '490', moneyness: 'OTM', last: '1.62', vol: '11.9k', iv: '18.3' },
];

function MoneynessDot({ kind }: { kind: string }) {
  const c = kind === 'ATM' ? BRASS : kind === 'ITM' ? MOSS : 'rgba(148,163,184,0.6)';
  return <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c }} />;
}

export function OptionsIllustration() {
  return (
    <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
      <div className={`${panel} overflow-hidden`}>
        <div className={panelHead}>
          <span className={eyebrow}>Chain · SPY · Apr 18</span>
          <span className="font-mono text-[9px] text-zinc-500 tabular">480.12 · +0.34%</span>
        </div>
        <table className="w-full table-fixed text-left text-xs">
          <thead>
            <tr className="bg-white/[0.03] text-[9px] uppercase tracking-wider text-zinc-500">
              <th className="px-3 py-2 font-medium">Strike</th>
              <th className="px-3 py-2 font-medium">Last</th>
              <th className="px-3 py-2 font-medium">Volume</th>
              <th className="px-3 py-2 font-medium">IV</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {CHAIN.map((r) => (
              <tr key={r.strike} className={r.moneyness === 'ATM' ? 'bg-brass/[0.06]' : ''}>
                <td className="px-3 py-2.5 font-mono tabular text-neutral-100">
                  <span className="mr-2"><MoneynessDot kind={r.moneyness} /></span>
                  {r.strike}
                </td>
                <td className="px-3 py-2.5 font-mono tabular text-zinc-300">{r.last}</td>
                <td className="px-3 py-2.5 font-mono tabular text-zinc-400">{r.vol}</td>
                <td className="px-3 py-2.5 font-mono tabular text-zinc-300">{r.iv}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={`${panel} p-4`}>
        <p className="mb-3 text-[9px] uppercase tracking-wider text-zinc-500">Position sensitivities · 480 call</p>
        <ul className="space-y-3 text-[13px]">
          <li>
            <p className="text-zinc-300">Bleeds <span className="text-tan">$0.41/day</span> in time value</p>
            <p className="text-[11px] text-zinc-500">accelerating into the final week</p>
          </li>
          <li>
            <p className="text-zinc-300">A 2% move up adds <span className="text-moss">+$2.10</span></p>
            <p className="text-[11px] text-zinc-500">but the gain rate itself speeds up as it runs</p>
          </li>
          <li>
            <p className="text-zinc-300">If volatility expands 3pts: <span className="text-moss">+$1.35</span></p>
            <p className="text-[11px] text-zinc-500">vega exposure richest at this strike</p>
          </li>
          <li className="rounded border border-brass/30 bg-brass/[0.05] px-3 py-2">
            <p className="text-zinc-200">Manage near <span className="font-mono tabular text-tan">486.50</span></p>
            <p className="text-[11px] text-zinc-500">where the position needs attention or a close</p>
          </li>
        </ul>
      </div>
    </div>
  );
}

export function WarehouseServiceIllustration() {
  return (
    <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr]">
      <div className={`${panel} overflow-hidden`}>
        <div className={panelHead}>
          <span className={eyebrow}>Warehouse service · feature parameters</span>
          <span className="font-mono text-[9px] text-zinc-500 tabular">as_of · 2026-06-03T13:45:11Z</span>
        </div>
        <table className="w-full table-fixed text-left text-xs">
          <thead>
            <tr className="bg-white/[0.03] text-[9px] uppercase tracking-wider text-zinc-500">
              <th className="px-3 py-2 font-medium">Parameter</th>
              <th className="px-3 py-2 font-medium">Example</th>
              <th className="px-3 py-2 font-medium">Source</th>
              <th className="px-3 py-2 font-medium">Usage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {[
              ['Regime', 'compressed_vol', 'market microstructure', 'strategy gating'],
              ['Sentiment', 'risk_on_0.67', 'flow + news blends', 'position sizing'],
              ['Liquidity score', '0.82', 'lit/dark venue depth', 'entry timing'],
              ['Vol state', 'elevated_vol', 'surface + realized bands', 'hedging logic'],
            ].map(([p, e, s, u]) => (
              <tr key={p}>
                <td className="px-3 py-2.5 text-zinc-200">{p}</td>
                <td className="px-3 py-2.5 font-mono tabular text-zinc-400">{e}</td>
                <td className="px-3 py-2.5 text-zinc-400">{s}</td>
                <td className="px-3 py-2.5 font-mono tabular text-moss">{u}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={`${panel} p-4`}>
        <p className="mb-3 text-[9px] uppercase tracking-wider text-zinc-500">Service outputs</p>
        <ul className="space-y-3 text-[13px]">
          <li>
            <p className="text-zinc-300">Point-in-time snapshots for deterministic replay</p>
            <p className="text-[11px] text-zinc-500">no look-ahead leakage in research pipelines</p>
          </li>
          <li>
            <p className="text-zinc-300">Feature-ready marts for model and strategy training</p>
            <p className="text-[11px] text-zinc-500">normalized joins across price, options, and flow</p>
          </li>
          <li className="rounded border border-brass/30 bg-brass/[0.05] px-3 py-2">
            <p className="text-zinc-200">Storage: floppydisk.cc + IPFS archival layers</p>
            <p className="text-[11px] text-zinc-500">content-addressed snapshots with CID lineage for reproducible retrieval</p>
          </li>
        </ul>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section IV — Market intelligence: noise vs conviction               */
/* ------------------------------------------------------------------ */

export function MarketIntelIllustration() {
  const uid = useId().replace(/:/g, '');
  return (
    <div className={`${panel} overflow-hidden`}>
      <div className={panelHead}>
        <span className={eyebrow}>Positioning · NVDA</span>
        <span className="rounded-full border border-moss/40 bg-moss/10 px-2 py-0.5 text-[9px] font-medium text-moss">
          CONVICTION
        </span>
      </div>
      <div className="p-4">
        <svg viewBox="0 0 460 150" className="h-auto w-full" aria-hidden>
          <defs>
            <linearGradient id={`mi-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(201,169,110,0.3)" />
              <stop offset="100%" stopColor="rgba(201,169,110,0)" />
            </linearGradient>
          </defs>
          {/* noise band — jittery, low */}
          <path
            d="M10 110 L40 104 L70 116 L100 100 L130 112 L160 102 L190 114 L220 104 L250 110 L280 100 L310 112 L340 104 L370 116 L400 106 L430 112 L450 106"
            fill="none"
            stroke={DIM}
            strokeWidth="1"
            strokeOpacity="0.5"
          />
          {/* conviction signal — rising with fill */}
          <path
            d="M10 120 L70 118 L130 112 L190 100 L250 82 L310 58 L370 40 L430 28 L450 24"
            fill="none"
            stroke={BRASS}
            strokeWidth="1.8"
          />
          <path
            d="M10 120 L70 118 L130 112 L190 100 L250 82 L310 58 L370 40 L430 28 L450 24 L450 140 L10 140 Z"
            fill={`url(#mi-${uid})`}
          />
          <text x="10" y="18" fill={DIM} fontSize="8.5" fontFamily="ui-monospace, monospace">
            NOISE
          </text>
          <text x="395" y="18" fill={BRASS} fontSize="8.5" fontFamily="ui-monospace, monospace">
            CONVICTION
          </text>
        </svg>
        <div className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded border border-white/[0.06] bg-white/[0.06] text-center">
          {[
            ['Institutional bias', 'Accumulating'],
            ['Hedging pressure', 'Building'],
            ['Flow conviction', 'Elevated'],
          ].map(([k, v]) => (
            <div key={k} className="bg-charcoal/80 px-2 py-3">
              <p className="text-[9px] uppercase tracking-wider text-zinc-500">{k}</p>
              <p className="mt-1 text-[12px] text-tan">{v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section V — Strategy library: versioned + portable                  */
/* ------------------------------------------------------------------ */

const LIB = [
  { name: 'Gamma Squeeze Fade', sym: 'TSLA', ver: 'v4', sharpe: '1.62' },
  { name: 'Premium Harvest', sym: 'SPY', ver: 'v11', sharpe: '2.04' },
  { name: 'Earnings Straddle', sym: 'AAPL', ver: 'v2', sharpe: '1.18' },
];

export function StrategyLibraryIllustration() {
  return (
    <div className={`${panel} overflow-hidden`}>
      <div className={panelHead}>
        <span className={eyebrow}>Library · published strategies</span>
        <span className="font-mono text-[9px] text-zinc-500 tabular">3 of 1,284</span>
      </div>
      <ul className="divide-y divide-white/[0.06]">
        {LIB.map((s) => (
          <li key={s.name} className="flex items-center justify-between gap-3 px-4 py-3.5">
            <div className="min-w-0">
              <p className="truncate text-sm text-neutral-100">{s.name}</p>
              <p className="mt-0.5 font-mono text-[10px] tabular text-zinc-500">
                {s.sym} · {s.ver} · every backtest preserved
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="font-mono text-[11px] tabular text-moss">SR {s.sharpe}</span>
              <span className="rounded border border-brass/30 px-2 py-1 text-[10px] text-tan">Fork</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section VI — Institutional data access                              */
/* ------------------------------------------------------------------ */

export function DataAccessIllustration() {
  return (
    <div className={`${panel} p-5 font-mono text-[12px]`}>
      <div className={`${panelHead} -mx-5 -mt-5 mb-4`}>
        <span className={eyebrow}>Access layer</span>
        <span className="text-[9px] text-moss">● operational</span>
      </div>
      <pre className="overflow-x-auto leading-relaxed text-zinc-400">
        <span className="text-zinc-600">GET</span> <span className="text-tan">/v1/signals/SPY</span>
        {'\n'}
        <span className="text-zinc-600">{'{'}</span>
        {'\n'}  <span className="text-zinc-300">{'"symbol"'}</span>: <span className="text-moss">{'"SPY"'}</span>,
        {'\n'}  <span className="text-zinc-300">{'"as_of"'}</span>: <span className="text-moss">{'"2026-04-12T15:51:08Z"'}</span>,
        {'\n'}  <span className="text-zinc-300">{'"regime"'}</span>: <span className="text-moss">{'"compressed_vol"'}</span>,
        {'\n'}  <span className="text-zinc-300">{'"confidence"'}</span>: <span className="text-tan">0.82</span>
        {'\n'}
        <span className="text-zinc-600">{'}'}</span>
      </pre>
      <p className="mt-4 border-t border-white/[0.06] pt-3 text-[11px] text-zinc-500">
        Institutional market data, options analytics, and computed signals — delivered to your systems.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section VII — Trust & audit: traceable lineage                      */
/* ------------------------------------------------------------------ */

const LINEAGE = ['Raw market data', 'Warehouse', 'Derived models', 'Computed signal', 'Backtest result'];

export function LineageIllustration() {
  return (
    <div className={`${panel} p-5`}>
      <div className={`${panelHead} -mx-5 -mt-5 mb-5`}>
        <span className={eyebrow}>Lineage · signal a3f9c1</span>
        <span className="font-mono text-[9px] text-zinc-500 tabular">verified</span>
      </div>
      <ol className="flex flex-col gap-0">
        {LINEAGE.map((node, i) => (
          <li key={node} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-brass/40 bg-brass/[0.08] font-mono text-[9px] text-tan">
                {i + 1}
              </span>
              {i < LINEAGE.length - 1 && <span className="my-0.5 h-6 w-px bg-gradient-to-b from-brass/40 to-brass/10" />}
            </div>
            <div className="pb-2 pt-0.5">
              <p className="text-[13px] text-zinc-200">{node}</p>
              {i < LINEAGE.length - 1 && (
                <p className="font-mono text-[10px] tabular text-zinc-600">traced · reproducible</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section VII — Commodities                                           */
/* ------------------------------------------------------------------ */

export function CommoditiesIllustration() {
  return (
    <div className={`${panel} overflow-hidden`}>
      <div className={panelHead}>
        <span className={eyebrow}>Commodities lane · alternative markets</span>
        <span className="font-mono text-[9px] text-zinc-500 tabular">session mix · live</span>
      </div>
      <div className="grid gap-px bg-white/[0.06] sm:grid-cols-2">
        <div className="bg-charcoal/80 p-4">
          <p className="mb-3 text-[9px] uppercase tracking-wider text-zinc-500">Tradable groups</p>
          <div className="space-y-2.5 text-[12px]">
            {[
              ['Energy', 'Crude, nat gas, power spreads'],
              ['Metals', 'Gold, silver, copper curves'],
              ['Agriculture', 'Cattle, grains, softs'],
              ['Freight / inputs', 'shipping and industrial input proxies'],
            ].map(([h, b]) => (
              <div key={h} className="rounded border border-white/[0.08] bg-black/25 px-3 py-2.5">
                <p className="text-zinc-200">{h}</p>
                <p className="text-[10px] text-zinc-500">{b}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-charcoal/80 p-4">
          <p className="mb-3 text-[9px] uppercase tracking-wider text-zinc-500">Risk context</p>
          <table className="w-full table-fixed text-left text-xs">
            <thead>
              <tr className="bg-white/[0.03] text-[9px] uppercase tracking-wider text-zinc-500">
                <th className="px-2.5 py-2 font-medium">Theme</th>
                <th className="px-2.5 py-2 font-medium">Signal</th>
                <th className="px-2.5 py-2 font-medium">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {[
                ['Seasonality', 'harvest_window', 'active'],
                ['Basis risk', 'regional_spread', 'elevated'],
                ['Inventory', 'drawdown_rate', 'tightening'],
                ['Vol regime', 'term_structure', 'compressed'],
              ].map(([theme, sig, state]) => (
                <tr key={theme}>
                  <td className="px-2.5 py-2.5 text-zinc-300">{theme}</td>
                  <td className="px-2.5 py-2.5 font-mono tabular text-zinc-400">{sig}</td>
                  <td className="px-2.5 py-2.5 font-mono tabular text-tan">{state}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-[10px] text-zinc-500">Designed for transactable, margin-aware commodities workflows.</p>
        </div>
      </div>
    </div>
  );
}

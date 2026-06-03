/**
 * Homepage product-UI illustrations.
 *
 * These are mock surfaces, not live components — they exist to let the product
 * "show, not tell" on the commercial homepage. Charcoal / brass / moss only,
 * tabular mono for figures. No third-party logos, no infrastructure jargon.
 */

'use client';

import React, { useId, useEffect, useRef, useState } from 'react';

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
  const chainRows = [
    { strike: '470', bid: '12.10', ask: '12.45', last: '12.40', spread: '0.35', moneyness: 'ITM' },
    { strike: '475', bid: '8.65', ask: '8.92', last: '8.85', spread: '0.27', moneyness: 'ITM' },
    { strike: '480', bid: '5.46', ask: '5.72', last: '5.60', spread: '0.26', moneyness: 'ATM', active: true },
    { strike: '485', bid: '3.04', ask: '3.22', last: '3.15', spread: '0.18', moneyness: 'OTM' },
    { strike: '490', bid: '1.54', ask: '1.69', last: '1.62', spread: '0.15', moneyness: 'OTM' },
  ];

  return (
    <div className={`${panel} overflow-hidden`}>
      <div className={panelHead}>
        <span className={eyebrow}>Execution layer · Interactive Brokers</span>
        <div className="flex items-center gap-2">
          <span className="hidden font-mono text-[9px] tabular text-zinc-500 sm:inline">U1234567 · paper</span>
          <span className="rounded-full border border-moss/40 bg-moss/10 px-2 py-0.5 text-[9px] font-medium text-moss">
            LIVE QUOTES
          </span>
        </div>
      </div>

      <div className="grid gap-px bg-white/[0.06] lg:grid-cols-[0.92fr_1.08fr]">
        {/* Wallet */}
        <div className="bg-charcoal/80 p-5">
          <p className="mb-3 text-[9px] uppercase tracking-wider text-zinc-500">Wallet view · account context</p>
          <div className="rounded-md border border-white/[0.08] bg-black/25">
            <div className="flex items-center justify-between border-b border-white/[0.08] px-3 py-2.5">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500">Portfolio</span>
              <span className="font-mono text-[13px] font-medium tabular text-moss">$1,284,220</span>
            </div>
            <div className="space-y-3 px-3 py-3.5 text-[12px]">
              {[
                ['Buying power', '$392,110', 'text-zinc-300'],
                ['Available margin', '$188,440', 'text-zinc-300'],
                ['Daily P&L', '+$12,842', 'text-moss'],
                ['Open risk', '$71,300', 'text-zinc-300'],
              ].map(([k, v, cls]) => (
                <div key={k} className="flex items-center justify-between gap-4">
                  <span className="text-zinc-500">{k}</span>
                  <span className={`font-mono tabular ${cls}`}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 rounded border border-brass/25 bg-brass/[0.04] px-3 py-2">
            <p className="text-[10px] text-zinc-400">
              Margin and buying power refresh on every quote tick — execution sizing stays inside live account limits.
            </p>
          </div>
        </div>

        {/* Options chain */}
        <div className="bg-charcoal/80 p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[9px] uppercase tracking-wider text-zinc-500">Options chain · live contract pricing</p>
            <span className="font-mono text-[9px] tabular text-zinc-500">SPY · Apr 18 · 480.12 · +0.34%</span>
          </div>
          <div className="overflow-hidden rounded-md border border-white/[0.08]">
            <table className="w-full table-fixed text-left text-xs">
              <thead>
                <tr className="bg-white/[0.03] text-[9px] uppercase tracking-wider text-zinc-500">
                  <th className="px-2.5 py-2 font-medium">Strike</th>
                  <th className="px-2.5 py-2 font-medium">Bid</th>
                  <th className="px-2.5 py-2 font-medium">Ask</th>
                  <th className="px-2.5 py-2 font-medium">Last</th>
                  <th className="px-2.5 py-2 font-medium">Spr</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {chainRows.map((row) => (
                  <tr
                    key={row.strike}
                    className={
                      row.active
                        ? 'bg-brass/[0.08] ring-1 ring-inset ring-brass/25'
                        : 'transition-colors hover:bg-white/[0.02]'
                    }
                  >
                    <td className="px-2.5 py-3">
                      <div className="flex items-center gap-2">
                        <MoneynessDot kind={row.moneyness} />
                        <span className="font-mono tabular text-neutral-100">{row.strike}</span>
                      </div>
                    </td>
                    <td className="px-2.5 py-3 font-mono tabular text-zinc-300">{row.bid}</td>
                    <td className="px-2.5 py-3 font-mono tabular text-zinc-300">{row.ask}</td>
                    <td className="px-2.5 py-3 font-mono tabular text-tan">{row.last}</td>
                    <td className="px-2.5 py-3 font-mono tabular text-zinc-500">{row.spread}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[10px] leading-relaxed text-zinc-500">
            Quotes shown before order submission for price-aware execution. ATM row pinned for the working strike.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 divide-y divide-white/[0.06] border-t border-white/[0.06] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {[
          ['Quote latency', '14 ms'],
          ['Route', 'SMART'],
          ['Pre-trade checks', 'passed'],
        ].map(([k, v]) => (
          <div key={k} className="px-4 py-3.5">
            <p className="text-[9px] uppercase tracking-wider text-zinc-500">{k}</p>
            <p className="mt-0.5 font-mono text-sm tabular text-neutral-100">{v}</p>
          </div>
        ))}
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
            <p className="text-zinc-300">Historical run matrix for base-rate win probability</p>
            <p className="text-[11px] text-zinc-500">each win-rate cohort is computed from point-in-time replayed sessions only</p>
          </li>
          <li>
            <p className="text-zinc-300">Game-theory pressure states per decision window</p>
            <p className="text-[11px] text-zinc-500">institutional positioning, hedging pressure, and flow intent feed win-rate weighting</p>
          </li>
          <li className="rounded border border-brass/30 bg-brass/[0.05] px-3 py-2">
            <p className="text-zinc-200">Real-time Monte Carlo risk overlays on every candidate path</p>
            <p className="text-[11px] text-zinc-500">dynamic drawdown, slippage, and tail-risk parameters adjust projected win rate before execution</p>
          </li>
        </ul>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ChatGPT-style streaming token animation                             */
/* ------------------------------------------------------------------ */

const LLM_EXCHANGES = [
  {
    prompt: 'Why did win rate drop from 61% to 47% in elevated volatility?',
    response:
      'Most losses clustered around late entries after liquidity thinned. Game-theory state had shifted to forced hedging — that widened spreads and degraded fill quality. In compressed-vol regimes the same strategy wins 64% of the time. The edge is real; the environment selection is the problem.',
  },
  {
    prompt: 'What does Monte Carlo say about tail risk at current sizing?',
    response:
      'At current parameters, Monte Carlo shows tail risk rising from 6.1% to 11.3% under vol expansion. Reducing position size by 30% in high-pressure windows keeps projected win rate near 57% while cutting max drawdown exposure by roughly half.',
  },
];

function StreamingResponse({ text, active }: { text: string; active: boolean }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const idxRef = useRef(0);

  useEffect(() => {
    if (!active) return;
    setDisplayed('');
    setDone(false);
    idxRef.current = 0;
    const id = window.setInterval(() => {
      idxRef.current += 1;
      setDisplayed(text.slice(0, idxRef.current));
      if (idxRef.current >= text.length) {
        window.clearInterval(id);
        setDone(true);
      }
    }, 18);
    return () => window.clearInterval(id);
  }, [active, text]);

  return (
    <span>
      {displayed}
      {!done && active && (
        <span className="ml-px inline-block h-3.5 w-0.5 translate-y-px animate-pulse bg-tan align-middle" />
      )}
    </span>
  );
}

export function BacktestLlmIllustration() {
  const [turn, setTurn] = useState(0);
  const [phase, setPhase] = useState<'prompt' | 'response' | 'done'>('prompt');

  useEffect(() => {
    const ex = LLM_EXCHANGES[turn % LLM_EXCHANGES.length];
    if (phase === 'prompt') {
      const t = window.setTimeout(() => setPhase('response'), 900);
      return () => window.clearTimeout(t);
    }
    if (phase === 'response') {
      const t = window.setTimeout(
        () => setPhase('done'),
        ex.response.length * 18 + 800,
      );
      return () => window.clearTimeout(t);
    }
    if (phase === 'done') {
      const t = window.setTimeout(() => {
        setTurn((n) => n + 1);
        setPhase('prompt');
      }, 3200);
      return () => window.clearTimeout(t);
    }
  }, [turn, phase]);

  const ex = LLM_EXCHANGES[turn % LLM_EXCHANGES.length];

  return (
    <div className={`${panel} overflow-hidden`}>
      <div className={panelHead}>
        <span className={eyebrow}>BackSpace LLM · plain-English strategy review</span>
        <span className="rounded-full border border-moss/40 bg-moss/10 px-2 py-0.5 text-[9px] font-medium text-moss">
          DECISION SUPPORT
        </span>
      </div>
      <div className="min-h-[200px] space-y-3 bg-charcoal/80 p-4">
        {/* User prompt */}
        <div className="flex justify-end">
          <div className="max-w-[85%] rounded-2xl rounded-br-sm border border-brass/30 bg-brass/[0.08] px-3.5 py-2.5">
            <p className="text-[12px] leading-relaxed text-zinc-200">{ex.prompt}</p>
          </div>
        </div>

        {/* LLM response — streams in */}
        {(phase === 'response' || phase === 'done') && (
          <div className="flex justify-start">
            <div className="max-w-[90%] rounded-2xl rounded-bl-sm border border-white/[0.08] bg-black/30 px-3.5 py-2.5">
              <p className="mb-1.5 flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-zinc-600">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-moss" />
                BackSpace LLM
              </p>
              <p className="text-[12px] leading-relaxed text-zinc-300">
                <StreamingResponse
                  key={`${turn}-${phase}`}
                  text={ex.response}
                  active={phase === 'response'}
                />
              </p>
            </div>
          </div>
        )}

        {/* Thinking indicator */}
        {phase === 'prompt' && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl border border-white/[0.06] bg-black/20 px-4 py-2.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="inline-block h-1.5 w-1.5 rounded-full bg-zinc-500"
                  style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
                />
              ))}
            </div>
          </div>
        )}
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

const FOLDERS = [
  { name: 'Mean Reversion', count: 14, modified: '2h ago', pinned: true },
  { name: 'Momentum Breakout', count: 9, modified: 'yesterday', pinned: true },
  { name: 'Earnings Plays', count: 22, modified: '3 days ago', pinned: false },
];

const FILES = [
  { name: 'Gamma Squeeze Fade', sym: 'TSLA', ver: 'v4', sharpe: '1.62', status: 'live' },
  { name: 'Premium Harvest', sym: 'SPY', ver: 'v11', sharpe: '2.04', status: 'live' },
  { name: 'Earnings Straddle', sym: 'AAPL', ver: 'v2', sharpe: '1.18', status: 'review' },
  { name: 'Vol Contraction Play', sym: 'QQQ', ver: 'v6', sharpe: '1.44', status: 'paper' },
];

function FolderIcon({ pinned }: { pinned: boolean }) {
  return (
    <svg viewBox="0 0 20 17" className="h-4 w-4 shrink-0" aria-hidden>
      <path
        d="M2 2.5h6l1.5 2H18a1 1 0 0 1 1 1V15a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V3.5A1 1 0 0 1 2 2.5Z"
        fill={pinned ? 'rgba(210,180,140,0.18)' : 'rgba(255,255,255,0.06)'}
        stroke={pinned ? 'rgba(210,180,140,0.5)' : 'rgba(255,255,255,0.12)'}
        strokeWidth="1"
      />
    </svg>
  );
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    live: 'bg-moss',
    review: 'bg-[#C9A96E]',
    paper: 'bg-zinc-500',
  };
  return <span className={`inline-block h-1.5 w-1.5 rounded-full ${colors[status] ?? 'bg-zinc-600'}`} />;
}

export function StrategyLibraryIllustration() {
  return (
    <div className={`${panel} overflow-hidden`}>
      {/* Toolbar */}
      <div className={panelHead}>
        <span className={eyebrow}>Research Library · strategy workstation</span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] tabular text-zinc-500">1,284 strategies</span>
          <span className="rounded border border-brass/30 bg-brass/[0.06] px-2 py-0.5 text-[9px] text-tan">
            + New
          </span>
        </div>
      </div>

      <div className="grid gap-px bg-white/[0.06] lg:grid-cols-[200px_1fr]">
        {/* Sidebar */}
        <div className="bg-charcoal/90 p-3">
          <p className="mb-2 text-[9px] uppercase tracking-wider text-zinc-600">Folders</p>
          <div className="space-y-0.5">
            {FOLDERS.map((f) => (
              <div
                key={f.name}
                className={`flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 transition-colors ${
                  f.name === 'Momentum Breakout'
                    ? 'bg-brass/[0.1] text-tan'
                    : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
                }`}
              >
                <FolderIcon pinned={f.pinned} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px]">{f.name}</p>
                  <p className="font-mono text-[9px] tabular text-zinc-600">{f.count} strategies</p>
                </div>
              </div>
            ))}
          </div>

          <p className="mb-2 mt-4 text-[9px] uppercase tracking-wider text-zinc-600">Workstation</p>
          {['Paper', 'Live', 'Archived'].map((label) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded px-2 py-1.5 text-[11px] text-zinc-500 hover:text-zinc-300"
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-zinc-600" />
              {label}
            </div>
          ))}
        </div>

        {/* File grid */}
        <div className="bg-charcoal/80 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[9px] uppercase tracking-wider text-zinc-500">Momentum Breakout · 9 strategies</p>
            <div className="flex gap-1">
              {['Grid', 'List'].map((v, i) => (
                <button
                  key={v}
                  className={`rounded px-2 py-0.5 text-[9px] transition-colors ${
                    i === 1 ? 'bg-white/[0.06] text-zinc-200' : 'text-zinc-600 hover:text-zinc-400'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            {/* column headers */}
            <div className="grid grid-cols-[1fr_56px_40px_52px_72px] gap-2 px-2 pb-1 text-[9px] uppercase tracking-wider text-zinc-600">
              <span>Strategy</span>
              <span className="text-right">Sharpe</span>
              <span>Ver</span>
              <span>Status</span>
              <span className="text-right">Action</span>
            </div>
            {FILES.map((f) => (
              <div
                key={f.name}
                className="grid grid-cols-[1fr_56px_40px_52px_72px] items-center gap-2 rounded-md border border-white/[0.05] bg-white/[0.02] px-2 py-2.5 transition-colors hover:border-brass/25 hover:bg-brass/[0.04]"
              >
                <div className="min-w-0">
                  <p className="truncate text-[12px] text-neutral-100">{f.name}</p>
                  <p className="font-mono text-[9px] tabular text-zinc-500">{f.sym}</p>
                </div>
                <span className="text-right font-mono text-[11px] tabular text-moss">
                  {f.sharpe}
                </span>
                <span className="font-mono text-[10px] tabular text-zinc-500">{f.ver}</span>
                <div className="flex items-center gap-1.5">
                  <StatusDot status={f.status} />
                  <span className="text-[10px] capitalize text-zinc-400">{f.status}</span>
                </div>
                <div className="flex justify-end gap-1">
                  <span className="cursor-pointer rounded border border-white/[0.1] px-1.5 py-0.5 text-[9px] text-zinc-400 hover:border-brass/40 hover:text-tan">
                    Fork
                  </span>
                  <span className="cursor-pointer rounded border border-moss/30 bg-moss/[0.08] px-1.5 py-0.5 text-[9px] text-moss hover:bg-moss/[0.14]">
                    Load
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between border-t border-white/[0.06] bg-white/[0.02] px-4 py-2">
        <span className="font-mono text-[9px] tabular text-zinc-600">
          Premium Harvest v11 · loaded to workstation
        </span>
        <span className="rounded border border-moss/30 bg-moss/[0.08] px-2 py-0.5 text-[9px] text-moss">
          ● active session
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section VI — Institutional data access                              */
/* ------------------------------------------------------------------ */

export function DataAccessIllustration() {
  return (
    <div className={`${panel} overflow-hidden`}>
      <div className={panelHead}>
        <span className={eyebrow}>Bridge Observer · morning briefing</span>
        <span className="rounded-full border border-brass/40 bg-brass/[0.08] px-2 py-0.5 text-[9px] text-tan">
          Morningstar-style layout
        </span>
      </div>
      <div className="grid gap-px bg-white/[0.06] lg:grid-cols-[1.2fr_0.8fr]">
        <div className="bg-charcoal/80 p-5">
          <p className="text-[9px] uppercase tracking-wider text-zinc-500">Today&apos;s lead story</p>
          <h4 className="mt-2 text-pretty font-display text-[22px] leading-[1.15] text-neutral-100">
            Futures hold gains as commodity curves tighten and macro liquidity rotates back into risk.
          </h4>
          <p className="mt-3 text-[12px] leading-[1.8] text-zinc-400">
            Our morning desk read shows participation broadening across cyclicals while index downside hedging fades.
            The notable change is concentrated in commodities-linked transport and energy proxies.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {[
              ['US 10Y', '4.18%', '-4 bps'],
              ['WTI', '$79.42', '+1.7%'],
              ['DXY', '103.1', '-0.3%'],
            ].map(([k, v, d]) => (
              <div key={k} className="rounded border border-white/[0.08] bg-black/20 px-3 py-2.5">
                <p className="text-[9px] uppercase tracking-wider text-zinc-600">{k}</p>
                <p className="mt-1 font-mono text-[13px] tabular text-neutral-100">{v}</p>
                <p className="font-mono text-[10px] tabular text-moss">{d}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-charcoal/80 p-5">
          <p className="mb-3 text-[9px] uppercase tracking-wider text-zinc-500">Sections</p>
          <div className="space-y-2.5">
            {[
              ['Market Pulse', 'Who added risk, who reduced.'],
              ['Flows & Positioning', 'Institutional pressure map by sector.'],
              ['Volatility Desk', 'Regime shift watchlist and catalysts.'],
              ['Commodities Tape', 'Term structure and basis stress scan.'],
            ].map(([h, b]) => (
              <div key={h} className="rounded border border-white/[0.08] bg-black/20 px-3 py-2.5">
                <p className="text-[12px] text-zinc-200">{h}</p>
                <p className="text-[10px] text-zinc-500">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
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
        <div className="bg-charcoal/80 p-5">
          <p className="mb-3 text-[9px] uppercase tracking-wider text-zinc-500">Tradable groups</p>
          <div className="space-y-3 text-[13px]">
            {[
              ['Energy', 'Crude, nat gas, power spreads'],
              ['Metals', 'Gold, silver, copper curves'],
              ['Agriculture', 'Cattle, grains, softs'],
              ['Freight / inputs', 'shipping and industrial input proxies'],
            ].map(([h, b]) => (
              <div key={h} className="rounded border border-white/[0.08] bg-black/25 px-3.5 py-3">
                <p className="text-zinc-200">{h}</p>
                <p className="text-[11px] text-zinc-500">{b}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-charcoal/80 p-5">
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
          <p className="mt-4 text-[11px] text-zinc-500">
            Designed for transactable, margin-aware commodities workflows.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Dashboard — primary authenticated trading terminal.
 *
 * Three-column terminal: left rail (watchlist AG Grid + account), center panel
 * (symbol bar, ECharts price chart, ECharts GEX, tabbed AG Grid / feeds), right
 * rail (Visx regime sparklines, news feed, ECharts dark-pool). An Advanced
 * Analytics toggle swaps the center panel for the dynamically-loaded Perspective
 * workspace. Selecting a chain strike opens the Visx position-analysis overlay.
 *
 * Visualization tooling: ECharts (market charts), AG Grid (tables), Visx (custom
 * analytics), Perspective (pro streaming analytics). Only the focused price
 * chart streams; off-screen charts pause via IntersectionObserver.
 */

'use client';

import React, { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { EChartsOption } from 'echarts';
import type { GridApi } from 'ag-grid-community';
import { LineChart, Table2 } from 'lucide-react';
import { ProfileMenu } from '../components/ProfileMenu';
import { Panel, SignalFeed, NewsFeed } from '../components/dashboard/terminal/panels';
import { PriceChart, type PriceChartHandle } from '../components/charts/PriceChart';
import { GEXBarChart } from '../components/charts/GEXBarChart';
import { EChart } from '../components/charts/EChart';
import { useInViewport } from '../components/charts/useInViewport';
import { CHART } from '../components/charts/chartTokens';
import { OptionsChainGrid, applyChainTransaction, type ChainGridRow } from '../components/grids/OptionsChainGrid';
import { PositionsGrid } from '../components/grids/PositionsGrid';
import { useMarketStream } from '../services/marketStream';
import { TradeHistoryGrid } from '../components/grids/TradeHistoryGrid';
import { WatchlistGrid } from '../components/grids/WatchlistGrid';
import { RegimeSparklines, type SparkItem } from '../components/analytics/RegimeSparklines';
import { PositionAnalysis } from '../components/analytics/PositionAnalysis';
import { StrategyAssistantChat } from '../components/dashboard/StrategyAssistantChat';
import type { ChainRow } from '../components/perspective/usePerspectiveTables';
import {
  ACCOUNT,
  SYMBOLS,
  getSnapshot,
  getWatchlist,
  getPositions,
  getTradeHistory,
  type OptionRow,
  type RegimeSnapshot,
  type DarkPoolRow,
} from '../components/dashboard/terminal/terminalData';

const PerspectiveWorkspace = dynamic(() => import('../components/perspective/PerspectiveWorkspace'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <span className="animate-pulse font-mono text-[11px] text-zinc-500">loading advanced analytics…</span>
    </div>
  ),
});

type Tab = 'chain' | 'positions' | 'history' | 'signals' | 'backtest-llm';

const fmtMoney = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* synthesize a small trend series around a value for the regime sparklines */
function jitterSeries(seed: number, base: number, n = 16): number[] {
  let a = seed >>> 0;
  const out: number[] = [];
  let v = base;
  for (let i = 0; i < n; i++) {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    const r = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    v = v + (r - 0.5) * base * 0.08;
    out.push(v);
  }
  return out;
}

function regimeItems(regime: RegimeSnapshot): SparkItem[] {
  return [
    { label: 'Vol regime', value: regime.volRegime, series: jitterSeries(1, regime.impliedVol), tone: 'neutral' },
    { label: 'Hurst', value: regime.hurst.toFixed(2), series: jitterSeries(2, regime.hurst), tone: regime.hurst > 0.5 ? 'up' : 'down' },
    { label: 'RV / IV', value: `${regime.realizedVol.toFixed(0)} / ${regime.impliedVol.toFixed(0)}`, series: jitterSeries(3, regime.rvIvSpread + 20), tone: regime.rvIvSpread > 0 ? 'down' : 'up' },
    { label: 'Skew (25Δ)', value: regime.skew.toFixed(1), series: jitterSeries(4, regime.skew + 5), tone: 'neutral' },
    { label: 'Term slope', value: regime.termSlope.toFixed(2), series: jitterSeries(5, regime.termSlope), tone: regime.termSlope >= 1 ? 'up' : 'down' },
    { label: 'Dealer GEX', value: `${regime.dealerGexTotal.toFixed(0)}mm`, series: jitterSeries(6, Math.abs(regime.dealerGexTotal) + 10), tone: regime.dealerGexTotal >= 0 ? 'up' : 'down' },
  ];
}

function toChainRows(chain: OptionRow[]): ChainRow[] {
  return chain.map((r) => ({
    id: r.id,
    type: r.type,
    strike: r.strike,
    bid: r.bid,
    ask: r.ask,
    mid: r.mid,
    volume: r.volume,
    openInterest: r.openInterest,
    iv: r.iv,
    ivRank: r.ivRank,
    delta: r.delta,
    gamma: r.gamma,
    theta: r.theta,
    vega: r.vega,
    moneyness: r.moneyness,
  }));
}

function DarkPoolPanel({ rows, unusual }: { rows: DarkPoolRow[]; unusual: number }) {
  const [ref, inView] = useInViewport<HTMLDivElement>();
  const option = useMemo<EChartsOption>(() => {
    const sorted = [...rows].sort((a, b) => a.time - b.time);
    return {
      animation: false,
      grid: { left: 6, right: 6, top: 8, bottom: 18 },
      tooltip: { trigger: 'axis', valueFormatter: (v) => `${Number(v).toFixed(1)}%` },
      xAxis: { type: 'category', data: sorted.map((_, i) => `T-${sorted.length - i}`), axisLabel: { fontSize: 8 } },
      yAxis: { type: 'value', axisLabel: { fontSize: 8, formatter: '{value}%' } },
      series: [{ type: 'bar', data: sorted.map((r) => r.pctOfTape), itemStyle: { color: CHART.brass } }],
    };
  }, [rows]);

  return (
    <Panel title="DARK POOL · % OF TAPE">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between px-3 pt-2">
          <span className="text-[10px] uppercase tracking-wider text-zinc-500">Unusual activity</span>
          <span
            className="font-mono text-lg font-semibold tabular-nums"
            style={{ color: unusual > 0.6 ? CHART.down : unusual > 0.35 ? CHART.brass : CHART.up }}
          >
            {(unusual * 100).toFixed(0)}
          </span>
        </div>
        <div ref={ref} className="min-h-0 flex-1">
          <EChart option={option} active={inView} height="100%" />
        </div>
      </div>
    </Panel>
  );
}

export const Dashboard: React.FC = () => {
  const [symbol, setSymbol] = useState<string>(SYMBOLS[0]);
  const [tab, setTab] = useState<Tab>('chain');
  const [advanced, setAdvanced] = useState(false);
  const [analysisRow, setAnalysisRow] = useState<OptionRow | null>(null);

  const watchlist = useMemo(() => getWatchlist(), []);
  const positions = useMemo(() => getPositions(), []);
  const history = useMemo(() => getTradeHistory(), []);
  const snap = useMemo(() => getSnapshot(symbol), [symbol]);
  const chainRows = useMemo(() => toChainRows(snap.chain), [snap.chain]);
  const regime = useMemo(() => regimeItems(snap.regime), [snap.regime]);

  const [gexRef, gexInView] = useInViewport<HTMLDivElement>();
  const up = snap.change >= 0;

  // Live streaming handles. Dormant unless NEXT_PUBLIC_WS_URL is configured.
  const priceChartRef = useRef<PriceChartHandle | null>(null);
  const chainApiRef = useRef<GridApi<ChainGridRow> | null>(null);
  useMarketStream(symbol, '5m', {
    onCandle: (candle, replaceLast) => priceChartRef.current?.pushCandle(candle, replaceLast),
    onChainDelta: (delta) => {
      const api = chainApiRef.current;
      if (!api) return;
      const stamp = (rows?: OptionRow[]) => rows?.map((r) => ({ ...r, expiration: snap.expirations[2] }));
      applyChainTransaction(api, { add: stamp(delta.add), update: stamp(delta.update), remove: stamp(delta.remove) });
    },
  });

  return (
    <div className="h-screen overflow-hidden bg-charcoal text-zinc-100">
      <PositionAnalysis row={analysisRow} chain={snap.chain} spot={snap.price} symbol={symbol} onClose={() => setAnalysisRow(null)} />

      <header className="sticky top-0 z-30 h-12 border-b border-tan/20 bg-charcoal/95 backdrop-blur-xl">
        <div className="mx-auto flex h-12 max-w-[1920px] items-center justify-between px-3 sm:px-5">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-display text-base tracking-tight text-neutral-100">
              general.exchange
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
              {[
                ['Dashboard', '/dashboard'],
                ['Backtest', '/backspace'],
                ['Options', '/options'],
                ['Risk', '/risk-management'],
              ].map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  className={`rounded px-2.5 py-1 text-[12px] tracking-wide transition-colors ${
                    label === 'Dashboard' ? 'bg-white/[0.06] text-tan' : 'text-zinc-400 hover:text-zinc-100'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <ProfileMenu />
        </div>
      </header>

      <main className="mx-auto grid h-[calc(100vh-3rem)] max-w-[1920px] grid-cols-1 gap-2 p-2 lg:grid-cols-[220px_minmax(0,1fr)_280px]">
        {/* Left rail */}
        <aside className="hidden min-h-0 flex-col gap-2 lg:flex">
          <Panel title="WATCHLIST" className="min-h-0 flex-1">
            <WatchlistGrid items={watchlist} selected={symbol} onSelect={setSymbol} />
          </Panel>
          <Panel title="ACCOUNT" className="shrink-0">
            <div className="grid grid-cols-2 gap-px bg-white/[0.05] text-[11px]">
              {[
                ['Portfolio', `$${fmtMoney(ACCOUNT.portfolioValue)}`, ''],
                ['Cash', `$${fmtMoney(ACCOUNT.cash)}`, ''],
                ['Day PnL', `${ACCOUNT.dayPnl >= 0 ? '+' : ''}$${fmtMoney(ACCOUNT.dayPnl)}`, ACCOUNT.dayPnl >= 0 ? 'text-moss' : 'text-rose-400'],
                ['Total PnL', `${ACCOUNT.totalPnl >= 0 ? '+' : ''}$${fmtMoney(ACCOUNT.totalPnl)}`, ACCOUNT.totalPnl >= 0 ? 'text-moss' : 'text-rose-400'],
              ].map(([label, val, cls]) => (
                <div key={label} className="bg-charcoal px-3 py-2">
                  <div className="text-[9px] uppercase tracking-wider text-zinc-500">{label}</div>
                  <div className={`font-mono tabular-nums ${cls || 'text-zinc-200'}`}>{val}</div>
                </div>
              ))}
            </div>
          </Panel>
        </aside>

        {/* Center panel */}
        <section className="flex min-h-0 min-w-0 flex-col gap-2">
          {/* symbol bar */}
          <div className="flex shrink-0 items-center justify-between rounded-md border border-white/[0.08] bg-charcoal/70 px-3 py-2">
            <div className="flex items-center gap-3">
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="rounded border border-white/[0.1] bg-dark-gray px-2 py-1 font-mono text-sm text-tan focus:outline-none"
              >
                {SYMBOLS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <span className="hidden font-sans text-xs text-zinc-500 sm:block">{snap.name}</span>
              <span className="font-mono text-lg tabular-nums text-zinc-100">{fmtMoney(snap.price)}</span>
              <span className={`font-mono text-sm tabular-nums ${up ? 'text-moss' : 'text-rose-400'}`}>
                {up ? '+' : ''}
                {fmtMoney(snap.change)} ({up ? '+' : ''}
                {snap.changePct.toFixed(2)}%)
              </span>
            </div>
            <button
              onClick={() => setAdvanced((v) => !v)}
              className={`flex items-center gap-1.5 rounded border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide transition-colors ${
                advanced ? 'border-tan/40 bg-tan/15 text-tan' : 'border-white/[0.1] text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {advanced ? <Table2 className="h-3.5 w-3.5" /> : <LineChart className="h-3.5 w-3.5" />}
              {advanced ? 'Standard' : 'Advanced'}
            </button>
          </div>

          {advanced ? (
            <div className="min-h-0 flex-1 overflow-hidden rounded-md border border-white/[0.08] bg-charcoal/70">
              <PerspectiveWorkspace symbol={symbol} chainRows={chainRows} basePrice={snap.price} />
            </div>
          ) : (
            <>
              {/* price chart (primary streaming instance) */}
              <Panel title={`${symbol} · 5M · VWAP / EMA9 / SMA20 / BB`} className="h-[300px] shrink-0">
                <PriceChart ref={priceChartRef} candles={snap.candles} active />
              </Panel>

              {/* GEX (streams only when in viewport) */}
              <Panel title="GAMMA EXPOSURE BY STRIKE" className="h-[190px] shrink-0">
                <div ref={gexRef} className="h-full">
                  <GEXBarChart gex={snap.gex} price={snap.price} active={gexInView} />
                </div>
              </Panel>

              {/* tabbed table / feeds region (flex-grows to fill) */}
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-white/[0.08] bg-charcoal/70">
                <div className="flex shrink-0 items-center gap-px border-b border-white/[0.08] bg-white/[0.02]">
                  {([
                    ['chain', 'Options Chain'],
                    ['positions', 'Positions'],
                    ['history', 'History'],
                    ['signals', 'Signals'],
                    ['backtest-llm', 'Backtest LLM'],
                  ] as [Tab, string][]).map(([id, label]) => (
                    <button
                      key={id}
                      onClick={() => setTab(id)}
                      className={`px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide transition-colors ${
                        tab === id ? 'bg-charcoal text-tan' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="min-h-0 flex-1">
                  {tab === 'chain' && (
                    <OptionsChainGrid
                      chain={snap.chain}
                      expiration={snap.expirations[2]}
                      onSelectRow={setAnalysisRow}
                      onApiReady={(api) => (chainApiRef.current = api)}
                    />
                  )}
                  {tab === 'positions' && <PositionsGrid positions={positions} />}
                  {tab === 'history' && <TradeHistoryGrid trades={history} />}
                  {tab === 'signals' && <SignalFeed signals={snap.signals} />}
                  {tab === 'backtest-llm' && (
                    <div className="h-full p-3">
                      <StrategyAssistantChat stacked />
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </section>

        {/* Right rail */}
        <aside className="hidden min-h-0 flex-col gap-2 lg:flex">
          <Panel title="REGIME" className="shrink-0">
            <RegimeSparklines items={regime} />
          </Panel>
          <Panel title="NEWS" className="min-h-0 flex-1">
            <NewsFeed news={snap.news} />
          </Panel>
          <div className="h-[180px] shrink-0">
            <DarkPoolPanel rows={snap.darkPool} unusual={snap.regime.putCallRatio > 1 ? 0.7 : 0.4} />
          </div>
        </aside>
      </main>
    </div>
  );
};

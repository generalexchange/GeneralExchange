/**
 * Dashboard — primary authenticated trading terminal.
 *
 * Live data only: Polygon REST (via /api/v1 proxy) + WebSocket ticks/candles.
 * Mock generators in terminalData.ts are not used on this screen.
 */

'use client';

import React, { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { GridApi } from 'ag-grid-community';
import { LineChart, Table2 } from 'lucide-react';
import { ProfileMenu } from '../components/ProfileMenu';
import { Panel } from '../components/dashboard/terminal/panels';
import { StockQuoteHero } from '../components/dashboard/StockQuoteHero';
import { PriceChart, type PriceChartHandle } from '../components/charts/PriceChart';
import { GEXBarChart } from '../components/charts/GEXBarChart';
import { useInViewport } from '../components/charts/useInViewport';
import { OptionsChainGrid, applyChainTransaction, type ChainGridRow } from '../components/grids/OptionsChainGrid';
import { useMarketStream } from '../services/marketStream';
import { useLiveDashboard, type ChartRange } from '../hooks/useLiveDashboard';
import { PositionAnalysis } from '../components/analytics/PositionAnalysis';
import { StrategyAssistantChat } from '../components/dashboard/StrategyAssistantChat';
import type { ChainRow } from '../components/perspective/usePerspectiveTables';
import type { OptionRow } from '../components/dashboard/terminal/terminalData';
import { TRADEABLE_SYMBOLS, symbolDisplayName } from '../data/symbols';

const PerspectiveWorkspace = dynamic(() => import('../components/perspective/PerspectiveWorkspace'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <span className="animate-pulse font-mono text-[11px] text-zinc-500">loading advanced analytics…</span>
    </div>
  ),
});

type Tab = 'chain' | 'positions' | 'history' | 'signals' | 'backtest-llm';

function toChainRows(chain: OptionRow[], expiration: string): ChainRow[] {
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
    expiration,
  }));
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-full min-h-[160px] items-center justify-center px-6 text-center">
      <p className="font-mono text-[11px] leading-relaxed text-zinc-500">{message}</p>
    </div>
  );
}

export const Dashboard: React.FC = () => {
  const [symbol, setSymbol] = useState<string>(TRADEABLE_SYMBOLS[0]);
  const [tab, setTab] = useState<Tab>('chain');
  const [advanced, setAdvanced] = useState(false);
  const [analysisRow, setAnalysisRow] = useState<OptionRow | null>(null);
  const [chartRange, setChartRange] = useState<ChartRange>('1D');

  const {
    quote,
    candles,
    chain,
    gex,
    news,
    expirations,
    cardTheme,
    loading,
    error,
    live,
  } = useLiveDashboard(symbol, chartRange);

  const spot = quote?.price ?? 0;
  const nearestExpiration = expirations[0] ?? '—';
  const chainRows = useMemo(() => toChainRows(chain, nearestExpiration), [chain, nearestExpiration]);

  const [gexRef, gexInView] = useInViewport<HTMLDivElement>();
  const priceChartRef = useRef<PriceChartHandle | null>(null);
  const chainApiRef = useRef<GridApi<ChainGridRow> | null>(null);

  useMarketStream(symbol, '5m', {
    onCandle: (candle, replaceLast) => priceChartRef.current?.pushCandle(candle, replaceLast),
    onChainDelta: (delta) => {
      const api = chainApiRef.current;
      if (!api) return;
      const stamp = (rows?: OptionRow[]) =>
        rows?.map((r) => ({ ...r, expiration: nearestExpiration }));
      applyChainTransaction(api, { add: stamp(delta.add), update: stamp(delta.update), remove: stamp(delta.remove) });
    },
  });

  return (
    <div className="h-screen overflow-hidden bg-charcoal text-zinc-100">
      <PositionAnalysis
        row={analysisRow}
        chain={chain}
        spot={spot}
        symbol={symbol}
        onClose={() => setAnalysisRow(null)}
      />

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

      <main className="mx-auto grid h-[calc(100vh-3rem)] max-w-[1920px] grid-cols-1 gap-2 p-2 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="flex min-h-0 min-w-0 flex-col gap-2">
          <div className="flex shrink-0 items-center justify-between rounded-md border border-white/[0.08] bg-charcoal/70 px-3 py-2">
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="rounded border border-white/[0.1] bg-dark-gray px-2 py-1 font-mono text-sm text-tan focus:outline-none"
            >
              {TRADEABLE_SYMBOLS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
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

          {error && (
            <div className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 font-mono text-[11px] text-rose-300">
              Market feed: {error}. Check POLYGON_API_KEY and network.
            </div>
          )}

          {advanced ? (
            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto">
              <Panel title={`${symbol} · 5M · VWAP / EMA9 / SMA20 / BB`} className="h-[280px] shrink-0">
                {candles.length ? (
                  <PriceChart ref={priceChartRef} candles={candles} active />
                ) : (
                  <EmptyState message={loading ? 'Loading live candles…' : 'No candle data available.'} />
                )}
              </Panel>
              <Panel title="GAMMA EXPOSURE BY STRIKE" className="h-[190px] shrink-0">
                <div ref={gexRef} className="h-full">
                  {gex.length ? (
                    <GEXBarChart gex={gex} price={spot} active={gexInView} />
                  ) : (
                    <EmptyState message={loading ? 'Computing GEX from live chain…' : 'Options chain required for GEX.'} />
                  )}
                </div>
              </Panel>
              <div className="min-h-[320px] flex-1 overflow-hidden rounded-md border border-white/[0.08] bg-charcoal/70">
                {chain.length ? (
                  <PerspectiveWorkspace symbol={symbol} chainRows={chainRows} basePrice={spot} />
                ) : (
                  <EmptyState message="Live options chain loading…" />
                )}
              </div>
            </div>
          ) : (
            <>
              <StockQuoteHero
                symbol={symbol}
                name={symbolDisplayName(symbol)}
                price={spot}
                change={quote?.change ?? 0}
                changePct={quote?.changePct ?? 0}
                prevClose={quote?.prevClose}
                afterHoursChange={quote?.afterHoursChange}
                afterHoursChangePct={quote?.afterHoursChangePct}
                candles={candles}
                live={live}
                loading={loading}
                theme={cardTheme}
                chartRange={chartRange}
                onChartRangeChange={setChartRange}
                onOpenAdvanced={() => setAdvanced(true)}
                className="shrink-0"
              />

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
                  {tab === 'chain' &&
                    (chain.length ? (
                      <OptionsChainGrid
                        chain={chain}
                        expiration={nearestExpiration}
                        onSelectRow={setAnalysisRow}
                        onApiReady={(api) => (chainApiRef.current = api)}
                      />
                    ) : (
                      <EmptyState message={loading ? 'Loading live options chain…' : 'No options chain data.'} />
                    ))}
                  {tab === 'positions' && (
                    <EmptyState message="Connect a portfolio or paper account to view positions." />
                  )}
                  {tab === 'history' && (
                    <EmptyState message="Trade history will appear when connected to your execution ledger." />
                  )}
                  {tab === 'signals' && (
                    <EmptyState message="Signal feed activates when strategy signals are configured for this symbol." />
                  )}
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

        <aside className="hidden min-h-0 flex-col gap-2 lg:flex">
          <Panel title="REGIME" className="shrink-0">
            <EmptyState message="Regime analytics will populate from live vol surface data." />
          </Panel>
          <Panel title="NEWS" className="min-h-0 flex-1" bodyClassName="overflow-auto">
            {news.length ? (
              <ul className="divide-y divide-white/[0.05]">
                {news.map((n) => (
                  <li key={n.id} className="px-3 py-2">
                    <p className="text-[11px] leading-snug text-zinc-200">{n.headline}</p>
                    <p className="mt-1 font-mono text-[9px] tabular text-zinc-500">{n.source}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState message={loading ? 'Loading news…' : 'No news available.'} />
            )}
          </Panel>
          <Panel title="DARK POOL · % OF TAPE" className="h-[180px] shrink-0">
            <EmptyState message="Dark pool tape data not yet connected." />
          </Panel>
        </aside>
      </main>
    </div>
  );
};

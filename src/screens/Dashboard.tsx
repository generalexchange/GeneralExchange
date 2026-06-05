/**
 * Legend terminal — live IBKR feeds, quote hero.
 */

'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { LineChart, Table2 } from 'lucide-react';
import { legendDashboardUrl } from '@/lib/legendUrl';
import { ProfileMenu } from '../components/ProfileMenu';
import { Panel } from '../components/dashboard/terminal/panels';
import { StockQuoteHero } from '../components/dashboard/StockQuoteHero';
import { PriceChart, type PriceChartHandle } from '../components/charts/PriceChart';
import { GEXBarChart } from '../components/charts/GEXBarChart';
import { useInViewport } from '../components/charts/useInViewport';
import { useMarketStream } from '../services/marketStream';
import { useLiveDashboard, type ChartRange } from '../hooks/useLiveDashboard';
import { isMarketWsConfigured } from '../services/wsClient';
import { TRADEABLE_SYMBOLS, symbolDisplayName } from '../data/symbols';
import { WalletButton } from '../components/dashboard/WalletButton';
import { MarketTemperature } from '../components/dashboard/MarketTemperature';
import { OpportunityDiscoveryFeed } from '../components/dashboard/OpportunityDiscoveryFeed';

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[120px] items-center justify-center px-6 text-center">
      <p className="font-mono text-[11px] leading-relaxed text-zinc-500">{message}</p>
    </div>
  );
}

export const Dashboard: React.FC = () => {
  const [symbol, setSymbol] = useState<string>(TRADEABLE_SYMBOLS[0]);
  const [advanced, setAdvanced] = useState(false);
  const [chartRange, setChartRange] = useState<ChartRange>('1D');

  const feed = useLiveDashboard(symbol, chartRange);
  const spyFeed = useLiveDashboard('SPY', '1D');

  const spot = feed.quote?.price ?? 0;
  const [gexRef, gexInView] = useInViewport<HTMLDivElement>();
  const priceChartRef = useRef<PriceChartHandle | null>(null);

  useMarketStream(symbol, chartRange === '1D' ? '1m' : '5m', {
    onCandle: (candle, replaceLast) => priceChartRef.current?.pushCandle(candle, replaceLast),
  });

  return (
    <div className="min-h-screen bg-charcoal text-zinc-100">
      <header className="sticky top-0 z-30 h-12 border-b border-tan/20 bg-charcoal/95 backdrop-blur-xl">
        <div className="mx-auto flex h-12 max-w-[1920px] items-center justify-between px-3 sm:px-5">
          <Link href={legendDashboardUrl('/')} className="font-display text-base tracking-tight text-neutral-100">
            General Exchange
          </Link>
          <div className="flex items-center gap-2">
            <WalletButton />
            <ProfileMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-[1920px] flex-col gap-3 p-2 lg:flex-row lg:gap-4 lg:p-3">
        <section className="min-w-0 flex-1">
        <div className="mb-3 flex items-center justify-between rounded-md border border-white/[0.08] bg-charcoal/70 px-3 py-2">
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
            type="button"
            onClick={() => setAdvanced((v) => !v)}
            className={`flex items-center gap-1.5 rounded border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide transition-colors ${
              advanced ? 'border-tan/40 bg-tan/15 text-tan' : 'border-white/[0.1] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {advanced ? <Table2 className="h-3.5 w-3.5" /> : <LineChart className="h-3.5 w-3.5" />}
            {advanced ? 'Standard' : 'Advanced'}
          </button>
        </div>

        {feed.error && !feed.quote?.price && (
          <div className="mb-3 rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 font-mono text-[11px] text-rose-300">
            {feed.error}
            {feed.wsConnected === false && isMarketWsConfigured() ? ' (WebSocket reconnecting…)' : ''}
          </div>
        )}

        {advanced ? (
          <div className="space-y-3">
            <Panel title={`${symbol} · 5M · VWAP / EMA9 / SMA20 / BB`} className="h-[280px]">
              {feed.candles.length ? (
                <PriceChart ref={priceChartRef} candles={feed.candles} active />
              ) : (
                <EmptyState message={feed.loading ? 'Loading live candles…' : 'No candle data available.'} />
              )}
            </Panel>
            <Panel title="GAMMA EXPOSURE BY STRIKE" className="h-[190px]">
              <div ref={gexRef} className="h-full">
                {feed.gex.length ? (
                  <GEXBarChart gex={feed.gex} price={spot} active={gexInView} />
                ) : (
                  <EmptyState message="Options chain required for GEX." />
                )}
              </div>
            </Panel>
          </div>
        ) : (
          <>
          <StockQuoteHero
            symbol={symbol}
            name={symbolDisplayName(symbol)}
            price={spot}
            change={feed.quote?.change ?? 0}
            changePct={feed.quote?.changePct ?? 0}
            prevClose={feed.quote?.prevClose}
            afterHoursChange={feed.quote?.afterHoursChange}
            afterHoursChangePct={feed.quote?.afterHoursChangePct}
            candles={feed.candles}
            live={feed.live}
            loading={feed.loading}
            theme={feed.cardTheme}
            chartRange={chartRange}
            onChartRangeChange={setChartRange}
            onOpenAdvanced={() => setAdvanced(true)}
          />
          </>
        )}
        </section>

        <aside className="flex w-full shrink-0 flex-col gap-3 lg:w-80 lg:max-w-[320px]">
          <MarketTemperature
            selectedSymbol={symbol}
            spyCandles={spyFeed.candles}
            spyLive={spyFeed.live}
            spyLoading={spyFeed.loading}
          />
          <div className="flex min-h-[420px] flex-1 flex-col lg:min-h-[calc(100vh-8rem)]">
            <OpportunityDiscoveryFeed />
          </div>
        </aside>
      </main>
    </div>
  );
};

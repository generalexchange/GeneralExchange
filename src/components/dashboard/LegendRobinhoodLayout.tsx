'use client';

/**
 * Legend — Robinhood-style terminal layout with IBKR live feed (desktop) / API (web).
 */
import React, { useRef, useState } from 'react';
import { LineChart, Table2 } from 'lucide-react';
import { useLiveDashboard, type ChartRange } from '@/hooks/useLiveDashboard';
import { symbolDisplayName } from '@/data/symbols';
import { SymbolSearchBar } from '@/components/dashboard/SymbolSearchBar';
import { StockQuoteHero } from '@/components/dashboard/StockQuoteHero';
import { MonteCarloLegendShowcase } from '@/components/dashboard/MonteCarloLegendShowcase';
import { SpyRiskPanel } from '@/components/dashboard/SpyRiskPanel';
import { CorrelationHeatmap } from '@/components/dashboard/CorrelationHeatmap';
import { DualLayerGreekViz } from '@/components/dashboard/DualLayerGreekViz';
import { MarketTemperature } from '@/components/dashboard/MarketTemperature';
import { OpportunityDiscoveryFeed } from '@/components/dashboard/OpportunityDiscoveryFeed';
import { LiveCacheStatusBar } from '@/components/dashboard/LiveCacheStatusBar';
import { LivePulseIndicator } from '@/components/dashboard/LivePulseIndicator';
import { Panel } from '@/components/dashboard/terminal/panels';
import { PriceChart, type PriceChartHandle } from '@/components/charts/PriceChart';
import { GEXBarChart } from '@/components/charts/GEXBarChart';
import { useInViewport } from '@/components/charts/useInViewport';
import { useMarketStream } from '@/services/marketStream';
import { isLocalDesktopClient } from '@/lib/api/v1Fetch';
import { isMarketWsConfigured } from '@/services/wsClient';
import { useGxEngineFeed } from '@/hooks/useGxEngineFeed';

type Feed = ReturnType<typeof useLiveDashboard>;

type LegendRobinhoodLayoutProps = {
  symbol: string;
  onSymbolChange: (s: string) => void;
  chartRange: ChartRange;
  onChartRangeChange: (r: ChartRange) => void;
  feed: Feed;
};

export function LegendRobinhoodLayout({
  symbol,
  onSymbolChange,
  chartRange,
  onChartRangeChange,
  feed,
}: LegendRobinhoodLayoutProps) {
  const [advanced, setAdvanced] = useState(false);
  const desktop = isLocalDesktopClient();
  const gxFeed = useGxEngineFeed(symbol);
  const spyFeed = useLiveDashboard('SPY', '1D', { lite: true });
  const displayPrice = feed.quote?.price ?? 0;
  const change = feed.quote?.change ?? 0;
  const smoothChange = change;
  const chainReady = feed.chain.length > 0;

  const [gexRef, gexInView] = useInViewport<HTMLDivElement>();
  const priceChartRef = useRef<PriceChartHandle | null>(null);

  useMarketStream(symbol, chartRange === '1D' ? '1m' : '5m', {
    onCandle: (candle, replaceLast) => priceChartRef.current?.pushCandle(candle, replaceLast),
  });

  return (
    <div className="flex min-h-[calc(100vh-3rem)] flex-col bg-charcoal">
      <LiveCacheStatusBar
        live={feed.live}
        source={feed.source}
        symbol={symbol}
        loading={feed.loading}
        gxConnected={feed.gxConnected}
        gxReconnecting={feed.gxReconnecting}
      />

      <main className="mx-auto flex w-full max-w-[1920px] flex-1 flex-col gap-3 p-2 lg:flex-row lg:gap-4 lg:p-3">
        <section className="min-w-0 flex-1">
          <div className="mb-3 flex items-center justify-between gap-2 rounded-md border border-white/[0.08] bg-charcoal/70 px-3 py-2">
            <SymbolSearchBar value={symbol} onChange={onSymbolChange} />
            <button
              type="button"
              onClick={() => setAdvanced((v) => !v)}
              className={`flex shrink-0 items-center gap-1.5 rounded border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide transition-colors ${
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
              <Panel title={`${symbol} · 5M`} className="relative h-[280px] overflow-hidden">
                <div className="relative z-10 h-full">
                  {feed.candles.length ? (
                    <PriceChart ref={priceChartRef} candles={feed.candles} active />
                  ) : feed.loading ? (
                    <div className="flex h-full items-center justify-center font-mono text-[11px] text-zinc-500">
                      Loading IBKR candles…
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center font-mono text-[11px] text-zinc-500">
                      No candle data
                    </div>
                  )}
                </div>
              </Panel>
              <Panel title="Gamma exposure" className="h-[190px]">
                <div ref={gexRef} className="h-full">
                  {feed.gex.length ? (
                    <GEXBarChart gex={feed.gex} price={displayPrice} active={gexInView} />
                  ) : !chainReady && feed.loading ? (
                    <div className="flex h-full items-center justify-center font-mono text-[11px] text-zinc-500">
                      Loading options chain…
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center font-mono text-[11px] text-zinc-500">
                      Options chain required for GEX
                    </div>
                  )}
                </div>
              </Panel>
            </div>
          ) : (
            <>
              <div className="relative overflow-hidden rounded-xl">
                <div className="relative z-10">
                  <StockQuoteHero
                    symbol={symbol}
                    name={symbolDisplayName(symbol)}
                    price={displayPrice}
                    change={smoothChange}
                    changePct={feed.quote?.changePct ?? 0}
                    prevClose={feed.quote?.prevClose}
                    sessionOpen={feed.sessionOpen}
                    afterHoursChange={feed.quote?.afterHoursChange}
                    afterHoursChangePct={feed.quote?.afterHoursChangePct}
                    candles={feed.candles}
                    live={feed.live}
                    loading={feed.loading}
                    theme={feed.cardTheme}
                    chartRange={chartRange}
                    onChartRangeChange={onChartRangeChange}
                    onOpenAdvanced={() => setAdvanced(true)}
                  />
                </div>
              </div>
              {feed.live && chartRange === '1D' && (!desktop || gxFeed.connected) ? (
                <LivePulseIndicator accentClass="bg-[#00C805]" visible />
              ) : null}
              <div className="mt-3">
                <MonteCarloLegendShowcase
                  symbol={symbol}
                  spot={displayPrice}
                  chain={feed.chain}
                  live={feed.live}
                />
              </div>
              {feed.chain.length > 0 && (
                <div className="mt-3">
                  <DualLayerGreekViz symbol={symbol} chain={feed.chain} />
                </div>
              )}
            </>
          )}
        </section>

        <aside className="flex w-full shrink-0 flex-col gap-3 lg:w-80 lg:max-w-[320px]">
          <SpyRiskPanel symbol={symbol} />
          <CorrelationHeatmap highlight={symbol} />
          <MarketTemperature
            spyCandles={spyFeed.candles}
            spyLive={spyFeed.live}
            spyLoading={spyFeed.loading}
          />
          <div className="flex min-h-[360px] flex-1 flex-col lg:min-h-[calc(100vh-8rem)]">
            <OpportunityDiscoveryFeed
              highlightSymbol={symbol}
              chain={feed.chain}
              spot={displayPrice}
              chainLoading={!chainReady && feed.loading}
              live={feed.live}
            />
          </div>
        </aside>
      </main>
    </div>
  );
}

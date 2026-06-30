'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Search, Sparkles } from 'lucide-react';
import type { ChartRange } from '@/hooks/useLiveDashboard';
import type { useLiveDashboard } from '@/hooks/useLiveDashboard';
import { buildTradeInsights } from '@/lib/tradeEngineInsights';
import { TRADEABLE_SYMBOLS, symbolDisplayName } from '@/data/symbols';
import { QuotePriceChart } from '@/components/dashboard/QuotePriceChart';
import { GEXBarChart } from '@/components/charts/GEXBarChart';
import { SpyRiskPanel } from '@/components/dashboard/SpyRiskPanel';
import { LiveCacheStatusBar } from '@/components/dashboard/LiveCacheStatusBar';
import { useSpyRegression } from '@/hooks/useSpyRegression';
import { useInterpolatedQuote } from '@/hooks/useInterpolatedQuote';

type Feed = ReturnType<typeof useLiveDashboard>;

type TradeEngineShellProps = {
  symbol: string;
  onSymbolChange: (s: string) => void;
  chartRange: ChartRange;
  onChartRangeChange: (r: ChartRange) => void;
  feed: Feed;
};

const SUGGESTED = [
  'Gamma squeeze risk today?',
  'What is driving price action?',
  'How do Greeks interact with flow?',
  'Beta vs SPY right now',
];

const severityBorder = {
  neutral: 'border-white/[0.08]',
  watch: 'border-amber-500/35',
  alert: 'border-rose-500/40',
} as const;

export function TradeEngineShell({
  symbol,
  onSymbolChange,
  chartRange,
  onChartRangeChange,
  feed,
}: TradeEngineShellProps) {
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('What is driving price action?');
  const spy = useSpyRegression(symbol);
  const smooth = useInterpolatedQuote(symbol);

  const spot = smooth.displayPrice > 0 ? smooth.displayPrice : feed.quote?.price ?? 0;

  const insights = useMemo(
    () =>
      buildTradeInsights({
        symbol,
        spot,
        changePct: feed.quote?.changePct ?? 0,
        chain: feed.chain,
        gex: feed.gex,
        beta: spy.regression?.beta,
        alphaPct: spy.regression?.alphaAnnualizedPct,
        correlation: spy.regression?.correlation,
        live: feed.live,
        source: feed.source,
      }),
    [symbol, spot, feed.quote?.changePct, feed.chain, feed.gex, feed.live, feed.source, spy.regression],
  );

  const filtered = useMemo(() => {
    const q = activeQuery.toLowerCase();
    if (q.includes('gamma') || q.includes('squeeze')) return insights.filter((i) => i.id === 'gamma' || i.id === 'flip');
    if (q.includes('greek')) return insights.filter((i) => i.id === 'greeks' || i.id === 'gamma');
    if (q.includes('beta') || q.includes('spy') || q.includes('market')) return insights.filter((i) => i.id === 'beta');
    if (q.includes('driv') || q.includes('price')) return insights.filter((i) => i.id === 'drivers');
    return insights;
  }, [activeQuery, insights]);

  const submitQuery = () => {
    const text = query.trim();
    if (text) setActiveQuery(text);
    setQuery('');
  };

  return (
    <div className="flex min-h-[calc(100vh-3rem)] flex-col bg-[#0a0b0e]">
      <LiveCacheStatusBar live={feed.live} source={feed.source} symbol={symbol} loading={feed.loading} />

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-8">
        {/* Perplexity-style query bar */}
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <select
              value={symbol}
              onChange={(e) => onSymbolChange(e.target.value)}
              className="rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 font-mono text-sm text-tan outline-none focus:border-tan/40"
            >
              {TRADEABLE_SYMBOLS.map((s) => (
                <option key={s} value={s}>
                  {s} · {symbolDisplayName(s)}
                </option>
              ))}
            </select>
            <p className="font-mono text-[11px] tabular-nums text-zinc-500">
              {spot > 0 ? (
                <>
                  <span className="text-zinc-200">${spot.toFixed(2)}</span>
                  <span className={(feed.quote?.changePct ?? 0) >= 0 ? ' text-emerald-400' : ' text-rose-400'}>
                    {' '}
                    {(feed.quote?.changePct ?? 0) >= 0 ? '+' : ''}
                    {(feed.quote?.changePct ?? 0).toFixed(2)}%
                  </span>
                </>
              ) : (
                '—'
              )}
            </p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-white/[0.12] bg-[#12141a] shadow-[0_24px_80px_-40px_rgba(0,0,0,0.9)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(201,169,110,0.08),transparent_55%)]" />
            <div className="relative flex items-end gap-2 p-3 sm:p-4">
              <Sparkles className="mb-2.5 hidden h-5 w-5 shrink-0 text-tan/60 sm:block" />
              <textarea
                rows={1}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    submitQuery();
                  }
                }}
                placeholder="Ask the trade engine…"
                className="max-h-28 min-h-[44px] flex-1 resize-none bg-transparent text-[15px] leading-relaxed text-zinc-100 placeholder:text-zinc-600 outline-none"
              />
              <button
                type="button"
                onClick={submitQuery}
                className="mb-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-tan text-charcoal transition hover:bg-tan-muted"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGESTED.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setActiveQuery(s)}
                className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[12px] text-zinc-400 transition hover:border-white/15 hover:text-zinc-200"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {feed.error && !feed.quote?.price ? (
          <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {feed.error}
          </div>
        ) : null}

        {/* Streaming answer cards */}
        <div className="space-y-4">
          <p className="text-[12px] text-zinc-600">
            Analyzing <span className="text-zinc-400">{activeQuery}</span>
            {feed.live ? (
              <span className="ml-2 inline-flex items-center gap-1 text-emerald-500/80">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                streaming
              </span>
            ) : null}
          </p>

          <AnimatePresence mode="popLayout">
            {filtered.map((insight, i) => (
              <motion.article
                key={insight.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
                className={`rounded-xl border bg-[#0f1014] p-4 sm:p-5 ${severityBorder[insight.severity]}`}
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">
                      {insight.tag}
                    </span>
                    <h3 className="mt-1 text-[17px] font-medium tracking-tight text-zinc-100">{insight.title}</h3>
                  </div>
                  {insight.metric ? (
                    <span className="shrink-0 rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-1 font-mono text-[11px] text-tan">
                      {insight.metric}
                    </span>
                  ) : null}
                </div>
                <p className="text-[14px] leading-[1.7] text-zinc-400">{insight.body}</p>
                <p className="mt-3 flex items-center gap-1 font-mono text-[10px] text-zinc-600">
                  <ArrowUpRight className="h-3 w-3" />
                  IBKR local · {symbol} · refreshed {feed.live ? 'live' : 'cached'}
                </p>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>

        {/* Charts row — compact Perplexity "sources" panel */}
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-white/[0.08] bg-[#0f1014] p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Session chart</p>
              <div className="flex gap-1">
                {(['1D', '1W', '1M'] as ChartRange[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => onChartRangeChange(r)}
                    className={`rounded px-2 py-0.5 font-mono text-[10px] ${
                      chartRange === r ? 'bg-tan/20 text-tan' : 'text-zinc-600 hover:text-zinc-400'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[180px]">
              {feed.candles.length > 0 && spot > 0 ? (
                <QuotePriceChart
                  candles={feed.candles}
                  up={(feed.quote?.changePct ?? 0) >= 0}
                  prevClose={feed.quote?.prevClose ?? spot}
                  theme="tan"
                  height={180}
                  live={feed.live}
                  liveDisplayPrice={smooth.displayPrice}
                />
              ) : (
                <div className="flex h-full items-center justify-center font-mono text-[11px] text-zinc-600">
                  {feed.loading ? 'Loading candles…' : 'No chart data'}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-[#0f1014] p-3">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500">Gamma exposure</p>
            <div className="h-[180px]">
              {feed.gex.length > 0 ? (
                <GEXBarChart gex={feed.gex} price={spot} active />
              ) : (
                <div className="flex h-full items-center justify-center font-mono text-[11px] text-zinc-600">
                  Load options chain for GEX
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <SpyRiskPanel symbol={symbol} />
        </div>
      </div>
    </div>
  );
}

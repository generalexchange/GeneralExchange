/**
 * AI trading command center — front-end only; mock data; no APIs.
 */

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { ProfileMenu } from '../components/ProfileMenu';
import { StockSearchResults } from '../components/StockSearchResults';
import { MarketChart } from '../components/dashboard/MarketChart';
import { OrderBookPreview } from '../components/dashboard/OrderBookPreview';
import { TradeEngineModal } from '../components/dashboard/TradeEngineModal';
import { PortfolioAnalyticsModal } from '../components/dashboard/PortfolioAnalyticsModal';
import { ChartSkeleton, OrderBookSkeleton } from '../components/dashboard/DashboardSkeletons';
import {
  MARKET_SERIES,
  MODEL_EDGE_BY_MODEL,
  OPTIONS_CONTEXT_BY_MODEL,
  getPredictionSeriesForModel,
  getPredictionOutlook,
  buildTradeSetupFromSeries,
  getSignalExplanationLines,
  buildIntelligenceRibbon,
  getDirectionalAccuracyPct,
  STRATEGY_SIGNAL,
  type ModelId,
} from '../components/dashboard/mockMlDashboardData';
import { DashboardSidebar } from '../components/DashboardSidebar';
import { RiskDashboardTab } from '../components/dashboard/RiskDashboardTab';
import { StrategiesResearchWorkspace } from '../components/dashboard/StrategiesResearchWorkspace';
import { useDashboardView } from '@/hooks/useDashboardView';

const easeLuxury = [0.22, 1, 0.36, 1] as const;

const headerMotion = {
  initial: { opacity: 0, y: -14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: easeLuxury },
};

const mainStagger = {
  initial: 'hidden' as const,
  animate: 'show' as const,
  variants: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.08 },
    },
  },
};

const sectionItem = {
  variants: {
    hidden: { opacity: 0, y: 26 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.52, ease: easeLuxury },
    },
  },
};

export const Dashboard: React.FC = () => {
  const view = useDashboardView();
  const [selectedModel, setSelectedModel] = useState<ModelId>('xgboost');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tradeEngineModalOpen, setTradeEngineModalOpen] = useState(false);
  const [portfolioAnalyticsOpen, setPortfolioAnalyticsOpen] = useState(false);
  const [actionFx, setActionFx] = useState<{ id: number; label: string } | null>(null);
  const predictionData = getPredictionSeriesForModel(selectedModel);
  const outlook = getPredictionOutlook(selectedModel, predictionData);
  const tradeSetup = buildTradeSetupFromSeries(predictionData, outlook);
  const modelEdge = MODEL_EDGE_BY_MODEL[selectedModel];
  const optionsContext = OPTIONS_CONTEXT_BY_MODEL[selectedModel];
  const intelligenceRibbon = buildIntelligenceRibbon(selectedModel, modelEdge, predictionData, optionsContext);
  const lastBar = predictionData[predictionData.length - 1];
  const tradeLevels = {
    entry: tradeSetup.entryPrice,
    target: tradeSetup.targetPrice,
    stop: tradeSetup.stopLoss,
  };
  const explanationLines = getSignalExplanationLines({
    tradeSetup,
    directionalAccuracyPct: getDirectionalAccuracyPct(selectedModel),
    signal: STRATEGY_SIGNAL.current,
  });

  useEffect(() => {
    setLoading(true);
    const t = window.setTimeout(() => setLoading(false), 550);
    return () => window.clearTimeout(t);
  }, [selectedModel]);

  useEffect(() => {
    if (!actionFx) return;
    const t = window.setTimeout(() => setActionFx(null), 1100);
    return () => window.clearTimeout(t);
  }, [actionFx]);

  const triggerActionFx = (label: string) => {
    setActionFx({ id: Date.now(), label });
  };

  const handleModelSelect = (modelId: ModelId) => {
    setSelectedModel(modelId);
    triggerActionFx('Model updated');
  };

  const handleOpenAnalytics = () => {
    setPortfolioAnalyticsOpen(true);
    triggerActionFx('Analytics opened');
  };

  const handleOpenTradeEngine = () => {
    setTradeEngineModalOpen(true);
    triggerActionFx('Trade engine opened');
  };

  return (
    <div className="min-h-screen bg-charcoal text-zinc-100">
      <TradeEngineModal open={tradeEngineModalOpen} onClose={() => setTradeEngineModalOpen(false)} />
      <PortfolioAnalyticsModal
        open={portfolioAnalyticsOpen}
        onClose={() => setPortfolioAnalyticsOpen(false)}
        onOpenTradeEngine={handleOpenTradeEngine}
      />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-30%,rgba(255,255,255,0.04),transparent_55%),radial-gradient(ellipse_55%_45%_at_100%_0%,rgba(255,255,255,0.03),transparent_45%)]" />
      <AnimatePresence>
        {actionFx && (
          <motion.div
            key={actionFx.id}
            className="pointer-events-none fixed right-4 top-20 z-[120] rounded-xl border border-white/15 bg-[#0b0b0b]/95 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-200 shadow-xl shadow-black/40 sm:right-6"
            initial={{ opacity: 0, y: -10, scale: 0.96, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, scale: 0.98, filter: 'blur(3px)' }}
            transition={{ duration: 0.28, ease: easeLuxury }}
          >
            {actionFx.label}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.header
        className="relative z-30 border-b border-tan/20 bg-charcoal/95 backdrop-blur-xl"
        {...headerMotion}
      >
        <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 py-3 sm:py-0 sm:min-h-16 sm:flex sm:items-center">
          <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:gap-x-4 lg:h-16 lg:items-center">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 col-start-1 row-start-1">
              <Link
                href="/"
                className="min-w-0 shrink-0 truncate font-display text-base sm:text-lg text-neutral-100 tracking-tight"
              >
                General Exchange
              </Link>
            </div>

            <div className="relative z-40 min-w-0 col-span-2 col-start-1 row-start-2 sm:col-span-1 sm:col-start-2 sm:row-start-1 w-full">
              <label className="sr-only" htmlFor="dashboard-stock-search">
                Search stocks
              </label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
                  aria-hidden
                />
                <input
                  id="dashboard-stock-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search symbol or company…"
                  autoComplete="off"
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 outline-none ring-institutional-green/20 transition-shadow focus:ring-2 touch-manipulation"
                />
                <StockSearchResults query={searchQuery} />
              </div>
            </div>

            <div className="col-start-2 row-start-1 justify-self-end self-center sm:col-start-3 sm:row-start-1">
              <ProfileMenu />
            </div>
          </div>
        </div>
      </motion.header>

      <div className="relative z-10 flex max-w-[1680px] mx-auto">
        <DashboardSidebar />
        <motion.main
          className="relative z-10 flex-1 min-w-0 px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 pb-16"
          {...mainStagger}
        >
          {view === 'risk' && <RiskDashboardTab />}

          {view === 'strategies' && (
            <StrategiesResearchWorkspace
              intelligenceRibbon={intelligenceRibbon}
              loading={loading}
              selectedModel={selectedModel}
              onModelSelect={handleModelSelect}
              predictionData={predictionData}
              outlook={outlook}
              lastBar={lastBar}
              tradeLevels={tradeLevels}
              modelEdge={modelEdge}
              optionsContext={optionsContext}
              explanationLines={explanationLines}
              tradeSetup={tradeSetup}
            />
          )}

          {view === 'overview' && (
            <>
              <motion.section className="mb-10 sm:mb-12" aria-labelledby="market-session-title" {...sectionItem}>
                <h2 id="market-session-title" className="sr-only">
                  Paper session · tape and depth
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
                  <div className="lg:col-span-2">
                    {loading ? (
                      <ChartSkeleton className="min-h-[420px] sm:min-h-[480px]" />
                    ) : (
                      <MarketChart
                        data={MARKET_SERIES}
                        onOpenAnalytics={handleOpenAnalytics}
                        intelligenceRibbon={intelligenceRibbon}
                      />
                    )}
                  </div>
                  <div className="lg:col-span-1">
                    {loading ? <OrderBookSkeleton /> : <OrderBookPreview />}
                  </div>
                </div>
              </motion.section>
            </>
          )}
        </motion.main>
      </div>
    </div>
  );
};

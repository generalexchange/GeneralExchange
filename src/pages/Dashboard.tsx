/**
 * AI trading command center — front-end only; mock data; no APIs.
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, Search } from 'lucide-react';
import { ProfileMenu } from '../components/ProfileMenu';
import { StockSearchResults } from '../components/StockSearchResults';
import { ModelSelector } from '../components/dashboard/ModelSelector';
import { PredictionChart } from '../components/dashboard/PredictionChart';
import { MetricsPanel } from '../components/dashboard/MetricsPanel';
import { SignalPanel } from '../components/dashboard/SignalPanel';
import { AccuracyTrendChart } from '../components/dashboard/AccuracyTrendChart';
import { MarketChart } from '../components/dashboard/MarketChart';
import { OrderBookPreview } from '../components/dashboard/OrderBookPreview';
import { PredictionOutlookPanel } from '../components/dashboard/PredictionOutlookPanel';
import { IntelligenceStatusBar } from '../components/dashboard/IntelligenceStatusBar';
import { OptionsContextPanel } from '../components/dashboard/OptionsContextPanel';
import { TradeEngineModal } from '../components/dashboard/TradeEngineModal';
import { PortfolioAnalyticsModal } from '../components/dashboard/PortfolioAnalyticsModal';
import {
  ChartSkeleton,
  MetricCardsSkeleton,
  OrderBookSkeleton,
  OutlookPanelSkeleton,
  PanelSkeleton,
} from '../components/dashboard/DashboardSkeletons';
import {
  MODELS,
  METRICS_MOCK,
  CONFUSION_MATRIX,
  STRATEGY_SIGNAL,
  ROLLING_ACCURACY,
  ERROR_OVER_TIME,
  MARKET_SERIES,
  MODEL_EDGE_BY_MODEL,
  OPTIONS_CONTEXT_BY_MODEL,
  getPredictionSeriesForModel,
  getPredictionOutlook,
  buildTradeSetupFromSeries,
  getSignalExplanationLines,
  getIntelligenceFeed,
  getDirectionalAccuracyPct,
  type ModelId,
} from '../components/dashboard/mockMlDashboardData';

function LayerHeader({
  step,
  title,
  subtitle,
  headingId,
  stepButtonProps,
}: {
  step: string;
  title: string;
  subtitle: string;
  headingId?: string;
  /** When set, the step badge is a button (e.g. open trade engine config). */
  stepButtonProps?: { onClick: () => void; 'aria-label': string };
}) {
  const stepClassName =
    'font-mono text-xs text-zinc-400 tabular-nums border border-white/10 rounded-lg px-2 py-1 bg-white/[0.03]';

  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
      <div className="flex items-center gap-3">
        {stepButtonProps ? (
          <button
            type="button"
            onClick={stepButtonProps.onClick}
            aria-label={stepButtonProps['aria-label']}
            className={`${stepClassName} cursor-pointer transition-all hover:border-white/20 hover:bg-white/[0.06] hover:shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808]`}
          >
            {step}
          </button>
        ) : (
          <span className={stepClassName}>{step}</span>
        )}
        <div>
          <h2 id={headingId} className="text-lg sm:text-xl font-semibold text-white tracking-tight">
            {title}
          </h2>
          <p className="text-sm text-zinc-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

export const Dashboard: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<ModelId>('xgboost');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tradeEngineModalOpen, setTradeEngineModalOpen] = useState(false);
  const [portfolioAnalyticsOpen, setPortfolioAnalyticsOpen] = useState(false);
  const predictionData = getPredictionSeriesForModel(selectedModel);
  const outlook = getPredictionOutlook(selectedModel, predictionData);
  const tradeSetup = buildTradeSetupFromSeries(predictionData, outlook);
  const modelEdge = MODEL_EDGE_BY_MODEL[selectedModel];
  const optionsContext = OPTIONS_CONTEXT_BY_MODEL[selectedModel];
  const intelligenceFeed = getIntelligenceFeed(selectedModel, modelEdge);
  const lastBar = predictionData[predictionData.length - 1];
  const tradeLevels = {
    entry: tradeSetup.entryPrice,
    target: tradeSetup.targetPrice,
    stop: tradeSetup.stopLoss,
  };
  const explanationLines = getSignalExplanationLines({
    tradeSetup,
    directionalAccuracyPct: getDirectionalAccuracyPct(),
    signal: STRATEGY_SIGNAL.current,
  });

  useEffect(() => {
    setLoading(true);
    const t = window.setTimeout(() => setLoading(false), 550);
    return () => window.clearTimeout(t);
  }, [selectedModel]);

  return (
    <div className="min-h-screen bg-[#080808] text-zinc-100">
      <TradeEngineModal open={tradeEngineModalOpen} onClose={() => setTradeEngineModalOpen(false)} />
      <PortfolioAnalyticsModal
        open={portfolioAnalyticsOpen}
        onClose={() => setPortfolioAnalyticsOpen(false)}
        onOpenTradeEngine={() => setTradeEngineModalOpen(true)}
      />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-30%,rgba(255,255,255,0.04),transparent_55%),radial-gradient(ellipse_55%_45%_at_100%_0%,rgba(255,255,255,0.03),transparent_45%)]" />

      <header className="relative z-30 border-b border-white/[0.06] bg-[#0c0c0c]/90 backdrop-blur-xl">
        <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 py-3 sm:py-0 sm:min-h-16 sm:flex sm:items-center">
          <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:gap-x-4 lg:h-16 lg:items-center">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 col-start-1 row-start-1">
              <Link to="/" className="flex items-center gap-2 shrink-0 group min-w-0">
                <LayoutGrid className="w-5 h-5 shrink-0 text-zinc-400 transition-transform group-hover:scale-105" aria-hidden />
                <span className="text-sm sm:text-base font-semibold text-white tracking-tight truncate">
                  General Exchange
                </span>
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
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 outline-none ring-white/10 transition-shadow focus:ring-2 touch-manipulation"
                />
                <StockSearchResults query={searchQuery} />
              </div>
            </div>

            <div className="col-start-2 row-start-1 justify-self-end self-center sm:col-start-3 sm:row-start-1">
              <ProfileMenu />
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 pb-16">
        <IntelligenceStatusBar key={selectedModel} items={intelligenceFeed} />

        {/* 01 Market Engine */}
        <section className="mb-10 sm:mb-12" aria-labelledby="layer-market">
          <LayerHeader
            step="01"
            title="Market Engine"
            headingId="layer-market"
            subtitle="Paper portfolio intraday · buying power · tape and depth (mock)"
          />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
            <div className="lg:col-span-2">
              {loading ? (
                <ChartSkeleton className="min-h-[420px] sm:min-h-[480px]" />
              ) : (
                <MarketChart data={MARKET_SERIES} onOpenAnalytics={() => setPortfolioAnalyticsOpen(true)} />
              )}
            </div>
            <div className="lg:col-span-1">
              {loading ? <OrderBookSkeleton /> : <OrderBookPreview />}
            </div>
          </div>
        </section>

        {/* 02 Prediction */}
        <section className="mb-10 sm:mb-12" aria-labelledby="layer-prediction">
          <LayerHeader
            step="02"
            title="Prediction layer"
            subtitle="Model path, confidence, and a readout for expected move → target → horizon"
          />
          <div id="layer-prediction" className="grid grid-cols-1 xl:grid-cols-12 gap-5 xl:gap-6">
            <div className="xl:col-span-4 min-w-0">
              <ModelSelector models={MODELS} selectedId={selectedModel} onSelect={setSelectedModel} />
            </div>
            <div className="xl:col-span-8 min-w-0">
              {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 xl:gap-5">
                  <ChartSkeleton className="h-[280px] sm:h-[320px] lg:col-span-3" />
                  <div className="lg:col-span-2 min-w-0">
                    <OutlookPanelSkeleton />
                  </div>
                </div>
              ) : (
                <div
                  key={selectedModel}
                  className="grid grid-cols-1 lg:grid-cols-5 gap-4 xl:gap-5 animate-dash-fade-in"
                >
                  <div className="lg:col-span-3 min-w-0">
                    <PredictionChart data={predictionData} tradeLevels={tradeLevels} />
                  </div>
                  <div className="lg:col-span-2 min-w-0">
                    <PredictionOutlookPanel
                      outlook={outlook}
                      actual={lastBar.actual}
                      predicted={lastBar.predicted}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 03 Accuracy */}
        <section className="mb-10 sm:mb-12" aria-labelledby="layer-accuracy">
          <LayerHeader
            step="03"
            title="Accuracy layer"
            subtitle="Level errors, directional hit rate, and calibration grid"
          />
          <div id="layer-accuracy" className="grid grid-cols-1 xl:grid-cols-12 gap-5 xl:gap-6 items-start">
            <div className="xl:col-span-7 space-y-5">
              {loading ? (
                <>
                  <MetricCardsSkeleton />
                  <PanelSkeleton tall />
                </>
              ) : (
                <div
                  key={selectedModel}
                  className="rounded-2xl border border-white/[0.06] bg-[#0a0a0a] backdrop-blur-xl p-4 sm:p-6 animate-dash-fade-in"
                >
                  <MetricsPanel metrics={METRICS_MOCK} modelEdge={modelEdge} confusionRows={CONFUSION_MATRIX} />
                </div>
              )}
            </div>
            <div className="xl:col-span-5">
              {loading ? <PanelSkeleton tall /> : <AccuracyTrendChart rollingAccuracy={ROLLING_ACCURACY} errorOverTime={ERROR_OVER_TIME} />}
            </div>
          </div>
        </section>

        {/* 04 Execution */}
        <section aria-labelledby="layer-exec">
          <LayerHeader
            step="04"
            title="Execution layer"
            subtitle="Dominant signal, trade ladder, narrative, and options context"
          />
          <div id="layer-exec">
            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
                <div className="lg:col-span-2">
                  <PanelSkeleton tall />
                </div>
                <PanelSkeleton tall />
              </div>
            ) : (
              <div
                key={selectedModel}
                className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5 animate-dash-fade-in items-stretch"
              >
                <div className="lg:col-span-2 min-w-0">
                  <SignalPanel
                    current={STRATEGY_SIGNAL.current}
                    confidencePct={STRATEGY_SIGNAL.confidencePct}
                    recent={STRATEGY_SIGNAL.recent}
                    tradeSetup={tradeSetup}
                    explanationLines={explanationLines}
                  />
                </div>
                <div className="lg:col-span-1 min-w-0">
                  <OptionsContextPanel context={optionsContext} />
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

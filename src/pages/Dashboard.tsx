/**
 * AI trading command center — front-end only; mock data; no APIs.
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, LayoutGrid } from 'lucide-react';
import { ProfileMenu } from '../components/ProfileMenu';
import { ModelSelector } from '../components/dashboard/ModelSelector';
import { PredictionChart } from '../components/dashboard/PredictionChart';
import { MetricsPanel } from '../components/dashboard/MetricsPanel';
import { SignalPanel } from '../components/dashboard/SignalPanel';
import { AccuracyTrendChart } from '../components/dashboard/AccuracyTrendChart';
import { MarketChart } from '../components/dashboard/MarketChart';
import { OrderBookPreview } from '../components/dashboard/OrderBookPreview';
import {
  ChartSkeleton,
  MetricCardsSkeleton,
  OrderBookSkeleton,
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
  ORDER_BOOK_MOCK,
  getPredictionSeriesForModel,
  type ModelId,
} from '../components/dashboard/mockMlDashboardData';

function LayerHeader({
  step,
  title,
  subtitle,
}: {
  step: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-cyan-400/90 tabular-nums border border-cyan-500/30 rounded-lg px-2 py-1 bg-cyan-500/5">
          {step}
        </span>
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-white tracking-tight">{title}</h2>
          <p className="text-sm text-zinc-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

export const Dashboard: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<ModelId>('xgboost');
  const [loading, setLoading] = useState(true);
  const activeName = MODELS.find((m) => m.id === selectedModel)?.name ?? 'Model';
  const predictionData = getPredictionSeriesForModel(selectedModel);

  useEffect(() => {
    setLoading(true);
    const t = window.setTimeout(() => setLoading(false), 550);
    return () => window.clearTimeout(t);
  }, [selectedModel]);

  return (
    <div className="min-h-screen bg-[#050608] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-25%,rgba(34,197,94,0.06),transparent_55%),radial-gradient(ellipse_60%_40%_at_100%_10%,rgba(139,92,246,0.07),transparent_45%)]" />

      <header className="relative z-30 border-b border-white/10 bg-[#080a0d]/85 backdrop-blur-xl">
        <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 h-14 sm:h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/" className="flex items-center gap-2 shrink-0 group">
              <LayoutGrid className="w-5 h-5 text-emerald-400/90 transition-transform group-hover:scale-105" aria-hidden />
              <span className="text-sm sm:text-base font-semibold text-white tracking-tight truncate">General Exchange</span>
            </Link>
            <span className="hidden md:inline text-xs text-zinc-500 border-l border-white/10 pl-3 truncate">
              Command center · {activeName}
            </span>
          </div>
          <ProfileMenu />
        </div>
      </header>

      <main className="relative z-10 max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 pb-16">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">Trading intelligence</h1>
          <p className="mt-2 text-sm text-zinc-400 max-w-3xl leading-relaxed">
            Decision flow: surface market state, compare model path to reality, validate accuracy, then act on the signal.
            All data is mocked for UI development.
          </p>
          <nav
            className="mt-5 flex flex-wrap items-center gap-1 sm:gap-2 text-[11px] sm:text-xs font-medium text-zinc-500"
            aria-label="Dashboard flow"
          >
            <span className="text-emerald-400/90">Data</span>
            <ChevronRight className="w-3 h-3 text-zinc-600" />
            <span className="text-violet-300/90">Prediction</span>
            <ChevronRight className="w-3 h-3 text-zinc-600" />
            <span className="text-cyan-300/90">Accuracy</span>
            <ChevronRight className="w-3 h-3 text-zinc-600" />
            <span className="text-fuchsia-300/90">Action</span>
          </nav>
        </div>

        {/* 01 Market */}
        <section className="mb-10 sm:mb-12" aria-labelledby="layer-market">
          <LayerHeader
            step="01"
            title="Market layer"
            subtitle="Live tape mock — price, volume, and depth preview"
          />
          <div id="layer-market" className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
            <div className="lg:col-span-2">
              {loading ? <ChartSkeleton className=" h-[300px] sm:h-[340px]" /> : <MarketChart data={MARKET_SERIES} />}
            </div>
            <div className="lg:col-span-1">
              {loading ? <OrderBookSkeleton /> : <OrderBookPreview bids={ORDER_BOOK_MOCK.bids} asks={ORDER_BOOK_MOCK.asks} />}
            </div>
          </div>
        </section>

        {/* 02 Prediction */}
        <section className="mb-10 sm:mb-12" aria-labelledby="layer-prediction">
          <LayerHeader
            step="02"
            title="Prediction layer"
            subtitle="Select a model profile · actual vs predicted with confidence band"
          />
          <div id="layer-prediction" className="grid grid-cols-1 xl:grid-cols-12 gap-5 xl:gap-6">
            <div className="xl:col-span-4">
              <ModelSelector models={MODELS} selectedId={selectedModel} onSelect={setSelectedModel} />
            </div>
            <div className="xl:col-span-8 min-w-0">
              {loading ? <ChartSkeleton className=" h-[320px]" /> : <PredictionChart data={predictionData} />}
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
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4 sm:p-6">
                  <MetricsPanel metrics={METRICS_MOCK} confusionRows={CONFUSION_MATRIX} />
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
            subtitle="Signal, confidence, timeline, and mock order stub"
          />
          <div id="layer-exec">{loading ? <PanelSkeleton tall /> : <SignalPanel {...STRATEGY_SIGNAL} />}</div>
        </section>
      </main>
    </div>
  );
};

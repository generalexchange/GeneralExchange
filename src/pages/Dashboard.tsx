/**
 * Financial analytics dashboard UI — mock data & charts only (no ML/API backend).
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid } from 'lucide-react';
import { ProfileMenu } from '../components/ProfileMenu';
import { ModelSelector } from '../components/dashboard/ModelSelector';
import { PricePredictionChart } from '../components/dashboard/PricePredictionChart';
import { MetricsPanel } from '../components/dashboard/MetricsPanel';
import { StrategyPanel } from '../components/dashboard/StrategyPanel';
import { PerformanceCharts } from '../components/dashboard/PerformanceCharts';
import {
  MODELS,
  PRICE_SERIES,
  METRICS_MOCK,
  CONFUSION_MATRIX,
  STRATEGY_SIGNAL,
  ROLLING_ACCURACY,
  ERROR_OVER_TIME,
  type ModelId,
} from '../components/dashboard/mockMlDashboardData';

export const Dashboard: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<ModelId>('xgboost');
  const activeName = MODELS.find((m) => m.id === selectedModel)?.name ?? 'Model';

  return (
    <div className="min-h-screen bg-[#07080c] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(34,211,238,0.08),transparent_50%),radial-gradient(ellipse_80%_50%_at_100%_0%,rgba(167,139,250,0.06),transparent_45%)]" />

      <header className="relative z-20 border-b border-white/10 bg-[#0b0c0f]/80 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 h-14 sm:h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/" className="flex items-center gap-2 shrink-0 group">
              <LayoutGrid className="w-5 h-5 text-cyan-400/90" aria-hidden />
              <span className="text-sm sm:text-base font-semibold text-white tracking-tight truncate">
                General Exchange
              </span>
            </Link>
            <span className="hidden sm:inline text-xs text-zinc-500 border-l border-white/10 pl-3 truncate">
              Analytics · {activeName}
            </span>
          </div>
          <ProfileMenu />
        </div>
      </header>

      <main className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-10">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">Prediction & accuracy</h1>
          <p className="mt-1 text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Front-end preview only: compare mock actual vs predicted prices, inspect accuracy metrics, and review strategy
            signals. Connect real series and model outputs when your pipeline is ready.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <aside className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-20 lg:self-start space-y-4">
            <ModelSelector models={MODELS} selectedId={selectedModel} onSelect={setSelectedModel} />
          </aside>

          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            <PricePredictionChart data={PRICE_SERIES} />

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4 sm:p-6">
              <MetricsPanel metrics={METRICS_MOCK} confusionRows={CONFUSION_MATRIX} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <StrategyPanel
                current={STRATEGY_SIGNAL.current}
                confidencePct={STRATEGY_SIGNAL.confidencePct}
                recent={STRATEGY_SIGNAL.recent}
              />
              <PerformanceCharts rollingAccuracy={ROLLING_ACCURACY} errorOverTime={ERROR_OVER_TIME} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

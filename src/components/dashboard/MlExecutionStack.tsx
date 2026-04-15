'use client';

import React from 'react';
import { ModelSelector } from './ModelSelector';
import { PredictionChart } from './PredictionChart';
import { MetricsPanel } from './MetricsPanel';
import { SignalPanel } from './SignalPanel';
import { AccuracyTrendChart } from './AccuracyTrendChart';
import { PredictionOutlookPanel } from './PredictionOutlookPanel';
import { OptionsContextPanel } from './OptionsContextPanel';
import {
  ChartSkeleton,
  MetricCardsSkeleton,
  OutlookPanelSkeleton,
  PanelSkeleton,
} from './DashboardSkeletons';
import {
  MODELS,
  METRICS_MOCK,
  CONFUSION_MATRIX,
  STRATEGY_SIGNAL,
  ROLLING_ACCURACY,
  ERROR_OVER_TIME,
  type ModelId,
  type ModelEdge,
  type OptionsContext,
  type PredictionOutlook,
  type PredictionPoint,
  type TradeSetup,
} from './mockMlDashboardData';
import { LayerHeader } from './LayerHeader';

export type MlExecutionStackProps = {
  loading: boolean;
  selectedModel: ModelId;
  onModelSelect: (id: ModelId) => void;
  predictionData: PredictionPoint[];
  outlook: PredictionOutlook;
  lastBar: { actual: number; predicted: number };
  tradeLevels: { entry: number; target: number; stop: number };
  modelEdge: ModelEdge;
  optionsContext: OptionsContext;
  explanationLines: [string, string];
  tradeSetup: TradeSetup;
};

export function MlExecutionStack({
  loading,
  selectedModel,
  onModelSelect,
  predictionData,
  outlook,
  lastBar,
  tradeLevels,
  modelEdge,
  optionsContext,
  explanationLines,
  tradeSetup,
}: MlExecutionStackProps) {
  return (
    <>
      <section className="mb-10 sm:mb-12" aria-labelledby="layer-prediction">
        <LayerHeader
          step="02"
          title="Prediction layer"
          subtitle="Model path, confidence, and a readout for expected move → target → horizon"
        />
        <div id="layer-prediction" className="grid grid-cols-1 xl:grid-cols-12 gap-5 xl:gap-6">
          <div className="xl:col-span-4 min-w-0">
            <ModelSelector models={MODELS} selectedId={selectedModel} onSelect={onModelSelect} />
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
              <div key={selectedModel} className="grid grid-cols-1 lg:grid-cols-5 gap-4 xl:gap-5">
                <div className="lg:col-span-3 min-w-0">
                  <PredictionChart data={predictionData} tradeLevels={tradeLevels} />
                </div>
                <div className="lg:col-span-2 min-w-0">
                  <PredictionOutlookPanel outlook={outlook} actual={lastBar.actual} predicted={lastBar.predicted} />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

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
                className="rounded-2xl border border-white/[0.06] bg-[#0a0a0a] backdrop-blur-xl p-4 sm:p-6"
              >
                <MetricsPanel metrics={METRICS_MOCK} modelEdge={modelEdge} confusionRows={CONFUSION_MATRIX} />
              </div>
            )}
          </div>
          <div className="xl:col-span-5">
            {loading ? (
              <PanelSkeleton tall />
            ) : (
              <AccuracyTrendChart rollingAccuracy={ROLLING_ACCURACY} errorOverTime={ERROR_OVER_TIME} />
            )}
          </div>
        </div>
      </section>

      <section className="mb-10 sm:mb-12" aria-labelledby="layer-exec">
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
            <div key={selectedModel} className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5 items-stretch">
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
    </>
  );
}

import React from 'react';
import { MetricCard } from './MetricCard';
import { ConfusionMatrix } from './ConfusionMatrix';
import type { DashboardMetrics } from './mockMlDashboardData';

interface MetricsPanelProps {
  metrics: DashboardMetrics;
  confusionRows: { predicted: string; actuals: Record<string, number> }[];
}

export const MetricsPanel: React.FC<MetricsPanelProps> = ({ metrics, confusionRows }) => {
  return (
    <div className="space-y-4">
      <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-purple-400/90">Accuracy metrics</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        <MetricCard name="MAE" value={metrics.mae.value} trend={metrics.mae.trend} invertTrendColors />
        <MetricCard name="MSE" value={metrics.mse.value} trend={metrics.mse.trend} invertTrendColors />
        <MetricCard name="RMSE" value={metrics.rmse.value} trend={metrics.rmse.trend} invertTrendColors />
        <MetricCard name="Directional accuracy" value={metrics.directionalAccuracy.value} trend={metrics.directionalAccuracy.trend} />
        <MetricCard
          name="Theoretical vs market price error"
          value={metrics.theoVsMarketError.value}
          trend={metrics.theoVsMarketError.trend}
          invertTrendColors
        />
        <MetricCard name="Delta accuracy" value={metrics.deltaAccuracy.value} trend={metrics.deltaAccuracy.trend} />
      </div>
      <ConfusionMatrix rows={confusionRows} />
    </div>
  );
};

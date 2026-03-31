import React from 'react';
import { MetricCard } from './MetricCard';
import { ConfusionMatrixGrid } from './ConfusionMatrixGrid';
import type { DashboardMetrics } from './mockMlDashboardData';
import { METRIC_TOOLTIPS } from './mockMlDashboardData';

interface MetricsPanelProps {
  metrics: DashboardMetrics;
  confusionRows: { predicted: string; actuals: Record<string, number> }[];
}

export const MetricsPanel: React.FC<MetricsPanelProps> = ({ metrics, confusionRows }) => {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          name="MAE"
          value={metrics.mae.value}
          trend={metrics.mae.trend}
          invertTrendColors
          metricTooltip={METRIC_TOOLTIPS.mae}
        />
        <MetricCard
          name="MSE"
          value={metrics.mse.value}
          trend={metrics.mse.trend}
          invertTrendColors
          metricTooltip={METRIC_TOOLTIPS.mse}
        />
        <MetricCard
          name="RMSE"
          value={metrics.rmse.value}
          trend={metrics.rmse.trend}
          invertTrendColors
          metricTooltip={METRIC_TOOLTIPS.rmse}
        />
        <MetricCard
          name="Directional accuracy"
          value={metrics.directionalAccuracy.value}
          trend={metrics.directionalAccuracy.trend}
          metricTooltip={METRIC_TOOLTIPS.directionalAccuracy}
        />
      </div>
      <ConfusionMatrixGrid rows={confusionRows} />
    </div>
  );
};

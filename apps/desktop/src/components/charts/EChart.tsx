import React, { useImperativeHandle, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption, ECharts } from 'echarts';
import { registerEChartsTheme, GE_THEME } from './chartTheme';

registerEChartsTheme();

export interface EChartHandle {
  getInstance: () => ECharts | null;
}

interface EChartProps {
  option: EChartsOption;
  height?: number | string;
  /** when true, ECharts merges the option instead of replacing it */
  notMerge?: boolean;
  lazyUpdate?: boolean;
}

/**
 * Thin wrapper around echarts-for-react that applies the shared theme and
 * exposes the underlying instance for incremental streaming updates (so a new
 * candle each second never forces a full React rerender).
 */
export const EChart = React.forwardRef<EChartHandle, EChartProps>(function EChart(
  { option, height = '100%', notMerge = false, lazyUpdate = true },
  ref,
) {
  const chartRef = useRef<ReactECharts>(null);

  useImperativeHandle(ref, () => ({
    getInstance: () => chartRef.current?.getEchartsInstance() ?? null,
  }));

  return (
    <ReactECharts
      ref={chartRef}
      theme={GE_THEME}
      option={option}
      notMerge={notMerge}
      lazyUpdate={lazyUpdate}
      style={{ height, width: '100%' }}
      opts={{ renderer: 'canvas' }}
    />
  );
});

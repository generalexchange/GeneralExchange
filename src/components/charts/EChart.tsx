/**
 * Base ECharts wrapper.
 *
 * Wraps echarts-for-react, registers the general.exchange theme exactly once
 * before the first render, and exposes the underlying ECharts instance so
 * callers can do incremental streaming appends (setOption with only the changed
 * series) instead of replacing the whole option object.
 *
 * A `live` flag combined with an IntersectionObserver lets the dashboard honor
 * the rule that only one streaming chart updates at a time: charts that are not
 * the primary focus and not in the viewport simply stop receiving new options.
 */

'use client';

import React, { useEffect, useImperativeHandle, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsInstance } from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { registerEChartsTheme, GE_THEME } from './echartsTheme';

registerEChartsTheme();

export interface EChartHandle {
  getInstance: () => EChartsInstance | null;
  /** Incremental streaming append: merge only the provided series data. */
  appendSeries: (seriesIndex: number, data: unknown[]) => void;
}

export const EChart = React.forwardRef<
  EChartHandle,
  {
    option: EChartsOption;
    height?: number | string;
    className?: string;
    /** When false, option updates are skipped (used for viewport gating). */
    active?: boolean;
    notMerge?: boolean;
    onEvents?: Record<string, (params: unknown) => void>;
  }
>(function EChart({ option, height = '100%', className = '', active = true, notMerge = false, onEvents }, ref) {
  const chartRef = useRef<ReactECharts | null>(null);

  useImperativeHandle(ref, () => ({
    getInstance: () => chartRef.current?.getEchartsInstance() ?? null,
    appendSeries: (seriesIndex, data) => {
      const inst = chartRef.current?.getEchartsInstance();
      if (!inst) return;
      inst.setOption({ series: [{ seriesIndex, data }] } as EChartsOption, { lazyUpdate: true });
    },
  }));

  // Resize on container changes so charts never collapse in flex/grid parents.
  useEffect(() => {
    const inst = chartRef.current?.getEchartsInstance();
    if (!inst) return;
    const ro = new ResizeObserver(() => inst.resize());
    const dom = inst.getDom();
    if (dom?.parentElement) ro.observe(dom.parentElement);
    return () => ro.disconnect();
  }, []);

  return (
    <ReactECharts
      ref={chartRef}
      theme={GE_THEME}
      option={active ? option : {}}
      notMerge={notMerge}
      lazyUpdate
      style={{ height, width: '100%' }}
      className={className}
      opts={{ renderer: 'canvas' }}
      onEvents={onEvents}
    />
  );
});

/**
 * Monthly return heatmap — ECharts heatmap series.
 *
 * x = month (Jan–Dec), y = year, cell color on a diverging red→white→green
 * visualMap centered at zero, cell label = monthly return %.
 */

'use client';

import React, { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import { EChart } from './EChart';
import { CHART, DIVERGING } from './chartTokens';
import type { MonthlyCell } from '../backtest/backtestData';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function MonthlyReturnHeatmap({ cells, active = true }: { cells: MonthlyCell[]; active?: boolean }) {
  const option = useMemo<EChartsOption>(() => {
    const years = Array.from(new Set(cells.map((c) => c.year))).sort((a, b) => a - b);
    const yearIdx = new Map(years.map((y, i) => [y, i]));
    let maxAbs = 0;
    for (const c of cells) maxAbs = Math.max(maxAbs, Math.abs(c.ret));
    maxAbs = Math.max(1, +maxAbs.toFixed(1));

    const data = cells.map((c) => [c.month, yearIdx.get(c.year) as number, c.ret]);

    return {
      animation: false,
      grid: { left: 44, right: 16, top: 12, bottom: 48 },
      tooltip: {
        position: 'top',
        formatter: (p: unknown) => {
          const d = (p as { data: [number, number, number] }).data;
          return `${MONTHS[d[0]]} ${years[d[1]]}<br/>${d[2] >= 0 ? '+' : ''}${d[2].toFixed(1)}%`;
        },
      },
      xAxis: { type: 'category', data: MONTHS, splitArea: { show: true }, axisLabel: { fontSize: 9 } },
      yAxis: {
        type: 'category',
        data: years.map(String),
        splitArea: { show: true },
        axisLabel: { fontSize: 9 },
      },
      visualMap: {
        min: -maxAbs,
        max: maxAbs,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: 6,
        itemHeight: 90,
        textStyle: { color: CHART.textDim, fontSize: 9 },
        inRange: { color: DIVERGING },
      },
      series: [
        {
          name: 'Monthly return',
          type: 'heatmap',
          data,
          label: {
            show: true,
            fontSize: 9,
            color: CHART.charcoal,
            formatter: (p: unknown) => {
              const v = (p as { data: [number, number, number] }).data[2];
              return `${v >= 0 ? '+' : ''}${v.toFixed(1)}`;
            },
          },
          itemStyle: { borderColor: CHART.charcoal, borderWidth: 1 },
        },
      ],
    };
  }, [cells]);

  return <EChart option={option} active={active} height="100%" />;
}

/**
 * Implied-volatility surface — ECharts 2D heatmap.
 *
 * x = expiration (days), y = moneyness (strike / spot), color = IV%. The 2D
 * heatmap is preferred over an echarts-gl 3D surface for performance and to
 * avoid the WebGL dependency, per the visualization spec.
 */

'use client';

import React, { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import { EChart } from './EChart';
import { CHART } from './chartTokens';
import type { SurfaceCell } from '../dashboard/terminal/terminalData';

export function IVHeatmap({ surface, active = true }: { surface: SurfaceCell[]; active?: boolean }) {
  const option = useMemo<EChartsOption>(() => {
    const expDays = Array.from(new Set(surface.map((s) => s.expDays))).sort((a, b) => a - b);
    const moneyness = Array.from(new Set(surface.map((s) => s.moneyness))).sort((a, b) => a - b);
    const xIdx = new Map(expDays.map((d, i) => [d, i]));
    const yIdx = new Map(moneyness.map((m, i) => [m, i]));
    let min = Infinity;
    let max = -Infinity;
    for (const s of surface) {
      if (s.iv < min) min = s.iv;
      if (s.iv > max) max = s.iv;
    }
    const data = surface.map((s) => [xIdx.get(s.expDays) as number, yIdx.get(s.moneyness) as number, s.iv]);

    return {
      animation: false,
      grid: { left: 48, right: 16, top: 12, bottom: 52 },
      tooltip: {
        position: 'top',
        formatter: (p: unknown) => {
          const d = (p as { data: [number, number, number] }).data;
          return `${expDays[d[0]]}d · ${(moneyness[d[1]] * 100).toFixed(0)}% mny<br/>IV ${d[2].toFixed(1)}%`;
        },
      },
      xAxis: { type: 'category', data: expDays.map((d) => `${d}d`), axisLabel: { fontSize: 9 } },
      yAxis: {
        type: 'category',
        data: moneyness.map((m) => `${(m * 100).toFixed(0)}%`),
        axisLabel: { fontSize: 9 },
      },
      visualMap: {
        min: Math.floor(min),
        max: Math.ceil(max),
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: 6,
        itemHeight: 90,
        textStyle: { color: CHART.textDim, fontSize: 9 },
        inRange: { color: ['#1c3a24', CHART.up, CHART.brass, CHART.down] },
      },
      series: [
        {
          name: 'IV',
          type: 'heatmap',
          data,
          label: { show: false },
          itemStyle: { borderColor: CHART.charcoal, borderWidth: 1 },
          emphasis: { itemStyle: { borderColor: CHART.brass, borderWidth: 1 } },
        },
      ],
    };
  }, [surface]);

  return <EChart option={option} active={active} height="100%" />;
}

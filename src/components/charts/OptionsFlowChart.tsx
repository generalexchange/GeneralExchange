/**
 * Options flow — ECharts call vs put volume over time.
 *
 * Call volume rises above the zero line in green; put volume mirrors below in
 * red, so the net order-flow imbalance is readable at a glance across the
 * session.
 */

'use client';

import React, { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import { EChart } from './EChart';
import { CHART } from './chartTokens';
import type { FlowBar } from '../dashboard/terminal/terminalData';

export function OptionsFlowChart({ flow, active = true }: { flow: FlowBar[]; active?: boolean }) {
  const option = useMemo<EChartsOption>(() => {
    const times = flow.map((f) =>
      new Date(f.t).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' }),
    );
    return {
      animation: false,
      grid: { left: 8, right: 12, top: 24, bottom: 24 },
      legend: { top: 0, right: 8, itemWidth: 10, itemHeight: 10, textStyle: { fontSize: 9 } },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        valueFormatter: (v) => Math.abs(Number(v)).toLocaleString('en-US'),
      },
      xAxis: { type: 'category', data: times, axisLabel: { fontSize: 9, interval: 3 } },
      yAxis: {
        type: 'value',
        axisLabel: {
          fontSize: 9,
          formatter: (v: number) => Intl.NumberFormat('en-US', { notation: 'compact' }).format(Math.abs(v)),
        },
      },
      series: [
        { name: 'Calls', type: 'bar', stack: 'flow', data: flow.map((f) => f.callVol), itemStyle: { color: CHART.up } },
        { name: 'Puts', type: 'bar', stack: 'flow', data: flow.map((f) => -f.putVol), itemStyle: { color: CHART.down } },
      ],
    };
  }, [flow]);

  return <EChart option={option} active={active} height="100%" />;
}

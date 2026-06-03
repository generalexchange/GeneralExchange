/**
 * GEX by strike — ECharts horizontal bar chart.
 *
 * x = dealer gamma exposure ($mm per 1% move), y = strike. Positive GEX extends
 * right in green (dealers long gamma → natural sellers into strength); negative
 * extends left in red (dealers short gamma → forced buyers into strength).
 * A markLine at x=0 and a horizontal marker at the current underlying price
 * anchor the read.
 */

'use client';

import React, { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import { EChart } from './EChart';
import { CHART } from './chartTokens';
import type { GexBar } from '../dashboard/terminal/terminalData';

export function GEXBarChart({ gex, price, active = true }: { gex: GexBar[]; price: number; active?: boolean }) {
  const option = useMemo<EChartsOption>(() => {
    const sorted = [...gex].sort((a, b) => a.strike - b.strike);
    const strikes = sorted.map((g) => g.strike.toFixed(0));
    const data = sorted.map((g) => ({
      value: g.gex,
      itemStyle: { color: g.gex >= 0 ? CHART.up : CHART.down },
    }));
    // index of the strike closest to spot, for the price reference line
    let nearest = 0;
    let best = Infinity;
    sorted.forEach((g, i) => {
      const d = Math.abs(g.strike - price);
      if (d < best) {
        best = d;
        nearest = i;
      }
    });

    return {
      animation: false,
      grid: { left: 8, right: 16, top: 10, bottom: 24 },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        valueFormatter: (v) => `${Number(v).toFixed(2)} $mm`,
      },
      xAxis: {
        type: 'value',
        name: '$mm γ',
        nameTextStyle: { color: CHART.textDim, fontSize: 9 },
        axisLabel: { fontSize: 9 },
      },
      yAxis: {
        type: 'category',
        data: strikes,
        axisLabel: { fontSize: 9 },
        axisTick: { show: false },
      },
      series: [
        {
          name: 'GEX',
          type: 'bar',
          data,
          barWidth: '70%',
          markLine: {
            symbol: 'none',
            silent: true,
            data: [
              { xAxis: 0, lineStyle: { color: CHART.axisLine, width: 1 } },
              {
                yAxis: nearest,
                lineStyle: { color: CHART.brass, width: 1, type: 'dashed' },
                label: { formatter: `spot ${price.toFixed(2)}`, color: CHART.brass, fontSize: 9, position: 'insideEndTop' },
              },
            ],
          },
        },
      ],
    };
  }, [gex, price]);

  return <EChart option={option} active={active} height="100%" />;
}

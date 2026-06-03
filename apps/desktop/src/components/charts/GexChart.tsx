import React, { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import { EChart } from './EChart';
import { CHART } from './chartTheme';
import { useMarketStore } from '@/stores/marketStore';
import type { GexLevel } from '@/types/market';

function buildOption(gex: GexLevel[], spot: number | null): EChartsOption {
  const sorted = [...gex].sort((a, b) => a.strike - b.strike);
  const strikes = sorted.map((g) => g.strike);
  const values = sorted.map((g) => ({
    value: g.gamma / 1e6, // display in $mm
    itemStyle: { color: g.gamma >= 0 ? CHART.up : CHART.down },
  }));

  return {
    animation: false,
    grid: { left: 8, right: 12, top: 8, bottom: 18 },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      valueFormatter: (v) => `$${Number(v).toFixed(1)}mm`,
    },
    xAxis: { type: 'category', data: strikes.map(String), axisLabel: { fontSize: 9 } },
    yAxis: { type: 'value', name: '$mm', nameTextStyle: { fontSize: 9 } },
    series: [
      {
        type: 'bar',
        data: values,
        barWidth: '70%',
        markLine:
          spot != null
            ? {
                symbol: 'none',
                data: [{ xAxis: nearestIndex(strikes, spot) }],
                lineStyle: { color: CHART.brass, type: 'solid', width: 1 },
                label: { formatter: 'spot', color: CHART.brass, fontSize: 9 },
              }
            : undefined,
      },
    ],
  };
}

function nearestIndex(strikes: number[], spot: number): number {
  let best = 0;
  let bestDist = Infinity;
  strikes.forEach((s, i) => {
    const d = Math.abs(s - spot);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  });
  return best;
}

export const GexChart: React.FC = React.memo(function GexChart() {
  const gex = useMarketStore((s) => s.gex);
  const spot = useMarketStore((s) => s.spot);
  const option = useMemo(() => buildOption(gex, spot), [gex, spot]);

  if (gex.length === 0) {
    return <div className="flex h-full items-center justify-center text-[11px] text-zinc-600">No gamma data</div>;
  }
  return <EChart option={option} />;
});

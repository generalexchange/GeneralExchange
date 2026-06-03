import React, { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import { EChart } from './EChart';
import { CHART } from './chartTheme';
import { useMarketStore } from '@/stores/marketStore';
import type { Candle } from '@/types/market';

function buildOption(candles: Candle[]): EChartsOption {
  const dates = candles.map((c) => new Date(c.t).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
  const ohlc = candles.map((c) => [c.open, c.close, c.low, c.high]);
  const volumes = candles.map((c, i) => ({
    value: c.volume,
    itemStyle: { color: c.close >= c.open ? 'rgba(52,211,153,0.45)' : 'rgba(248,113,113,0.45)' },
    name: String(i),
  }));
  const vwap = candles.map((c) => (c.vwap != null ? Number(c.vwap.toFixed(2)) : null));

  return {
    animation: false,
    grid: [
      { left: 8, right: 56, top: 12, height: '64%' },
      { left: 8, right: 56, top: '74%', height: '18%' },
    ],
    axisPointer: { link: [{ xAxisIndex: 'all' }] },
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    xAxis: [
      { type: 'category', data: dates, gridIndex: 0, boundaryGap: true, axisLabel: { show: false } },
      { type: 'category', data: dates, gridIndex: 1, boundaryGap: true },
    ],
    yAxis: [
      { scale: true, gridIndex: 0, position: 'right' },
      { scale: true, gridIndex: 1, position: 'right', axisLabel: { show: false }, splitLine: { show: false } },
    ],
    dataZoom: [
      { type: 'inside', xAxisIndex: [0, 1], start: 60, end: 100 },
    ],
    series: [
      {
        name: 'Price',
        type: 'candlestick',
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: ohlc,
      },
      {
        name: 'VWAP',
        type: 'line',
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: vwap,
        lineStyle: { color: CHART.brass, width: 1, type: 'dashed' },
        showSymbol: false,
        connectNulls: true,
      },
      {
        name: 'Volume',
        type: 'bar',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: volumes,
      },
    ],
  };
}

export const PriceChart: React.FC = React.memo(function PriceChart() {
  const candles = useMarketStore((s) => s.candles);
  const option = useMemo(() => buildOption(candles), [candles]);

  if (candles.length === 0) {
    return <div className="flex h-full items-center justify-center text-xs text-zinc-600">Waiting for price data…</div>;
  }
  return <EChart option={option} />;
});

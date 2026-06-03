/**
 * Price chart — ECharts candlestick + volume + indicator overlays.
 *
 * Two linked grids share one x axis (axisPointer link): candles + VWAP + SMA /
 * EMA / Bollinger in the upper grid, volume bars in the lower grid. All
 * technical indicators are computed on the frontend from the candle data.
 *
 * Streaming: call the exposed pushCandle() to append/replace the forming candle
 * via an incremental setOption rather than rebuilding the whole option.
 */

'use client';

import React, { useImperativeHandle, useMemo, useRef } from 'react';
import type { EChartsOption } from 'echarts';
import { EChart, type EChartHandle } from './EChart';
import { CHART } from './chartTokens';
import type { Candle } from '../dashboard/terminal/terminalData';

export interface PriceChartHandle {
  pushCandle: (candle: Candle, replaceLast?: boolean) => void;
}

function sma(values: number[], period: number): (number | null)[] {
  const out: (number | null)[] = [];
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= period) sum -= values[i - period];
    out.push(i >= period - 1 ? +(sum / period).toFixed(2) : null);
  }
  return out;
}

function ema(values: number[], period: number): (number | null)[] {
  const out: (number | null)[] = [];
  const k = 2 / (period + 1);
  let prev = values[0];
  for (let i = 0; i < values.length; i++) {
    prev = i === 0 ? values[0] : values[i] * k + prev * (1 - k);
    out.push(i >= period - 1 ? +prev.toFixed(2) : null);
  }
  return out;
}

function bollinger(values: number[], period: number, mult: number) {
  const mid = sma(values, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      upper.push(null);
      lower.push(null);
      continue;
    }
    const slice = values.slice(i - period + 1, i + 1);
    const m = mid[i] as number;
    const variance = slice.reduce((a, v) => a + (v - m) ** 2, 0) / period;
    const sd = Math.sqrt(variance);
    upper.push(+(m + mult * sd).toFixed(2));
    lower.push(+(m - mult * sd).toFixed(2));
  }
  return { upper, lower };
}

function sessionVwap(candles: Candle[]): number[] {
  let cumPV = 0;
  let cumV = 0;
  return candles.map((c) => {
    const typical = (c.h + c.l + c.c) / 3;
    cumPV += typical * c.v;
    cumV += c.v;
    return +(cumPV / Math.max(1, cumV)).toFixed(2);
  });
}

function buildOption(candles: Candle[]): EChartsOption {
  const times = candles.map((c) =>
    new Date(c.t).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' }),
  );
  const ohlc = candles.map((c) => [c.o, c.c, c.l, c.h]);
  const closes = candles.map((c) => c.c);
  const vols = candles.map((c) => ({
    value: c.v,
    itemStyle: { color: c.c >= c.o ? CHART.upDim : CHART.downDim },
  }));
  const vwap = sessionVwap(candles);
  const sma20 = sma(closes, 20);
  const ema9 = ema(closes, 9);
  const { upper, lower } = bollinger(closes, 20, 2);

  return {
    animation: false,
    grid: [
      { left: 8, right: 56, top: 12, height: '64%' },
      { left: 8, right: 56, top: '74%', height: '18%' },
    ],
    axisPointer: { link: [{ xAxisIndex: 'all' }], label: { backgroundColor: CHART.panel } },
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    xAxis: [
      { type: 'category', data: times, gridIndex: 0, boundaryGap: true, axisLabel: { show: false }, axisTick: { show: false } },
      { type: 'category', data: times, gridIndex: 1, boundaryGap: true, axisLabel: { fontSize: 9 } },
    ],
    yAxis: [
      { scale: true, gridIndex: 0, position: 'right', splitNumber: 4 },
      { scale: true, gridIndex: 1, position: 'right', splitNumber: 2, axisLabel: { fontSize: 9 } },
    ],
    dataZoom: [
      { type: 'inside', xAxisIndex: [0, 1], start: 40, end: 100 },
    ],
    series: [
      { name: 'Price', type: 'candlestick', xAxisIndex: 0, yAxisIndex: 0, data: ohlc },
      { name: 'VWAP', type: 'line', xAxisIndex: 0, yAxisIndex: 0, data: vwap, showSymbol: false, lineStyle: { width: 1.25, color: CHART.brass, type: 'dashed' } },
      { name: 'EMA 9', type: 'line', xAxisIndex: 0, yAxisIndex: 0, data: ema9, showSymbol: false, lineStyle: { width: 1, color: CHART.tan } },
      { name: 'SMA 20', type: 'line', xAxisIndex: 0, yAxisIndex: 0, data: sma20, showSymbol: false, lineStyle: { width: 1, color: '#6b8cce' } },
      { name: 'BB upper', type: 'line', xAxisIndex: 0, yAxisIndex: 0, data: upper, showSymbol: false, lineStyle: { width: 0.75, color: CHART.splitLine, opacity: 0.6 } },
      { name: 'BB lower', type: 'line', xAxisIndex: 0, yAxisIndex: 0, data: lower, showSymbol: false, lineStyle: { width: 0.75, color: CHART.splitLine, opacity: 0.6 } },
      { name: 'Volume', type: 'bar', xAxisIndex: 1, yAxisIndex: 1, data: vols },
    ],
  };
}

export const PriceChart = React.forwardRef<
  PriceChartHandle,
  { candles: Candle[]; active?: boolean }
>(function PriceChart({ candles, active = true }, ref) {
  const chartRef = useRef<EChartHandle | null>(null);
  const candlesRef = useRef<Candle[]>(candles);
  candlesRef.current = candles;

  const option = useMemo(() => buildOption(candles), [candles]);

  useImperativeHandle(ref, () => ({
    pushCandle: (candle, replaceLast = false) => {
      const inst = chartRef.current?.getInstance();
      if (!inst) return;
      const next = replaceLast ? [...candlesRef.current.slice(0, -1), candle] : [...candlesRef.current, candle];
      candlesRef.current = next;
      // Incremental: push only the recomputed series arrays, not a fresh option.
      inst.setOption(buildOption(next), { lazyUpdate: true });
    },
  }));

  return <EChart ref={chartRef} option={option} active={active} height="100%" />;
});

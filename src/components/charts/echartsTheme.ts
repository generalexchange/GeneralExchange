/**
 * Custom ECharts theme for general.exchange.
 *
 * Registered once (idempotently) before any chart renders. Backgrounds are
 * transparent so charts inherit the dashboard panel surface; colors, axes, and
 * candle styling come from the shared chart tokens.
 */

import * as echarts from 'echarts';
import { CHART } from './chartTokens';

export const GE_THEME = 'general-exchange';

let registered = false;

export function registerEChartsTheme(): void {
  if (registered) return;
  echarts.registerTheme(GE_THEME, {
    color: [CHART.brass, CHART.up, CHART.down, CHART.tan, '#6b8cce', '#c98ec9'],
    backgroundColor: CHART.panelTransparent,
    textStyle: {
      fontFamily: CHART.mono,
      color: CHART.text,
    },
    title: {
      textStyle: { color: CHART.textBright, fontFamily: CHART.mono },
      subtextStyle: { color: CHART.textDim },
    },
    grid: {
      borderColor: CHART.axisLine,
    },
    categoryAxis: axis(),
    valueAxis: axis(),
    timeAxis: axis(),
    logAxis: axis(),
    legend: {
      textStyle: { color: CHART.text },
    },
    tooltip: {
      backgroundColor: 'rgba(19, 20, 28, 0.96)',
      borderColor: CHART.border,
      borderWidth: 1,
      textStyle: { color: CHART.textBright, fontFamily: CHART.mono, fontSize: 11 },
      axisPointer: {
        lineStyle: { color: CHART.brassDeep },
        crossStyle: { color: CHART.brassDeep },
        label: { backgroundColor: CHART.panel, color: CHART.textBright },
      },
    },
    candlestick: {
      itemStyle: {
        color: CHART.up, // up (bullish) body
        color0: CHART.down, // down (bearish) body
        borderColor: CHART.up,
        borderColor0: CHART.down,
      },
    },
    bar: {
      itemStyle: { barBorderColor: CHART.axisLine, barBorderWidth: 0 },
    },
    line: {
      itemStyle: { borderWidth: 1.5 },
      lineStyle: { width: 1.5 },
      symbolSize: 0,
      symbol: 'circle',
      smooth: false,
    },
    visualMap: {
      textStyle: { color: CHART.text },
    },
    dataZoom: {
      backgroundColor: 'transparent',
      dataBackgroundColor: CHART.splitLine,
      fillerColor: 'rgba(201, 169, 110, 0.10)',
      handleColor: CHART.brassDeep,
      textStyle: { color: CHART.textDim },
      borderColor: CHART.axisLine,
    },
  });
  registered = true;
}

function axis() {
  return {
    axisLine: { show: true, lineStyle: { color: CHART.axisLine } },
    axisTick: { show: false },
    axisLabel: { color: CHART.textDim, fontFamily: CHART.mono, fontSize: 10 },
    splitLine: { show: true, lineStyle: { color: CHART.splitLine } },
    splitArea: { show: false },
  };
}

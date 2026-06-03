/**
 * ECharts theme + shared chart tokens for the desktop terminal. Identical
 * palette to the general.exchange web dashboard so the two read as one product.
 */
import * as echarts from 'echarts';

export const CHART = {
  brass: '#C9A96E',
  brassDeep: '#A88A4F',
  tan: '#D2B48C',
  up: '#34d399',
  down: '#f87171',
  neutral: '#a1a1aa',
  text: '#a1a1aa',
  textBright: '#e4e4e7',
  textDim: '#71717a',
  panel: '#13141c',
  panelTransparent: 'transparent',
  border: 'rgba(201,169,110,0.35)',
  axisLine: 'rgba(255,255,255,0.10)',
  splitLine: 'rgba(255,255,255,0.05)',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
} as const;

export const GE_THEME = 'general-exchange';

/** Red → neutral → green color for a delta in [-1, 1]. */
export function deltaColor(delta: number): string {
  const t = Math.max(-1, Math.min(1, delta));
  if (t >= 0) {
    // neutral -> green
    return lerpHex('#9aa0aa', CHART.up, t);
  }
  return lerpHex('#9aa0aa', CHART.down, -t);
}

function lerpHex(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ar = (pa >> 16) & 255;
  const ag = (pa >> 8) & 255;
  const ab = pa & 255;
  const br = (pb >> 16) & 255;
  const bg = (pb >> 8) & 255;
  const bb = pb & 255;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

let registered = false;

function axis() {
  return {
    axisLine: { show: true, lineStyle: { color: CHART.axisLine } },
    axisTick: { show: false },
    axisLabel: { color: CHART.textDim, fontFamily: CHART.mono, fontSize: 10 },
    splitLine: { show: true, lineStyle: { color: CHART.splitLine } },
    splitArea: { show: false },
  };
}

export function registerEChartsTheme(): void {
  if (registered) return;
  echarts.registerTheme(GE_THEME, {
    color: [CHART.brass, CHART.up, CHART.down, CHART.tan, '#6b8cce', '#c98ec9'],
    backgroundColor: CHART.panelTransparent,
    textStyle: { fontFamily: CHART.mono, color: CHART.text },
    grid: { borderColor: CHART.axisLine },
    categoryAxis: axis(),
    valueAxis: axis(),
    timeAxis: axis(),
    logAxis: axis(),
    legend: { textStyle: { color: CHART.text } },
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
        color: CHART.up,
        color0: CHART.down,
        borderColor: CHART.up,
        borderColor0: CHART.down,
      },
    },
    bar: { itemStyle: { barBorderWidth: 0 } },
    line: { lineStyle: { width: 1.5 }, symbolSize: 0, symbol: 'circle', smooth: false },
    dataZoom: {
      backgroundColor: 'transparent',
      fillerColor: 'rgba(201, 169, 110, 0.10)',
      handleColor: CHART.brassDeep,
      textStyle: { color: CHART.textDim },
      borderColor: CHART.axisLine,
    },
  });
  registered = true;
}

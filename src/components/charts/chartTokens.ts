/**
 * Shared visualization design tokens.
 *
 * Single source of truth for every chart, grid, and analytic visual in the
 * authenticated experience (ECharts, AG Grid, Visx, Perspective). Values mirror
 * tailwind.config.js so the four libraries render as one coherent terminal
 * rather than four bolted-together charting libraries.
 */

export const CHART = {
  /* surfaces */
  charcoal: '#13141c',
  panel: '#1c1d26',
  panelTransparent: 'transparent',

  /* accents */
  brass: '#C9A96E',
  brassDeep: '#A88A4F',
  tan: '#D2B48C',

  /* directional (up / positive vs down / negative) */
  up: '#3f9d57',
  upDim: 'rgba(63, 157, 87, 0.18)',
  down: '#f47272',
  downDim: 'rgba(244, 114, 114, 0.18)',
  neutral: 'rgba(148, 163, 184, 0.6)',

  /* text */
  text: '#a1a1aa', // zinc-400
  textBright: '#e4e4e7', // zinc-200
  textDim: '#71717a', // zinc-500

  /* structure */
  axisLine: 'rgba(255, 255, 255, 0.08)',
  splitLine: 'rgba(255, 255, 255, 0.04)',
  border: 'rgba(255, 255, 255, 0.08)',

  /* interaction */
  hover: 'rgba(201, 169, 110, 0.04)',
  selected: 'rgba(201, 169, 110, 0.08)',

  /* fonts */
  mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace",
  sans: "var(--font-inter), system-ui, sans-serif",
} as const;

/**
 * Diverging red→white→green scale used by the monthly-return heatmap and the
 * scenario grid (Visx + ECharts share it so risk visuals read identically).
 */
export const DIVERGING = ['#b3322f', '#d96a52', '#e8a87c', '#efe9df', '#9cc59a', '#5aa06a', '#2e7d46'];

/** Diverging color for a value in [-1, 1] (clamped). t<0 → red, t>0 → green. */
export function divergingColor(t: number): string {
  const x = Math.max(-1, Math.min(1, t));
  const stops = DIVERGING;
  const pos = ((x + 1) / 2) * (stops.length - 1);
  const i = Math.floor(pos);
  const f = pos - i;
  if (i >= stops.length - 1) return stops[stops.length - 1];
  return lerpHex(stops[i], stops[i + 1], f);
}

function lerpHex(a: string, b: string, t: number): string {
  const pa = hexToRgb(a);
  const pb = hexToRgb(b);
  const r = Math.round(pa[0] + (pb[0] - pa[0]) * t);
  const g = Math.round(pa[1] + (pb[1] - pa[1]) * t);
  const bl = Math.round(pa[2] + (pb[2] - pa[2]) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

/** Color a delta value in [-1, 1] on the red→white→green gradient. */
export function deltaColor(delta: number): string {
  return divergingColor(delta);
}

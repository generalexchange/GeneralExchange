/**
 * Shared AG Grid cell renderers for the financial grids.
 *
 * All coloring pulls from the shared chart tokens so grids read identically to
 * the charts. Renderers are intentionally tiny and allocation-light because they
 * run for every visible cell on every transaction update.
 */

'use client';

import React from 'react';
import type { ICellRendererParams } from 'ag-grid-community';
import { CHART, deltaColor } from '../charts/chartTokens';

const fmt = (n: number, d = 2) =>
  Number.isFinite(n) ? n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) : '—';

/** Delta colored on the red → white → green gradient. */
export function DeltaCell(p: ICellRendererParams) {
  const v = Number(p.value);
  if (!Number.isFinite(v)) return <span className="text-zinc-600">—</span>;
  return <span style={{ color: deltaColor(v) }}>{fmt(v, 3)}</span>;
}

/** Theta is always negative for long holders → always rendered in red. */
export function ThetaCell(p: ICellRendererParams) {
  const v = Number(p.value);
  if (!Number.isFinite(v)) return <span className="text-zinc-600">—</span>;
  return <span style={{ color: CHART.down }}>{fmt(v, 3)}</span>;
}

/** PnL / signed-dollar cell: red negative, green positive, 2 decimals. */
export function PnlCell(p: ICellRendererParams) {
  const v = Number(p.value);
  if (!Number.isFinite(v)) return <span className="text-zinc-600">—</span>;
  const color = v >= 0 ? CHART.up : CHART.down;
  return (
    <span style={{ color }}>
      {v >= 0 ? '+' : ''}
      {fmt(v, 2)}
    </span>
  );
}

/** Percent cell, signed + colored. */
export function PctCell(p: ICellRendererParams) {
  const v = Number(p.value);
  if (!Number.isFinite(v)) return <span className="text-zinc-600">—</span>;
  const color = v >= 0 ? CHART.up : CHART.down;
  return (
    <span style={{ color }}>
      {v >= 0 ? '+' : ''}
      {fmt(v, 2)}%
    </span>
  );
}

/** IV rank as a numeric value plus an inline horizontal bar (0–100). */
export function IvRankCell(p: ICellRendererParams) {
  const v = Math.max(0, Math.min(100, Number(p.value) || 0));
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-6 text-right text-zinc-300">{v.toFixed(0)}</span>
      <div className="relative h-1.5 flex-1 overflow-hidden rounded-sm bg-white/[0.06]">
        <div
          className="absolute inset-y-0 left-0 rounded-sm"
          style={{
            width: `${v}%`,
            background: v > 66 ? CHART.down : v > 33 ? CHART.brass : CHART.up,
          }}
        />
      </div>
    </div>
  );
}

/** Moneyness: ITM brass, ATM white, OTM dimmed zinc. */
export function MoneynessCell(p: ICellRendererParams) {
  const v = String(p.value ?? '');
  const color = v === 'ITM' ? CHART.brass : v === 'ATM' ? CHART.textBright : CHART.textDim;
  return <span style={{ color }}>{v}</span>;
}

/** CALL / PUT tag. */
export function SideCell(p: ICellRendererParams) {
  const v = String(p.value ?? '');
  const color = v === 'CALL' || v === 'LONG' ? CHART.up : v === 'PUT' || v === 'SHORT' ? CHART.down : CHART.neutral;
  return <span style={{ color }}>{v}</span>;
}

/**
 * Compact inline SVG sparkline for the watchlist (intentionally NOT an ECharts
 * instance — one lightweight SVG per row keeps hundreds of rows cheap).
 */
export function SparklineCell(p: ICellRendererParams) {
  const series: number[] = Array.isArray(p.value) ? p.value : [];
  if (series.length < 2) return <span className="text-zinc-600">—</span>;
  const w = 64;
  const h = 18;
  let min = Infinity;
  let max = -Infinity;
  for (const v of series) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const span = max - min || 1;
  const pts = series
    .map((v, i) => `${(i / (series.length - 1)) * w},${h - ((v - min) / span) * (h - 2) - 1}`)
    .join(' ');
  const up = series[series.length - 1] >= series[0];
  return (
    <svg width={w} height={h} className="block">
      <polyline points={pts} fill="none" stroke={up ? CHART.up : CHART.down} strokeWidth={1.25} />
    </svg>
  );
}

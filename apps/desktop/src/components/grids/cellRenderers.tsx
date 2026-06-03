/**
 * Shared AG Grid cell renderers. Ported from the general.exchange web project so
 * the desktop grids read identically. Tiny and allocation-light — they run for
 * every visible cell on every transaction update.
 */

import type { ICellRendererParams } from 'ag-grid-community';
import { CHART, deltaColor } from '@/components/charts/chartTheme';

const fmt = (n: number, d = 2) =>
  Number.isFinite(n) ? n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) : '—';

export function DeltaCell(p: ICellRendererParams) {
  const v = Number(p.value);
  if (!Number.isFinite(v)) return <span className="text-zinc-600">—</span>;
  return <span style={{ color: deltaColor(v) }}>{fmt(v, 3)}</span>;
}

export function ThetaCell(p: ICellRendererParams) {
  const v = Number(p.value);
  if (!Number.isFinite(v)) return <span className="text-zinc-600">—</span>;
  return <span style={{ color: CHART.down }}>{fmt(v, 3)}</span>;
}

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

export function IvRankCell(p: ICellRendererParams) {
  const v = Math.max(0, Math.min(100, Number(p.value) || 0));
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-6 text-right text-zinc-300">{v.toFixed(0)}</span>
      <div className="relative h-1.5 flex-1 overflow-hidden rounded-sm bg-white/[0.06]">
        <div
          className="absolute inset-y-0 left-0 rounded-sm"
          style={{ width: `${v}%`, background: v > 66 ? CHART.down : v > 33 ? CHART.brass : CHART.up }}
        />
      </div>
    </div>
  );
}

export function MoneynessCell(p: ICellRendererParams) {
  const v = String(p.value ?? '');
  const color = v === 'ITM' ? CHART.brass : v === 'ATM' ? CHART.textBright : CHART.textDim;
  return <span style={{ color }}>{v}</span>;
}

export function SideCell(p: ICellRendererParams) {
  const v = String(p.value ?? '').toUpperCase();
  const color =
    v === 'CALL' || v === 'LONG' || v === 'BUY' ? CHART.up : v === 'PUT' || v === 'SHORT' || v === 'SELL' ? CHART.down : CHART.neutral;
  return <span style={{ color }}>{v}</span>;
}

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

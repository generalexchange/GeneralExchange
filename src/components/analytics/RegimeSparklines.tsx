/**
 * Regime panel sparklines — small inline Visx visuals.
 *
 * A compact labelled metric list where each row pairs a value with a tiny Visx
 * sparkline (area + line). Fixed-size SVGs keep these cheap to render many at
 * once in the right rail.
 */

'use client';

import React, { useMemo } from 'react';
import { scaleLinear } from '@visx/scale';
import { LinePath, AreaClosed } from '@visx/shape';
import { curveMonotoneX } from '@visx/curve';
import { CHART } from '../charts/chartTokens';

export type Tone = 'up' | 'down' | 'neutral';

export interface SparkItem {
  label: string;
  value: string;
  series: number[];
  tone?: Tone;
}

const toneColor = (t: Tone = 'neutral') => (t === 'up' ? CHART.up : t === 'down' ? CHART.down : CHART.brass);

export function Spark({ series, tone = 'neutral', width = 72, height = 22 }: { series: number[]; tone?: Tone; width?: number; height?: number }) {
  const { line, area, xScale, yScale } = useMemo(() => {
    const data = series.length ? series : [0, 0];
    const xScale = scaleLinear({ domain: [0, data.length - 1], range: [1, width - 1] });
    const yScale = scaleLinear({ domain: [Math.min(...data), Math.max(...data)], range: [height - 2, 2] });
    return { line: data, area: data, xScale, yScale };
  }, [series, width, height]);

  const color = toneColor(tone);
  const gid = useMemo(() => `spark-${Math.random().toString(36).slice(2, 8)}`, []);

  return (
    <svg width={width} height={height} className="block">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <AreaClosed<number>
        data={area}
        x={(_, i) => xScale(i)}
        y={(d) => yScale(d)}
        y0={() => height}
        yScale={yScale}
        fill={`url(#${gid})`}
        curve={curveMonotoneX}
      />
      <LinePath<number> data={line} x={(_, i) => xScale(i)} y={(d) => yScale(d)} stroke={color} strokeWidth={1.25} curve={curveMonotoneX} />
    </svg>
  );
}

export function RegimeSparklines({ items }: { items: SparkItem[] }) {
  return (
    <div className="flex flex-col">
      {items.map((it) => (
        <div key={it.label} className="flex items-center justify-between gap-2 border-b border-white/[0.05] px-3 py-1.5 last:border-0">
          <span className="text-[10px] uppercase tracking-wider text-zinc-500">{it.label}</span>
          <div className="flex items-center gap-2">
            <Spark series={it.series} tone={it.tone} />
            <span
              className="w-14 text-right font-mono text-[11px] tabular-nums"
              style={{ color: toneColor(it.tone) }}
            >
              {it.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

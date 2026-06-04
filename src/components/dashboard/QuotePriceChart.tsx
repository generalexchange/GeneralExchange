'use client';

import React, { useId, useMemo } from 'react';
import {
  Area,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Candle } from '@/components/dashboard/terminal/terminalData';

export type QuoteCardTheme = 'tan' | 'dark';

const CHART_HEIGHT = 240;

/** Zoom Y-axis to visible closes with padding so the line fills ~70–85% of plot height. */
export function computeVisibleYDomain(prices: number[], paddingRatio = 0.08): [number, number] {
  if (prices.length === 0) return [0, 1];

  const visibleMin = Math.min(...prices);
  const visibleMax = Math.max(...prices);
  let span = visibleMax - visibleMin;

  if (span === 0) {
    span = Math.max(visibleMin * 0.0015, 0.05);
  }

  const padding = span * paddingRatio;
  return [visibleMin - padding, visibleMax + padding];
}

type ChartPoint = { index: number; t: number; price: number };

function ChartTooltip({
  active,
  payload,
  theme,
}: {
  active?: boolean;
  payload?: { value: number; payload: ChartPoint }[];
  theme: QuoteCardTheme;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  const bg = theme === 'dark' ? '#171717' : '#fff';
  const border = theme === 'dark' ? '#333' : '#e4e4e4';
  const text = theme === 'dark' ? '#f5f5f5' : '#1a1a1a';
  const muted = theme === 'dark' ? '#9ca3af' : '#6b6b6b';

  return (
    <div
      className="rounded-md px-2.5 py-1.5 text-[12px] tabular-nums shadow-sm"
      style={{ backgroundColor: bg, border: `1px solid ${border}`, color: text }}
    >
      <div className="font-semibold">${payload[0].value.toFixed(2)}</div>
      <div style={{ color: muted }}>
        {new Date(row.t).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>
    </div>
  );
}

export function QuotePriceChart({
  candles,
  up,
  prevClose,
  theme,
}: {
  candles: Candle[];
  up: boolean;
  prevClose: number;
  theme: QuoteCardTheme;
}) {
  const gradId = useId().replace(/:/g, '');

  const chartData = useMemo<ChartPoint[]>(
    () => candles.map((c, index) => ({ index, t: c.t, price: c.c })),
    [candles],
  );

  const yDomain = useMemo(() => computeVisibleYDomain(chartData.map((d) => d.price)), [chartData]);

  const stroke = up ? '#00C805' : '#FF5000';
  const baselineColor = theme === 'dark' ? '#404040' : '#b0b0b0';
  const showBaseline = prevClose >= yDomain[0] && prevClose <= yDomain[1];

  if (!chartData.length) {
    return <div className="w-full" style={{ height: CHART_HEIGHT }} />;
  }

  return (
    <div className="w-full" style={{ height: CHART_HEIGHT }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.22} />
              <stop offset="95%" stopColor={stroke} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis dataKey="index" hide />
          <YAxis domain={yDomain} hide allowDataOverflow />
          <Tooltip
            content={<ChartTooltip theme={theme} />}
            cursor={{ stroke: baselineColor, strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          {showBaseline && (
            <ReferenceLine
              y={prevClose}
              stroke={baselineColor}
              strokeDasharray="4 4"
              strokeWidth={1}
              ifOverflow="hidden"
            />
          )}
          <Area
            type="linear"
            dataKey="price"
            fill={`url(#${gradId})`}
            stroke="none"
            isAnimationActive={false}
          />
          <Line
            type="linear"
            dataKey="price"
            stroke={stroke}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: stroke, stroke: theme === 'dark' ? '#0a0a0a' : '#f2ead3', strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export { CHART_HEIGHT as QUOTE_CHART_HEIGHT };

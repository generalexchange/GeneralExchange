'use client';

import React, { useId, useMemo } from 'react';
import {
  Area,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Candle } from '@/components/dashboard/terminal/terminalData';
import {
  BAND_FILL,
  sessionZones,
  timeMarkers,
  toExtendedChartPoints,
  type ChartPoint,
} from '@/lib/extendedHoursChart';

export type QuoteCardTheme = 'tan' | 'dark';

const CHART_HEIGHT = 240;
const CHART_HEIGHT_EXTENDED = 260;

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

  return (
    <div
      className={`rounded-md border px-2.5 py-1.5 text-[12px] tabular-nums shadow-sm ${
        theme === 'dark' ? 'border-zinc-700 bg-zinc-900 text-zinc-100' : 'border-zinc-200 bg-white text-zinc-900'
      }`}
    >
      <div className="font-semibold">${payload[0].value.toFixed(2)}</div>
      <div className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}>
        {new Date(row.t).toLocaleString('en-US', {
          timeZone: 'America/New_York',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}{' '}
        ET
      </div>
    </div>
  );
}

export function QuotePriceChart({
  candles,
  up,
  prevClose,
  theme,
  height,
  showTooltip = true,
  extendedHours = false,
}: {
  candles: Candle[];
  up: boolean;
  prevClose: number;
  theme: QuoteCardTheme;
  height?: number;
  showTooltip?: boolean;
  extendedHours?: boolean;
}) {
  const gradId = useId().replace(/:/g, '');
  const plotHeight = height ?? (extendedHours ? CHART_HEIGHT_EXTENDED : CHART_HEIGHT);

  const chartData = useMemo<ChartPoint[]>(() => {
    if (extendedHours) return toExtendedChartPoints(candles);
    return candles.map((c, index) => ({
      index,
      t: c.t,
      price: c.c,
      band: 'regular' as const,
    }));
  }, [candles, extendedHours]);

  const yDomain = useMemo(() => computeVisibleYDomain(chartData.map((d) => d.price)), [chartData]);
  const zones = useMemo(() => (extendedHours ? sessionZones(chartData) : []), [chartData, extendedHours]);
  const markers = useMemo(() => (extendedHours ? timeMarkers(chartData) : []), [chartData, extendedHours]);

  const stroke = up ? '#00C805' : '#FF5000';
  const baselineColor = theme === 'dark' ? '#404040' : '#b0b0b0';
  const showBaseline = prevClose >= yDomain[0] && prevClose <= yDomain[1];
  const axisColor = theme === 'dark' ? '#71717a' : '#6b6b6b';

  if (!chartData.length) {
    return <div className="h-full w-full" style={{ height: plotHeight }} />;
  }

  return (
    <div className="w-full" style={{ height: plotHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 6, right: 4, left: 4, bottom: extendedHours ? 22 : 0 }}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.22} />
              <stop offset="95%" stopColor={stroke} stopOpacity={0.02} />
            </linearGradient>
          </defs>

          {extendedHours &&
            zones.map((z, i) => (
              <ReferenceArea
                key={`${z.band}-${i}`}
                x1={z.x1}
                x2={z.x2}
                fill={BAND_FILL[z.band]}
                strokeOpacity={0}
                ifOverflow="extendDomain"
              />
            ))}

          {extendedHours &&
            markers.map((m) => (
              <ReferenceLine
                key={m.label}
                x={m.index}
                stroke={baselineColor}
                strokeDasharray="3 3"
                strokeOpacity={0.5}
              />
            ))}

          <XAxis
            dataKey="index"
            hide={!extendedHours}
            axisLine={false}
            tickLine={false}
            tick={{ fill: axisColor, fontSize: 9 }}
            ticks={markers.map((m) => m.index)}
            tickFormatter={(idx) => markers.find((m) => m.index === Number(idx))?.label ?? ''}
            interval={0}
          />
          <YAxis domain={yDomain} hide allowDataOverflow />
          {showTooltip && (
            <Tooltip
              content={<ChartTooltip theme={theme} />}
              cursor={{ stroke: baselineColor, strokeWidth: 1, strokeDasharray: '4 4' }}
            />
          )}
          {showBaseline && (
            <ReferenceLine
              y={prevClose}
              stroke={baselineColor}
              strokeDasharray="4 4"
              strokeWidth={1}
              ifOverflow="hidden"
            />
          )}
          <Area type="linear" dataKey="price" fill={`url(#${gradId})`} stroke="none" isAnimationActive={false} />
          <Line
            type="linear"
            dataKey="price"
            stroke={stroke}
            strokeWidth={2.5}
            dot={false}
            activeDot={{
              r: 4,
              fill: stroke,
              stroke: theme === 'dark' ? '#0a0a0a' : '#f2ead3',
              strokeWidth: 2,
            }}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export { CHART_HEIGHT as QUOTE_CHART_HEIGHT, CHART_HEIGHT_EXTENDED };

import React from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { PredictionPoint } from './mockMlDashboardData';

export interface TradeLevelOverlay {
  entry: number;
  target: number;
  stop: number;
}

interface PredictionChartProps {
  data: PredictionPoint[];
  tradeLevels?: TradeLevelOverlay | null;
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    payload: PredictionPoint & { confidenceSpan?: number };
  }>;
}) => {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  const err = (p.predicted - p.actual).toFixed(3);
  const pctErr = p.actual !== 0 ? (((p.predicted - p.actual) / p.actual) * 100).toFixed(2) : '0';
  return (
    <div className="rounded-lg border border-white/10 bg-[#0c0c0c] px-3 py-2 text-xs shadow-xl">
      <p className="text-zinc-500 font-mono mb-1">{p.time}</p>
      <p className="text-zinc-200 font-medium">Actual: {p.actual.toFixed(2)}</p>
      <p className="text-zinc-400 font-medium">Predicted: {p.predicted.toFixed(2)}</p>
      <p className="text-zinc-500 mt-1">Δ level: {err}</p>
      <p className="text-zinc-600 text-[11px]">Δ %: {pctErr}%</p>
    </div>
  );
};

export const PredictionChart: React.FC<PredictionChartProps> = ({ data, tradeLevels }) => {
  const chartData = data.map((d) => ({
    ...d,
    confidenceSpan: d.confidenceHigh - d.confidenceLow,
  }));

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-4 sm:p-6 transition-all duration-500 hover:border-white/10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-zinc-500">Prediction vs actual</p>
          <p className="text-sm text-zinc-600 mt-1">Monochrome scale · band = confidence · dashed = trade box</p>
        </div>
        <div className="flex flex-wrap gap-4 text-xs">
          <span className="flex items-center gap-2 text-zinc-400">
            <span className="h-1 w-7 bg-zinc-200 rounded-full" />
            Actual
          </span>
          <span className="flex items-center gap-2 text-zinc-400">
            <span className="h-1 w-7 bg-zinc-500 rounded-full" />
            Predicted
          </span>
          <span className="flex items-center gap-2 text-zinc-500">
            <span className="h-2 w-2 rounded-sm bg-zinc-600 border border-zinc-500/50" />
            Confidence
          </span>
          {tradeLevels && (
            <span className="flex items-center gap-2 text-zinc-500">
              <span className="h-0 w-6 border-t-2 border-dashed border-zinc-500" />
              Setup
            </span>
          )}
        </div>
      </div>
      <div className="h-[280px] sm:h-[320px] w-full transition-opacity duration-500">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fill: '#71717a', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
            />
            <YAxis
              domain={['dataMin - 0.6', 'dataMax + 0.6']}
              tick={{ fill: '#71717a', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
              width={48}
            />
            <Tooltip content={<CustomTooltip />} />
            {tradeLevels && (
              <>
                <ReferenceLine
                  y={tradeLevels.entry}
                  stroke="rgba(212, 212, 216, 0.85)"
                  strokeDasharray="6 4"
                  strokeWidth={1.5}
                  label={{ value: 'Entry', fill: '#a1a1aa', fontSize: 10, position: 'insideTopRight' }}
                />
                <ReferenceLine
                  y={tradeLevels.target}
                  stroke="rgba(244, 244, 245, 0.9)"
                  strokeDasharray="6 4"
                  strokeWidth={1.5}
                  label={{ value: 'Target', fill: '#e4e4e7', fontSize: 10, position: 'insideTopRight' }}
                />
                <ReferenceLine
                  y={tradeLevels.stop}
                  stroke="rgba(113, 113, 122, 0.95)"
                  strokeDasharray="6 4"
                  strokeWidth={1.5}
                  label={{ value: 'Stop', fill: '#71717a', fontSize: 10, position: 'insideBottomRight' }}
                />
              </>
            )}
            <Area
              type="monotone"
              dataKey="confidenceLow"
              stackId="band"
              stroke="none"
              fill="transparent"
              isAnimationActive
              animationDuration={500}
            />
            <Area
              type="monotone"
              dataKey="confidenceSpan"
              stackId="band"
              stroke="none"
              fill="rgba(161, 161, 170, 0.12)"
              isAnimationActive
              animationDuration={500}
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#e4e4e7"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 6, fill: '#e4e4e7', stroke: '#fff', strokeWidth: 1 }}
              isAnimationActive
              animationDuration={700}
              animationEasing="ease-out"
            />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#71717a"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 6, fill: '#71717a', stroke: '#fff', strokeWidth: 1 }}
              isAnimationActive
              animationDuration={700}
              animationEasing="ease-out"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

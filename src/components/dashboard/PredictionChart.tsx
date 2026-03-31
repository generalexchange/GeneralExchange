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
  /** Horizontal levels for trade setup visualization (mock). */
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
    <div className="rounded-lg border border-white/15 bg-[#0f1118]/95 backdrop-blur-md px-3 py-2 shadow-xl text-xs">
      <p className="text-zinc-400 font-mono mb-1">{p.time}</p>
      <p className="text-emerald-300 font-medium">Actual: {p.actual.toFixed(2)}</p>
      <p className="text-violet-300 font-medium">Predicted: {p.predicted.toFixed(2)}</p>
      <p className="text-amber-200/90 mt-1">Δ level: {err}</p>
      <p className="text-zinc-500 text-[11px]">Δ %: {pctErr}%</p>
    </div>
  );
};

export const PredictionChart: React.FC<PredictionChartProps> = ({ data, tradeLevels }) => {
  const chartData = data.map((d) => ({
    ...d,
    confidenceSpan: d.confidenceHigh - d.confidenceLow,
  }));

  const lineStyleActual = { filter: 'drop-shadow(0 0 8px rgba(52, 211, 153, 0.45))' };
  const lineStylePred = { filter: 'drop-shadow(0 0 8px rgba(167, 139, 250, 0.5))' };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-4 sm:p-6 shadow-[0_12px_48px_-24px_rgba(0,0,0,0.6)] transition-all duration-500 hover:border-violet-500/25 hover:shadow-[0_16px_56px_-20px_rgba(167,139,246,0.15)]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-violet-400/90">Prediction vs actual</p>
          <p className="text-sm text-zinc-500 mt-1">Brighter lines = decision focus · band = confidence · dashed = trade box</p>
        </div>
        <div className="flex flex-wrap gap-4 text-xs">
          <span className="flex items-center gap-2 text-zinc-200">
            <span className="h-1 w-7 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.6)]" />
            Actual
          </span>
          <span className="flex items-center gap-2 text-zinc-200">
            <span className="h-1 w-7 bg-violet-300 rounded-full shadow-[0_0_10px_rgba(167,139,250,0.55)]" />
            Predicted
          </span>
          <span className="flex items-center gap-2 text-zinc-400">
            <span className="h-2 w-2 rounded-sm bg-cyan-500/45 border border-cyan-400/55" />
            Confidence
          </span>
          {tradeLevels && (
            <span className="flex items-center gap-2 text-zinc-400">
              <span className="h-0 w-6 border-t-2 border-dashed border-fuchsia-400/80" />
              Setup
            </span>
          )}
        </div>
      </div>
      <div className="h-[280px] sm:h-[320px] w-full transition-opacity duration-500">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fill: '#71717a', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
            />
            <YAxis
              domain={['dataMin - 0.6', 'dataMax + 0.6']}
              tick={{ fill: '#71717a', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
              width={48}
            />
            <Tooltip content={<CustomTooltip />} />
            {tradeLevels && (
              <>
                <ReferenceLine
                  y={tradeLevels.entry}
                  stroke="rgba(232, 121, 249, 0.95)"
                  strokeDasharray="6 4"
                  strokeWidth={2}
                  label={{ value: 'Entry', fill: '#e879f9', fontSize: 10, position: 'insideTopRight' }}
                />
                <ReferenceLine
                  y={tradeLevels.target}
                  stroke="rgba(52, 211, 153, 0.9)"
                  strokeDasharray="6 4"
                  strokeWidth={2}
                  label={{ value: 'Target', fill: '#34d399', fontSize: 10, position: 'insideTopRight' }}
                />
                <ReferenceLine
                  y={tradeLevels.stop}
                  stroke="rgba(251, 113, 133, 0.95)"
                  strokeDasharray="6 4"
                  strokeWidth={2}
                  label={{ value: 'Stop', fill: '#fb7185', fontSize: 10, position: 'insideBottomRight' }}
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
              fill="rgba(6, 182, 212, 0.22)"
              isAnimationActive
              animationDuration={500}
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#4ade80"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: '#4ade80', stroke: '#fff', strokeWidth: 1 }}
              isAnimationActive
              animationDuration={700}
              animationEasing="ease-out"
              style={lineStyleActual}
            />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#c4b5fd"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: '#c4b5fd', stroke: '#fff', strokeWidth: 1 }}
              isAnimationActive
              animationDuration={700}
              animationEasing="ease-out"
              style={lineStylePred}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

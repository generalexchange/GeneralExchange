import React from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { PredictionPoint } from './mockMlDashboardData';

interface PricePredictionChartProps {
  data: PredictionPoint[];
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
  return (
    <div className="rounded-lg border border-white/15 bg-[#0f1118]/95 backdrop-blur-md px-3 py-2 shadow-xl text-xs">
      <p className="text-zinc-400 font-mono mb-1">{p.time}</p>
      <p className="text-emerald-300">Actual: {p.actual.toFixed(2)}</p>
      <p className="text-violet-300">Predicted: {p.predicted.toFixed(2)}</p>
      <p className="text-amber-200/90">Error: {err}</p>
    </div>
  );
};

export const PricePredictionChart: React.FC<PricePredictionChartProps> = ({ data }) => {
  const chartData = data.map((d) => ({
    ...d,
    confidenceSpan: d.confidenceHigh - d.confidenceLow,
  }));

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-4 sm:p-6 shadow-[0_12px_48px_-24px_rgba(0,0,0,0.6)]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-blue-400/90">Price vs prediction</p>
          <p className="text-sm text-zinc-500 mt-1">Intraday mock series · shaded band = confidence envelope</p>
        </div>
        <div className="flex flex-wrap gap-4 text-xs">
          <span className="flex items-center gap-2 text-zinc-300">
            <span className="h-0.5 w-6 bg-emerald-400 rounded" />
            Actual
          </span>
          <span className="flex items-center gap-2 text-zinc-300">
            <span className="h-0.5 w-6 bg-violet-400 rounded" />
            Predicted
          </span>
          <span className="flex items-center gap-2 text-zinc-400">
            <span className="h-2 w-2 rounded-sm bg-cyan-500/40 border border-cyan-400/50" />
            Confidence
          </span>
        </div>
      </div>
      <div className="h-[280px] sm:h-[340px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fill: '#71717a', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
            />
            <YAxis
              domain={['dataMin - 0.5', 'dataMax + 0.5']}
              tick={{ fill: '#71717a', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
              width={48}
            />
            <Tooltip content={<CustomTooltip />} />
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
              stroke="#34d399"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive
              animationDuration={750}
              animationEasing="ease-out"
            />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#a78bfa"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive
              animationDuration={750}
              animationEasing="ease-out"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

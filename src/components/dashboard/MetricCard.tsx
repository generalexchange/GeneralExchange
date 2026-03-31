import React from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer } from 'recharts';

interface MetricCardProps {
  name: string;
  value: string;
  trend: 'up' | 'down';
  /** Higher-is-better metrics: up arrow is green. Lower-is-better: invert if needed via invertTrendColors */
  invertTrendColors?: boolean;
  sparkline?: { v: number }[];
}

export const MetricCard: React.FC<MetricCardProps> = ({
  name,
  value,
  trend,
  invertTrendColors = false,
  sparkline,
}) => {
  const upGood = !invertTrendColors;
  const isPositiveVisual = trend === 'up' ? upGood : !upGood;
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;
  const sparkData =
    sparkline ?? Array.from({ length: 12 }, (_, i) => ({ v: 40 + Math.sin(i * 0.6) * 15 + i }));

  return (
    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent backdrop-blur-md p-4 sm:p-5 shadow-lg shadow-black/20">
      <p className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium mb-1">{name}</p>
      <div className="flex items-end justify-between gap-2">
        <p className="text-2xl sm:text-3xl font-semibold text-white tabular-nums">{value}</p>
        <div
          className={`flex items-center gap-1 text-xs font-semibold ${
            isPositiveVisual ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          <TrendIcon className="w-4 h-4" />
        </div>
      </div>
      <div className="h-10 mt-3 -mx-1 opacity-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sparkData}>
            <Line
              type="monotone"
              dataKey="v"
              stroke={isPositiveVisual ? '#34d399' : '#f472b6'}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface RollingPoint {
  t: string;
  acc: number;
}

interface ErrorPoint {
  t: string;
  err: number;
}

interface AccuracyTrendChartProps {
  rollingAccuracy: RollingPoint[];
  errorOverTime: ErrorPoint[];
}

export const AccuracyTrendChart: React.FC<AccuracyTrendChartProps> = ({
  rollingAccuracy,
  errorOverTime,
}) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-4 sm:p-5 h-full flex flex-col transition-all hover:border-cyan-500/15">
      <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-cyan-400/90 mb-1">Accuracy trends</p>
      <p className="text-xs text-zinc-500 mb-4">Rolling hit rate vs aggregate error (mock)</p>
      <div className="space-y-6 flex-1">
        <div className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rollingAccuracy} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="t" tick={{ fill: '#71717a', fontSize: 11 }} tickLine={false} />
              <YAxis
                domain={[50, 70]}
                tick={{ fill: '#71717a', fontSize: 11 }}
                tickLine={false}
                width={32}
              />
              <Tooltip
                contentStyle={{
                  background: 'rgba(15,17,24,0.95)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: '#a1a1aa' }}
              />
              <Line
                type="monotone"
                dataKey="acc"
                stroke="#22d3ee"
                strokeWidth={2.5}
                dot={{ fill: '#22d3ee', r: 3 }}
                activeDot={{ r: 5 }}
                isAnimationActive
                animationDuration={700}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={errorOverTime} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="accErrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fb923c" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="t" tick={{ fill: '#71717a', fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fill: '#71717a', fontSize: 11 }} tickLine={false} width={32} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(15,17,24,0.95)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar
                dataKey="err"
                fill="url(#accErrGrad)"
                radius={[6, 6, 0, 0]}
                isAnimationActive
                animationDuration={600}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

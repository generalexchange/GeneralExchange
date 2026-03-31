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

const tooltipStyle = {
  background: 'rgba(12,12,12,0.98)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '8px',
  fontSize: '12px',
};

export const AccuracyTrendChart: React.FC<AccuracyTrendChartProps> = ({
  rollingAccuracy,
  errorOverTime,
}) => {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-4 sm:p-5 h-full flex flex-col transition-all hover:border-white/10">
      <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-zinc-500 mb-1">Accuracy trends</p>
      <p className="text-xs text-zinc-600 mb-4">Rolling hit rate vs aggregate error (mock)</p>
      <div className="space-y-6 flex-1">
        <div className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rollingAccuracy} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="t" tick={{ fill: '#71717a', fontSize: 11 }} tickLine={false} />
              <YAxis
                domain={[50, 70]}
                tick={{ fill: '#71717a', fontSize: 11 }}
                tickLine={false}
                width={32}
              />
              <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#a1a1aa' }} />
              <Line
                type="monotone"
                dataKey="acc"
                stroke="#d4d4d8"
                strokeWidth={2}
                dot={{ fill: '#d4d4d8', r: 3 }}
                activeDot={{ r: 5, fill: '#fafafa' }}
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
                <linearGradient id="accErrGradMono" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a1a1aa" stopOpacity={0.85} />
                  <stop offset="100%" stopColor="#52525b" stopOpacity={0.5} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="t" tick={{ fill: '#71717a', fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fill: '#71717a', fontSize: 11 }} tickLine={false} width={32} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar
                dataKey="err"
                fill="url(#accErrGradMono)"
                radius={[4, 4, 0, 0]}
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

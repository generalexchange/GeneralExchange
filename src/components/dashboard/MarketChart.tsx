import React from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export interface MarketPoint {
  time: string;
  price: number;
  volume: number;
}

interface MarketChartProps {
  data: MarketPoint[];
}

const Tip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: MarketPoint }>;
}) => {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-white/15 bg-[#0a0c10]/95 backdrop-blur-md px-3 py-2 text-xs shadow-xl">
      <p className="font-mono text-zinc-400 mb-1">{p.time}</p>
      <p className="text-emerald-300">Price: {p.price.toFixed(2)}</p>
      <p className="text-sky-300">Volume: {(p.volume / 1_000_000).toFixed(2)}M</p>
    </div>
  );
};

export const MarketChart: React.FC<MarketChartProps> = ({ data }) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-4 sm:p-6 shadow-[0_12px_48px_-24px_rgba(0,0,0,0.55)] transition-shadow hover:shadow-[0_16px_56px_-20px_rgba(34,211,238,0.12)]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-emerald-400/90">Live price</p>
          <p className="text-sm text-zinc-500 mt-1">Mock intraday · volume bars scaled to shares</p>
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-zinc-400">
          <span className="flex items-center gap-2">
            <span className="h-0.5 w-6 bg-emerald-400 rounded" />
            Price
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded bg-sky-500/60" />
            Volume
          </span>
        </div>
      </div>
      <div className="h-[260px] sm:h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="volFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(56, 189, 248)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="rgb(56, 189, 248)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fill: '#71717a', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
            />
            <YAxis
              yAxisId="price"
              domain={['dataMin - 0.6', 'dataMax + 0.6']}
              tick={{ fill: '#71717a', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
              width={44}
            />
            <YAxis
              yAxisId="vol"
              orientation="right"
              tick={{ fill: '#52525b', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`}
              width={40}
            />
            <Tooltip content={<Tip />} />
            <Bar
              yAxisId="vol"
              dataKey="volume"
              fill="url(#volFill)"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
              isAnimationActive
              animationDuration={500}
            />
            <Line
              yAxisId="price"
              type="monotone"
              dataKey="price"
              stroke="#34d399"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: '#34d399', stroke: '#fff', strokeWidth: 1 }}
              isAnimationActive
              animationDuration={700}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

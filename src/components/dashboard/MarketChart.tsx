import React, { useMemo } from 'react';
import {
  Area as ReArea,
  Bar as ReBar,
  CartesianGrid as ReCartesianGrid,
  ComposedChart as ReComposedChart,
  Line as ReLine,
  ResponsiveContainer as ReResponsiveContainer,
  Tooltip as ReTooltip,
  XAxis as ReXAxis,
  YAxis as ReYAxis,
} from 'recharts';
import {
  PAPER_SESSION_OPEN_EQUITY,
  enrichMarketWithPaperEquity,
  getPaperAccountSnapshot,
  type MarketPointWithEquity,
} from './mockMlDashboardData';

export interface MarketPoint {
  time: string;
  price: number;
  volume: number;
}

interface MarketChartProps {
  data: MarketPoint[];
}

const RH_GREEN = '#00C805';
const RH_RED = '#FF4F00';

function formatUsd(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
}

function formatUsdCompact(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 10_000) return `$${(n / 1_000).toFixed(1)}k`;
  return formatUsd(n);
}

const Tip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: MarketPointWithEquity }>;
}) => {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-xl border border-white/12 bg-[#0a0b0f]/95 backdrop-blur-xl px-3 py-2.5 text-xs shadow-2xl">
      <p className="font-mono text-zinc-500 mb-1.5">{p.time}</p>
      <p className="font-semibold tabular-nums text-white">{formatUsd(p.equity)}</p>
      <p className="text-[11px] text-zinc-500 mt-0.5">Paper equity (mock path)</p>
      <p className="text-sky-400/90 mt-2 tabular-nums">Vol {(p.volume / 1_000_000).toFixed(2)}M sh</p>
    </div>
  );
};

export const MarketChart: React.FC<MarketChartProps> = ({ data }) => {
  const paper = useMemo(() => getPaperAccountSnapshot(data), [data]);
  const chartData = useMemo(
    () => enrichMarketWithPaperEquity(data, PAPER_SESSION_OPEN_EQUITY),
    [data],
  );
  const upDay = paper.dayChange >= 0;
  const lineColor = upDay ? RH_GREEN : RH_RED;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#0c0e12] to-[#060708] shadow-[0_20px_60px_-28px_rgba(0,0,0,0.85),0_0_0_1px_rgba(0,200,5,0.06)_inset]">
      {/* Web3-style edge sheen */}
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-40"
        style={{
          background:
            'linear-gradient(135deg, rgba(0,200,5,0.12) 0%, transparent 42%, rgba(139,92,246,0.08) 100%)',
        }}
      />

      <div className="relative p-4 sm:p-6 lg:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">{paper.accountLabel}</p>
            </div>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white tabular-nums sm:text-4xl lg:text-[2.75rem] lg:leading-none">
              {formatUsd(paper.equityNow)}
            </p>
            <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span
                className={`text-sm font-semibold tabular-nums sm:text-base ${upDay ? 'text-[#00C805]' : 'text-[#FF4F00]'}`}
              >
                {upDay ? '+' : ''}
                {formatUsd(paper.dayChange)}
              </span>
              <span className={`text-sm font-semibold tabular-nums ${upDay ? 'text-[#00C805]' : 'text-[#FF4F00]'}`}>
                ({upDay ? '+' : ''}
                {paper.dayChangePercent.toFixed(2)}%)
              </span>
              <span className="text-xs font-medium tracking-wide text-zinc-500">Today · mock session</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium text-zinc-300">
                Buying power{' '}
                <span className="ml-1.5 tabular-nums text-white">{formatUsd(paper.buyingPower)}</span>
              </span>
              <span className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-[11px] text-zinc-500">
                Open{' '}
                <span className="ml-1.5 tabular-nums text-zinc-400">{formatUsd(paper.sessionOpenEquity)}</span>
              </span>
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center lg:flex-col lg:items-end">
            <div className="flex flex-wrap items-center gap-4 text-[11px] text-zinc-500">
              <span className="flex items-center gap-2">
                <span className="h-2 w-8 rounded-full" style={{ background: lineColor }} />
                Equity
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded bg-sky-500/70" />
                Volume
              </span>
            </div>
            <p className="max-w-[220px] text-right text-[11px] leading-snug text-zinc-600 lg:text-xs">
              Intraday curve tracks paper balance vs session open using the mock benchmark tape (not live quotes).
            </p>
          </div>
        </div>

        <div className="relative mt-6 h-[220px] w-full sm:h-[260px] lg:h-[300px]">
          <ReResponsiveContainer width="100%" height="100%">
            <ReComposedChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <defs>
                <linearGradient id="equityAreaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={lineColor} stopOpacity={0.35} />
                  <stop offset="55%" stopColor={lineColor} stopOpacity={0.06} />
                  <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="volBarFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(56, 189, 248)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="rgb(56, 189, 248)" stopOpacity={0.08} />
                </linearGradient>
              </defs>
              <ReCartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <ReXAxis
                dataKey="time"
                tick={{ fill: '#52525b', fontSize: 11, fontWeight: 500 }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.07)' }}
              />
              <ReYAxis
                yAxisId="equity"
                domain={['dataMin - 120', 'dataMax + 120']}
                tick={{ fill: '#71717a', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={56}
                tickFormatter={(v) => formatUsdCompact(v as number)}
              />
              <ReYAxis
                yAxisId="vol"
                orientation="right"
                tick={{ fill: '#52525b', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${((v as number) / 1_000_000).toFixed(1)}M`}
                width={36}
              />
              <ReTooltip content={<Tip />} cursor={{ stroke: 'rgba(255,255,255,0.12)', strokeWidth: 1 }} />
              <ReBar
                yAxisId="vol"
                dataKey="volume"
                fill="url(#volBarFill)"
                radius={[3, 3, 0, 0]}
                maxBarSize={22}
                isAnimationActive
                animationDuration={480}
              />
              <ReArea
                yAxisId="equity"
                type="monotone"
                dataKey="equity"
                stroke="none"
                fill="url(#equityAreaFill)"
                isAnimationActive
                animationDuration={600}
              />
              <ReLine
                yAxisId="equity"
                type="monotone"
                dataKey="equity"
                stroke={lineColor}
                strokeWidth={2.25}
                dot={false}
                activeDot={{ r: 5, fill: lineColor, stroke: '#fff', strokeWidth: 1.5 }}
                isAnimationActive
                animationDuration={650}
              />
            </ReComposedChart>
          </ReResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

import React, { useId, useMemo, useState } from 'react';
import { Settings } from 'lucide-react';
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
  enrichMarketWithPaperEquity,
  type MarketPointWithEquity,
} from './mockMlDashboardData';
import {
  type PaperChartRange,
  PAPER_RANGE_PERIOD_LABEL,
  PAPER_RANGE_TABS,
  buildPaperSeriesForRange,
} from './paperPortfolioRanges';

export interface MarketPoint {
  time: string;
  price: number;
  volume: number;
}

interface MarketChartProps {
  data: MarketPoint[];
  onOpenAnalytics: () => void;
}

/** Luxury monochrome: primary line / emphasis vs muted drift */
const LINE_UP = '#f4f4f5';
const LINE_DOWN = '#a1a1aa';

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
  const volM = p.volume / 1_000_000;
  return (
    <div className="rounded-xl border border-white/10 bg-[#0c0c0c] px-3 py-2.5 text-xs shadow-xl">
      <p className="font-mono text-zinc-500 mb-1.5">{p.time}</p>
      <p className="font-semibold tabular-nums text-white">{formatUsd(p.equity)}</p>
      <p className="text-[11px] text-zinc-500 mt-0.5">Paper equity (mock path)</p>
      <p className="text-zinc-400 mt-2 tabular-nums">
        Vol {volM >= 0.01 ? `${volM.toFixed(2)}M` : `${(p.volume / 1000).toFixed(0)}k`} sh
      </p>
    </div>
  );
};

export const MarketChart: React.FC<MarketChartProps> = ({ data: baseData, onOpenAnalytics }) => {
  const gid = useId().replace(/:/g, '');
  const [range, setRange] = useState<PaperChartRange>('live');

  const { series, openEquity } = useMemo(() => buildPaperSeriesForRange(range, baseData), [range, baseData]);

  const chartData = useMemo(
    () => enrichMarketWithPaperEquity(series, openEquity),
    [series, openEquity],
  );

  const equityNow = chartData[chartData.length - 1]?.equity ?? openEquity;
  const sessionOpenEquity = chartData[0]?.equity ?? openEquity;
  const dayChange = Math.round((equityNow - sessionOpenEquity) * 100) / 100;
  const dayChangePercent =
    sessionOpenEquity !== 0 ? Math.round((dayChange / sessionOpenEquity) * 10000) / 100 : 0;
  const buyingPower = Math.round(equityNow * 0.352 * 100) / 100;

  const upPeriod = dayChange >= 0;
  const lineColor = upPeriod ? LINE_UP : LINE_DOWN;

  const yDomain = useMemo(() => {
    if (!chartData.length) return undefined;
    const vals = chartData.map((d) => d.equity);
    const lo = Math.min(...vals);
    const hi = Math.max(...vals);
    const pad = Math.max((hi - lo) * 0.12, 80);
    return [lo - pad, hi + pad] as [number, number];
  }, [chartData]);

  const areaId = `eq-${gid}`;
  const volId = `vol-${gid}`;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-[#0a0a0a] shadow-[0_24px_64px_-32px_rgba(0,0,0,0.9)]">
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(255,255,255,0.04),transparent_50%)]" />

      <div className="relative p-4 sm:p-6 lg:p-7">
        <div className="flex flex-col gap-4 lg:gap-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-zinc-400" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">Paper portfolio</p>
            </div>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white tabular-nums sm:text-4xl lg:text-[2.75rem] lg:leading-none">
              {formatUsd(equityNow)}
            </p>
            <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span
                className={`text-sm font-semibold tabular-nums sm:text-base ${upPeriod ? 'text-white' : 'text-zinc-500'}`}
              >
                {upPeriod ? '+' : ''}
                {formatUsd(dayChange)}
              </span>
              <span className={`text-sm font-semibold tabular-nums ${upPeriod ? 'text-zinc-300' : 'text-zinc-600'}`}>
                ({upPeriod ? '+' : ''}
                {dayChangePercent.toFixed(2)}%)
              </span>
              <span className="text-xs font-medium tracking-wide text-zinc-600">{PAPER_RANGE_PERIOD_LABEL[range]}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-[11px] font-medium text-zinc-400">
                Buying power <span className="ml-1.5 tabular-nums text-zinc-200">{formatUsd(buyingPower)}</span>
              </span>
              <span className="inline-flex items-center rounded-full border border-white/[0.06] bg-transparent px-3 py-1.5 text-[11px] text-zinc-600">
                Range open{' '}
                <span className="ml-1.5 tabular-nums text-zinc-500">{formatUsd(sessionOpenEquity)}</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <div className="flex flex-wrap items-center gap-4 text-[11px] text-zinc-500">
                <span className="flex items-center gap-2">
                  <span className="h-px w-8 bg-zinc-300" />
                  Equity
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm bg-zinc-600" />
                  Volume
                </span>
              </div>
              <button
                type="button"
                onClick={onOpenAnalytics}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-400 transition-all hover:border-white/20 hover:bg-white/[0.08] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                aria-label="Open portfolio analytics"
              >
                <Settings className="h-5 w-5" strokeWidth={1.75} />
              </button>
            </div>
            <p className="max-w-md text-[11px] leading-snug text-zinc-600 sm:text-right">
              Interval tabs below update the mock path. Analytics: gear.
            </p>
          </div>
        </div>

        <div className="relative mt-4 h-[220px] w-full sm:h-[260px] lg:h-[300px]">
          <ReResponsiveContainer width="100%" height="100%">
            <ReComposedChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <defs>
                <linearGradient id={areaId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={lineColor} stopOpacity={0.2} />
                  <stop offset="70%" stopColor={lineColor} stopOpacity={0.04} />
                  <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
                </linearGradient>
                <linearGradient id={volId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#52525b" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#27272a" stopOpacity={0.15} />
                </linearGradient>
              </defs>
              <ReCartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <ReXAxis
                dataKey="time"
                tick={{ fill: '#71717a', fontSize: 11, fontWeight: 500 }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                interval="preserveStartEnd"
              />
              <ReYAxis
                yAxisId="equity"
                domain={yDomain ?? ['dataMin - 120', 'dataMax + 120']}
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
                tickFormatter={(v) => {
                  const n = v as number;
                  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
                  return `${(n / 1000).toFixed(0)}k`;
                }}
                width={40}
              />
              <ReTooltip content={<Tip />} cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }} />
              <ReBar
                yAxisId="vol"
                dataKey="volume"
                fill={`url(#${volId})`}
                radius={[2, 2, 0, 0]}
                maxBarSize={22}
                isAnimationActive
                animationDuration={480}
              />
              <ReArea
                yAxisId="equity"
                type="monotone"
                dataKey="equity"
                stroke="none"
                fill={`url(#${areaId})`}
                isAnimationActive
                animationDuration={600}
              />
              <ReLine
                yAxisId="equity"
                type="monotone"
                dataKey="equity"
                stroke={lineColor}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: lineColor, stroke: '#ffffff', strokeWidth: 1 }}
                isAnimationActive
                animationDuration={650}
              />
            </ReComposedChart>
          </ReResponsiveContainer>
        </div>

        <div className="mt-4 flex justify-center border-t border-white/[0.06] pt-4">
          <div className="flex max-w-full gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:justify-center">
            {PAPER_RANGE_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setRange(tab.id)}
                className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-medium tabular-nums transition-all sm:px-4 ${
                  range === tab.id
                    ? 'border-white/20 bg-white/[0.12] text-white'
                    : 'border-transparent text-zinc-500 hover:border-white/10 hover:bg-white/[0.04] hover:text-zinc-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bell, Loader2, Maximize2, Settings } from 'lucide-react';
import type { Candle } from '@/components/dashboard/terminal/terminalData';
import type { ChartRange } from '@/hooks/useLiveDashboard';
import { QuotePriceChart, CHART_HEIGHT_EXTENDED, QUOTE_CHART_HEIGHT, type QuoteCardTheme } from '@/components/dashboard/QuotePriceChart';
import { LivePulseIndicator } from '@/components/dashboard/LivePulseIndicator';
import { legendDashboardUrl } from '@/lib/legendUrl';

export type { QuoteCardTheme };

export type StockQuoteHeroProps = {
  symbol: string;
  name?: string;
  price: number;
  change: number;
  changePct: number;
  prevClose?: number;
  afterHoursChange?: number;
  afterHoursChangePct?: number;
  candles?: Candle[];
  live?: boolean;
  loading?: boolean;
  theme?: QuoteCardTheme;
  chartRange?: ChartRange;
  onChartRangeChange?: (range: ChartRange) => void;
  onOpenAdvanced?: () => void;
  className?: string;
};

const RANGES: ChartRange[] = ['1D', '1W', '1M', '3M', 'YTD', '1Y', '5Y', 'MAX'];

function fmtPrice(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtSigned(n: number, digits = 2) {
  const abs = Math.abs(n);
  const s = abs.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
  return n < 0 ? `-$${s}` : n > 0 ? `+$${s}` : `$${s}`;
}

function fmtSignedPct(n: number) {
  const sign = n > 0 ? '+' : n < 0 ? '' : '+';
  return `${sign}${n.toFixed(2)}%`;
}

/** Hero quote card — left-aligned price block, extended-hours 1D chart, bottom LIVE pulse. */
export function StockQuoteHero({
  symbol,
  name,
  price,
  change,
  changePct,
  prevClose: prevCloseProp,
  afterHoursChange,
  afterHoursChangePct,
  candles = [],
  live,
  loading,
  theme = 'tan',
  chartRange: chartRangeProp,
  onChartRangeChange,
  onOpenAdvanced,
  className = '',
}: StockQuoteHeroProps) {
  const [localRange, setLocalRange] = useState<ChartRange>('1D');
  const range = chartRangeProp ?? localRange;
  const isDark = theme === 'dark';
  const is1D = range === '1D';

  const up = change >= 0;
  const displayName = name && name !== symbol ? name : symbol;
  const prevClose = prevCloseProp ?? price - change;
  const showAh =
    afterHoursChange != null &&
    afterHoursChangePct != null &&
    (afterHoursChange !== 0 || afterHoursChangePct !== 0);
  const ahUp = (afterHoursChange ?? 0) >= 0;

  const setRange = (r: ChartRange) => {
    if (onChartRangeChange) onChartRangeChange(r);
    else setLocalRange(r);
  };

  const cardBg = isDark ? 'bg-[#0a0a0a] text-zinc-100' : 'bg-[#f2ead3] text-zinc-900';
  const priceColor = isDark ? 'text-white' : 'text-zinc-900';
  const changeColor = up ? 'text-[#00C805]' : 'text-[#FF5000]';
  const ahColor = ahUp ? 'text-[#00C805]' : 'text-[#FF5000]';
  const muted = isDark ? 'text-zinc-400' : 'text-zinc-600';
  const border = isDark ? 'border-zinc-800' : 'border-zinc-300';
  const accentDot = up ? 'bg-[#00C805]' : 'bg-[#FF5000]';
  const tabBorder = isDark ? 'border-zinc-800' : 'border-zinc-200';
  const chartH = is1D ? CHART_HEIGHT_EXTENDED : QUOTE_CHART_HEIGHT;

  return (
    <div className={`overflow-hidden rounded-xl shadow-sm ${cardBg} ${className}`}>
      <div className="flex items-center justify-end gap-2 px-4 pt-4">
        <button
          type="button"
          className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors hover:opacity-90 ${border}`}
          aria-label="Alerts"
        >
          <Bell className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          onClick={onOpenAdvanced}
          className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors hover:opacity-90 ${border}`}
          aria-label="Expand chart"
        >
          <Maximize2 className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </button>
        <Link
          href={legendDashboardUrl('/')}
          onClick={(e) => {
            if (onOpenAdvanced) {
              e.preventDefault();
              onOpenAdvanced();
            }
          }}
          className={`flex h-9 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium transition-colors hover:opacity-90 ${border}`}
        >
          Legend chart
          <span className="text-[11px] opacity-60">↗</span>
        </Link>
      </div>

      {/* Left-aligned quote block — ~55% width leaves 100–150px+ breathing room on right */}
      <div className="px-4 pb-2 pt-1">
        <div className="max-w-[min(55%,calc(100%-150px))]">
          <h1 className="text-[22px] font-bold leading-tight tracking-tight sm:text-[26px]">{displayName}</h1>
          {name && name !== symbol && (
            <p className={`mt-0.5 text-[13px] font-medium ${muted}`}>{symbol}</p>
          )}
          {loading && !price && (
            <Loader2 className={`mt-2 h-5 w-5 animate-spin ${muted}`} />
          )}
          <p className={`mt-3 text-[34px] font-normal leading-none tabular-nums tracking-tight sm:text-[40px] ${priceColor}`}>
            ${fmtPrice(price)}
          </p>
          <p className={`mt-2 text-[14px] tabular-nums ${changeColor}`}>
            {fmtSigned(change)} ({fmtSignedPct(changePct)}) <span className={muted}>Today</span>
          </p>
          {showAh && (
            <p className={`mt-0.5 text-[14px] tabular-nums ${ahColor}`}>
              {fmtSigned(afterHoursChange!)} ({fmtSignedPct(afterHoursChangePct!)}){' '}
              <span className={muted}>After-hours</span>
            </p>
          )}
        </div>
      </div>

      <div className="w-full px-1">
        {candles.length === 0 && loading ? (
          <div className="flex items-center justify-center" style={{ height: chartH }}>
            <Loader2 className={`h-6 w-6 animate-spin opacity-40 ${muted}`} />
          </div>
        ) : (
          <QuotePriceChart
            candles={candles}
            up={up}
            prevClose={prevClose}
            theme={theme}
            height={chartH}
            extendedHours={is1D}
          />
        )}
      </div>

      <LivePulseIndicator accentClass={accentDot} visible={is1D && Boolean(live)} />

      <div className={`flex items-center justify-between border-t px-2 pb-3 pt-2 ${tabBorder}`}>
        <div className="flex flex-wrap items-center gap-0.5">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`relative px-2.5 py-1.5 text-[13px] font-bold tabular-nums transition-colors ${
                range === r ? (isDark ? 'text-white' : 'text-zinc-900') : muted
              }`}
            >
              {r}
              {range === r && (
                <span className={`absolute bottom-0 left-2 right-2 h-[2px] rounded-full ${up ? 'bg-[#00C805]' : 'bg-[#FF5000]'}`} />
              )}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={`mr-1 flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-black/5 ${muted}`}
          aria-label="Chart settings"
        >
          <Settings className="h-[16px] w-[16px]" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}

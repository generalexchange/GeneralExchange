'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bell, Loader2, Maximize2, Settings } from 'lucide-react';
import type { Candle } from '@/components/dashboard/terminal/terminalData';
import type { ChartRange } from '@/hooks/useLiveDashboard';
import { QuotePriceChart, QUOTE_CHART_HEIGHT, type QuoteCardTheme } from '@/components/dashboard/QuotePriceChart';

const RH_UP = '#00C805';
const RH_DOWN = '#FF5000';
const TAN_BG = '#f2ead3';
const DARK_BG = '#0a0a0a';

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

/** Robinhood-style quote block with session-aware theming. */
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

  const bg = isDark ? DARK_BG : TAN_BG;
  const text = isDark ? '#f5f5f5' : '#1a1a1a';
  const muted = isDark ? '#9ca3af' : '#6b6b6b';
  const border = isDark ? '#262626' : '#e4e4e4';
  const hoverBg = isDark ? '#171717' : '#f5f5f5';
  const tabBorder = isDark ? '#262626' : '#ebebeb';

  const up = change >= 0;
  const color = up ? RH_UP : RH_DOWN;
  const displayName = name && name !== symbol ? name : symbol;
  const prevClose = prevCloseProp ?? price - change;
  const showAh =
    afterHoursChange != null &&
    afterHoursChangePct != null &&
    (afterHoursChange !== 0 || afterHoursChangePct !== 0);
  const ahUp = (afterHoursChange ?? 0) >= 0;
  const ahColor = ahUp ? RH_UP : RH_DOWN;

  const setRange = (r: ChartRange) => {
    if (onChartRangeChange) onChartRangeChange(r);
    else setLocalRange(r);
  };

  return (
    <div className={`overflow-hidden rounded-xl shadow-sm ${className}`} style={{ backgroundColor: bg, color: text }}>
      <div className="flex items-center justify-end gap-2 px-4 pt-4">
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full border transition-colors hover:opacity-90"
          style={{ borderColor: border, color: text }}
          aria-label="Alerts"
        >
          <Bell className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          onClick={onOpenAdvanced}
          className="flex h-9 w-9 items-center justify-center rounded-full border transition-colors hover:opacity-90"
          style={{ borderColor: border, color: text }}
          aria-label="Expand chart"
        >
          <Maximize2 className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </button>
        <Link
          href="/dashboard"
          onClick={(e) => {
            if (onOpenAdvanced) {
              e.preventDefault();
              onOpenAdvanced();
            }
          }}
          className="flex h-9 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium transition-colors hover:opacity-90"
          style={{ borderColor: border, color: text }}
        >
          Legend chart
          <span className="text-[11px] opacity-60">↗</span>
        </Link>
      </div>

      <div className="px-4 pb-2 pt-1">
        <div className="flex items-baseline gap-2">
          <h1 className="text-[28px] font-bold leading-tight tracking-tight" style={{ color: text }}>
            {displayName}
          </h1>
          {live && (
            <span className="rounded bg-[#00C805]/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#00C805]">
              Live
            </span>
          )}
          {loading && !live && (
            <Loader2 className="h-4 w-4 animate-spin opacity-50" style={{ color: muted }} />
          )}
        </div>
        {name && name !== symbol && (
          <p className="mt-0.5 text-[13px] font-medium" style={{ color: muted }}>
            {symbol}
          </p>
        )}
        <p className="mt-3 text-[32px] font-normal leading-none tabular-nums tracking-tight sm:text-[36px]" style={{ color: text }}>
          ${fmtPrice(price)}
        </p>
        <p className="mt-2 text-[14px] tabular-nums" style={{ color }}>
          {fmtSigned(change)} ({fmtSignedPct(changePct)}){' '}
          <span style={{ color: muted }}>Today</span>
        </p>
        {showAh && (
          <p className="mt-0.5 text-[14px] tabular-nums" style={{ color: ahColor }}>
            {fmtSigned(afterHoursChange!)} ({fmtSignedPct(afterHoursChangePct!)}){' '}
            <span style={{ color: muted }}>After-hours</span>
          </p>
        )}
      </div>

      <div className="px-1">
        {candles.length === 0 && loading ? (
          <div className="flex items-center justify-center" style={{ height: QUOTE_CHART_HEIGHT }}>
            <Loader2 className="h-6 w-6 animate-spin opacity-40" style={{ color: muted }} />
          </div>
        ) : (
          <QuotePriceChart candles={candles} up={up} prevClose={prevClose} theme={theme} />
        )}
      </div>

      <div className="flex items-center justify-between border-t px-2 pb-3 pt-2" style={{ borderColor: tabBorder }}>
        <div className="flex flex-wrap items-center gap-0.5">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className="relative px-2.5 py-1.5 text-[13px] font-bold tabular-nums transition-colors"
              style={{ color: range === r ? text : muted }}
            >
              {r}
              {range === r && (
                <span
                  className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full"
                  style={{ backgroundColor: color }}
                />
              )}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="mr-1 flex h-8 w-8 items-center justify-center rounded-full transition-colors"
          style={{ color: muted }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hoverBg)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          aria-label="Chart settings"
        >
          <Settings className="h-[16px] w-[16px]" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Settings, Wallet } from 'lucide-react';
import { SessionIntelRibbonSummary } from './IntelligenceStatusBar';
import type { IntelligenceRibbonProps } from './mockMlDashboardData';
import { getBenchmarkEndEquity, PAPER_RANGE_TABS } from './paperPortfolioRanges';
import {
  appendLiveTick,
  buildEquitySeriesForRange,
  getOneHourLastEquity,
  getPortfolioChartSessionSeed,
  RANGE_PERIOD_LABEL,
  type RobinhoodRange,
} from './robinhoodMockSeries';

export interface MarketPoint {
  time: string;
  price: number;
  volume: number;
}

interface MarketChartProps {
  data: MarketPoint[];
  onOpenAnalytics: () => void;
  intelligenceRibbon?: IntelligenceRibbonProps;
  onIntelligenceTapeHoverChange?: (open: boolean) => void;
}

const LINE_UP = '#00C805';
const LINE_DOWN = '#FF5000';

function formatUsd(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
}

function CassetteTapeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <rect x="2.25" y="5.5" width="19.5" height="13" rx="1.75" stroke="currentColor" strokeWidth="1.65" />
      <path d="M4 8.25h16" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" opacity="0.45" />
      <rect x="5.5" y="9.25" width="13" height="4.25" rx="0.5" stroke="currentColor" strokeWidth="1.2" opacity="0.35" />
      <circle cx="8.75" cy="15.75" r="2.35" stroke="currentColor" strokeWidth="1.35" />
      <circle cx="15.25" cy="15.75" r="2.35" stroke="currentColor" strokeWidth="1.35" />
      <circle cx="8.75" cy="15.75" r="0.9" fill="currentColor" opacity="0.35" />
      <circle cx="15.25" cy="15.75" r="0.9" fill="currentColor" opacity="0.35" />
      <path d="M7 5.5V4M17 5.5V4" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
    </svg>
  );
}

function buildSmoothLinePath(pts: Array<{ x: number; y: number }>): string {
  if (pts.length < 2) return '';
  if (pts.length === 2) return `M ${pts[0]!.x} ${pts[0]!.y} L ${pts[1]!.x} ${pts[1]!.y}`;
  let d = `M ${pts[0]!.x} ${pts[0]!.y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]!;
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p3 = pts[Math.min(pts.length - 1, i + 2)]!;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

function scaleYs(values: number[], chartH: number, pad: number): { min: number; max: number; y: (v: number) => number } {
  if (!values.length) {
    return { min: 0, max: 1, y: () => chartH / 2 };
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(max - min, max * 0.0008, 1);
  const lo = min - span * pad;
  const hi = max + span * pad;
  const range = hi - lo;
  return {
    min: lo,
    max: hi,
    y: (v: number) => chartH - ((v - lo) / range) * chartH,
  };
}

export const MarketChart: React.FC<MarketChartProps> = ({
  data: baseData,
  onOpenAnalytics,
  intelligenceRibbon,
  onIntelligenceTapeHoverChange,
}) => {
  const gid = useId().replace(/:/g, '');
  const sessionSeed = useMemo(() => getPortfolioChartSessionSeed(), []);
  const [range, setRange] = useState<RobinhoodRange>('1d');
  const [liveSeries, setLiveSeries] = useState<number[]>([]);
  const [chartW, setChartW] = useState(360);
  const chartH = 200;
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scrubIdx, setScrubIdx] = useState<number | null>(null);
  const [pointerX, setPointerX] = useState<number | null>(null);
  const [portfolioSource, setPortfolioSource] = useState<'paper' | 'ib'>('paper');

  const endEquity = useMemo(() => getBenchmarkEndEquity(baseData), [baseData]);
  const isIb = portfolioSource === 'ib';

  const staticByRange = useMemo(() => {
    const out: Partial<Record<RobinhoodRange, number[]>> = {};
    for (const tab of PAPER_RANGE_TABS) {
      if (tab.id === 'live') continue;
      out[tab.id] = buildEquitySeriesForRange(tab.id, endEquity, sessionSeed);
    }
    return out;
  }, [endEquity, sessionSeed]);

  const staticSeries = range === 'live' ? [] : staticByRange[range] ?? [];
  const equitySeries = range === 'live' ? liveSeries : staticSeries;
  const chartSeries = isIb ? [] : equitySeries;

  useEffect(() => {
    if (isIb || range !== 'live') return;
    setLiveSeries((prev) => {
      if (prev.length) return prev;
      const anchor = getOneHourLastEquity(endEquity, sessionSeed);
      return [anchor];
    });
  }, [isIb, range, endEquity, sessionSeed]);

  useEffect(() => {
    if (isIb || range !== 'live') return;
    const id = window.setInterval(() => {
      setLiveSeries((prev) => appendLiveTick(prev, endEquity, sessionSeed));
    }, 2000);
    return () => window.clearInterval(id);
  }, [isIb, range, endEquity, sessionSeed]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w && w > 0) setChartW(Math.floor(w));
    });
    ro.observe(el);
    setChartW(Math.floor(el.getBoundingClientRect().width) || 360);
    return () => ro.disconnect();
  }, []);

  const rangeStart = chartSeries[0] ?? endEquity;
  const rangeEnd = chartSeries[chartSeries.length - 1] ?? endEquity;
  const upRange = rangeEnd >= rangeStart;
  const lineColor = upRange ? LINE_UP : LINE_DOWN;

  const lastIdx = Math.max(0, chartSeries.length - 1);
  const hoverIdx = scrubIdx !== null ? scrubIdx : lastIdx;
  const displayValue = isIb ? 0 : chartSeries[hoverIdx] ?? endEquity;
  const compareStart = rangeStart;
  const displayChange = isIb ? 0 : Math.round((displayValue - compareStart) * 100) / 100;
  const displayPct =
    isIb || compareStart === 0 ? 0 : Math.round((displayChange / compareStart) * 10000) / 100;
  const displayUp = displayChange >= 0;

  const buyingPower = Math.round((chartSeries[lastIdx] ?? endEquity) * 0.352 * 100) / 100;

  const pts = useMemo(() => {
    if (isIb) return [];
    const src =
      chartSeries.length >= 2
        ? chartSeries
        : chartSeries.length === 1
          ? [chartSeries[0]!, chartSeries[0]!]
          : [];
    if (src.length < 2) return [];
    const { y } = scaleYs(src, chartH, 0.1);
    const n = src.length;
    return src.map((v, i) => ({
      x: (i / (n - 1)) * chartW,
      y: y(v),
    }));
  }, [chartSeries, chartW, chartH, isIb]);

  const linePath = useMemo(() => buildSmoothLinePath(pts), [pts]);
  const fillPath =
    linePath && pts.length
      ? `${linePath} L ${pts[pts.length - 1]!.x} ${chartH} L ${pts[0]!.x} ${chartH} Z`
      : '';

  const tapeBtnRef = useRef<HTMLButtonElement>(null);
  const tapeLeaveTimer = useRef<number | null>(null);
  const [tapeHover, setTapeHover] = useState(false);
  const [tapeAnchor, setTapeAnchor] = useState<{ top: number; right: number } | null>(null);

  const clearTapeLeaveTimer = useCallback(() => {
    if (tapeLeaveTimer.current !== null) {
      window.clearTimeout(tapeLeaveTimer.current);
      tapeLeaveTimer.current = null;
    }
  }, []);

  const updateTapeAnchor = useCallback(() => {
    const el = tapeBtnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setTapeAnchor({ top: r.bottom + 8, right: window.innerWidth - r.right });
  }, []);

  useEffect(() => {
    if (!tapeHover) return;
    updateTapeAnchor();
    const onResize = () => updateTapeAnchor();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [tapeHover, updateTapeAnchor]);

  useEffect(() => {
    onIntelligenceTapeHoverChange?.(tapeHover);
  }, [tapeHover, onIntelligenceTapeHoverChange]);

  useEffect(() => () => clearTapeLeaveTimer(), [clearTapeLeaveTimer]);

  const onChartPointer = (clientX: number, rect: DOMRect) => {
    if (isIb || chartSeries.length < 1) return;
    const x = clientX - rect.left;
    const clamped = Math.max(0, Math.min(chartW, x));
    const denom = Math.max(1, chartSeries.length - 1);
    const t = chartW > 0 ? clamped / chartW : 0;
    const idx = Math.round(t * denom);
    setScrubIdx(idx);
    setPointerX((idx / denom) * chartW);
  };

  useEffect(() => {
    if (!isIb) return;
    setScrubIdx(null);
    setPointerX(null);
  }, [isIb]);

  const tapePopover =
    tapeHover && intelligenceRibbon && tapeAnchor && typeof document !== 'undefined'
      ? createPortal(
          <div
            className="pointer-events-auto fixed z-[200] w-[min(calc(100vw-2rem),22rem)] rounded-xl border border-white/10 bg-[#0b0b0b] p-3 shadow-2xl shadow-black/50"
            style={{ top: tapeAnchor.top, right: tapeAnchor.right }}
            onMouseEnter={() => {
              clearTapeLeaveTimer();
              setTapeHover(true);
            }}
            onMouseLeave={() => setTapeHover(false)}
            role="tooltip"
          >
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Snapshot</p>
            <SessionIntelRibbonSummary ribbon={intelligenceRibbon} />
          </div>,
          document.body,
        )
      : null;

  const gradId = `rh-fill-${gid}`;
  const isScrubbing = scrubIdx !== null;

  return (
    <div className="relative overflow-x-hidden overflow-y-visible rounded-3xl border border-white/[0.06] bg-[#0a0a0a] shadow-[0_24px_64px_-32px_rgba(0,0,0,0.9)]">
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(255,255,255,0.04),transparent_50%)]" />

      <div className="relative p-4 sm:p-6 lg:p-7">
        <div className="absolute right-4 top-4 z-20 flex flex-row-reverse items-center gap-2 sm:right-6 sm:top-6">
          <button
            type="button"
            onClick={onOpenAnalytics}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-zinc-400 transition-all hover:border-white/20 hover:bg-white/[0.1] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 sm:h-10 sm:w-10"
            aria-label="Open portfolio analytics"
          >
            <Settings className="h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={1.75} />
          </button>
          {intelligenceRibbon ? (
            <button
              ref={tapeBtnRef}
              type="button"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-zinc-400 transition-all hover:border-white/20 hover:bg-white/[0.1] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 sm:h-10 sm:w-10"
              aria-label="Session intelligence on tape — hover for Edge, Hit rate, and Volatility"
              aria-expanded={tapeHover}
              onMouseEnter={() => {
                clearTapeLeaveTimer();
                setTapeHover(true);
                queueMicrotask(() => updateTapeAnchor());
              }}
              onMouseLeave={() => {
                tapeLeaveTimer.current = window.setTimeout(() => setTapeHover(false), 140);
              }}
              onFocus={() => {
                clearTapeLeaveTimer();
                setTapeHover(true);
                queueMicrotask(() => updateTapeAnchor());
              }}
              onBlur={() => {
                tapeLeaveTimer.current = window.setTimeout(() => setTapeHover(false), 140);
              }}
            >
              <CassetteTapeIcon className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
            </button>
          ) : null}
        </div>

        <div className="flex flex-col gap-1 pr-24 sm:pr-28">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" aria-hidden />
              <div
                className="inline-flex max-w-full rounded-lg border border-white/[0.12] bg-black/35 p-0.5"
                role="group"
                aria-label="Portfolio data source"
              >
                <button
                  type="button"
                  onClick={() => setPortfolioSource('paper')}
                  className={`rounded-md px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors sm:px-3 sm:text-[11px] ${
                    portfolioSource === 'paper'
                      ? 'bg-white/[0.12] text-white'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Paper
                </button>
                <button
                  type="button"
                  title="Interactive Brokers"
                  onClick={() => setPortfolioSource('ib')}
                  className={`rounded-md px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors sm:px-3 sm:text-[11px] ${
                    portfolioSource === 'ib'
                      ? 'bg-white/[0.12] text-white'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <span className="sm:hidden">IBKR</span>
                  <span className="hidden sm:inline">Interactive Brokers</span>
                </button>
              </div>
            </div>
            {isIb ? (
              <>
                <p className="mt-3 font-mono text-[32px] font-bold leading-none tracking-tight text-zinc-600 tabular-nums">
                  —
                </p>
                <div className="mt-3 max-w-xl rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                    Interactive Brokers · not connected
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    Live balances, margin, and synced positions for IBKR accounts are still in certification. Paper mode
                    remains the supported path for now.
                  </p>
                  <p className="mt-2 font-mono text-xs text-zinc-500">Status: coming soon</p>
                </div>
              </>
            ) : (
              <>
                <motion.p
                  key={isScrubbing ? `v-${hoverIdx}` : 'v-rest'}
                  initial={{ opacity: 0.88 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="mt-3 font-mono text-[32px] font-bold leading-none tracking-tight text-white tabular-nums"
                >
                  {formatUsd(displayValue)}
                </motion.p>
                <motion.div
                  key={isScrubbing ? `c-${hoverIdx}` : 'c-rest'}
                  initial={{ opacity: 0.88 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 font-mono text-base tabular-nums sm:text-[16px]"
                >
                  <span className={`font-medium ${displayUp ? 'text-[#00C805]' : 'text-[#FF5000]'}`}>
                    {displayUp ? '+' : ''}
                    {formatUsd(displayChange)}
                  </span>
                  <span className={`font-medium ${displayUp ? 'text-[#00C805]' : 'text-[#FF5000]'}`}>
                    ({displayUp ? '+' : ''}
                    {displayPct.toFixed(2)}%)
                  </span>
                  <span className="text-[13px] font-normal text-zinc-500">{RANGE_PERIOD_LABEL[range]}</span>
                </motion.div>
                <div className="mt-3 flex items-center gap-2 text-zinc-500">
                  <Wallet className="h-3.5 w-3.5 shrink-0 text-zinc-400" strokeWidth={1.75} aria-hidden />
                  <span className="text-xs font-medium tracking-wide">
                    Buying power{' '}
                    <span className="font-mono tabular-nums text-zinc-300">{formatUsd(buyingPower)}</span>
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <div ref={wrapRef} className="relative mt-5 w-full select-none" style={{ height: chartH }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${range}-${portfolioSource}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: isIb ? 0.35 : 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="absolute inset-0"
              onPointerMove={(e) => {
                if (isIb || !wrapRef.current || chartSeries.length < 2) return;
                onChartPointer(e.clientX, wrapRef.current.getBoundingClientRect());
              }}
              onPointerDown={(e) => {
                if (isIb || !wrapRef.current || chartSeries.length < 2) return;
                try {
                  (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
                } catch {
                  /* noop */
                }
                onChartPointer(e.clientX, wrapRef.current.getBoundingClientRect());
              }}
              onPointerLeave={() => {
                setScrubIdx(null);
                setPointerX(null);
              }}
              onPointerUp={() => {
                setScrubIdx(null);
                setPointerX(null);
              }}
            >
              <svg width={chartW} height={chartH} className="block max-w-full" role="img" aria-label="Portfolio value">
                <defs>
                  <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={lineColor} stopOpacity={0.15} />
                    <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                {fillPath ? <path d={fillPath} fill={`url(#${gradId})`} /> : null}
                {linePath ? (
                  <path d={linePath} fill="none" stroke={lineColor} strokeWidth={2} strokeLinejoin="round" />
                ) : null}
                {pointerX !== null && chartSeries.length >= 1 && !isIb ? (
                  <line
                    x1={pointerX}
                    y1={0}
                    x2={pointerX}
                    y2={chartH}
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth={1}
                  />
                ) : null}
              </svg>
            </motion.div>
          </AnimatePresence>
          {isIb ? (
            <div
              className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center rounded-lg border border-white/[0.06] bg-[#0a0a0a]/90 px-4 text-center backdrop-blur-sm"
              aria-live="polite"
            >
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Interactive Brokers
              </p>
              <p className="mt-2 max-w-sm text-sm font-medium text-zinc-200">Broker feed unavailable</p>
              <p className="mt-1 max-w-sm text-xs leading-relaxed text-zinc-500">
                Read-only portfolio sync and live P&amp;L from IBKR are on the roadmap. Switch to Paper to use the chart.
              </p>
              <p className="mt-3 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                Coming soon
              </p>
            </div>
          ) : null}
        </div>

        <div className="mt-5 flex justify-center border-t border-white/[0.06] pt-4">
          <div className="flex max-w-full flex-wrap justify-center gap-x-1 gap-y-1 sm:gap-x-2">
            {PAPER_RANGE_TABS.map((tab) => {
              const tabSeries = tab.id === 'live' ? liveSeries : staticByRange[tab.id] ?? [];
              const upTab =
                tab.id === 'live'
                  ? (tabSeries[tabSeries.length - 1] ?? endEquity) >= (tabSeries[0] ?? endEquity)
                  : (tabSeries[tabSeries.length - 1] ?? endEquity) >= (tabSeries[0] ?? endEquity);
              const selColor = upTab ? LINE_UP : LINE_DOWN;
              const selected = range === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  disabled={isIb}
                  onClick={() => {
                    setRange(tab.id);
                    if (tab.id === 'live') setLiveSeries([]);
                  }}
                  className={`shrink-0 px-2 py-1.5 font-mono text-xs transition-colors sm:px-2.5 disabled:cursor-not-allowed disabled:opacity-35 ${
                    selected
                      ? `font-bold underline decoration-2 underline-offset-4`
                      : 'font-medium text-zinc-500 hover:text-zinc-300'
                  }`}
                  style={selected && !isIb ? { color: selColor, textDecorationColor: selColor } : undefined}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {tapePopover}
    </div>
  );
};

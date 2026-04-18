'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Check, Inbox, X } from 'lucide-react';
import { getCatalogStockBySymbol, listUniqueStocks, type CatalogStock } from '../../data/mockStocksCatalog';

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

interface SignalPickRow {
  id: string;
  label: string;
  strike: number;
  right: 'C' | 'P';
  expLabel: string;
  signalStrength: number;
  ivRank: number;
  delta: number;
  bid: number;
  ask: number;
  edgeUsd: number;
}

interface FeedRow {
  key: string;
  label: string;
  signal: number;
  edge: number;
  baseId: string;
}

function formatUsdSigned(n: number): string {
  const sign = n >= 0 ? '+' : '-';
  const body = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${sign}$${body}`;
}

function buildSignalPicks(symbol: string, spot: number): SignalPickRow[] {
  const step = spot > 400 ? 5 : spot > 150 ? 2.5 : 1;
  const center = Math.round(spot / step) * step;
  const rows: SignalPickRow[] = [];
  const offsets = [-4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7];
  const expPool = ['04/03', '04/10', '04/18', '05/15'];
  for (const off of offsets) {
    if (rows.length >= 10) break;
    const strike = Math.max(1, Math.round((center + off * step) * 100) / 100);
    const right: 'C' | 'P' = hashStr(`${symbol}|${strike}`) % 2 === 0 ? 'C' : 'P';
    const expLabel = expPool[hashStr(`${symbol}|${strike}|${right}`) % expPool.length]!;
    const id = `${symbol}|${strike}|${right}|${expLabel}`;
    const h = hashStr(id);
    const signalStrength = Math.round((0.52 + (h % 48) / 100) * 100) / 100;
    if (signalStrength < 0.5) continue;
    const ivRank = Math.round((22 + (h % 55) + (strike > spot ? 4 : 0)) * 10) / 10;
    const delta = right === 'C' ? Math.min(0.92, 0.35 + (h % 40) / 100) : -Math.min(0.85, 0.3 + (h % 35) / 100);
    const mid = Math.max(0.05, (h % 500) / 100 + (right === 'C' ? 2.2 : 1.8));
    const spr = 0.02 + (h % 8) / 100;
    const bid = Math.round((mid - spr / 2) * 100) / 100;
    const ask = Math.round((mid + spr / 2) * 100) / 100;
    const edgeUsd = Math.round(((h % 17) - 6) * 3) / 100;
    rows.push({
      id,
      label: `${symbol} ${strike % 1 === 0 ? strike.toFixed(0) : strike.toFixed(1)}${right} ${expLabel}`,
      strike,
      right,
      expLabel,
      signalStrength,
      ivRank,
      delta,
      bid,
      ask,
      edgeUsd,
    });
  }
  return rows.sort((a, b) => b.signalStrength - a.signalStrength).slice(0, 10);
}

/** ±5% multiplicative jitter for live-recalc feel */
function jitterPick(p: SignalPickRow): { signalStrength: number; edgeUsd: number } {
  const r = () => 1 + (Math.random() * 2 - 1) * 0.05;
  const signalStrength = Math.min(1, Math.max(0.5, Math.round(p.signalStrength * r() * 1000) / 1000));
  const edgeUsd = Math.round(p.edgeUsd * r() * 100) / 100;
  return { signalStrength, edgeUsd };
}

function buildModalPnLPath(
  spot: number,
  w: number,
  h: number,
  pad: number,
): { line: string; zeroY: number; spotX: number } {
  const n = 56;
  const xs: number[] = [];
  const pnls: number[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const u = 0.8 + t * 0.4;
    const px = pad + t * (w - pad * 2);
    const underlying = spot * u;
    const pnl = -5200 + 4600 * Math.sin((u - 1) * 5.5) + (underlying - spot) * 36;
    xs.push(px);
    pnls.push(pnl);
  }
  const minPnl = Math.min(...pnls);
  const maxPnl = Math.max(...pnls);
  const span = Math.max(1e-6, maxPnl - minPnl);
  const zeroYRaw = pad + (1 - (0 - minPnl) / span) * (h - pad * 2);
  const zeroY = Math.max(pad + 4, Math.min(h - pad - 4, zeroYRaw));
  const pts = pnls.map((pnl, i) => {
    const py = pad + (1 - (pnl - minPnl) / span) * (h - pad * 2);
    return `${i === 0 ? 'M' : 'L'}${xs[i]!.toFixed(1)},${py.toFixed(1)}`;
  });
  const spotT = 0.5;
  const spotX = pad + spotT * (w - pad * 2);
  return { line: pts.join(' '), zeroY, spotX };
}

const DEFAULT_SYMBOL = 'AAPL';
const FEED_EASE = [0.16, 1, 0.3, 1] as const;

export const OrderBookPreview: React.FC = () => {
  const [selected] = useState<CatalogStock>(
    () => getCatalogStockBySymbol(DEFAULT_SYMBOL) ?? listUniqueStocks()[0]!,
  );
  const [riskModalOpen, setRiskModalOpen] = useState(false);
  const [pnlTick, setPnlTick] = useState(0);
  const [feedRows, setFeedRows] = useState<FeedRow[]>([]);
  const [watchedBaseIds, setWatchedBaseIds] = useState<Set<string>>(() => new Set());

  const cycleRef = useRef(0);
  const pauseRef = useRef(false);
  const resumeTimerRef = useRef<number | null>(null);

  const topPool = useMemo(
    () => buildSignalPicks(selected.symbol, selected.price).slice(0, 5),
    [selected.symbol, selected.price],
  );

  useEffect(() => {
    const id = window.setInterval(() => setPnlTick((t) => t + 1), 2200);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!riskModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setRiskModalOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [riskModalOpen]);

  useEffect(() => {
    if (!riskModalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [riskModalOpen]);

  useEffect(() => {
    cycleRef.current = 0;
    if (!topPool.length) {
      setFeedRows([]);
      return;
    }
    setFeedRows(
      Array.from({ length: 5 }, (_, i) => {
        const base = topPool[i % topPool.length]!;
        const j = jitterPick(base);
        return {
          key: `seed-${base.id}-${i}-${hashStr(`${base.id}-seed-${i}`)}`,
          label: base.label,
          signal: j.signalStrength,
          edge: j.edgeUsd,
          baseId: base.id,
        };
      }),
    );
  }, [topPool]);

  useEffect(() => {
    if (!topPool.length) return;
    const id = window.setInterval(() => {
      if (pauseRef.current) return;
      const base = topPool[cycleRef.current % topPool.length]!;
      cycleRef.current += 1;
      const j = jitterPick(base);
      setFeedRows((prev) => {
        const row: FeedRow = {
          key: `${base.id}-${Date.now()}-${cycleRef.current}`,
          label: base.label,
          signal: j.signalStrength,
          edge: j.edgeUsd,
          baseId: base.id,
        };
        const next = [...prev, row];
        return next.length > 5 ? next.slice(1) : next;
      });
    }, 3000);
    return () => window.clearInterval(id);
  }, [topPool]);

  const clearResumeTimer = () => {
    if (resumeTimerRef.current !== null) {
      window.clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  };

  const handleFeedEnter = () => {
    pauseRef.current = true;
    clearResumeTimer();
  };

  const handleFeedLeave = () => {
    clearResumeTimer();
    resumeTimerRef.current = window.setTimeout(() => {
      pauseRef.current = false;
      resumeTimerRef.current = null;
    }, 2000);
  };

  useEffect(() => () => clearResumeTimer(), []);

  const basePnl = 1243 + hashStr(selected.symbol) % 200;
  const headerPnl = Math.round((basePnl + Math.sin(pnlTick * 0.35) * 55) * 100) / 100;
  const headerPnlPct = 2.4 + Math.sin(pnlTick * 0.28) * 0.35;
  const headerPnlUp = headerPnl >= 0;

  const modalCurve = useMemo(() => buildModalPnLPath(selected.price, 640, 200, 24), [selected.price]);

  const toggleWatch = (baseId: string) => {
    setWatchedBaseIds((prev) => {
      const n = new Set(prev);
      if (n.has(baseId)) n.delete(baseId);
      else n.add(baseId);
      return n;
    });
  };

  const riskModal =
    riskModalOpen && typeof document !== 'undefined'
      ? createPortal(
          <div
            className="fixed inset-0 z-[400] flex items-center justify-center bg-black/70 p-4 transition-opacity duration-150 ease-out"
            role="dialog"
            aria-modal="true"
            aria-labelledby="risk-engine-title"
            onClick={() => setRiskModalOpen(false)}
          >
            <div
              className="relative max-h-[85vh] w-full max-w-[720px] overflow-y-auto rounded-xl border border-white/[0.1] bg-[#0c0c0c] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/[0.08] hover:text-white"
                aria-label="Close risk engine"
                onClick={() => setRiskModalOpen(false)}
              >
                <X className="h-5 w-5" strokeWidth={1.75} />
              </button>
              <div className="border-b border-white/[0.08] px-5 pb-4 pt-5 pr-14">
                <h2 id="risk-engine-title" className="font-sans text-lg font-semibold text-white">
                  {selected.symbol} Risk engine
                </h2>
              </div>

              <div className="px-5 py-4">
                <p className="py-6 text-center font-sans text-sm text-zinc-500">No positions to analyze</p>

                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div className="rounded-lg border border-white/[0.08] bg-black/35 px-3 py-2">
                    <p className="font-sans text-[10px] uppercase tracking-wide text-zinc-500">Max profit</p>
                    <p className="mt-1 font-mono text-sm font-bold text-emerald-400">+$8,400</p>
                  </div>
                  <div className="rounded-lg border border-white/[0.08] bg-black/35 px-3 py-2">
                    <p className="font-sans text-[10px] uppercase tracking-wide text-zinc-500">Max loss</p>
                    <p className="mt-1 font-mono text-sm font-bold text-rose-400">-$3,200</p>
                  </div>
                  <div className="rounded-lg border border-white/[0.08] bg-black/35 px-3 py-2">
                    <p className="font-sans text-[10px] uppercase tracking-wide text-zinc-500">Breakeven(s)</p>
                    <p className="mt-1 font-mono text-sm font-bold text-zinc-200">172.40 · 188.10</p>
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-white/[0.08] bg-black/25 p-3">
                  <svg viewBox="0 0 640 200" className="h-44 w-full" role="img" aria-label="P and L vs underlying">
                    <rect x="24" y="24" width="592" height={Math.max(0, modalCurve.zeroY - 24)} fill="rgba(34,197,94,0.08)" />
                    <rect
                      x="24"
                      y={modalCurve.zeroY}
                      width="592"
                      height={Math.max(0, 176 - modalCurve.zeroY)}
                      fill="rgba(239,68,68,0.08)"
                    />
                    <line
                      x1="24"
                      y1={modalCurve.zeroY}
                      x2="616"
                      y2={modalCurve.zeroY}
                      stroke="rgba(255,255,255,0.25)"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <line
                      x1={modalCurve.spotX}
                      y1="24"
                      x2={modalCurve.spotX}
                      y2="176"
                      stroke="rgba(255,255,255,0.35)"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={modalCurve.spotX + 4}
                      y="36"
                      fill="rgba(255,255,255,0.5)"
                      style={{ fontFamily: 'ui-monospace, monospace', fontSize: 10 }}
                    >
                      Spot {selected.price.toFixed(2)}
                    </text>
                    <path d={modalCurve.line} fill="none" stroke="#fafafa" strokeWidth="2" strokeLinejoin="round" />
                  </svg>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-white/[0.08] bg-black/35 px-3 py-2">
                    <p className="font-sans text-[10px] uppercase tracking-wide text-zinc-500">VaR (95%)</p>
                    <p className="mt-1 font-mono text-sm font-bold tabular-nums text-zinc-100">$2,180</p>
                  </div>
                  <div className="rounded-lg border border-white/[0.08] bg-black/35 px-3 py-2">
                    <p className="font-sans text-[10px] uppercase tracking-wide text-zinc-500">Expected shortfall</p>
                    <p className="mt-1 font-mono text-sm font-bold tabular-nums text-zinc-100">$3,050</p>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0a0a0a] backdrop-blur-xl p-4 sm:p-5 min-h-[480px] flex flex-col shadow-lg shadow-black/30 transition-all hover:border-white/10">
      <div className="mb-3 flex min-w-0 items-center gap-2">
        <BookOpen className="h-4 w-4 shrink-0 text-tan/80" strokeWidth={1.5} aria-hidden />
        <p className="text-[9px] sm:text-[10px] font-semibold tracking-[0.12em] uppercase text-zinc-400 whitespace-nowrap truncate">
          Order Book - Options Chain
        </p>
      </div>

      <button
        type="button"
        onClick={() => setRiskModalOpen(true)}
        className="mb-3 flex w-full items-center justify-between rounded-lg border border-white/[0.08] bg-black/35 px-3 py-2.5 text-left transition-colors hover:bg-white/[0.06]"
      >
        <span className="font-mono text-base font-bold tabular-nums text-white">
          {selected.symbol} {selected.price.toFixed(2)}
        </span>
        <span className={`font-mono text-base font-bold tabular-nums ${headerPnlUp ? 'text-emerald-400' : 'text-rose-400'}`}>
          {formatUsdSigned(headerPnl)}{' '}
          <span className="text-sm font-semibold">
            ({headerPnlUp ? '+' : ''}
            {headerPnlPct.toFixed(1)}%)
          </span>
        </span>
      </button>

      <div
        className="relative mb-3 h-[320px] overflow-hidden rounded-lg border border-white/[0.06] bg-black/25"
        onMouseEnter={handleFeedEnter}
        onMouseLeave={handleFeedLeave}
      >
        {!topPool.length ? (
          <div className="flex h-full items-center justify-center px-4">
            <p className="animate-pulse font-sans text-sm text-zinc-500">Scanning for signals…</p>
          </div>
        ) : (
          <div className="flex h-full flex-col justify-end gap-2 p-2">
            <AnimatePresence initial={false} mode="popLayout">
              {feedRows.map((row) => {
                const watched = watchedBaseIds.has(row.baseId);
                const dotClass = row.signal >= 0.8 ? 'bg-emerald-400' : 'bg-amber-400';
                const edgeUp = row.edge >= 0;
                return (
                  <motion.div
                    key={row.key}
                    layout
                    initial={{ y: 48, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.3, ease: 'easeOut' } }}
                    transition={{ duration: 0.4, ease: FEED_EASE }}
                    className={`flex h-11 min-h-[44px] shrink-0 items-center gap-2 rounded-lg border border-white/[0.08] bg-black/40 px-3.5 py-2 ${
                      watched ? 'border-l-2 border-l-emerald-500 border-white/[0.08]' : ''
                    }`}
                  >
                    <span className="min-w-0 flex-1 truncate font-mono text-[13px] font-bold text-zinc-100">
                      {row.label}
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5 font-mono text-[13px] tabular-nums text-zinc-300">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${dotClass}`} aria-hidden />
                      {row.signal.toFixed(2)}
                    </span>
                    <span
                      className={`shrink-0 font-mono text-[13px] font-semibold tabular-nums ${edgeUp ? 'text-emerald-400' : 'text-rose-400'}`}
                    >
                      {edgeUp ? '+' : '-'}${Math.abs(row.edge).toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWatch(row.baseId);
                      }}
                      className={`shrink-0 rounded border px-2 py-1 font-sans text-[11px] font-semibold transition-colors ${
                        watched
                          ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-300'
                          : 'border-white/12 bg-transparent text-zinc-400 hover:border-white/20 hover:text-zinc-200'
                      }`}
                    >
                      {watched ? (
                        <span className="inline-flex items-center gap-1">
                          <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden />
                          Watching
                        </span>
                      ) : (
                        'Watch'
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-white/[0.08] bg-black/20 py-12 text-center">
        <Inbox className="h-8 w-8 text-zinc-600" strokeWidth={1.25} aria-hidden />
        <p className="mt-3 font-sans text-sm text-zinc-500">No active orders</p>
        <p className="mt-1 max-w-xs font-sans text-xs text-zinc-600">
          Add contracts from your watchlist or signal picks
        </p>
      </div>

      {riskModal}
    </div>
  );
};

'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Check, X } from 'lucide-react';
import { getCatalogStockBySymbol, listUniqueStocks, type CatalogStock } from '../../data/mockStocksCatalog';
import { getPaperAccountSnapshot, MARKET_SERIES } from './mockMlDashboardData';

function BinocularsIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={14}
      height={14}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M8 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm8 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.5 10.5 3 15m15-4.5L21 15M10.5 8h3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 15h4l1.5-2M21 15h-4l-1.5-2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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

export interface OptionPositionRow {
  id: string;
  contract: string;
  qty: number;
  avgEntry: number;
  current: number;
  pnlUsd: number;
  pnlPct: number;
  dte: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
}

function formatUsdSigned(n: number): string {
  const sign = n >= 0 ? '+' : '-';
  const body = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${sign}$${body}`;
}

function formatUsdPlain(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
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

function parseContractInput(raw: string, _spot: number, symbol: string): OptionPositionRow | null {
  const s = raw.trim().replace(/\s+/g, ' ');
  if (!s.length) return null;
  const m = /^([A-Z]{1,5})\s+(\d+(?:\.\d+)?)([CP])\s+(\d{2}\/\d{2})$/.exec(s.toUpperCase());
  if (!m) return null;
  const [, sym, strikeStr, right, exp] = m;
  if (sym !== symbol) return null;
  const strike = Number(strikeStr);
  const h = hashStr(`${sym}${strike}${right}${exp}`);
  const qty = 1 + (h % 4);
  const avgEntry = Math.round((1.2 + (h % 80) / 20) * 100) / 100;
  const current = Math.round((avgEntry + ((h % 17) - 8) / 20) * 100) / 100;
  const pnlUsd = Math.round((current - avgEntry) * qty * 100 * 100) / 100;
  const cost = avgEntry * qty * 100;
  const pnlPct = cost > 0 ? Math.round((pnlUsd / cost) * 10000) / 100 : 0;
  const dte = 3 + (h % 20);
  return {
    id: `add-${Date.now()}-${h}`,
    contract: `${sym} ${strike}${right === 'C' ? 'C' : 'P'} ${exp}`,
    qty,
    avgEntry,
    current,
    pnlUsd,
    pnlPct,
    dte,
    delta: right === 'C' ? 0.42 : -0.38,
    gamma: 0.018,
    theta: -12,
    vega: 24,
    rho: 2.1,
  };
}

const DEFAULT_SYMBOL = 'AAPL';
const FEED_EASE = [0.16, 1, 0.3, 1] as const;

function demoActivePosition(symbol: string): OptionPositionRow {
  return {
    id: 'demo-active-book',
    contract: `${symbol} 180C 04/18`,
    qty: 2,
    avgEntry: 2.42,
    current: 2.71,
    pnlUsd: 58,
    pnlPct: 11.98,
    dte: 14,
    delta: 0.44,
    gamma: 0.019,
    theta: -9,
    vega: 21,
    rho: 1.4,
  };
}

export const OrderBookPreview: React.FC = () => {
  const [selected] = useState<CatalogStock>(
    () => getCatalogStockBySymbol(DEFAULT_SYMBOL) ?? listUniqueStocks()[0]!,
  );
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [watchlistOpen, setWatchlistOpen] = useState(false);
  const [feedRows, setFeedRows] = useState<FeedRow[]>([]);
  const [watchedBaseIds, setWatchedBaseIds] = useState<Set<string>>(() => new Set());
  const [positions, setPositions] = useState<OptionPositionRow[]>(() => {
    const sym = getCatalogStockBySymbol(DEFAULT_SYMBOL)?.symbol ?? DEFAULT_SYMBOL;
    return [demoActivePosition(sym)];
  });
  const [addContractRaw, setAddContractRaw] = useState('');

  const cycleRef = useRef(0);
  const pauseRef = useRef(false);
  const resumeTimerRef = useRef<number | null>(null);

  const topPool = useMemo(
    () => buildSignalPicks(selected.symbol, selected.price).slice(0, 5),
    [selected.symbol, selected.price],
  );

  useEffect(() => {
    if (!bookModalOpen && !watchlistOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setBookModalOpen(false);
        setWatchlistOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [bookModalOpen, watchlistOpen]);

  useEffect(() => {
    if (!bookModalOpen && !watchlistOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [bookModalOpen, watchlistOpen]);

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

  const paperAccount = useMemo(() => getPaperAccountSnapshot(MARKET_SERIES), []);

  const optionsPnlUsd = useMemo(
    () => Math.round(positions.reduce((s, p) => s + p.pnlUsd, 0) * 100) / 100,
    [positions],
  );
  const optionsCostBasis = useMemo(
    () => positions.reduce((s, p) => s + p.avgEntry * p.qty * 100, 0),
    [positions],
  );
  const optionsPnlPct =
    positions.length === 0 || optionsCostBasis === 0
      ? 0
      : Math.round((optionsPnlUsd / optionsCostBasis) * 10000) / 100;
  const optionsPnlUp = optionsPnlUsd >= 0;

  const watchedListLabels = useMemo(() => {
    const out: string[] = [];
    for (const id of watchedBaseIds) {
      const pick = topPool.find((p) => p.id === id);
      out.push(pick?.label ?? id.replace(/\|/g, ' · '));
    }
    return out;
  }, [watchedBaseIds, topPool]);

  const modalCurve = useMemo(() => buildModalPnLPath(selected.price, 640, 200, 24), [selected.price]);

  const portfolioDelta = useMemo(
    () => positions.reduce((s, p) => s + p.delta * p.qty, 0),
    [positions],
  );
  const portfolioGamma = useMemo(
    () => positions.reduce((s, p) => s + p.gamma * p.qty, 0),
    [positions],
  );
  const portfolioTheta = useMemo(
    () => positions.reduce((s, p) => s + p.theta * p.qty, 0),
    [positions],
  );
  const portfolioVega = useMemo(
    () => positions.reduce((s, p) => s + p.vega * p.qty, 0),
    [positions],
  );
  const portfolioRho = useMemo(
    () => positions.reduce((s, p) => s + p.rho * p.qty, 0),
    [positions],
  );

  const toggleWatch = (baseId: string) => {
    setWatchedBaseIds((prev) => {
      const n = new Set(prev);
      if (n.has(baseId)) n.delete(baseId);
      else n.add(baseId);
      return n;
    });
  };

  const closePosition = (id: string) => {
    setPositions((prev) => prev.filter((p) => p.id !== id));
  };

  const addContract = () => {
    const row = parseContractInput(addContractRaw, selected.price, selected.symbol);
    if (row) setPositions((p) => [...p, row]);
    setAddContractRaw('');
  };

  return (
    <div className="flex min-h-[480px] flex-col rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-4 shadow-lg shadow-black/30 backdrop-blur-xl transition-all hover:border-white/10 sm:p-5">
      <div className="mb-2 flex min-w-0 items-center gap-2">
        <BookOpen className="h-4 w-4 shrink-0 text-tan/80" strokeWidth={1.5} aria-hidden />
        <p className="truncate whitespace-nowrap text-[9px] font-semibold uppercase tracking-[0.12em] text-zinc-400 sm:text-[10px]">
          Order Book - Options Chain
        </p>
      </div>

      <button
        type="button"
        onClick={() => setBookModalOpen(true)}
        className="mb-3 w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-3 text-center transition-colors hover:border-white/[0.12] hover:bg-white/[0.05]"
      >
        {positions.length === 0 ? (
          <>
            <p className="font-mono text-lg font-bold tabular-nums text-zinc-500">$0.00 (0.0%)</p>
            <p className="mt-1 font-sans text-[11px] text-zinc-600">No options held</p>
          </>
        ) : (
          <>
            <p
              className={`font-mono text-lg font-bold tabular-nums ${optionsPnlUp ? 'text-emerald-400' : 'text-rose-400'}`}
            >
              {formatUsdSigned(optionsPnlUsd)} ({optionsPnlUp ? '+' : ''}
              {optionsPnlPct.toFixed(1)}%)
            </p>
            <p className="mt-1 font-sans text-[11px] text-zinc-500">Options P&amp;L</p>
          </>
        )}
      </button>

      <button
        type="button"
        onClick={() => setWatchlistOpen(true)}
        className="mb-3 flex w-full items-center justify-between gap-3 rounded-lg border border-white/[0.1] bg-black/25 px-3 py-2.5 text-left transition-colors hover:border-tan/25 hover:bg-white/[0.04]"
      >
        <span className="flex items-center gap-2">
          <BinocularsIcon className="shrink-0 text-zinc-400" />
          <span className="font-sans text-sm font-semibold text-zinc-200">Watchlist</span>
        </span>
        <span className="font-sans text-[11px] text-zinc-500">{watchedBaseIds.size} pinned</span>
      </button>

      <div
        className="relative mb-0 h-[320px] overflow-hidden rounded-lg border border-white/[0.06] bg-black/25"
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

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {watchlistOpen ? (
              <motion.div
                key="watchlist"
                role="dialog"
                aria-modal="true"
                aria-labelledby="watchlist-title"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="fixed inset-0 z-[400] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[12px]"
                onClick={() => setWatchlistOpen(false)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="relative w-full max-w-lg rounded-xl border border-white/[0.1] bg-[#1a1a1a] p-6 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/[0.08] hover:text-white"
                    aria-label="Close watchlist"
                    onClick={() => setWatchlistOpen(false)}
                  >
                    <X className="h-5 w-5" strokeWidth={1.75} />
                  </button>
                  <h2 id="watchlist-title" className="pr-12 font-sans text-lg font-semibold text-white">
                    Watchlist
                  </h2>

                  <div className="mt-5 rounded-lg border border-white/[0.08] bg-black/30 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Paper account value</p>
                    <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-white">{formatUsdPlain(paperAccount.equityNow)}</p>
                    <p
                      className={`mt-1 font-mono text-sm font-semibold tabular-nums ${paperAccount.dayChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
                    >
                      {formatUsdPlain(paperAccount.dayChange)} session ({paperAccount.dayChangePercent >= 0 ? '+' : ''}
                      {paperAccount.dayChangePercent.toFixed(2)}%)
                    </p>
                    <p className="mt-2 font-sans text-xs text-zinc-500">
                      Buying power{' '}
                      <span className="font-mono text-zinc-300">{formatUsdPlain(paperAccount.buyingPower)}</span>
                    </p>
                    <p className="mt-1 font-sans text-[11px] text-zinc-600">Mock path from dashboard tape · not a live broker feed</p>
                  </div>

                  <div className="mt-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Pinned from signals</p>
                    {watchedListLabels.length === 0 ? (
                      <p className="mt-2 font-sans text-sm text-zinc-500">
                        Nothing pinned yet. Use <span className="font-semibold text-zinc-400">Watch</span> on a signal row below.
                      </p>
                    ) : (
                      <ul className="mt-2 max-h-48 space-y-2 overflow-y-auto rounded-lg border border-white/[0.06] bg-black/25 p-3">
                        {watchedListLabels.map((label, i) => (
                          <li key={`${label}-${i}`} className="font-mono text-sm text-zinc-200">
                            {label}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <p className="mt-4 font-sans text-xs text-zinc-600">
                    External watchlist sync is not connected. Pins are stored in this session only.
                  </p>
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>,
          document.body,
        )}

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {bookModalOpen ? (
              <motion.div
                key="book"
                role="dialog"
                aria-modal="true"
                aria-labelledby="options-book-title"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="fixed inset-0 z-[400] flex items-center justify-center bg-[rgba(0,0,0,0.6)] p-4 backdrop-blur-[12px]"
                onClick={() => setBookModalOpen(false)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="relative max-h-[85vh] w-full max-w-[720px] overflow-y-auto rounded-xl border border-white/[0.08] bg-[#1a1a1a] shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className="absolute right-2 top-2 z-10 flex h-11 w-11 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/[0.08] hover:text-white"
                    aria-label="Close"
                    onClick={() => setBookModalOpen(false)}
                  >
                    <X className="h-5 w-5" strokeWidth={1.75} />
                  </button>
                  <div className="border-b border-white/[0.08] px-5 pb-4 pt-5 pr-14">
                    <h2 id="options-book-title" className="font-sans text-lg font-semibold text-white">
                      {selected.symbol} · Options book
                    </h2>
                  </div>

                  <div className="space-y-8 px-5 py-5">
                    <section>
                      <p className="mb-3 font-sans text-[14px] text-zinc-500">Active orders</p>
                      {positions.length === 0 ? (
                        <p className="rounded-lg border border-white/[0.06] bg-black/30 py-10 text-center font-sans text-sm text-zinc-500">
                          No contracts in this book yet. Use Add to book below.
                        </p>
                      ) : (
                        <div className="overflow-x-auto rounded-lg border border-white/[0.08]">
                          <table className="w-full min-w-[560px] border-collapse text-left text-[13px]">
                            <thead>
                              <tr className="border-b border-white/[0.08] text-zinc-500">
                                <th className="px-3 py-2 font-sans font-medium">Contract</th>
                                <th className="px-3 py-2 font-mono">Qty</th>
                                <th className="px-3 py-2 font-mono">Avg</th>
                                <th className="px-3 py-2 font-mono">Current</th>
                                <th className="px-3 py-2 font-mono">P&amp;L</th>
                                <th className="px-3 py-2 font-mono">DTE</th>
                                <th className="px-3 py-2" />
                              </tr>
                            </thead>
                            <tbody>
                              {positions.map((p) => {
                                const up = p.pnlUsd >= 0;
                                return (
                                  <tr key={p.id} className="border-b border-white/[0.05] last:border-0">
                                    <td className="px-3 py-2.5 font-mono text-zinc-100">{p.contract}</td>
                                    <td className="px-3 py-2.5 font-mono tabular-nums text-zinc-300">{p.qty}</td>
                                    <td className="px-3 py-2.5 font-mono tabular-nums text-zinc-300">{p.avgEntry.toFixed(2)}</td>
                                    <td className="px-3 py-2.5 font-mono tabular-nums text-zinc-300">{p.current.toFixed(2)}</td>
                                    <td
                                      className={`px-3 py-2.5 font-mono font-semibold tabular-nums ${up ? 'text-emerald-400' : 'text-rose-400'}`}
                                    >
                                      {formatUsdSigned(p.pnlUsd)} ({up ? '+' : ''}
                                      {p.pnlPct.toFixed(1)}%)
                                    </td>
                                    <td className="px-3 py-2.5 font-mono tabular-nums text-zinc-400">{p.dte}</td>
                                    <td className="px-3 py-2.5 text-right">
                                      <button
                                        type="button"
                                        onClick={() => closePosition(p.id)}
                                        className="rounded-md border border-white/10 px-2.5 py-1 font-sans text-[11px] font-semibold text-zinc-400 transition-colors hover:border-white/20 hover:text-zinc-200"
                                      >
                                        Close
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                        <input
                          type="text"
                          value={addContractRaw}
                          onChange={(e) => setAddContractRaw(e.target.value)}
                          placeholder={`${selected.symbol} 180C 04/18`}
                          className="min-w-0 flex-1 rounded-lg border border-white/[0.1] bg-black/40 px-3 py-2 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-white/20 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={addContract}
                          className="shrink-0 rounded-lg border border-white/15 bg-white/[0.08] px-4 py-2 font-sans text-sm font-semibold text-white transition-colors hover:bg-white/[0.12]"
                        >
                          Add to book
                        </button>
                      </div>
                    </section>

                    <section>
                      <p className="mb-3 font-sans text-[14px] text-zinc-500">Risk simulator</p>
                      <div className="overflow-x-auto rounded-lg border border-white/[0.08]">
                        <table className="w-full min-w-[480px] border-collapse text-left text-[13px]">
                          <thead>
                            <tr className="border-b border-white/[0.08] text-zinc-500">
                              <th className="px-3 py-2 font-sans font-medium">Position</th>
                              <th className="px-3 py-2 font-mono">Δ</th>
                              <th className="px-3 py-2 font-mono">Γ</th>
                              <th className="px-3 py-2 font-mono">Θ</th>
                              <th className="px-3 py-2 font-mono">ν</th>
                              <th className="px-3 py-2 font-mono">ρ</th>
                            </tr>
                          </thead>
                          <tbody>
                            {positions.map((p) => (
                              <tr key={`g-${p.id}`} className="border-b border-white/[0.05]">
                                <td className="px-3 py-2 font-mono text-zinc-200">{p.contract}</td>
                                <td className="px-3 py-2 font-mono tabular-nums text-zinc-300">{p.delta.toFixed(3)}</td>
                                <td className="px-3 py-2 font-mono tabular-nums text-zinc-300">{p.gamma.toFixed(3)}</td>
                                <td className="px-3 py-2 font-mono tabular-nums text-zinc-300">{p.theta.toFixed(1)}</td>
                                <td className="px-3 py-2 font-mono tabular-nums text-zinc-300">{p.vega.toFixed(1)}</td>
                                <td className="px-3 py-2 font-mono tabular-nums text-zinc-300">{p.rho.toFixed(2)}</td>
                              </tr>
                            ))}
                            <tr className="border-t border-white/[0.12] font-bold">
                              <td className="px-3 py-2.5 font-sans text-zinc-100">Portfolio</td>
                              <td className="px-3 py-2.5 font-mono tabular-nums text-zinc-100">{portfolioDelta.toFixed(3)}</td>
                              <td className="px-3 py-2.5 font-mono tabular-nums text-zinc-100">{portfolioGamma.toFixed(3)}</td>
                              <td className="px-3 py-2.5 font-mono tabular-nums text-zinc-100">{portfolioTheta.toFixed(1)}</td>
                              <td className="px-3 py-2.5 font-mono tabular-nums text-zinc-100">{portfolioVega.toFixed(1)}</td>
                              <td className="px-3 py-2.5 font-mono tabular-nums text-zinc-100">{portfolioRho.toFixed(2)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

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
                    </section>
                  </div>
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
};

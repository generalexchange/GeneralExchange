import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Inbox, Search, X } from 'lucide-react';
import {
  getCatalogStockBySymbol,
  listUniqueStocks,
  searchCatalogStocks,
  type CatalogStock,
} from '../../data/mockStocksCatalog';

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

interface OptionBookLevel {
  price: number;
  size: number;
  iv: number;
}

function synthesizeOptionBook(centerPrice: number, seed: string): { bids: OptionBookLevel[]; asks: OptionBookLevel[] } {
  const h = hashStr(seed);
  const tick = centerPrice >= 500 ? 0.5 : centerPrice >= 200 ? 0.05 : centerPrice >= 50 ? 0.05 : 0.01;
  const bids: OptionBookLevel[] = [];
  const asks: OptionBookLevel[] = [];
  for (let i = 1; i <= 6; i++) {
    const ivBid = Math.round((0.22 + ((h + i * 11) % 80) / 400) * 1000) / 1000;
    const ivAsk = Math.round((0.24 + ((h + i * 13) % 75) / 400) * 1000) / 1000;
    bids.push({
      price: Math.round((centerPrice - tick * i) * 100) / 100,
      size: 800 + ((h + i * 17) % 4000),
      iv: ivBid,
    });
    asks.push({
      price: Math.round((centerPrice + tick * i) * 100) / 100,
      size: 600 + ((h + i * 23) % 4200),
      iv: ivAsk,
    });
  }
  return { bids, asks };
}

type SortDir = 'asc' | 'desc';

type WatchlistSortKey = 'label' | 'last' | 'change' | 'signal' | 'iv';
type PositionsSortKey = 'label' | 'qty' | 'avg' | 'mark' | 'pnl' | 'dte';

export type ContractId = string;

export interface WatchlistRow {
  id: ContractId;
  label: string;
  strike: number;
  right: 'C' | 'P';
  expLabel: string;
  lastPrice: number;
  changePct: number;
  changeUsd: number;
  signalStrength: number;
  ivRank: number;
  bid: number;
  ask: number;
}

export interface PositionRow {
  id: ContractId;
  label: string;
  strike: number;
  right: 'C' | 'P';
  expLabel: string;
  qty: number;
  avgEntry: number;
  currentPrice: number;
  pnlUsd: number;
  pnlPct: number;
  dte: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
}

export interface SignalPickRow {
  id: ContractId;
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

function pickToWatchlist(p: SignalPickRow): WatchlistRow {
  const h = hashStr(p.id);
  const changePct = Math.round(((h % 21) - 8) * 10) / 10;
  const last = Math.round(((p.bid + p.ask) / 2) * 100) / 100;
  const changeUsd = Math.round(last * (changePct / 100) * 100) / 100;
  return {
    id: p.id,
    label: p.label,
    strike: p.strike,
    right: p.right,
    expLabel: p.expLabel,
    lastPrice: last,
    changePct,
    changeUsd,
    signalStrength: p.signalStrength,
    ivRank: p.ivRank,
    bid: p.bid,
    ask: p.ask,
  };
}

function signalPillClass(s: number): string {
  if (s >= 0.8) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35';
  return 'bg-amber-500/18 text-amber-200 border-amber-500/35';
}

function signalBarClass(s: number): string {
  if (s >= 0.8) return 'bg-emerald-500';
  return 'bg-amber-500';
}

function buildModalPnLPath(
  spot: number,
  w: number,
  h: number,
  pad: number,
): { line: string; zeroY: number; spotX: number; minPnl: number; maxPnl: number } {
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
  return { line: pts.join(' '), zeroY, spotX, minPnl, maxPnl };
}

const DEFAULT_SYMBOL = 'AAPL';

export const OrderBookPreview: React.FC = () => {
  const [selected, setSelected] = useState<CatalogStock>(
    () => getCatalogStockBySymbol(DEFAULT_SYMBOL) ?? listUniqueStocks()[0]!,
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const [listTab, setListTab] = useState<'watchlist' | 'positions'>('watchlist');
  const [watchlist, setWatchlist] = useState<WatchlistRow[]>([]);
  const [positions, setPositions] = useState<PositionRow[]>([]);
  const [watchedPickIds, setWatchedPickIds] = useState<Set<string>>(() => new Set());
  const [book, setBook] = useState<{
    centerPrice: number;
    seed: string;
    label: string;
    mode: 'entry' | 'close';
    sourceId: ContractId;
  } | null>(null);
  const [riskModalOpen, setRiskModalOpen] = useState(false);
  const [wlSort, setWlSort] = useState<{ key: WatchlistSortKey; dir: SortDir }>({ key: 'signal', dir: 'desc' });
  const [posSort, setPosSort] = useState<{ key: PositionsSortKey; dir: SortDir }>({ key: 'pnl', dir: 'desc' });
  const [pnlTick, setPnlTick] = useState(0);

  useEffect(() => {
    if (!searchOpen || searchQuery.trim().length === 0) return;
    const onDoc = (e: MouseEvent) => {
      if (searchWrapRef.current?.contains(e.target as Node)) return;
      setSearchOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [searchOpen, searchQuery]);

  useEffect(() => {
    const id = window.setInterval(() => setPnlTick((t) => t + 1), 2200);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    setWatchlist([]);
    setPositions([]);
    setBook(null);
    setWatchedPickIds(new Set());
  }, [selected.symbol]);

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

  const matches = useMemo(() => searchCatalogStocks(searchQuery, 10), [searchQuery]);
  const signalPicks = useMemo(() => buildSignalPicks(selected.symbol, selected.price), [selected.symbol, selected.price]);

  const bookLevels = useMemo(() => {
    if (!book) return { bids: [] as OptionBookLevel[], asks: [] as OptionBookLevel[], maxSize: 1 };
    const { bids, asks } = synthesizeOptionBook(book.centerPrice, book.seed);
    const maxSize = Math.max(...bids.map((b) => b.size), ...asks.map((a) => a.size), 1);
    return { bids, asks, maxSize };
  }, [book]);

  const bestBid = bookLevels.bids[0]?.price;
  const bestAsk = bookLevels.asks[0]?.price;
  const mid =
    book && bestBid !== undefined && bestAsk !== undefined
      ? Math.round(((bestBid + bestAsk) / 2) * 100) / 100
      : null;
  const spread =
    book && bestBid !== undefined && bestAsk !== undefined
      ? Math.round((bestAsk - bestBid) * 100) / 100
      : 0;
  const spreadPct = mid && mid !== 0 ? Math.round((spread / mid) * 10000) / 100 : 0;

  const portfolioAgg = useMemo(() => {
    if (!positions.length) {
      return { pnlUsd: 0, pnlPct: 0, delta: 0, thetaDay: 0 };
    }
    const pnlUsd = positions.reduce((s, p) => s + p.pnlUsd, 0);
    const cost = positions.reduce((s, p) => s + p.avgEntry * p.qty, 0) || 1;
    const pnlPct = (pnlUsd / cost) * 100;
    const delta = positions.reduce((s, p) => s + p.delta * p.qty, 0);
    const thetaDay = positions.reduce((s, p) => s + p.theta * p.qty, 0);
    return { pnlUsd, pnlPct, delta, thetaDay };
  }, [positions]);

  const basePnl = 1243 + hashStr(selected.symbol) % 200;
  const headerPnl = Math.round((basePnl + Math.sin(pnlTick * 0.35) * 55) * 100) / 100;
  const headerPnlPct = 2.4 + Math.sin(pnlTick * 0.28) * 0.35;
  const headerPnlUp = headerPnl >= 0;

  const sortedWatchlist = useMemo(() => {
    const arr = [...watchlist];
    const { key, dir } = wlSort;
    const m = dir === 'asc' ? 1 : -1;
    arr.sort((a, b) => {
      let cmp = 0;
      if (key === 'label') cmp = a.label.localeCompare(b.label);
      else if (key === 'last') cmp = a.lastPrice - b.lastPrice;
      else if (key === 'change') cmp = a.changePct - b.changePct;
      else if (key === 'signal') cmp = a.signalStrength - b.signalStrength;
      else cmp = a.ivRank - b.ivRank;
      return cmp * m;
    });
    return arr;
  }, [watchlist, wlSort]);

  const sortedPositions = useMemo(() => {
    const arr = [...positions];
    const { key, dir } = posSort;
    const m = dir === 'asc' ? 1 : -1;
    arr.sort((a, b) => {
      let cmp = 0;
      if (key === 'label') cmp = a.label.localeCompare(b.label);
      else if (key === 'qty') cmp = a.qty - b.qty;
      else if (key === 'avg') cmp = a.avgEntry - b.avgEntry;
      else if (key === 'mark') cmp = a.currentPrice - b.currentPrice;
      else if (key === 'pnl') cmp = a.pnlUsd - b.pnlUsd;
      else cmp = a.dte - b.dte;
      return cmp * m;
    });
    return arr;
  }, [positions, posSort]);

  const modalCurve = useMemo(() => buildModalPnLPath(selected.price, 640, 200, 24), [selected.price]);

  const pickStock = (stock: CatalogStock) => {
    setSelected(stock);
    setSearchQuery('');
    setSearchOpen(false);
  };

  const toggleWlSort = (key: WatchlistSortKey) => {
    setWlSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'signal' ? 'desc' : 'asc' }));
  };

  const togglePosSort = (key: PositionsSortKey) => {
    setPosSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'pnl' ? 'desc' : 'asc' }));
  };

  const addWatchFromPick = useCallback((p: SignalPickRow) => {
    setWatchedPickIds((prev) => new Set(prev).add(p.id));
    setWatchlist((wl) => {
      if (wl.some((w) => w.id === p.id)) return wl;
      return [...wl, pickToWatchlist(p)];
    });
  }, []);

  const removeFromWatchlist = (id: ContractId) => {
    if (!window.confirm('Remove this contract from your watchlist?')) return;
    setWatchlist((wl) => wl.filter((w) => w.id !== id));
    setWatchedPickIds((prev) => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
  };

  const addBookFromWatch = (w: WatchlistRow) => {
    const midPx = Math.round(((w.bid + w.ask) / 2) * 100) / 100;
    setBook({
      centerPrice: midPx,
      seed: w.id,
      label: w.label,
      mode: 'entry',
      sourceId: w.id,
    });
  };

  const addBookClose = (p: PositionRow) => {
    const midPx = Math.round(((p.currentPrice + 0.01) * 100) / 100);
    setBook({
      centerPrice: midPx,
      seed: `${p.id}-close`,
      label: `Close ${p.label}`,
      mode: 'close',
      sourceId: p.id,
    });
  };

  const simulateFill = () => {
    if (!book || mid === null) return;
    if (book.mode === 'entry') {
      const wl = watchlist.find((w) => w.id === book.sourceId);
      if (!wl) return;
      const h = hashStr(wl.id);
      const pos: PositionRow = {
        id: wl.id,
        label: wl.label,
        strike: wl.strike,
        right: wl.right,
        expLabel: wl.expLabel,
        qty: 1,
        avgEntry: mid,
        currentPrice: mid,
        pnlUsd: 0,
        pnlPct: 0,
        dte: 12 + (h % 40),
        delta: wl.right === 'C' ? 0.28 + (h % 10) / 100 : -0.22 - (h % 8) / 100,
        gamma: 0.005 + (h % 8) / 1000,
        theta: -28 - (h % 20),
        vega: 12 + (h % 15),
        rho: wl.right === 'C' ? 1.2 : -0.9,
      };
      setPositions((prev) => [...prev, pos]);
      setWatchlist((w) => w.filter((x) => x.id !== wl.id));
      setBook(null);
      setListTab('positions');
    } else {
      setPositions((prev) => prev.filter((p) => p.id !== book.sourceId));
      setBook(null);
    }
  };

  const portfolioPnlUp = portfolioAgg.pnlUsd >= 0;

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
                {positions.length === 0 ? (
                  <p className="py-6 text-center font-sans text-sm text-zinc-500">No positions to analyze</p>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-white/[0.08]">
                    <table className="w-full min-w-[480px] border-collapse text-left text-[11px]">
                      <thead className="border-b border-white/[0.08] bg-black/40">
                        <tr className="font-sans text-zinc-500">
                          <th className="px-3 py-2 font-medium">Position</th>
                          <th className="px-3 py-2 font-medium text-right">Δ</th>
                          <th className="px-3 py-2 font-medium text-right">Γ</th>
                          <th className="px-3 py-2 font-medium text-right">Θ</th>
                          <th className="px-3 py-2 font-medium text-right">ν</th>
                          <th className="px-3 py-2 font-medium text-right">ρ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {positions.map((row) => (
                          <tr key={row.id} className="border-b border-white/[0.06] font-mono tabular-nums text-zinc-200">
                            <td className="px-3 py-2 font-sans text-zinc-400">{row.label}</td>
                            <td className="px-3 py-2 text-right">{row.delta.toFixed(2)}</td>
                            <td className="px-3 py-2 text-right">{row.gamma.toFixed(3)}</td>
                            <td className="px-3 py-2 text-right">{row.theta.toFixed(1)}</td>
                            <td className="px-3 py-2 text-right">{row.vega.toFixed(1)}</td>
                            <td className="px-3 py-2 text-right">{row.rho.toFixed(1)}</td>
                          </tr>
                        ))}
                        <tr className="border-t border-white/[0.12] bg-white/[0.04] font-mono font-semibold tabular-nums text-white">
                          <td className="px-3 py-2 font-sans text-zinc-300">Portfolio</td>
                          <td className="px-3 py-2 text-right">{portfolioAgg.delta.toFixed(2)}</td>
                          <td className="px-3 py-2 text-right">
                            {positions.reduce((s, p) => s + p.gamma * p.qty, 0).toFixed(3)}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {positions.reduce((s, p) => s + p.theta * p.qty, 0).toFixed(1)}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {positions.reduce((s, p) => s + p.vega * p.qty, 0).toFixed(1)}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {positions.reduce((s, p) => s + p.rho * p.qty, 0).toFixed(1)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

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
                    <defs>
                      <linearGradient id="pnl-pos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgb(34,197,94)" stopOpacity="0.08" />
                        <stop offset={`${(modalCurve.zeroY / 200) * 100}%`} stopColor="rgb(34,197,94)" stopOpacity="0.08" />
                        <stop offset={`${(modalCurve.zeroY / 200) * 100}%`} stopColor="rgb(239,68,68)" stopOpacity="0.08" />
                        <stop offset="100%" stopColor="rgb(239,68,68)" stopOpacity="0.08" />
                      </linearGradient>
                    </defs>
                    <rect x="24" y="24" width="592" height="152" fill="url(#pnl-pos)" />
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
                      className="font-mono text-[10px]"
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
      <div className="mb-3 min-w-0">
        <p className="text-[9px] sm:text-[10px] font-semibold tracking-[0.12em] uppercase text-zinc-400 whitespace-nowrap truncate">
          Order Book - Options Chain
        </p>
      </div>

      <div ref={searchWrapRef} className="relative z-20 mb-3">
        <label className="sr-only" htmlFor="orderbook-symbol-search">
          Search company or symbol
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
          <input
            id="orderbook-symbol-search"
            type="search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            placeholder="Search symbol or company…"
            autoComplete="off"
            className="w-full rounded-lg border border-white/[0.08] bg-black/35 py-2 pl-8 pr-3 text-xs text-white placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-white/20"
          />
        </div>
        {searchOpen && searchQuery.trim().length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 max-h-48 overflow-y-auto rounded-lg border border-white/[0.08] bg-[#0a0a0a] shadow-xl">
            {matches.length === 0 ? (
              <p className="px-3 py-2 text-xs text-zinc-500">No matches in catalog.</p>
            ) : (
              <ul role="listbox">
                {matches.map((s) => (
                  <li key={s.symbol}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected.symbol === s.symbol}
                      className="w-full px-3 py-2 text-left text-xs hover:bg-white/10 border-b border-white/5 last:border-0"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => pickStock(s)}
                    >
                      <span className="font-semibold text-white">{s.symbol}</span>
                      <span className="text-zinc-500 ml-2 truncate">{s.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="mb-3 flex w-full rounded-lg border border-white/[0.08] bg-black/40 p-0.5 transition-colors duration-150">
        <button
          type="button"
          onClick={() => setListTab('watchlist')}
          className={`flex-1 rounded-md py-2 font-mono text-[13px] font-medium transition-all duration-150 ease-out ${
            listTab === 'watchlist'
              ? 'border border-white/[0.12] bg-white/[0.08] text-white'
              : 'border border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Watchlist
        </button>
        <button
          type="button"
          onClick={() => setListTab('positions')}
          className={`flex-1 rounded-md py-2 font-mono text-[13px] font-medium transition-all duration-150 ease-out ${
            listTab === 'positions'
              ? 'border border-white/[0.12] bg-white/[0.08] text-white'
              : 'border border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Positions
        </button>
      </div>

      {listTab === 'watchlist' ? (
        <div className="mb-3 flex max-h-[300px] flex-col overflow-hidden rounded-lg border border-white/[0.06] bg-black/25">
          <div className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto_auto_minmax(5.5rem,auto)] gap-1 border-b border-white/[0.08] bg-black/35 px-2 py-1.5 text-[10px] font-sans font-medium uppercase tracking-wide text-zinc-500">
            <button type="button" className="truncate text-left hover:text-zinc-300" onClick={() => toggleWlSort('label')}>
              Contract
            </button>
            <button type="button" className="text-right hover:text-zinc-300" onClick={() => toggleWlSort('last')}>
              Last
            </button>
            <button type="button" className="text-right hover:text-zinc-300" onClick={() => toggleWlSort('change')}>
              Chg
            </button>
            <button type="button" className="text-center hover:text-zinc-300" onClick={() => toggleWlSort('signal')}>
              Sig
            </button>
            <button type="button" className="text-right hover:text-zinc-300" onClick={() => toggleWlSort('iv')}>
              IV
            </button>
            <span className="sr-only">Actions</span>
          </div>
          <ul className="overflow-y-auto">
            {sortedWatchlist.length === 0 ? (
              <li className="px-3 py-8 text-center font-sans text-xs leading-relaxed text-zinc-500">
                Your watchlist is empty. Add contracts from signal picks below.
              </li>
            ) : (
              sortedWatchlist.map((w) => {
                const chUp = w.changePct >= 0;
                return (
                  <li
                    key={w.id}
                    className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto_auto_minmax(5.5rem,auto)] items-center gap-1 border-b border-white/[0.05] px-2 py-2 text-[11px] transition-colors hover:bg-white/[0.04] last:border-0"
                  >
                    <span className="truncate font-mono font-semibold text-zinc-100">{w.label}</span>
                    <span className="text-right font-mono tabular-nums text-zinc-300">{w.lastPrice.toFixed(2)}</span>
                    <span className={`text-right font-mono tabular-nums ${chUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {chUp ? '+' : ''}
                      {w.changePct.toFixed(1)}% / {formatUsdSigned(w.changeUsd)}
                    </span>
                    <span className="flex justify-center">
                      <span
                        className={`rounded-full border px-2 py-0.5 font-mono text-[10px] tabular-nums ${signalPillClass(w.signalStrength)}`}
                      >
                        {w.signalStrength.toFixed(2)}
                      </span>
                    </span>
                    <span className="text-right font-mono tabular-nums text-zinc-400">{w.ivRank.toFixed(1)}%</span>
                    <span className="flex justify-end gap-1">
                      <button
                        type="button"
                        className="w-full rounded border border-white/10 bg-white/[0.04] px-1 py-1.5 text-center font-mono text-[10px] font-semibold leading-tight text-zinc-300 hover:border-white/20 hover:text-white"
                        onClick={() => addBookFromWatch(w)}
                      >
                        Add to book
                      </button>
                      <button
                        type="button"
                        className="flex h-7 w-7 items-center justify-center rounded border border-white/10 text-zinc-500 hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300"
                        aria-label="Remove from watchlist"
                        onClick={() => removeFromWatchlist(w.id)}
                      >
                        <X className="h-3.5 w-3.5" strokeWidth={2} />
                      </button>
                    </span>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : (
        <div className="mb-3 flex max-h-[300px] flex-col overflow-hidden rounded-lg border border-white/[0.06] bg-black/25">
          <div className="border-b border-white/[0.08] bg-[#0f0f0f] px-2 py-2">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-sans text-[11px] text-zinc-500">
              <span>
                Total P&amp;L{' '}
                <span className={`font-mono font-bold tabular-nums ${portfolioPnlUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {positions.length ? formatUsdSigned(portfolioAgg.pnlUsd) : '—'}{' '}
                  {positions.length ? (
                    <span>
                      ({portfolioPnlUp ? '+' : ''}
                      {portfolioAgg.pnlPct.toFixed(1)}%)
                    </span>
                  ) : (
                    <span className="text-zinc-600">(—)</span>
                  )}
                </span>
              </span>
              <span>
                Net Δ{' '}
                <span className="font-mono font-bold text-zinc-200">{positions.length ? portfolioAgg.delta.toFixed(2) : '—'}</span>
              </span>
              <span>
                Θ/day{' '}
                <span className="font-mono font-bold text-zinc-200">
                  {positions.length ? formatUsdSigned(portfolioAgg.thetaDay) : '—'}
                </span>
              </span>
            </div>
          </div>
          <div className="grid grid-cols-[minmax(0,1.1fr)_auto_auto_auto_auto_auto_auto] gap-1 border-b border-white/[0.08] bg-black/35 px-2 py-1.5 text-[10px] font-sans font-medium uppercase tracking-wide text-zinc-500">
            <button type="button" className="truncate text-left hover:text-zinc-300" onClick={() => togglePosSort('label')}>
              Contract
            </button>
            <button type="button" className="text-right hover:text-zinc-300" onClick={() => togglePosSort('qty')}>
              Qty
            </button>
            <button type="button" className="text-right hover:text-zinc-300" onClick={() => togglePosSort('avg')}>
              Avg
            </button>
            <button type="button" className="text-right hover:text-zinc-300" onClick={() => togglePosSort('mark')}>
              Mark
            </button>
            <button type="button" className="text-right hover:text-zinc-300" onClick={() => togglePosSort('pnl')}>
              P&amp;L
            </button>
            <button type="button" className="text-right hover:text-zinc-300" onClick={() => togglePosSort('dte')}>
              DTE
            </button>
            <span className="sr-only">Close</span>
          </div>
          <ul className="overflow-y-auto">
            {sortedPositions.length === 0 ? (
              <li className="px-3 py-8 text-center font-sans text-xs leading-relaxed text-zinc-500">
                No open positions. Add contracts from your watchlist or signal picks.
              </li>
            ) : (
              sortedPositions.map((p) => {
                const pUp = p.pnlUsd >= 0;
                return (
                  <li
                    key={p.id}
                    className="grid grid-cols-[minmax(0,1.1fr)_auto_auto_auto_auto_auto_auto] items-center gap-1 border-b border-white/[0.05] px-2 py-2 text-[11px] transition-colors hover:bg-white/[0.04] last:border-0"
                  >
                    <span className="truncate font-mono font-semibold text-zinc-100">{p.label}</span>
                    <span className="text-right font-mono tabular-nums text-zinc-300">{p.qty}</span>
                    <span className="text-right font-mono tabular-nums text-zinc-300">{p.avgEntry.toFixed(2)}</span>
                    <span className="text-right font-mono tabular-nums text-zinc-300">{p.currentPrice.toFixed(2)}</span>
                    <span className={`text-right font-mono tabular-nums ${pUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatUsdSigned(p.pnlUsd)} ({pUp ? '+' : ''}
                      {p.pnlPct.toFixed(1)}%)
                    </span>
                    <span className="text-right font-mono tabular-nums text-zinc-400">{p.dte}</span>
                    <span className="flex justify-end">
                      <button
                        type="button"
                        className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-1 font-sans text-[9px] font-semibold uppercase tracking-wide text-zinc-300 hover:border-white/20 hover:text-white"
                        onClick={() => addBookClose(p)}
                      >
                        Close
                      </button>
                    </span>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}

      <div className="mb-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-zinc-300">Picks</h3>
          <p className="font-sans text-[10px] text-zinc-600">Ranked by signal strength</p>
        </div>
        {signalPicks.length === 0 ? (
          <p className="rounded-lg border border-dashed border-white/[0.1] bg-black/20 px-3 py-6 text-center font-sans text-xs text-zinc-500">
            No strong signals detected for {selected.symbol}
          </p>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {signalPicks.map((p) => {
              const watched = watchedPickIds.has(p.id);
              return (
                <div
                  key={p.id}
                  className="min-w-[200px] shrink-0 rounded-lg border border-white/[0.1] bg-black/30 px-4 py-3"
                >
                  <p className="font-mono text-sm font-bold text-white">{p.label}</p>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className={`h-full rounded-full transition-all ${signalBarClass(p.signalStrength)}`}
                      style={{ width: `${p.signalStrength * 100}%` }}
                    />
                  </div>
                  <div className="mt-2 space-y-0.5 font-sans text-[10px] text-zinc-500">
                    <p>
                      IV Rank <span className="font-mono text-zinc-300">{p.ivRank.toFixed(1)}%</span>
                    </p>
                    <p>
                      Δ <span className="font-mono text-zinc-300">{p.delta.toFixed(2)}</span>
                    </p>
                    <p>
                      Bid/Ask{' '}
                      <span className="font-mono text-zinc-300">
                        {p.bid.toFixed(2)} / {p.ask.toFixed(2)}
                      </span>
                    </p>
                    <p>
                      Edge{' '}
                      <span
                        className={`font-mono font-semibold ${p.edgeUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
                      >
                        {p.edgeUsd >= 0 ? '+' : '-'}${Math.abs(p.edgeUsd).toFixed(2)}
                      </span>
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={watched}
                    onClick={() => addWatchFromPick(p)}
                    className={`mt-3 flex w-full items-center justify-center gap-1.5 rounded-md border py-2 font-sans text-[11px] font-semibold transition-colors ${
                      watched
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                        : 'border-white/15 bg-white/[0.06] text-zinc-200 hover:border-white/25 hover:bg-white/[0.1]'
                    }`}
                  >
                    {watched ? (
                      <>
                        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                        Watching
                      </>
                    ) : (
                      'Watch'
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setRiskModalOpen(true)}
        className="mb-3 w-full rounded-lg border border-white/10 bg-black/30 px-2.5 py-2.5 text-left transition-colors hover:border-white/15 hover:bg-black/40"
      >
        <div className="flex min-w-0 flex-1 items-center gap-4 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <p className="shrink-0 font-mono text-sm font-bold tabular-nums text-white">
            {selected.symbol} {selected.price.toFixed(2)}
          </p>
          <p className={`shrink-0 font-mono text-sm font-bold tabular-nums ${headerPnlUp ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatUsdSigned(headerPnl)}{' '}
            <span className="text-xs font-semibold">
              ({headerPnlUp ? '+' : ''}
              {headerPnlPct.toFixed(1)}%)
            </span>
          </p>
          <p className="shrink-0 font-sans text-[11px]">
            <span className="text-zinc-500">IV Rank </span>
            <span className="font-mono font-bold tabular-nums text-zinc-100">34.2%</span>
          </p>
          <p className="shrink-0 font-sans text-[11px]">
            <span className="text-zinc-500">Net Δ </span>
            <span className="font-mono font-bold tabular-nums text-zinc-100">
              {positions.length ? portfolioAgg.delta.toFixed(2) : '—'}
            </span>
          </p>
          <p className="shrink-0 font-sans text-[11px]">
            <span className="text-zinc-500">Θ/day </span>
            <span className="font-mono font-bold tabular-nums text-zinc-100">
              {positions.length ? formatUsdSigned(portfolioAgg.thetaDay) : '—'}
            </span>
          </p>
        </div>
        <p className="sr-only">Open risk engine</p>
      </button>

      {!book ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-white/[0.08] bg-black/20 py-12 text-center">
          <Inbox className="h-8 w-8 text-zinc-600" strokeWidth={1.25} aria-hidden />
          <p className="mt-3 font-sans text-sm text-zinc-500">No active orders</p>
          <p className="mt-1 max-w-xs font-sans text-xs text-zinc-600">
            Add contracts from your watchlist or signal picks
          </p>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <p className="mb-2 font-sans text-[11px] text-zinc-500">
            Book: <span className="font-mono text-zinc-200">{book.label}</span>
          </p>
          <div className="grid min-h-0 flex-1 grid-cols-[1fr_auto_1fr] gap-2 text-[11px]">
            <div className="min-w-0">
              <p className="mb-2 font-sans font-semibold uppercase tracking-wider text-zinc-400">Bids</p>
              <div className="mb-1 grid grid-cols-[1fr_1fr_1fr] gap-1 font-sans text-[9px] uppercase tracking-wide text-zinc-600">
                <span>Price</span>
                <span className="text-right">Size</span>
                <span className="text-right">IV</span>
              </div>
              <ul className="space-y-1">
                {bookLevels.bids.map((b, i) => (
                  <li
                    key={`b-${i}`}
                    className="relative overflow-hidden rounded-md border border-white/5 px-1.5 py-1 transition-colors hover:border-white/12"
                  >
                    <span
                      className="absolute inset-y-0 right-0 bg-emerald-500/10 pointer-events-none"
                      style={{ width: `${(b.size / bookLevels.maxSize) * 100}%` }}
                    />
                    <span className="relative grid grid-cols-[1fr_1fr_1fr] items-center gap-1 font-mono tabular-nums text-zinc-200">
                      <span className="text-left">{b.price.toFixed(2)}</span>
                      <span className="text-right text-zinc-400">{b.size.toLocaleString()}</span>
                      <span className="text-right text-zinc-400">{(b.iv * 100).toFixed(1)}%</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex w-[88px] shrink-0 flex-col items-center justify-center border-x border-white/[0.06] px-1 py-2 text-center">
              {mid !== null ? (
                <>
                  <p className="font-mono text-xs font-semibold tabular-nums text-zinc-200">{mid.toFixed(2)}</p>
                  <p className="mt-0.5 font-sans text-[9px] leading-tight text-zinc-500">
                    Spread {spread.toFixed(2)} ({spreadPct.toFixed(2)}%)
                  </p>
                </>
              ) : null}
            </div>
            <div className="min-w-0">
              <p className="mb-2 font-sans font-semibold uppercase tracking-wider text-zinc-500">Asks</p>
              <div className="mb-1 grid grid-cols-[1fr_1fr_1fr] gap-1 font-sans text-[9px] uppercase tracking-wide text-zinc-600">
                <span>Price</span>
                <span className="text-right">Size</span>
                <span className="text-right">IV</span>
              </div>
              <ul className="space-y-1">
                {bookLevels.asks.map((a, i) => (
                  <li
                    key={`a-${i}`}
                    className="relative overflow-hidden rounded-md border border-white/5 px-1.5 py-1 transition-colors hover:border-white/12"
                  >
                    <span
                      className="absolute inset-y-0 left-0 bg-rose-500/10 pointer-events-none"
                      style={{ width: `${(a.size / bookLevels.maxSize) * 100}%` }}
                    />
                    <span className="relative grid grid-cols-[1fr_1fr_1fr] items-center gap-1 font-mono tabular-nums text-zinc-200">
                      <span className="text-left">{a.price.toFixed(2)}</span>
                      <span className="text-right text-zinc-400">{a.size.toLocaleString()}</span>
                      <span className="text-right text-zinc-400">{(a.iv * 100).toFixed(1)}%</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <button
            type="button"
            onClick={simulateFill}
            className="mt-3 w-full rounded-lg border border-institutional-green/40 bg-institutional-green/15 py-2.5 font-mono text-xs font-semibold text-tan transition-colors hover:bg-institutional-green/25"
          >
            {book.mode === 'entry' ? 'Simulate fill @ mid' : 'Simulate close @ mid'}
          </button>
        </div>
      )}

      {riskModal}
    </div>
  );
};

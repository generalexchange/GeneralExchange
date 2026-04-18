import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import {
  getCatalogStockBySymbol,
  listUniqueStocks,
  searchCatalogStocks,
  type CatalogStock,
} from '../../data/mockStocksCatalog';
import { OPTION_EXPIRATIONS } from './optionsChainMock';

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

function synthesizeOptionBook(spot: number, seed: string): { bids: OptionBookLevel[]; asks: OptionBookLevel[] } {
  const h = hashStr(seed);
  const tick = spot >= 500 ? 0.5 : spot >= 200 ? 0.05 : 0.01;
  const bids: OptionBookLevel[] = [];
  const asks: OptionBookLevel[] = [];
  for (let i = 1; i <= 6; i++) {
    const ivBid = Math.round((0.22 + ((h + i * 11) % 80) / 400) * 1000) / 1000;
    const ivAsk = Math.round((0.24 + ((h + i * 13) % 75) / 400) * 1000) / 1000;
    bids.push({
      price: Math.round((spot - tick * i) * 100) / 100,
      size: 800 + ((h + i * 17) % 4000),
      iv: ivBid,
    });
    asks.push({
      price: Math.round((spot + tick * i) * 100) / 100,
      size: 600 + ((h + i * 23) % 4200),
      iv: ivAsk,
    });
  }
  return { bids, asks };
}

const MOCK_POSITIONS = [
  { label: 'AAPL 180C', delta: 0.28, gamma: 0.012, theta: -42.1, vega: 18.4, rho: 2.1 },
  { label: 'AAPL 175P', delta: -0.19, gamma: 0.009, theta: -31.6, vega: 14.2, rho: -1.4 },
  { label: 'AAPL 185C', delta: 0.14, gamma: 0.006, theta: -22.8, vega: 21.0, rho: 0.9 },
  { label: 'AAPL 170P', delta: -0.11, gamma: 0.004, theta: -18.2, vega: 9.6, rho: -0.8 },
] as const;

const PORTFOLIO_TOTAL = {
  delta: -0.42,
  gamma: 0.031,
  theta: -114.7,
  vega: 63.2,
  rho: 0.8,
};

function formatUsdSigned(n: number): string {
  const sign = n >= 0 ? '+' : '-';
  const body = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${sign}$${body}`;
}

function buildPnLPath(spot: number, width: number, height: number, pad: number): string {
  const pts: string[] = [];
  const n = 48;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const px = pad + t * (width - pad * 2);
    const u = 0.8 + t * 0.4;
    const underlying = spot * u;
    const pnl = -4200 + 3800 * Math.sin((u - 1) * 6) + (underlying - spot) * 28;
    const py = pad + (1 - (pnl + 6000) / 12000) * (height - pad * 2);
    pts.push(`${i === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`);
  }
  return pts.join(' ');
}

const DEFAULT_SYMBOL = 'AAPL';

export const OrderBookPreview: React.FC = () => {
  const [selected, setSelected] = useState<CatalogStock>(
    () => getCatalogStockBySymbol(DEFAULT_SYMBOL) ?? listUniqueStocks()[0]!,
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const [expirationId, setExpirationId] = useState(OPTION_EXPIRATIONS[2]!.id);
  const [riskOpen, setRiskOpen] = useState(false);
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

  const matches = useMemo(() => searchCatalogStocks(searchQuery, 10), [searchQuery]);

  const { bids, asks } = useMemo(
    () => synthesizeOptionBook(selected.price, `${selected.symbol}-${expirationId}`),
    [selected.price, selected.symbol, expirationId],
  );
  const maxSize = Math.max(...bids.map((b) => b.size), ...asks.map((a) => a.size), 1);

  const bestBid = bids[0]!.price;
  const bestAsk = asks[0]!.price;
  const spread = Math.round((bestAsk - bestBid) * 100) / 100;
  const mid = Math.round(((bestBid + bestAsk) / 2) * 100) / 100;
  const spreadPct = mid !== 0 ? Math.round((spread / mid) * 10000) / 100 : 0;

  const basePnl = 1243 + hashStr(selected.symbol) % 200;
  const pnl = Math.round((basePnl + Math.sin(pnlTick * 0.35) * 55) * 100) / 100;
  const pnlPct = 2.4 + Math.sin(pnlTick * 0.28) * 0.35;
  const pnlUp = pnl >= 0;

  const pickStock = (stock: CatalogStock) => {
    setSelected(stock);
    setSearchQuery('');
    setSearchOpen(false);
  };

  const pnlPath = useMemo(() => buildPnLPath(selected.price, 320, 120, 8), [selected.price]);

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

      <button
        type="button"
        onClick={() => setRiskOpen((o) => !o)}
        className="mb-3 w-full rounded-lg border border-white/10 bg-black/30 px-2.5 py-2.5 text-left transition-colors hover:border-white/15 hover:bg-black/40"
        aria-expanded={riskOpen}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-4 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <p className="shrink-0 font-mono text-sm font-bold tabular-nums text-white">
              {selected.symbol} {selected.price.toFixed(2)}
            </p>
            <p className={`shrink-0 font-mono text-sm font-bold tabular-nums ${pnlUp ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatUsdSigned(pnl)}{' '}
              <span className="text-xs font-semibold">
                ({pnlUp ? '+' : ''}
                {pnlPct.toFixed(1)}%)
              </span>
            </p>
            <p className="shrink-0 font-sans text-[11px]">
              <span className="text-zinc-500">IV Rank </span>
              <span className="font-mono font-bold tabular-nums text-zinc-100">34.2%</span>
            </p>
            <p className="shrink-0 font-sans text-[11px]">
              <span className="text-zinc-500">Net Δ </span>
              <span className="font-mono font-bold tabular-nums text-zinc-100">{PORTFOLIO_TOTAL.delta.toFixed(2)}</span>
            </p>
            <p className="shrink-0 font-sans text-[11px]">
              <span className="text-zinc-500">Θ/day </span>
              <span className="font-mono font-bold tabular-nums text-zinc-100">-$18.30</span>
            </p>
          </div>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-200 ease-out ${riskOpen ? 'rotate-180' : ''}`}
            aria-hidden
          />
        </div>
        <p className="sr-only">Open or close risk engine details</p>
      </button>

      <div
        className="mb-3 overflow-hidden border-y border-white/[0.08] bg-[#0e0e0e] transition-[max-height] duration-200 ease-out"
        style={{ maxHeight: riskOpen ? 720 : 0 }}
      >
        <div className="px-2 py-3 sm:px-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Risk engine</p>
          <div className="overflow-x-auto rounded-lg border border-white/[0.06]">
            <table className="w-full min-w-[480px] border-collapse text-left text-[11px]">
              <thead className="border-b border-white/[0.08] bg-black/30">
                <tr className="font-sans text-zinc-500">
                  <th className="px-2 py-1.5 font-medium">Position</th>
                  <th className="px-2 py-1.5 font-medium text-right">Δ</th>
                  <th className="px-2 py-1.5 font-medium text-right">Γ</th>
                  <th className="px-2 py-1.5 font-medium text-right">Θ</th>
                  <th className="px-2 py-1.5 font-medium text-right">ν</th>
                  <th className="px-2 py-1.5 font-medium text-right">ρ</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_POSITIONS.map((row) => (
                  <tr key={row.label} className="border-b border-white/[0.05] font-mono tabular-nums text-zinc-200">
                    <td className="px-2 py-1.5 font-sans text-zinc-400">{row.label}</td>
                    <td className="px-2 py-1.5 text-right">{row.delta.toFixed(2)}</td>
                    <td className="px-2 py-1.5 text-right">{row.gamma.toFixed(3)}</td>
                    <td className="px-2 py-1.5 text-right">{row.theta.toFixed(1)}</td>
                    <td className="px-2 py-1.5 text-right">{row.vega.toFixed(1)}</td>
                    <td className="px-2 py-1.5 text-right">{row.rho.toFixed(1)}</td>
                  </tr>
                ))}
                <tr className="bg-white/[0.04] font-mono font-semibold tabular-nums text-white">
                  <td className="px-2 py-1.5 font-sans text-zinc-300">Portfolio</td>
                  <td className="px-2 py-1.5 text-right">{PORTFOLIO_TOTAL.delta.toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-right">{PORTFOLIO_TOTAL.gamma.toFixed(3)}</td>
                  <td className="px-2 py-1.5 text-right">{PORTFOLIO_TOTAL.theta.toFixed(1)}</td>
                  <td className="px-2 py-1.5 text-right">{PORTFOLIO_TOTAL.vega.toFixed(1)}</td>
                  <td className="px-2 py-1.5 text-right">{PORTFOLIO_TOTAL.rho.toFixed(1)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex flex-wrap gap-3 font-sans text-[11px] text-zinc-500">
            <span>
              Max profit <span className="ml-1 font-mono font-bold text-emerald-400/90">+$8,400</span>
            </span>
            <span>
              Max loss <span className="ml-1 font-mono font-bold text-rose-400/90">-$3,200</span>
            </span>
            <span>
              Breakeven(s) <span className="ml-1 font-mono font-bold text-zinc-200">172.40 · 188.10</span>
            </span>
          </div>

          <div className="mt-3 rounded-lg border border-white/[0.06] bg-black/25 p-2">
            <p className="mb-1 font-sans text-[10px] font-semibold uppercase tracking-wider text-zinc-500">P&amp;L vs underlying</p>
            <svg viewBox="0 0 320 120" className="h-28 w-full" role="img" aria-label="Mock profit and loss curve">
              <rect width="320" height="120" fill="transparent" />
              <line x1="8" y1="60" x2="312" y2="60" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              <path d={pnlPath} fill="none" stroke="rgba(212,175,55,0.85)" strokeWidth="1.75" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-white/[0.08] bg-black/30 px-2 py-2">
              <p className="font-sans text-[10px] uppercase tracking-wide text-zinc-500">VaR (95%)</p>
              <p className="mt-0.5 font-mono text-sm font-bold tabular-nums text-zinc-100">$2,180</p>
            </div>
            <div className="rounded-lg border border-white/[0.08] bg-black/30 px-2 py-2">
              <p className="font-sans text-[10px] uppercase tracking-wide text-zinc-500">Exp. shortfall</p>
              <p className="mt-0.5 font-mono text-sm font-bold tabular-nums text-zinc-100">$3,050</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mb-2">
        <label className="sr-only" htmlFor="orderbook-expiration">
          Expiration
        </label>
        <select
          id="orderbook-expiration"
          value={expirationId}
          onChange={(e) => setExpirationId(e.target.value)}
          className="w-full appearance-none rounded-lg border border-white/[0.08] bg-black/35 py-2 pl-3 pr-9 font-sans text-xs text-white outline-none focus:ring-2 focus:ring-white/20"
        >
          {OPTION_EXPIRATIONS.map((e) => (
            <option key={e.id} value={e.id}>
              {e.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[1fr_auto_1fr] gap-2 text-[11px]">
        <div className="min-w-0">
          <p className="mb-2 font-sans font-semibold uppercase tracking-wider text-zinc-400">Bids</p>
          <div className="mb-1 grid grid-cols-[1fr_1fr_1fr] gap-1 font-sans text-[9px] uppercase tracking-wide text-zinc-600">
            <span>Price</span>
            <span className="text-right">Size</span>
            <span className="text-right">IV</span>
          </div>
          <ul className="space-y-1">
            {bids.map((b, i) => (
              <li
                key={`b-${i}`}
                className="relative overflow-hidden rounded-md border border-white/5 px-1.5 py-1 transition-colors hover:border-white/12"
              >
                <span
                  className="absolute inset-y-0 right-0 bg-emerald-500/10 pointer-events-none"
                  style={{ width: `${(b.size / maxSize) * 100}%` }}
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
          <p className="font-mono text-xs font-semibold tabular-nums text-zinc-200">{mid.toFixed(2)}</p>
          <p className="mt-0.5 font-sans text-[9px] leading-tight text-zinc-500">
            Spread {spread.toFixed(2)} ({spreadPct.toFixed(2)}%)
          </p>
        </div>

        <div className="min-w-0">
          <p className="mb-2 font-sans font-semibold uppercase tracking-wider text-zinc-500">Asks</p>
          <div className="mb-1 grid grid-cols-[1fr_1fr_1fr] gap-1 font-sans text-[9px] uppercase tracking-wide text-zinc-600">
            <span>Price</span>
            <span className="text-right">Size</span>
            <span className="text-right">IV</span>
          </div>
          <ul className="space-y-1">
            {asks.map((a, i) => (
              <li
                key={`a-${i}`}
                className="relative overflow-hidden rounded-md border border-white/5 px-1.5 py-1 transition-colors hover:border-white/12"
              >
                <span
                  className="absolute inset-y-0 left-0 bg-rose-500/10 pointer-events-none"
                  style={{ width: `${(a.size / maxSize) * 100}%` }}
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
    </div>
  );
};

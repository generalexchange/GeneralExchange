import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, ChevronDown, Layers, Search } from 'lucide-react';
import {
  getCatalogStockBySymbol,
  listUniqueStocks,
  searchCatalogStocks,
  type CatalogStock,
} from '../../data/mockStocksCatalog';
import {
  OPTION_EXPIRATIONS,
  buildOptionChainRows,
} from './optionsChainMock';
import type { OrderBookLevel } from './mockMlDashboardData';

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function synthesizeBook(spot: number, seed: string): { bids: OrderBookLevel[]; asks: OrderBookLevel[] } {
  const h = hashStr(seed);
  const tick = spot >= 500 ? 0.5 : spot >= 200 ? 0.05 : 0.01;
  const bids: OrderBookLevel[] = [];
  const asks: OrderBookLevel[] = [];
  for (let i = 1; i <= 6; i++) {
    bids.push({
      price: Math.round((spot - tick * i) * 100) / 100,
      size: 800 + ((h + i * 17) % 4000),
    });
    asks.push({
      price: Math.round((spot + tick * i) * 100) / 100,
      size: 600 + ((h + i * 23) % 4200),
    });
  }
  return { bids, asks };
}

const PRICE_PENDING = (
  <span className="text-zinc-600 tabular-nums" title="Quote feed not connected — premium TBD">
    —
  </span>
);

type TabId = 'book' | 'options';

const DEFAULT_SYMBOL = 'AAPL';

export const OrderBookPreview: React.FC = () => {
  const [selected, setSelected] = useState<CatalogStock>(
    () => getCatalogStockBySymbol(DEFAULT_SYMBOL) ?? listUniqueStocks()[0]!,
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!searchOpen || searchQuery.trim().length === 0) return;
    const onDoc = (e: MouseEvent) => {
      if (searchWrapRef.current?.contains(e.target as Node)) return;
      setSearchOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [searchOpen, searchQuery]);
  const [tab, setTab] = useState<TabId>('book');
  const [expirationId, setExpirationId] = useState(OPTION_EXPIRATIONS[2]!.id);

  const matches = useMemo(() => searchCatalogStocks(searchQuery, 10), [searchQuery]);

  const { bids, asks } = useMemo(
    () => synthesizeBook(selected.price, selected.symbol),
    [selected.price, selected.symbol],
  );
  const maxSize = Math.max(...bids.map((b) => b.size), ...asks.map((a) => a.size), 1);

  const chainRows = useMemo(
    () => buildOptionChainRows(selected.symbol, selected.price, expirationId),
    [selected.symbol, selected.price, expirationId],
  );

  const atmStrike = useMemo(() => {
    if (!chainRows.length) return null;
    return chainRows.reduce((best, r) =>
      Math.abs(r.strike - selected.price) < Math.abs(best.strike - selected.price) ? r : best,
    ).strike;
  }, [chainRows, selected.price]);

  const pickStock = (stock: CatalogStock) => {
    setSelected(stock);
    setSearchQuery('');
    setSearchOpen(false);
  };

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0a0a0a] backdrop-blur-xl p-4 sm:p-5 min-h-[480px] flex flex-col shadow-lg shadow-black/30 transition-all hover:border-white/10">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-zinc-400 mb-1 flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5" aria-hidden />
            Order book · chain
          </p>
          <p className="text-xs text-zinc-500">
            Look up a name, review depth, open the options chain. Quotes: equities mock · option premiums pending.
          </p>
        </div>
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

      <div className="rounded-lg border border-white/10 bg-black/25 px-3 py-2 mb-3 text-xs">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <span className="font-bold text-white text-sm">{selected.symbol}</span>
            <span className="text-zinc-500 ml-2 line-clamp-2">{selected.name}</span>
          </div>
          <div className="font-mono text-zinc-300 tabular-nums" title="Mock equity reference for book ladder">
            Ref {selected.price.toFixed(2)}
          </div>
        </div>
        <button
          type="button"
          className="mt-2 text-[11px] text-zinc-400 hover:text-zinc-200"
          onClick={() => {
            setSearchQuery(selected.symbol);
            setSearchOpen(true);
          }}
        >
          Change symbol
        </button>
      </div>

      <div className="flex rounded-lg border border-white/10 p-0.5 bg-black/20 mb-3">
        <button
          type="button"
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-semibold rounded-md transition-colors ${
            tab === 'book' ? 'bg-white/[0.1] text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
          onClick={() => setTab('book')}
        >
          Depth
        </button>
        <button
          type="button"
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-semibold rounded-md transition-colors ${
            tab === 'options' ? 'bg-white/[0.08] text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
          }`}
          onClick={() => setTab('options')}
        >
          <Layers className="w-3.5 h-3.5" />
          Options chain
        </button>
      </div>

      {tab === 'book' && (
        <div className="grid grid-cols-2 gap-3 flex-1 text-[11px] sm:text-xs min-h-0">
          <div>
            <p className="text-zinc-400 font-semibold mb-2 uppercase tracking-wider">Bids</p>
            <ul className="space-y-1.5">
              {bids.map((b, i) => (
                <li
                  key={`b-${i}`}
                  className="relative overflow-hidden rounded-md border border-white/5 px-2 py-1.5 font-mono tabular-nums transition-colors hover:border-white/15"
                  title={`Size ${b.size}`}
                >
                  <span
                    className="absolute inset-y-0 left-0 bg-white/[0.08] pointer-events-none"
                    style={{ width: `${(b.size / maxSize) * 100}%` }}
                  />
                  <span className="relative flex justify-between gap-2 text-zinc-200">
                    <span>{b.price.toFixed(2)}</span>
                    <span className="text-zinc-500">{b.size.toLocaleString()}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-zinc-500 font-semibold mb-2 uppercase tracking-wider">Asks</p>
            <ul className="space-y-1.5">
              {asks.map((a, i) => (
                <li
                  key={`a-${i}`}
                  className="relative overflow-hidden rounded-md border border-white/5 px-2 py-1.5 font-mono tabular-nums transition-colors hover:border-white/12"
                  title={`Size ${a.size}`}
                >
                  <span
                    className="absolute inset-y-0 right-0 bg-zinc-700/40 pointer-events-none"
                    style={{ width: `${(a.size / maxSize) * 100}%` }}
                  />
                  <span className="relative flex justify-between gap-2 text-zinc-200">
                    <span>{a.price.toFixed(2)}</span>
                    <span className="text-zinc-500">{a.size.toLocaleString()}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {tab === 'options' && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="relative mb-2">
            <label className="sr-only" htmlFor="orderbook-expiration">
              Expiration
            </label>
            <select
              id="orderbook-expiration"
              value={expirationId}
              onChange={(e) => setExpirationId(e.target.value)}
              className="w-full appearance-none rounded-lg border border-white/[0.08] bg-black/35 py-2 pl-3 pr-9 text-xs text-white outline-none focus:ring-2 focus:ring-white/20"
            >
              {OPTION_EXPIRATIONS.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          </div>
          <p className="text-[10px] text-zinc-500 mb-2">
            Bids/asks are withheld until the quote vendor is wired. Volume, OI, and deltas are mock desk fillers.
          </p>
          <div className="overflow-x-auto overflow-y-auto flex-1 max-h-[320px] rounded-lg border border-white/10">
            <table className="w-full min-w-[520px] text-[10px] sm:text-[11px] border-collapse">
              <thead className="sticky top-0 z-10 bg-[#0a0a0a] border-b border-white/[0.08]">
                <tr className="text-zinc-500 text-left">
                  <th className="p-2 font-medium" title="Call bid — pending feed">
                    C bid
                  </th>
                  <th className="p-2 font-medium" title="Call ask — pending feed">
                    C ask
                  </th>
                  <th className="p-2 font-medium">C vol</th>
                  <th className="p-2 font-medium">C OI</th>
                  <th className="p-2 font-medium text-center bg-white/[0.06]">Strike</th>
                  <th className="p-2 font-medium">P vol</th>
                  <th className="p-2 font-medium">P OI</th>
                  <th className="p-2 font-medium">P bid</th>
                  <th className="p-2 font-medium">P ask</th>
                </tr>
              </thead>
              <tbody>
                {chainRows.map((row) => {
                  const atm = atmStrike !== null && row.strike === atmStrike;
                  return (
                    <tr
                      key={row.strike}
                      className={`border-b border-white/[0.06] ${
                        atm ? 'bg-white/[0.06]' : 'hover:bg-white/[0.04]'
                      }`}
                    >
                      <td className="p-1.5 font-mono">{PRICE_PENDING}</td>
                      <td className="p-1.5 font-mono">{PRICE_PENDING}</td>
                      <td className="p-1.5 text-zinc-400 tabular-nums">{row.callVolume.toLocaleString()}</td>
                      <td className="p-1.5 text-zinc-400 tabular-nums">{row.callOpenInterest.toLocaleString()}</td>
                      <td
                        className={`p-1.5 text-center font-mono font-semibold tabular-nums ${
                          atm ? 'text-zinc-100' : 'text-white'
                        }`}
                        title={`Δ call ${row.callDelta} · Δ put ${row.putDelta}`}
                      >
                        {row.strike % 1 === 0 ? row.strike.toFixed(0) : row.strike.toFixed(1)}
                        {atm && <span className="sr-only"> at-the-money</span>}
                      </td>
                      <td className="p-1.5 text-zinc-400 tabular-nums">{row.putVolume.toLocaleString()}</td>
                      <td className="p-1.5 text-zinc-400 tabular-nums">{row.putOpenInterest.toLocaleString()}</td>
                      <td className="p-1.5 font-mono">{PRICE_PENDING}</td>
                      <td className="p-1.5 font-mono">{PRICE_PENDING}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

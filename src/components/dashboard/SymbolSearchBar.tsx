'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { TRADEABLE_SYMBOLS, symbolDisplayName } from '@/data/symbols';
import { searchSymbols } from '@/data/topSymbols';

type SymbolSearchBarProps = {
  value: string;
  onChange: (symbol: string) => void;
};

export function SymbolSearchBar({ value, onChange }: SymbolSearchBarProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const results = query.trim() ? searchSymbols(query, 10) : [];

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const pick = (sym: string) => {
    onChange(sym);
    setQuery('');
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
      <div className="relative min-w-[140px] max-w-[220px] flex-1">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search symbol…"
          className="h-8 w-full rounded border border-white/[0.1] bg-dark-gray pl-8 pr-2 font-mono text-sm text-tan placeholder:text-zinc-600 focus:border-brass/40 focus:outline-none"
          aria-label="Search symbols"
          autoComplete="off"
        />
        {open && results.length > 0 ? (
          <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-white/10 bg-[#0e0f13] py-1 shadow-xl">
            {results.map((sym) => (
              <li key={sym}>
                <button
                  type="button"
                  onClick={() => pick(sym)}
                  className="flex w-full items-center justify-between px-3 py-1.5 text-left font-mono text-[12px] text-zinc-200 hover:bg-white/[0.06]"
                >
                  <span className="text-tan">{sym}</span>
                  <span className="ml-2 truncate text-[10px] text-zinc-500">{symbolDisplayName(sym)}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <select
        value={TRADEABLE_SYMBOLS.includes(value as (typeof TRADEABLE_SYMBOLS)[number]) ? value : TRADEABLE_SYMBOLS[0]}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 shrink-0 rounded border border-white/[0.1] bg-dark-gray px-2 font-mono text-sm text-tan focus:outline-none"
        aria-label="Quick symbol picker"
      >
        {TRADEABLE_SYMBOLS.map((s) => (
          <option key={s} value={s}>
            {s} · {symbolDisplayName(s)}
          </option>
        ))}
      </select>
    </div>
  );
}

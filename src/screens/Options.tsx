/**
 * Options — the options intelligence terminal.
 *
 * Surfaces every dimension of the options market for a symbol: the full chain
 * with first- and second-order Greeks, the implied-volatility surface, skew,
 * term structure, options flow, dealer gamma exposure, and an intelligence
 * grid (IV regime, RV/IV spread, delta-squeeze risk, implied vs realized move).
 */

'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ProfileMenu } from '../components/ProfileMenu';
import { OptionsChainPanel, GexByStrike, PositionBuilder } from '../components/dashboard/terminal/panels';
import { VolSurface, SkewPanel, TermStructure, FlowPanel, IntelGrid } from '../components/options/optionsPanels';
import {
  SYMBOLS,
  getSnapshot,
  getOptionsIntel,
  type OptionRow,
} from '../components/dashboard/terminal/terminalData';

function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-tan/20 bg-charcoal/95 backdrop-blur-xl">
      <div className="mx-auto flex h-12 max-w-[1800px] items-center justify-between px-3 sm:px-5">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-display text-base tracking-tight text-neutral-100">general.exchange</Link>
          <nav className="hidden items-center gap-1 md:flex">
            {[['Dashboard', '/dashboard'], ['Backtest', '/backspace'], ['Options', '/options'], ['Risk', '/risk-management']].map(([l, h]) => (
              <Link key={l} href={h} className={`rounded px-2.5 py-1 text-[12px] tracking-wide transition-colors ${l === 'Options' ? 'bg-white/[0.06] text-tan' : 'text-zinc-400 hover:text-zinc-100'}`}>{l}</Link>
            ))}
          </nav>
        </div>
        <ProfileMenu />
      </div>
    </header>
  );
}

export const Options: React.FC = () => {
  const [symbol, setSymbol] = useState<string>(SYMBOLS[0]);
  const [expiration, setExpiration] = useState<string>('Jun 20');
  const [builderRow, setBuilderRow] = useState<OptionRow | null>(null);

  const snap = useMemo(() => getSnapshot(symbol), [symbol]);
  const intel = useMemo(() => getOptionsIntel(symbol), [symbol]);
  const atmIvRank = useMemo(() => {
    const atm = snap.chain.find((r) => r.moneyness === 'ATM');
    return atm ? atm.ivRank : 50;
  }, [snap]);

  return (
    <div className="min-h-screen bg-charcoal text-zinc-100">
      <Header />
      <PositionBuilder row={builderRow} symbol={symbol} onClose={() => setBuilderRow(null)} />

      <main className="mx-auto max-w-[1800px] px-2 py-3 sm:px-3">
        {/* symbol + expiration bar */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-md border border-white/[0.08] bg-charcoal/70 px-3 py-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {SYMBOLS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSymbol(s)}
                  className={`rounded px-2.5 py-1 font-mono text-[12px] tabular transition-colors ${symbol === s ? 'bg-brass/15 text-tan' : 'text-zinc-400 hover:text-zinc-100'}`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="hidden items-baseline gap-2 font-mono text-[12px] tabular sm:flex">
              <span className="text-neutral-100">{snap.price.toFixed(2)}</span>
              <span className={snap.change >= 0 ? 'text-moss' : 'text-rose-400'}>
                {snap.change >= 0 ? '+' : ''}{snap.change.toFixed(2)} ({snap.changePct >= 0 ? '+' : ''}{snap.changePct.toFixed(2)}%)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[9px] uppercase tracking-wider text-zinc-500">Expiry</span>
            {snap.expirations.map((e) => (
              <button
                key={e}
                onClick={() => setExpiration(e)}
                className={`rounded px-2 py-1 font-mono text-[11px] tabular transition-colors ${expiration === e ? 'bg-white/[0.08] text-tan' : 'text-zinc-400 hover:text-zinc-100'}`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* intelligence grid */}
        <IntelGrid intel={intel} regime={snap.regime} ivRank={atmIvRank} />

        {/* chain + analytics */}
        <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-[1.7fr_1fr]">
          <div className="h-[460px]">
            <OptionsChainPanel chain={snap.chain} onSelect={setBuilderRow} />
          </div>
          <div className="flex flex-col gap-3">
            <VolSurface surface={intel.surface} />
            <TermStructure term={intel.term} />
          </div>
        </div>

        {/* skew / flow / GEX */}
        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
          <SkewPanel skew={intel.skew} />
          <FlowPanel flow={intel.flow} />
          <div className="max-h-[320px] overflow-hidden">
            <GexByStrike gex={snap.gex} price={snap.price} />
          </div>
        </div>

        <p className="mt-3 text-center font-mono text-[9px] tabular text-zinc-600">
          Second-order sensitivities (charm, vanna, volga, speed, zomma, color) shown per contract in the chain and position builder.
        </p>
      </main>
    </div>
  );
};

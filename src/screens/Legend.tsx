/**
 * Legend terminal — Robinhood-style feed on legend.general.exchange (or /legend/ in desktop).
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { legendDashboardUrl } from '@/lib/legendUrl';
import { ProfileMenu } from '../components/ProfileMenu';
import { useLiveDashboard, type ChartRange } from '../hooks/useLiveDashboard';
import { TRADEABLE_SYMBOLS } from '../data/symbols';
import { WalletButton } from '../components/dashboard/WalletButton';
import { LegendRobinhoodLayout } from '../components/dashboard/LegendRobinhoodLayout';
import { isTauriApp } from '../lib/desktopNav';

export const Legend: React.FC = () => {
  const [symbol, setSymbol] = useState<string>(TRADEABLE_SYMBOLS[0]);
  const [chartRange, setChartRange] = useState<ChartRange>('1D');

  const feed = useLiveDashboard(symbol, chartRange);

  return (
    <div className="min-h-screen bg-[#0a0b0e] text-zinc-100">
      <header className="sticky top-0 z-30 h-12 border-b border-white/[0.06] bg-[#0a0b0e]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-12 max-w-[1920px] items-center justify-between px-3 sm:px-5">
          <Link href={legendDashboardUrl('/')} className="font-display text-base tracking-tight text-neutral-100">
            {isTauriApp() ? 'general.exchange' : 'Legend'}
          </Link>
          <div className="flex items-center gap-2">
            <WalletButton />
            <ProfileMenu />
          </div>
        </div>
      </header>

      <LegendRobinhoodLayout
        symbol={symbol}
        onSymbolChange={setSymbol}
        chartRange={chartRange}
        onChartRangeChange={setChartRange}
        feed={feed}
      />
    </div>
  );
};

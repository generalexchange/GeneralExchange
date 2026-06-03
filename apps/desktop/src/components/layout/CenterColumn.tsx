import React from 'react';
import { SymbolHeader } from '@/components/panels/SymbolHeader';
import { PriceChart } from '@/components/charts/PriceChart';
import { GexChart } from '@/components/charts/GexChart';
import { OptionsChainGrid } from '@/components/grids/OptionsChainGrid';
import { PositionsGrid } from '@/components/grids/PositionsGrid';
import { TradeHistoryGrid } from '@/components/grids/TradeHistoryGrid';
import { SignalFeed } from '@/components/panels/SignalFeed';
import { useUiStore, type BottomTab } from '@/stores/uiStore';
import type { TradeRecord } from '@/types/trading';

const TABS: { id: BottomTab; label: string }[] = [
  { id: 'chain', label: 'Options Chain' },
  { id: 'positions', label: 'Positions' },
  { id: 'history', label: 'History' },
  { id: 'signals', label: 'Signals' },
];

interface Props {
  trades: TradeRecord[];
}

export const CenterColumn: React.FC<Props> = ({ trades }) => {
  const activeTab = useUiStore((s) => s.activeTab);
  const setActiveTab = useUiStore((s) => s.setActiveTab);

  return (
    <div className="grid h-full min-h-0 grid-rows-[48px_420px_180px_1fr] bg-charcoal">
      <SymbolHeader />

      <div className="min-h-0 border-b border-white/[0.06] px-1 py-1" data-tour="price-chart">
        <PriceChart />
      </div>

      <div className="min-h-0 border-b border-white/[0.06] px-2 pb-1 pt-1">
        <p className="text-[10px] uppercase tracking-wider text-zinc-500">Dealer gamma by strike</p>
        <div className="h-[150px]">
          <GexChart />
        </div>
      </div>

      <div className="flex min-h-0 flex-col">
        <div className="flex shrink-0 items-center gap-1 border-b border-white/[0.06] px-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`border-b-2 px-3 py-1.5 text-[12px] ${
                activeTab === t.id ? 'border-brass text-tan' : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="min-h-0 flex-1">
          {activeTab === 'chain' && <OptionsChainGrid />}
          {activeTab === 'positions' && <PositionsGrid />}
          {activeTab === 'history' && <TradeHistoryGrid trades={trades} />}
          {activeTab === 'signals' && <SignalFeed />}
        </div>
      </div>
    </div>
  );
};

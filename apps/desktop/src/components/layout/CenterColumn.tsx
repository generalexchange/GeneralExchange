import React from 'react';
import { LineChart, Table2 } from 'lucide-react';
import { SymbolSearch } from './SymbolSearch';
import { StockQuoteHero } from '@/components/panels/StockQuoteHero';
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
  onSelectSymbol: (symbol: string) => void;
}

export const CenterColumn: React.FC<Props> = ({ trades, onSelectSymbol }) => {
  const activeTab = useUiStore((s) => s.activeTab);
  const setActiveTab = useUiStore((s) => s.setActiveTab);
  const advanced = useUiStore((s) => s.advancedView);
  const setAdvanced = useUiStore((s) => s.setAdvancedView);
  const symbol = useUiStore((s) => s.activeSymbol);

  return (
    <div className="flex h-full min-h-0 flex-col bg-charcoal">
      <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-2">
        <div className="min-w-0 flex-1">
          <SymbolSearch onSubmit={onSelectSymbol} />
        </div>
        <button
          type="button"
          onClick={() => setAdvanced(!advanced)}
          className={`mr-2 flex shrink-0 items-center gap-1.5 rounded border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide ${
            advanced ? 'border-tan/40 bg-tan/15 text-tan' : 'border-white/10 text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {advanced ? <Table2 className="h-3.5 w-3.5" /> : <LineChart className="h-3.5 w-3.5" />}
          {advanced ? 'Standard' : 'Advanced'}
        </button>
      </div>

      {advanced ? (
        <>
          <div className="min-h-0 shrink-0 border-b border-white/[0.06] px-1 py-1" data-tour="price-chart">
            <p className="px-2 pb-1 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              {symbol} · 5M · VWAP / EMA9 / SMA20 / BB
            </p>
            <div className="h-[280px]">
              <PriceChart />
            </div>
          </div>
          <div className="min-h-0 shrink-0 border-b border-white/[0.06] px-2 pb-1 pt-1">
            <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Gamma exposure by strike</p>
            <div className="h-[150px]">
              <GexChart />
            </div>
          </div>
        </>
      ) : (
        <div className="min-h-[200px] shrink-0 border-b border-white/[0.06]">
          <StockQuoteHero />
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col">
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

import React from 'react';
import { SymbolSearch } from './SymbolSearch';
import { WatchlistGrid, type WatchRow } from '@/components/grids/WatchlistGrid';
import { AccountSummary } from '@/components/panels/AccountSummary';

interface Props {
  watchlist: WatchRow[];
  activeSymbol: string;
  onSelectSymbol: (symbol: string) => void;
}

export const LeftColumn: React.FC<Props> = ({ watchlist, activeSymbol, onSelectSymbol }) => {
  return (
    <div className="flex h-full min-h-0 flex-col border-r border-white/[0.06] bg-charcoal">
      <SymbolSearch onSubmit={onSelectSymbol} />
      <div className="min-h-0 flex-1">
        <WatchlistGrid rows={watchlist} activeSymbol={activeSymbol} onSelect={onSelectSymbol} />
      </div>
      <AccountSummary />
    </div>
  );
};

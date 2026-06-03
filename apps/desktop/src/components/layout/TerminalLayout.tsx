import React from 'react';
import { LeftColumn } from './LeftColumn';
import { CenterColumn } from './CenterColumn';
import { RightColumn } from './RightColumn';
import type { WatchRow } from '@/components/grids/WatchlistGrid';
import type { TradeRecord } from '@/types/trading';

interface Props {
  watchlist: WatchRow[];
  trades: TradeRecord[];
  activeSymbol: string;
  onSelectSymbol: (symbol: string) => void;
}

/** The full-window 3-column terminal grid: 220px | flexible | 280px. */
export const TerminalLayout: React.FC<Props> = ({ watchlist, trades, activeSymbol, onSelectSymbol }) => {
  return (
    <div className="grid min-h-0 flex-1 grid-cols-[220px_1fr_280px] overflow-hidden">
      <LeftColumn watchlist={watchlist} activeSymbol={activeSymbol} onSelectSymbol={onSelectSymbol} />
      <CenterColumn trades={trades} />
      <RightColumn />
    </div>
  );
};

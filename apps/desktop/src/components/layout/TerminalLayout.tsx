import React from 'react';
import { CenterColumn } from './CenterColumn';
import { RightColumn } from './RightColumn';
import type { TradeRecord } from '@/types/trading';

interface Props {
  trades: TradeRecord[];
  onSelectSymbol: (symbol: string) => void;
}

/** Two-column terminal: center (quote + chain) | right (regime, orders, news). */
export const TerminalLayout: React.FC<Props> = ({ trades, onSelectSymbol }) => {
  return (
    <div className="grid min-h-0 flex-1 grid-cols-[1fr_280px] overflow-hidden">
      <CenterColumn trades={trades} onSelectSymbol={onSelectSymbol} />
      <RightColumn />
    </div>
  );
};

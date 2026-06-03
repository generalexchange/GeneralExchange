import React from 'react';
import { OrderEntryPanel } from '@/components/trading/OrderEntryPanel';
import { RegimePanel } from '@/components/panels/RegimePanel';
import { NewsFeed } from '@/components/panels/NewsFeed';
import { DarkPoolPanel } from '@/components/panels/DarkPoolPanel';

export const RightColumn: React.FC = () => {
  return (
    <div className="flex h-full min-h-0 flex-col border-l border-white/[0.06] bg-charcoal">
      <OrderEntryPanel />
      <RegimePanel />
      <NewsFeed />
      <DarkPoolPanel />
    </div>
  );
};

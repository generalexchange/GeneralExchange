/**
 * Crop Futures — solutions vertical (footer).
 */

'use client';

import React from 'react';
import { SolutionPageLayout } from '@/components/solutions/SolutionPageLayout';

export const CropFutures: React.FC = () => {
  return (
    <SolutionPageLayout
      eyebrow="Crop Futures"
      title="Agricultural futures without folklore math"
      lede="Planting progress, carry, and weather tails belong in the same envelope as your limits and P&L—scenario libraries you can diff, version, and defend to compliance."
    >
      <div className="max-w-3xl space-y-6 text-sm font-light leading-relaxed text-zinc-400 sm:text-base">
        <p>
          Crop Futures on General Exchange is where we land grain and oilseed templates: structured seasonality, basis risk,
          and cross-market correlations that mirror how elevators and funds actually think about margin.
        </p>
        <p>
          Monte Carlo and Backspace give you the engines; this vertical is the narrative and worksheet set so agronomy-shaped
          risk does not live in a disconnected spreadsheet tab.
        </p>
      </div>
    </SolutionPageLayout>
  );
};

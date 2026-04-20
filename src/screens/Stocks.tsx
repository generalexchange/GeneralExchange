/**
 * Stocks — solutions area (footer).
 */

'use client';

import React from 'react';
import { SolutionPageLayout } from '@/components/solutions/SolutionPageLayout';

export const Stocks: React.FC = () => {
  return (
    <SolutionPageLayout
      eyebrow="Stocks"
      title="Single-name and index equity with the same evidence bar as derivatives"
      lede="Treat listed equities like any other simulated surface: corporate actions, session rules, and liquidity assumptions stay manifest-tagged so risk and research read the same tape you used to approve size."
    >
      <div className="max-w-3xl space-y-6 text-sm font-light leading-relaxed text-zinc-400 sm:text-base">
        <p>
          Stocks on General Exchange emphasizes replayable sessions—gap risk, borrow availability where we model it, and how your book concentration
          shifts when correlations spike. Dashboards stay bound to the kernels that produced them, not a stale export from another tab.
        </p>
        <p>
          Pair this vertical with sentiment and news surfaces when narrative drives the name, and with Monte Carlo when you need path-dependent shocks
          on the same positions you already marked in Backspace.
        </p>
      </div>
    </SolutionPageLayout>
  );
};

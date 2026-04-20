/**
 * Futures — solutions area (footer).
 */

'use client';

import React from 'react';
import { SolutionPageLayout } from '@/components/solutions/SolutionPageLayout';

export const Futures: React.FC = () => {
  return (
    <SolutionPageLayout
      eyebrow="Futures"
      title="Margins, rolls, and spreads on one deterministic surface"
      lede="Treat outrights and calendar structures the way risk officers read them—scenario libraries, manifest-bound runs, and dashboards tied to the same kernels your desk used to size."
    >
      <div className="max-w-3xl space-y-6 text-sm font-light leading-relaxed text-zinc-400 sm:text-base">
        <p>
          General Exchange futures workflows emphasize replayable stress, honest margin assumptions, and datasets you can cite when governance asks
          what changed between yesterday and today.
        </p>
        <p>
          Pair this area with Monte Carlo for path-dependent shocks and Backspace when storage or delivery constraints shape the book you are
          teaching or paper trading.
        </p>
      </div>
    </SolutionPageLayout>
  );
};

/**
 * Strategies — solutions area (footer).
 */

'use client';

import React from 'react';
import { SolutionPageLayout } from '@/components/solutions/SolutionPageLayout';

export const Strategies: React.FC = () => {
  return (
    <SolutionPageLayout
      eyebrow="Strategies"
      title="Systematic sleeves with allocator-grade lineage"
      lede="From signal research to risk overlays, keep every variant versioned and comparable—so when limits tighten, you can show exactly which hypothesis changed and why size moved."
    >
      <div className="max-w-3xl space-y-6 text-sm font-light leading-relaxed text-zinc-400 sm:text-base">
        <p>
          Strategy solutions bridge the library, backtesting surfaces, and governance: one place to describe how a sleeve is built, how it is
          stressed, and how it respects portfolio constraints in simulation.
        </p>
        <p>
          This page anchors education and worksheet drops for allocator-facing narratives—always tied to evidence you can export, not a one-off deck.
        </p>
      </div>
    </SolutionPageLayout>
  );
};

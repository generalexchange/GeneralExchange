/**
 * Options — solutions area (footer).
 */

'use client';

import React from 'react';
import { SolutionPageLayout } from '@/components/solutions/SolutionPageLayout';

export const Options: React.FC = () => {
  return (
    <SolutionPageLayout
      eyebrow="Options"
      title="Volatility as a first-class surface, not a side spreadsheet"
      lede="Surfaces, greeks, and scenario grids stay bound to the same manifests as the rest of the platform—so education paths and risk review never drift from silent assumption edits."
    >
      <div className="max-w-3xl space-y-6 text-sm font-light leading-relaxed text-zinc-400 sm:text-base">
        <p>
          Options on General Exchange are built for desks that need explainable sensitivities: which model, which calendar, which discounting
          convention—and a diff when any of them move.
        </p>
        <p>
          Use the strategy library and Monte Carlo where you need path sampling; use this area as the narrative anchor for vol-specific templates
          and coursework as we publish them.
        </p>
      </div>
    </SolutionPageLayout>
  );
};

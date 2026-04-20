/**
 * Oil & Gas — solutions vertical (footer).
 */

'use client';

import React from 'react';
import { SolutionPageLayout } from '@/components/solutions/SolutionPageLayout';

export const OilAndGas: React.FC = () => {
  return (
    <SolutionPageLayout
      eyebrow="Oil & Gas"
      title="Hydrocarbon risk on a deterministic surface"
      lede="From prompt curves to inventory shocks, model the book the way traders and risk officers read it together—GPU-backed scenarios, lineage you can cite, and no silent assumption drift."
    >
      <div className="max-w-3xl space-y-6 text-sm font-light leading-relaxed text-zinc-400 sm:text-base">
        <p>
          General Exchange treats energy exposure like any other institutional surface: manifests bind datasets and kernels,
          runs replay cleanly, and dashboards stay tied to the same evidence your desk used to approve size.
        </p>
        <p>
          Use Backspace to stress storage and crack spreads; use The Exchange workflow language for how orders and limits
          actually release. This page is the anchor for oil{' & '}gas-specific education and templates as we ship them.
        </p>
      </div>
    </SolutionPageLayout>
  );
};

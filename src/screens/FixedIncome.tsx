/**
 * Fixed Income — solutions vertical (footer).
 */

'use client';

import React from 'react';
import { SolutionPageLayout } from '@/components/solutions/SolutionPageLayout';

export const FixedIncome: React.FC = () => {
  return (
    <SolutionPageLayout
      eyebrow="Fixed Income"
      title="Rates, credit, and carry with audit-grade runs"
      lede="Curve trades, issuer baskets, and RV sleeves share one lineage model with the rest of the platform—so risk, research, and execution read the same numbers at every step."
    >
      <div className="max-w-3xl space-y-6 text-sm font-light leading-relaxed text-zinc-400 sm:text-base">
        <p>
          Fixed Income solutions emphasize DV01 integrity, spread decomposition, and slow variables that still matter when
          leverage is tight. Runs are manifest-tagged so you can prove which discounting convention and calendar you used.
        </p>
        <p>
          Pair this vertical with governance and tokenized compute where heavy simulations need GPU capacity you can meter
          and explain on an invoice—not a black box cluster.
        </p>
      </div>
    </SolutionPageLayout>
  );
};

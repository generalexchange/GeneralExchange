/**
 * Fixed Income — solutions area (footer). Incorporates former dividend cash-flow narrative.
 */

'use client';

import React from 'react';
import { SolutionPageLayout } from '@/components/solutions/SolutionPageLayout';

export const FixedIncome: React.FC = () => {
  return (
    <SolutionPageLayout
      eyebrow="Fixed Income"
      title="Rates, credit, and dividend-style cash flows on one deterministic surface"
      lede="Curve trades, issuer baskets, and income-oriented cash streams share the same lineage model as the rest of the platform—DV01 integrity next to distribution timing and reinvestment paths you can replay, not hand-wave."
    >
      <div className="max-w-3xl space-y-6 text-sm font-light leading-relaxed text-zinc-400 sm:text-base">
        <p>
          Fixed Income on General Exchange is where we land templates for bonds, notes, and dividend-equivalent structures: how coupons and
          distributions hit your simulated book, how reinvestment assumptions move P{'&'}L, and how those flows interact with futures and equity
          sleeves you already marked.
        </p>
        <p>
          The former Dividend Properties lane now lives here—same emphasis on transparent assumptions, scenario libraries, and paper workflows tied
          to the evidence chain—so income desks and learners rehearse decisions with the same rigor as the rest of the exchange.
        </p>
        <p>
          Runs stay manifest-tagged so you can prove which discounting convention, calendar, and accrual method you used. Nothing here is an offer to
          sell securities; it is simulation-first tooling and narrative for education and desk review.
        </p>
      </div>
    </SolutionPageLayout>
  );
};

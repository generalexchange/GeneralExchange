/**
 * Sentiment — solutions area (footer).
 */

'use client';

import React from 'react';
import { SolutionPageLayout } from '@/components/solutions/SolutionPageLayout';

export const Sentiment: React.FC = () => {
  return (
    <SolutionPageLayout
      eyebrow="Sentiment"
      title="Narrative and positioning as features, not vibes"
      lede="When sentiment enters a simulator, it should arrive as structured features with timestamps and provenance—so research, risk, and execution do not argue about different Twitter exports."
    >
      <div className="max-w-3xl space-y-6 text-sm font-light leading-relaxed text-zinc-400 sm:text-base">
        <p>
          Sentiment solutions on General Exchange emphasize feature stores and replay: what signal, what half-life, what universe—and how those
          inputs behaved during the scenarios you already ran for the book.
        </p>
        <p>
          Pair with reconnaissance and news surfaces where narrative intelligence is gathered; use this vertical to document how those signals map
          into risk and simulation—not a separate anecdote layer.
        </p>
      </div>
    </SolutionPageLayout>
  );
};

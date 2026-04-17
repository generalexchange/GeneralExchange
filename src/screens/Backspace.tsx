/**
 * Backspace — compute-driven backtesting & model research pillar (moved from homepage).
 */

'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { InstitutionalFooter } from '@/components/InstitutionalFooter';
import { PillarSectionEmbed, getPillarById } from '@/screens/homepage/HomepageLegacyRestored';

export const Backspace: React.FC = () => {
  const pillar = getPillarById('backtesting-research');

  return (
    <div className="min-h-screen bg-charcoal font-sans text-neutral-100 antialiased selection:bg-tan/20">
      <Navbar showSearch={false} />

      <div className="pt-12 sm:pt-14">
        <header className="border-b border-white/[0.06] px-4 py-10 sm:px-6 sm:py-12 lg:px-10">
          <div className="mx-auto max-w-content">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-500 sm:text-[11px]">
              <span className="text-tan/90">Proof layer</span>
              <span className="text-zinc-600"> · </span>
              Backspace
            </p>
            <h1 className="mt-4 max-w-3xl font-display text-3xl font-medium leading-tight tracking-tight text-neutral-50 sm:text-4xl lg:text-[2.75rem]">
              Tokenized GPU pools for sweeps, evolution, and RL—with spend controls and reproducible manifests.
            </h1>
          </div>
        </header>

        {pillar ? <PillarSectionEmbed pillar={pillar} index={0} /> : null}
      </div>

      <InstitutionalFooter />
    </div>
  );
};

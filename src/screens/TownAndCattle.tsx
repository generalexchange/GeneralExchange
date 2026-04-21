/**
 * Town & Cattle — product marketing (footer). Agricultural cash and futures context.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { InstitutionalFooter } from '@/components/InstitutionalFooter';

const btnGhost =
  'inline-flex min-h-11 items-center justify-center rounded-lg border border-white/[0.12] bg-transparent px-5 text-sm font-semibold text-zinc-300 transition-colors hover:border-tan/35 hover:bg-white/[0.04] hover:text-tan';

export const TownAndCattle: React.FC = () => {
  return (
    <div className="min-h-screen bg-charcoal font-sans text-neutral-100 antialiased selection:bg-tan/20">
      <Navbar showSearch={false} />

      <div className="pt-[calc(3.5rem+env(safe-area-inset-top,0px))] sm:pt-[calc(3.75rem+env(safe-area-inset-top,0px))]">
        <header className="border-b border-white/[0.06] py-10 sm:py-12">
          <div className="mx-auto max-w-content layout-gutter">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-500 sm:text-[11px]">
              <span className="text-tan/90">Products</span>
              <span className="text-zinc-600"> · </span>
              Town{' & '}Cattle
            </p>
            <h1 className="mt-4 max-w-3xl font-display text-3xl font-medium leading-tight tracking-tight text-neutral-50 sm:text-4xl lg:text-[2.75rem]">
              Cash cattle, grains, and basis risk with the same replay standard as the rest of the book
            </h1>
            <p className="mt-4 max-w-2xl text-sm font-light leading-relaxed text-zinc-400 sm:text-base">
              Town{' & '}Cattle is the product lane for livestock and row-crop workflows—seasonality, delivery windows, and elevator-shaped basis in
              one surface so hedgers and funds rehearse scenarios without folklore spreadsheets.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/futures" className={btnGhost}>
                Futures
              </Link>
              <Link href="/solutions" className={btnGhost}>
                Solutions
              </Link>
            </div>
          </div>
        </header>

        <article className="mx-auto max-w-content layout-gutter py-12 sm:py-14 lg:py-16">
          <div className="max-w-3xl space-y-6 text-sm font-light leading-relaxed text-zinc-400 sm:text-base">
            <p>
              We emphasize manifest-bound runs for auction-to-futures convergence, margin-aware spreads, and weather-tailed inventories—aligned with
              how physical markets actually clear, not a generic “commodities” toggle.
            </p>
            <p>
              Educational simulation only; nothing here is investment advice or an offer. Pair with Monte Carlo when you need path sampling on the
              same positions you stress in Backspace.
            </p>
          </div>
        </article>
      </div>

      <InstitutionalFooter />
    </div>
  );
};

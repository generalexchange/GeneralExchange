/**
 * MoneyBagg — product marketing (footer).
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { InstitutionalFooter } from '@/components/InstitutionalFooter';

const btnGhost =
  'inline-flex min-h-11 items-center justify-center rounded-lg border border-white/[0.12] bg-transparent px-5 text-sm font-semibold text-zinc-300 transition-colors hover:border-tan/35 hover:bg-white/[0.04] hover:text-tan';

export const MoneyBagg: React.FC = () => {
  return (
    <div className="min-h-screen bg-charcoal font-sans text-neutral-100 antialiased selection:bg-tan/20">
      <Navbar showSearch={false} />

      <div className="pt-[calc(3.5rem+env(safe-area-inset-top,0px))] sm:pt-[calc(3.75rem+env(safe-area-inset-top,0px))]">
        <header className="border-b border-white/[0.06] py-10 sm:py-12">
          <div className="mx-auto max-w-content layout-gutter">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-500 sm:text-[11px]">
              <span className="text-tan/90">Products</span>
              <span className="text-zinc-600"> · </span>
              MoneyBagg
            </p>
            <h1 className="mt-4 max-w-3xl font-display text-3xl font-medium leading-tight tracking-tight text-neutral-50 sm:text-4xl lg:text-[2.75rem]">
              Treasury views and carry bags you can stress before you move size
            </h1>
            <p className="mt-4 max-w-2xl text-sm font-light leading-relaxed text-zinc-400 sm:text-base">
              MoneyBagg is the product lane for allocation snapshots, cash-pile scenarios, and paper workflows that treat “what’s in the bag?” as a
              first-class risk question—not a footnote on a slide deck.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/consultation" className={btnGhost}>
                Consultation
              </Link>
              <Link href="/fixed-income" className={btnGhost}>
                Fixed Income
              </Link>
            </div>
          </div>
        </header>

        <article className="mx-auto max-w-content layout-gutter py-12 sm:py-14 lg:py-16">
          <div className="max-w-3xl space-y-6 text-sm font-light leading-relaxed text-zinc-400 sm:text-base">
            <p>
              Wire MoneyBagg next to Monte Carlo and tokenized compute so heavy scenario grids stay metered—same lineage story as the rest of
              General Exchange, with templates we publish as we ship them.
            </p>
            <p>
              Educational simulation only; nothing here is investment advice or an offer. Use governance and your desk policy when deciding what
              you are allowed to rehearse in production sandboxes.
            </p>
          </div>
        </article>
      </div>

      <InstitutionalFooter />
    </div>
  );
};

/**
 * Coffee — credit.coffee editorial / newsletter (Products footer).
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { InstitutionalFooter } from '@/components/InstitutionalFooter';

const btnGhost =
  'inline-flex min-h-11 items-center justify-center rounded-lg border border-white/[0.12] bg-transparent px-5 text-sm font-semibold text-zinc-300 transition-colors hover:border-tan/35 hover:bg-white/[0.04] hover:text-tan';

export const Coffee: React.FC = () => {
  return (
    <div className="min-h-screen bg-charcoal font-sans text-neutral-100 antialiased selection:bg-tan/20">
      <Navbar showSearch={false} />

      <div className="pt-[calc(3.5rem+env(safe-area-inset-top,0px))] sm:pt-[calc(3.75rem+env(safe-area-inset-top,0px))]">
        <header className="border-b border-white/[0.06] py-10 sm:py-12">
          <div className="mx-auto max-w-content layout-gutter">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-500 sm:text-[11px]">
              <span className="text-tan/90">Products</span>
              <span className="text-zinc-600"> · </span>
              Coffee
            </p>
            <h1 className="mt-4 max-w-3xl font-display text-3xl font-medium leading-tight tracking-tight text-neutral-50 sm:text-4xl lg:text-[2.75rem]">
              Credit markets, served like a morning brief—not a spreadsheet dump
            </h1>
            <p className="mt-4 max-w-2xl text-sm font-light leading-relaxed text-zinc-400 sm:text-base">
              <a
                href="https://credit.coffee"
                className="text-tan/90 underline-offset-4 hover:underline"
                rel="noopener noreferrer"
                target="_blank"
              >
                credit.coffee
              </a>{' '}
              is a credit-based newsletter: new issues, spreads moving for a reason, covenants worth reading, and the occasional desk story told with
              enough context that risk and research can actually use it.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/newsletter" className={btnGhost}>
                General Exchange newsletter
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
              Each edition is edited for clarity: who borrowed, what changed in documentation, and what a prudent desk would want to verify before
              size moves. It complements the simulation tools on General Exchange—same respect for evidence, fewer attachments, more signal.
            </p>
            <p>
              Nothing here is investment advice or a solicitation. Subscriptions and editorial policies for credit.coffee are governed by the team
              behind that product; General Exchange hosts this page so learners and credit-curious investors can find the lane in one place.
            </p>
          </div>
        </article>
      </div>

      <InstitutionalFooter />
    </div>
  );
};

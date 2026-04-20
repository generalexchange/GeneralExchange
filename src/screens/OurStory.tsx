/**
 * Our Story — company narrative (footer / Company).
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { InstitutionalFooter } from '@/components/InstitutionalFooter';

const btnGhost =
  'inline-flex min-h-11 items-center justify-center rounded-lg border border-white/[0.12] bg-transparent px-5 text-sm font-semibold text-zinc-300 transition-colors hover:border-tan/35 hover:bg-white/[0.04] hover:text-tan';

export const OurStory: React.FC = () => {
  return (
    <div className="min-h-screen bg-charcoal font-sans text-neutral-100 antialiased selection:bg-tan/20">
      <Navbar showSearch={false} />

      <div className="pt-[calc(3.5rem+env(safe-area-inset-top,0px))] sm:pt-[calc(3.75rem+env(safe-area-inset-top,0px))]">
        <header className="border-b border-white/[0.06] py-10 sm:py-12">
          <div className="mx-auto max-w-content layout-gutter">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-500 sm:text-[11px]">
              <span className="text-tan/90">Company</span>
              <span className="text-zinc-600"> · </span>
              Our story
            </p>
            <h1 className="mt-4 max-w-3xl font-display text-3xl font-medium leading-tight tracking-tight text-neutral-50 sm:text-4xl lg:text-[2.75rem]">
              Simulation-first markets, built where institutions and learners meet
            </h1>
            <p className="mt-4 max-w-2xl text-sm font-light leading-relaxed text-zinc-400 sm:text-base">
              General Exchange started from a simple conviction: you should be able to rehearse sizing, risk, and narrative stress without bleeding
              real capital—while still using the same language desks use when they defend a book to compliance.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/company" className={btnGhost}>
                Company hub
              </Link>
              <Link href="/our-team" className={btnGhost}>
                Our team
              </Link>
            </div>
          </div>
        </header>

        <article className="mx-auto max-w-content layout-gutter py-12 sm:py-14 lg:py-16">
          <div className="max-w-3xl space-y-6 text-sm font-light leading-relaxed text-zinc-400 sm:text-base">
            <p>
              From Fort Worth, we ship paper workflows, Monte Carlo engines, and tokenized compute that stay metered and explainable—so “what did we
              assume?” always has an answer, not a shrug.
            </p>
            <p>
              We are an educational simulation platform: no content here is financial advice or a solicitation. Our job is to make the practice of
              markets legible, replayable, and honest about uncertainty.
            </p>
            <p>
              If you are exploring partnerships or press, start from the company hub or reach the team through the{' '}
              <Link href="/help-desk" className="text-tan/90 underline-offset-4 hover:underline">
                help desk
              </Link>
              .
            </p>
          </div>
        </article>
      </div>

      <InstitutionalFooter />
    </div>
  );
};

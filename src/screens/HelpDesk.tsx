/**
 * Help Desk — support entry point (footer / Company).
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { InstitutionalFooter } from '@/components/InstitutionalFooter';

const btnGhost =
  'inline-flex min-h-11 items-center justify-center rounded-lg border border-white/[0.12] bg-transparent px-5 text-sm font-semibold text-zinc-300 transition-colors hover:border-tan/35 hover:bg-white/[0.04] hover:text-tan';

export const HelpDesk: React.FC = () => {
  return (
    <div className="min-h-screen bg-charcoal font-sans text-neutral-100 antialiased selection:bg-tan/20">
      <Navbar showSearch={false} />

      <div className="pt-[calc(3.5rem+env(safe-area-inset-top,0px))] sm:pt-[calc(3.75rem+env(safe-area-inset-top,0px))]">
        <header className="border-b border-white/[0.06] py-10 sm:py-12">
          <div className="mx-auto max-w-content layout-gutter">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-500 sm:text-[11px]">
              <span className="text-tan/90">Company</span>
              <span className="text-zinc-600"> · </span>
              Help desk
            </p>
            <h1 className="mt-4 max-w-3xl font-display text-3xl font-medium leading-tight tracking-tight text-neutral-50 sm:text-4xl lg:text-[2.75rem]">
              A single front door for product questions and access issues
            </h1>
            <p className="mt-4 max-w-2xl text-sm font-light leading-relaxed text-zinc-400 sm:text-base">
              The help desk triages platform bugs, billing on tokenized compute, and onboarding for institutional sandboxes. For self-serve answers,
              the help center articles are the fastest path.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/help-center" className={btnGhost}>
                Help center
              </Link>
              <Link href="/request-access" className={btnGhost}>
                Request access
              </Link>
            </div>
          </div>
        </header>

        <article className="mx-auto max-w-content layout-gutter py-12 sm:py-14 lg:py-16">
          <div className="max-w-3xl space-y-6 text-sm font-light leading-relaxed text-zinc-400 sm:text-base">
            <p>
              When you open a ticket, include your org name, the page or workflow you were running, and any run or manifest identifiers you can
              share—those details cut resolution time dramatically.
            </p>
            <p>
              Critical production incidents for contracted partners should follow your success playbook; this public desk is best for general product
              questions and education-platform support.
            </p>
            <p>
              Prefer email? Use the contact path your account team provided, or start with{' '}
              <Link href="/help-center" className="text-tan/90 underline-offset-4 hover:underline">
                help center
              </Link>{' '}
              so we can route you with context.
            </p>
          </div>
        </article>
      </div>

      <InstitutionalFooter />
    </div>
  );
};

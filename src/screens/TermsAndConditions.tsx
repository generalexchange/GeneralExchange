/**
 * Terms and Conditions — marketing footer legal.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { InstitutionalFooter } from '@/components/InstitutionalFooter';

export const TermsAndConditions: React.FC = () => {
  return (
    <div className="min-h-screen bg-charcoal font-sans text-neutral-100 antialiased selection:bg-tan/20">
      <Navbar showSearch={false} />
      <div className="pt-[calc(3.5rem+env(safe-area-inset-top,0px))] sm:pt-[calc(3.75rem+env(safe-area-inset-top,0px))]">
        <header className="border-b border-white/[0.06] py-10 sm:py-12">
          <div className="mx-auto max-w-content layout-gutter">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-500">Legal</p>
            <h1 className="mt-3 font-display text-3xl font-medium tracking-tight text-neutral-50 sm:text-4xl">Terms and Conditions</h1>
            <p className="mt-3 max-w-2xl text-sm text-zinc-400">
              Last updated for the General Exchange marketing site. This is a summary framework; your executed agreements control if you have a
              separate contract.
            </p>
          </div>
        </header>
        <article className="mx-auto max-w-content layout-gutter py-12 sm:py-14">
          <div className="max-w-3xl space-y-8 text-sm font-light leading-relaxed text-zinc-400 sm:text-base">
            <section>
              <h2 className="font-display text-lg font-medium text-neutral-100">Use of the platform</h2>
              <p className="mt-2">
                General Exchange provides educational simulation and related tools. You agree not to use the service in violation of applicable law,
                not to attempt unauthorized access to systems or data, and not to misuse compute or API resources.
              </p>
            </section>
            <section>
              <h2 className="font-display text-lg font-medium text-neutral-100">No investment advice</h2>
              <p className="mt-2">
                Nothing on this site is financial, legal, or tax advice. Simulated results do not guarantee future performance. See also our{' '}
                <Link href="/privacy-policy" className="text-tan/90 underline-offset-4 hover:underline">
                  Privacy Policy
                </Link>{' '}
                and{' '}
                <Link href="/legal" className="text-tan/90 underline-offset-4 hover:underline">
                  Legal
                </Link>{' '}
                hub.
              </p>
            </section>
            <section>
              <h2 className="font-display text-lg font-medium text-neutral-100">Changes</h2>
              <p className="mt-2">We may update these terms; material changes will be reflected on this page with an updated summary at the top.</p>
            </section>
          </div>
        </article>
      </div>
      <InstitutionalFooter />
    </div>
  );
};

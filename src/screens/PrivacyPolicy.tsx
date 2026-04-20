/**
 * Privacy Policy — marketing footer legal.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { InstitutionalFooter } from '@/components/InstitutionalFooter';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-charcoal font-sans text-neutral-100 antialiased selection:bg-tan/20">
      <Navbar showSearch={false} />
      <div className="pt-[calc(3.5rem+env(safe-area-inset-top,0px))] sm:pt-[calc(3.75rem+env(safe-area-inset-top,0px))]">
        <header className="border-b border-white/[0.06] py-10 sm:py-12">
          <div className="mx-auto max-w-content layout-gutter">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-500">Legal</p>
            <h1 className="mt-3 font-display text-3xl font-medium tracking-tight text-neutral-50 sm:text-4xl">Privacy Policy</h1>
            <p className="mt-3 max-w-2xl text-sm text-zinc-400">
              How General Exchange handles information on this marketing experience. Product accounts may be governed by additional notices.
            </p>
          </div>
        </header>
        <article className="mx-auto max-w-content layout-gutter py-12 sm:py-14">
          <div className="max-w-3xl space-y-8 text-sm font-light leading-relaxed text-zinc-400 sm:text-base">
            <section>
              <h2 className="font-display text-lg font-medium text-neutral-100">What we collect</h2>
              <p className="mt-2">
                We may collect contact details you submit (for example newsletter or access requests), basic technical logs (IP, device, browser),
                and usage analytics to improve the site.
              </p>
            </section>
            <section>
              <h2 className="font-display text-lg font-medium text-neutral-100">How we use data</h2>
              <p className="mt-2">
                Data is used to operate and secure the service, respond to inquiries, and understand aggregate usage. We do not sell your personal
                information as a commodity; disclosures may occur where required by law or with service providers under contract.
              </p>
            </section>
            <section>
              <h2 className="font-display text-lg font-medium text-neutral-100">Your choices</h2>
              <p className="mt-2">
                You may request access or deletion of personal information subject to applicable law. For broader legal context see{' '}
                <Link href="/terms-and-conditions" className="text-tan/90 underline-offset-4 hover:underline">
                  Terms and Conditions
                </Link>{' '}
                and{' '}
                <Link href="/legal" className="text-tan/90 underline-offset-4 hover:underline">
                  Legal
                </Link>
                .
              </p>
            </section>
          </div>
        </article>
      </div>
      <InstitutionalFooter />
    </div>
  );
};

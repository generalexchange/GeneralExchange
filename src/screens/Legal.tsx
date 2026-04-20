/**
 * Legal — marketing footer (disclosures, cookies, regulatory framing).
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { InstitutionalFooter } from '@/components/InstitutionalFooter';

export const Legal: React.FC = () => {
  return (
    <div className="min-h-screen bg-charcoal font-sans text-neutral-100 antialiased selection:bg-tan/20">
      <Navbar showSearch={false} />
      <div className="pt-[calc(3.5rem+env(safe-area-inset-top,0px))] sm:pt-[calc(3.75rem+env(safe-area-inset-top,0px))]">
        <header className="border-b border-white/[0.06] py-10 sm:py-12">
          <div className="mx-auto max-w-content layout-gutter">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-500">Legal</p>
            <h1 className="mt-3 font-display text-3xl font-medium tracking-tight text-neutral-50 sm:text-4xl">Legal</h1>
            <p className="mt-3 max-w-2xl text-sm text-zinc-400">
              Disclosures, cookies, and cross-links for the General Exchange public site—not a substitute for counsel or your firm&apos;s compliance
              stack.
            </p>
          </div>
        </header>
        <article className="mx-auto max-w-content layout-gutter py-12 sm:py-14">
          <div className="max-w-3xl space-y-8 text-sm font-light leading-relaxed text-zinc-400 sm:text-base">
            <section>
              <h2 className="font-display text-lg font-medium text-neutral-100">Disclosures</h2>
              <p className="mt-2">
                General Exchange is an educational simulation platform. No content constitutes an offer to buy or sell securities or a solicitation in
                any jurisdiction. Past or simulated performance is not indicative of future results.
              </p>
            </section>
            <section>
              <h2 className="font-display text-lg font-medium text-neutral-100">Cookies and preferences</h2>
              <p className="mt-2">
                We may use cookies and similar technologies for security, preferences, and measurement. Adjust browser settings to limit cookies; some
                features may not function without them.
              </p>
            </section>
            <section>
              <h2 className="font-display text-lg font-medium text-neutral-100">Related</h2>
              <p className="mt-2">
                <Link href="/terms-and-conditions" className="text-tan/90 underline-offset-4 hover:underline">
                  Terms and Conditions
                </Link>
                {' · '}
                <Link href="/privacy-policy" className="text-tan/90 underline-offset-4 hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </section>
          </div>
        </article>
      </div>
      <InstitutionalFooter />
    </div>
  );
};

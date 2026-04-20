/**
 * Shared shell for Solutions vertical marketing pages.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { InstitutionalFooter } from '@/components/InstitutionalFooter';

const btnGhost =
  'inline-flex min-h-11 items-center justify-center rounded-lg border border-white/[0.12] bg-transparent px-5 text-sm font-semibold text-zinc-300 transition-colors hover:border-tan/35 hover:bg-white/[0.04] hover:text-tan';

export function SolutionPageLayout({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: string;
  title: string;
  lede: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-charcoal font-sans text-neutral-100 antialiased selection:bg-tan/20">
      <Navbar showSearch={false} />

      <div className="pt-[calc(3.5rem+env(safe-area-inset-top,0px))] sm:pt-[calc(3.75rem+env(safe-area-inset-top,0px))]">
        <header className="border-b border-white/[0.06] py-10 sm:py-12">
          <div className="mx-auto max-w-content layout-gutter">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-500 sm:text-[11px]">
              <span className="text-tan/90">Solutions</span>
              <span className="text-zinc-600"> · </span>
              {eyebrow}
            </p>
            <h1 className="mt-4 max-w-3xl font-display text-3xl font-medium leading-tight tracking-tight text-neutral-50 sm:text-4xl lg:text-[2.65rem]">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm font-light leading-relaxed text-zinc-400 sm:text-base">{lede}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/solutions" className={btnGhost}>
                All solutions
              </Link>
              <Link href="/" className={btnGhost}>
                Home
              </Link>
            </div>
          </div>
        </header>

        {children ? (
          <article className="mx-auto max-w-content layout-gutter py-12 sm:py-14 lg:py-16">{children}</article>
        ) : null}
      </div>

      <InstitutionalFooter />
    </div>
  );
}

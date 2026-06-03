/**
 * The Engine — the evidence layer behind general.exchange.
 *
 * Carries the demonstration that used to live in the homepage hero: the
 * backtest equity / drawdown / regime breakdown, framed by the platform's
 * evidence-first thesis.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BacktestIllustration } from '@/components/homepage/HomepageProductIllustrations';

const easeLux = [0.22, 1, 0.36, 1] as const;

const btnPrimary =
  'inline-flex min-h-11 w-full items-center justify-center rounded-md bg-tan px-6 py-3 text-sm font-semibold tracking-wide text-charcoal shadow-[0_12px_40px_-12px_rgba(210,180,140,0.35)] transition-all duration-300 hover:bg-tan-muted active:scale-[0.99] sm:w-auto sm:min-w-[10.5rem] sm:px-8 sm:py-3.5';

const btnOutline =
  'inline-flex min-h-11 w-full items-center justify-center rounded-md border border-brass/50 bg-transparent px-6 py-3 text-sm font-semibold tracking-wide text-zinc-200 transition-colors hover:border-brass hover:bg-brass/5 hover:text-tan active:scale-[0.99] sm:w-auto sm:min-w-[10.5rem] sm:px-8 sm:py-3.5';

export const TheEngine: React.FC = () => {
  return (
    <div className="min-h-screen bg-charcoal text-neutral-100">
      <header className="sticky top-0 z-30 border-b border-tan/20 bg-charcoal/95 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-content items-center justify-between layout-gutter">
          <Link href="/" className="font-display text-base tracking-tight text-neutral-100">
            general.exchange
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              href="/backspace"
              className="rounded px-2.5 py-1 text-[12px] tracking-wide text-zinc-400 transition-colors hover:text-zinc-100"
            >
              Proving ground
            </Link>
            <Link
              href="/download"
              className="rounded px-2.5 py-1 text-[12px] tracking-wide text-tan transition-colors hover:text-tan-muted"
            >
              Download App
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_70%_at_50%_-15%,rgba(46,90,58,0.12),transparent_58%)]"
          aria-hidden
        />
        <div className="relative z-10 mx-auto w-full max-w-content layout-gutter py-16 sm:py-24">
          <motion.div
            className="max-w-3xl"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeLux }}
          >
            <p className="sc-serif mb-5 text-[11px] tracking-[0.2em] text-tan/90">TRADE ENGINE</p>
            <h1 className="text-pretty font-display text-[clamp(2rem,6vw,3.5rem)] font-normal leading-[1.05] tracking-[-0.02em] text-neutral-50">
              Every decision, settled on evidence before it is made.
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-base font-normal leading-[1.75] text-zinc-400 sm:text-lg">
              A terminal for traders who would rather know than guess. Test what you are about to do against the
              conditions that actually occurred — then act on what the record tells you, not on a feeling.
            </p>
          </motion.div>

          <motion.div
            className="mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: easeLux }}
          >
            <BacktestIllustration />
          </motion.div>

          <div className="mt-12 flex w-full max-w-lg flex-col gap-3 border-t border-white/[0.06] pt-8 sm:max-w-none sm:flex-row sm:items-center">
            <Link href="/download" className={btnPrimary}>
              Download App
            </Link>
            <Link href="/backspace" className={btnOutline}>
              Open the proving ground
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

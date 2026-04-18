/**
 * Homepage hero — tall institutional band with TradeEngine CTA
 */

'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
const fadeEase = [0.22, 1, 0.36, 1] as const;
const fade = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: fadeEase },
};

export const Hero: React.FC = () => {
  return (
    <section className="relative flex min-h-[calc(100dvh-3rem)] flex-col overflow-hidden border-b border-white/[0.05] pb-24 sm:min-h-[calc(100dvh-3.5rem)] sm:pb-32 lg:pb-44">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_70%_at_50%_-15%,rgba(46,90,58,0.12),transparent_58%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_90%_20%,rgba(210,180,140,0.06),transparent_50%)]"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:72px_72px] opacity-40" />

      <div className="relative mx-auto flex w-full max-w-content flex-1 flex-col justify-center px-4 pt-16 pb-12 sm:px-6 sm:pt-20 sm:pb-16 lg:px-10 lg:pt-24 lg:pb-20">
        <div className="grid w-full items-center justify-items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:justify-items-stretch">
          <motion.div className="w-full max-w-2xl space-y-6 text-center lg:max-w-none lg:space-y-8 lg:text-left" {...fade}>
            <h1 className="font-display text-[2.5rem] sm:text-[3.125rem] lg:text-[3.5rem] xl:text-[3.75rem] leading-[1.06] font-medium tracking-[-0.02em] text-neutral-50">
              Trade Desk: Win on Wall Street
            </h1>

            <p className="mx-auto text-base sm:text-lg text-neutral-400 max-w-3xl leading-relaxed font-light lg:mx-0">
              From VaR, tail scenarios, and correlated stress paths to large-scale backtests and reinforcement-learning
              research grids, GPU-accelerated engines run under explicit governance. Manifest-bound lineage ties models,
              datasets, and kernels to reproducible results—so risk, research, and audit teams read the same deterministic
              geometry from signal generation through execution and evidence.
            </p>

            <div className="flex flex-wrap justify-center gap-3 pt-2 lg:justify-start">
              <Link
                href="/trade-engine"
                className="inline-flex items-center justify-center px-8 py-3.5 bg-tan text-charcoal text-sm font-semibold tracking-wide rounded-lg hover:bg-tan-muted transition-all duration-300 shadow-[0_12px_40px_-12px_rgba(210,180,140,0.35)]"
              >
                TradeEngine
              </Link>
              <Link
                href="/governance"
                className="inline-flex items-center justify-center px-8 py-3.5 bg-black text-white text-sm font-semibold tracking-wide rounded-lg border border-white/[0.12] transition-all duration-300 hover:bg-neutral-950 hover:border-white/[0.18]"
              >
                Governance
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="relative w-full max-w-md lg:max-w-none justify-self-center lg:justify-self-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08, ease: fadeEase }}
          >
            <figure className="relative mx-auto aspect-square w-full max-w-[min(100%,520px)] overflow-hidden rounded-xl border border-white/[0.08] bg-black/40 shadow-[0_32px_64px_-28px_rgba(0,0,0,0.65)] lg:mx-0">
              <Image
                src="/images/hero.png"
                alt="Western landscape — rider and horse at golden hour"
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 42vw"
                priority
              />
              <div
                className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-charcoal/50 via-transparent to-charcoal/35"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-t from-charcoal/55 via-transparent to-charcoal/25"
                aria-hidden
              />
              <figcaption className="sr-only">Hero artwork in public/images/hero.png</figcaption>
            </figure>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

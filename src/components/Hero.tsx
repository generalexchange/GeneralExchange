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
    <section className="relative flex min-h-[calc(100dvh-3rem)] flex-col overflow-hidden border-b border-paper-300/60 bg-paper-50 pb-24 sm:min-h-[calc(100dvh-3.5rem)] sm:pb-32 lg:pb-44">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_70%_at_50%_-15%,rgba(201,169,110,0.14),transparent_58%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_90%_80%,rgba(20,33,61,0.06),transparent_50%)]"
        aria-hidden
      />
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04] mix-blend-multiply" aria-hidden>
        <filter id="hero-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix values="0 0 0 0 0.12  0 0 0 0 0.13  0 0 0 0 0.14  0 0 0 1 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#hero-grain)" />
      </svg>

      <div className="relative z-10 mx-auto flex w-full max-w-content flex-1 flex-col justify-center px-4 pt-16 pb-12 sm:px-6 sm:pt-20 sm:pb-16 lg:px-10 lg:pt-24 lg:pb-20">
        <div className="grid w-full items-center justify-items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:justify-items-stretch">
          <motion.div className="w-full max-w-2xl space-y-6 text-center lg:max-w-none lg:space-y-8 lg:text-left" {...fade}>
            <h1 className="font-display text-[2.5rem] font-normal leading-[1.06] tracking-[-0.02em] text-graphite-900 sm:text-[3.125rem] lg:text-[3.5rem] xl:text-[3.75rem]">
              Institutional markets, built on provable compute.
            </h1>

            <p className="mx-auto max-w-3xl text-base font-normal leading-[1.75] text-graphite-700 sm:text-lg lg:mx-0">
              Research, risk, and execution on one deterministic surface. GPU-accelerated engines, manifest-bound lineage, and
              tokenized compute — so every model, dataset, and order reads the same evidence from signal to settlement.
            </p>

            <div className="flex flex-wrap justify-center gap-3 pt-2 lg:justify-start">
              <Link
                href="/trade-engine"
                className="inline-flex items-center justify-center rounded-md bg-navy px-8 py-3.5 text-sm font-semibold tracking-wide text-paper-50 shadow-[0_12px_40px_-12px_rgba(20,33,61,0.35)] transition-all duration-300 hover:bg-navy-deep"
              >
                TradeEngine
              </Link>
              <Link
                href="/governance"
                className="inline-flex items-center justify-center rounded-md border border-brass/50 bg-transparent px-8 py-3.5 text-sm font-semibold tracking-wide text-graphite-800 transition-colors hover:border-brass hover:bg-brass/5 hover:text-navy"
              >
                Governance
              </Link>
            </div>
            <div className="pt-3 text-center lg:text-left">
              <Link href="/tokenomics" className="text-[12px] text-graphite-600 transition-colors hover:text-navy">
                Read the whitepaper →
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="relative w-full max-w-md justify-self-center lg:max-w-none lg:justify-self-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08, ease: fadeEase }}
          >
            <figure className="relative mx-auto aspect-square w-full max-w-[min(100%,520px)] overflow-hidden rounded-sm border border-brass/30 bg-paper-50 shadow-[0_40px_80px_-32px_rgba(20,33,61,0.35)] lg:mx-0">
              <Image
                src="/images/hero.png"
                alt="Western landscape — rider and horse at golden hour"
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 42vw"
                priority
              />
              <div
                className="pointer-events-none absolute inset-0 rounded-sm bg-gradient-to-br from-transparent via-transparent to-paper-100/30"
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

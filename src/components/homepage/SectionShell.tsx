'use client';

import React from 'react';
import { motion } from 'framer-motion';

const easeLux = [0.22, 1, 0.36, 1] as const;

export interface SectionShellProps {
  eyebrowNum: string;
  eyebrowLabel: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  children: React.ReactNode;
  /** `primary` = charcoal, `secondary` = dark-gray band */
  tone?: 'primary' | 'secondary';
  id?: string;
  ariaLabelledBy?: string;
}

export function SectionShell({
  eyebrowNum,
  eyebrowLabel,
  title,
  lede,
  children,
  tone = 'primary',
  id,
  ariaLabelledBy,
}: SectionShellProps) {
  const bg = tone === 'primary' ? 'bg-charcoal' : 'bg-dark-gray';

  return (
    <section id={id} aria-labelledby={ariaLabelledBy} className={`relative ${bg} border-b border-white/[0.06]`}>
      <div className="rule-brass absolute inset-x-[8%] top-0 z-[1]" aria-hidden />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 0.7, ease: easeLux }}
        className="relative z-10 mx-auto w-full max-w-content px-4 py-20 sm:px-6 sm:py-24 lg:px-10 lg:py-32"
      >
        <header className="mb-10 max-w-3xl sm:mb-14">
          <p className="sc-serif mb-3 text-[11px] font-medium text-zinc-400 sm:text-xs">
            <span className="font-display text-[14px] not-italic tracking-[0.2em] text-tan/90">{eyebrowNum}</span>
            <span className="mx-3 text-zinc-600">/</span>
            <span className="text-zinc-400">{eyebrowLabel}</span>
          </p>
          <h2 className="font-display text-[2.25rem] font-normal leading-[1.08] tracking-[-0.015em] text-neutral-50 sm:text-[2.75rem] lg:text-[3.25rem]">
            {title}
          </h2>
          {lede ? (
            <div className="mt-5 max-w-2xl text-[15px] font-normal leading-[1.75] text-zinc-400 sm:text-base">{lede}</div>
          ) : null}
        </header>
        {children}
      </motion.div>
    </section>
  );
}

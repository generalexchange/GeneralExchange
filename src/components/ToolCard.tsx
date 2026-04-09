/**
 * Trading / platform tool card — tan accent, green hover
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

export interface ToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  to?: string;
  index?: number;
}

export const ToolCard: React.FC<ToolCardProps> = ({ title, description, icon: Icon, to, index = 0 }) => {
  const inner = (
    <>
      <div className="mb-5 flex items-center justify-between gap-3">
        <span className="block w-12 h-px bg-tan/60" aria-hidden />
        <Icon className="w-5 h-5 text-tan/90" strokeWidth={1.25} aria-hidden />
      </div>
      <h3 className="font-display text-xl sm:text-2xl text-neutral-50 tracking-tight mb-3 group-hover:text-tan transition-colors duration-300">
        {title}
      </h3>
      <p className="text-sm text-neutral-400 leading-relaxed group-hover:text-neutral-300 transition-colors">{description}</p>
    </>
  );

  const className =
    'group block rounded-sm border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent p-6 sm:p-8 h-full ' +
    'hover:border-institutional-green/50 hover:bg-institutional-green/[0.06] transition-all duration-300';

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
    >
      {to ? (
        <Link href={to} className={className}>
          {inner}
        </Link>
      ) : (
        <div className={className}>{inner}</div>
      )}
    </motion.div>
  );
};

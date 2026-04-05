/**
 * Compute token summary card
 */

import React from 'react';
import { motion } from 'framer-motion';
import type { ComputeTokenSpec } from '../data/computeTokens';
import { Cpu } from 'lucide-react';

export interface TokenCardProps {
  token: ComputeTokenSpec;
  index?: number;
}

export const TokenCard: React.FC<TokenCardProps> = ({ token, index = 0 }) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-sm border border-white/[0.08] bg-dark-gray/90 p-6 sm:p-8 flex flex-col h-full hover:border-tan/35 hover:shadow-[0_20px_50px_-24px_rgba(46,90,58,0.25)] transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.2em] text-tan uppercase mb-2">Token</p>
          <h3 className="font-display text-2xl sm:text-[1.65rem] text-neutral-50 tracking-tight">{token.symbol}</h3>
        </div>
        <Cpu className="w-5 h-5 text-institutional-green/80 shrink-0 mt-1" strokeWidth={1.25} aria-hidden />
      </div>
      <dl className="space-y-4 text-sm flex-1">
        <div>
          <dt className="text-[11px] uppercase tracking-wider text-neutral-500 mb-1">GPU</dt>
          <dd className="text-neutral-300 leading-relaxed">{token.gpu}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wider text-neutral-500 mb-1">HBM memory</dt>
          <dd className="text-neutral-300 leading-relaxed">{token.hbm}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wider text-neutral-500 mb-1">Ideal workloads</dt>
          <dd className="text-neutral-300 leading-relaxed">{token.workloads.join(' · ')}</dd>
        </div>
      </dl>
      <div className="mt-8 pt-6 border-t border-white/[0.08] flex items-baseline justify-between gap-4">
        <span className="text-[11px] uppercase tracking-wider text-neutral-500">Price</span>
        <div className="text-right">
          <span className="font-display text-xl text-tan tabular-nums">{token.pricePerUnit}</span>
          <span className="block text-xs text-neutral-500 mt-0.5">{token.unitLabel}</span>
        </div>
      </div>
    </motion.article>
  );
};

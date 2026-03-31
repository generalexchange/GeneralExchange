import React from 'react';
import { motion } from 'framer-motion';
import type { IntelligenceItem } from './mockMlDashboardData';

interface IntelligenceStatusBarProps {
  items: IntelligenceItem[];
}

const easeLuxury = [0.22, 1, 0.36, 1] as const;

/** Luxury mono: subtle elevation only (tone kept for a11y variety in border weight). */
const toneClasses: Record<IntelligenceItem['tone'], string> = {
  emerald: 'text-zinc-300 border-white/[0.1] bg-white/[0.04]',
  violet: 'text-zinc-300 border-white/[0.1] bg-white/[0.04]',
  amber: 'text-zinc-300 border-white/[0.1] bg-white/[0.04]',
  rose: 'text-zinc-300 border-white/[0.1] bg-white/[0.04]',
  cyan: 'text-zinc-300 border-white/[0.1] bg-white/[0.04]',
};

const listVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.02 },
  },
};

const chipVariants = {
  hidden: { opacity: 0, y: 10, filter: 'blur(4px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.4, ease: easeLuxury },
  },
};

export const IntelligenceStatusBar: React.FC<IntelligenceStatusBarProps> = ({ items }) => {
  return (
    <motion.div
      className="mb-8 flex flex-col items-center gap-2 sm:flex-row sm:flex-wrap sm:items-stretch sm:justify-start sm:gap-3"
      aria-label="Real-time intelligence feedback"
      initial="hidden"
      animate="show"
      variants={listVariants}
    >
      {items.map((item) => (
        <motion.div
          key={item.text}
          variants={chipVariants}
          className={`w-full max-w-md rounded-xl border px-3 py-2.5 text-center text-xs font-medium transition-all duration-300 hover:border-white/15 sm:w-auto sm:max-w-none sm:flex-1 sm:min-w-[200px] sm:text-left ${toneClasses[item.tone]}`}
        >
          <span className="tabular-nums">{item.text}</span>
        </motion.div>
      ))}
    </motion.div>
  );
};

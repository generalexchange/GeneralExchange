'use client';

import React from 'react';
import { motion } from 'framer-motion';

type LivePulseIndicatorProps = {
  accentClass: string;
  visible: boolean;
};

/** Robinhood-style ripple LIVE dot — 1D intraday only. */
export function LivePulseIndicator({ accentClass, visible }: LivePulseIndicatorProps) {
  if (!visible) return null;

  return (
    <div className="flex items-center justify-center gap-2 py-3">
      <span className="relative flex h-2.5 w-2.5 items-center justify-center">
        <motion.span
          className={`absolute h-2.5 w-2.5 rounded-full ${accentClass}`}
          animate={{ scale: [1, 2.8], opacity: [0.75, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
          aria-hidden
        />
        <span className={`relative h-2.5 w-2.5 rounded-full ${accentClass}`} />
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Live</span>
    </div>
  );
}

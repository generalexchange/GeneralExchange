'use client';

import { motion } from 'framer-motion';

type LegendPanelSkeletonProps = {
  label?: string;
  rows?: number;
  height?: number;
  className?: string;
};

/** Shimmer placeholder while IBKR / cache-backed panels hydrate. */
export function LegendPanelSkeleton({
  label = 'Loading…',
  rows = 3,
  height,
  className = '',
}: LegendPanelSkeletonProps) {
  return (
    <div
      className={`overflow-hidden rounded-lg border border-white/[0.08] bg-dark-gray/90 p-4 ${className}`}
      aria-busy
      aria-label={label}
    >
      <div className="mb-3 flex items-center gap-2">
        <motion.span
          className="h-2 w-2 rounded-full bg-tan/60"
          animate={{ opacity: [0.35, 1, 0.35] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">{label}</p>
      </div>
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <motion.div
            key={i}
            className="rounded bg-white/[0.05]"
            style={{ height: height ?? (i === 0 ? 48 : 28) }}
            animate={{ opacity: [0.35, 0.75, 0.35] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.12 }}
          />
        ))}
      </div>
    </div>
  );
}

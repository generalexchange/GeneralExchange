'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Database, Radio } from 'lucide-react';
import { useDesktopCacheStatus } from '@/hooks/useDesktopCacheStatus';

function ageLabel(ms: number | null): string {
  if (ms == null) return '—';
  if (ms < 1000) return 'just now';
  if (ms < 60_000) return `${Math.round(ms / 1000)}s ago`;
  return `${Math.round(ms / 60_000)}m ago`;
}

type LiveCacheStatusBarProps = {
  live: boolean;
  source?: string | null;
  symbol: string;
  loading?: boolean;
};

export function LiveCacheStatusBar({ live, source, symbol, loading }: LiveCacheStatusBarProps) {
  const cache = useDesktopCacheStatus();
  const lastAge =
    cache.lastFetchAt != null ? Date.now() - cache.lastFetchAt : cache.lastHitAt != null ? Date.now() - cache.lastHitAt : null;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-white/[0.06] bg-[#0c0d10]/90 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500 backdrop-blur-md">
      <span className="inline-flex items-center gap-2">
        {live ? (
          <>
            <span className="relative flex h-2 w-2">
              <motion.span
                className="absolute inline-flex h-full w-full rounded-full bg-emerald-400/80"
                animate={{ scale: [1, 2.2], opacity: [0.7, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
              />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <Radio className="h-3 w-3 text-emerald-400/80" />
            <span className="text-emerald-400/90">Live · {symbol}</span>
          </>
        ) : loading ? (
          <span className="inline-flex items-center gap-2 text-amber-400/90">
            <motion.span
              className="inline-block h-2 w-2 rounded-full bg-amber-400/80"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
            />
            Pulling {symbol}…
          </span>
        ) : (
          <span className="text-zinc-500">Waiting for data</span>
        )}
      </span>

      {source ? <span className="text-zinc-600">src {source}</span> : null}

      {cache.active ? (
        <span className="inline-flex items-center gap-1.5 text-zinc-600">
          <Database className="h-3 w-3" />
          Cache {cache.entries} · {cache.hits} hits · last {ageLabel(lastAge)}
        </span>
      ) : null}

      {cache.active && cache.recent.length > 0 ? (
        <span className="hidden min-w-0 flex-1 truncate text-zinc-700 lg:inline">
          {cache.recent
            .slice(0, 4)
            .map((r) => `${r.hit ? '↺' : '↓'} ${r.key.split(':')[0]}`)
            .join(' · ')}
        </span>
      ) : null}
    </div>
  );
}

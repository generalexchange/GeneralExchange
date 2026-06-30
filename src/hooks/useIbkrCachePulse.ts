'use client';

import { useEffect, useRef, useState } from 'react';
import { useDesktopCacheStatus } from '@/hooks/useDesktopCacheStatus';

/**
 * Increments when the desktop IBKR cache receives fresh data (miss/write).
 * Use as an effect dependency to re-run analytics panels without polling.
 */
export function useIbkrCachePulse(): number {
  const cache = useDesktopCacheStatus();
  const [pulse, setPulse] = useState(0);
  const lastFetchRef = useRef<number | null>(null);

  useEffect(() => {
    if (!cache.active) return;
    const prev = lastFetchRef.current;
    if (prev != null && cache.lastFetchAt != null && cache.lastFetchAt !== prev) {
      const latest = cache.recent[0];
      const key = latest?.key ?? '';
      // Chain polls fire every few seconds — skip so analytics panels stay stable.
      const isChainPoll = key.includes('options/chain') || key.includes('options-chain');
      if (!latest?.hit && !isChainPoll) {
        setPulse((n) => n + 1);
      }
    }
    lastFetchRef.current = cache.lastFetchAt;
  }, [cache.active, cache.lastFetchAt, cache.recent]);

  return pulse;
}

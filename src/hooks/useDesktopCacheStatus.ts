'use client';

import { useEffect, useState } from 'react';
import {
  getDesktopCacheStats,
  subscribeDesktopCache,
  type CacheStats,
} from '@/lib/api/desktopCache';
import { isLocalDesktopClient } from '@/lib/api/v1Fetch';

export function useDesktopCacheStatus(): CacheStats & { active: boolean } {
  const [stats, setStats] = useState<CacheStats>(() => getDesktopCacheStats());
  const active = isLocalDesktopClient();

  useEffect(() => {
    if (!active) return;
    setStats(getDesktopCacheStats());
    return subscribeDesktopCache(() => setStats(getDesktopCacheStats()));
  }, [active]);

  return { ...stats, active };
}

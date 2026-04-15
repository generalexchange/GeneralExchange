'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

export type DashboardViewId = 'overview' | 'strategies' | 'backtesting' | 'risk';

export function useDashboardView(): DashboardViewId {
  const sp = useSearchParams();
  return useMemo(() => {
    const tab = sp.get('tab');
    if (tab === 'risk') return 'risk';
    if (tab === 'strategies') return 'strategies';
    if (tab === 'backtesting') return 'backtesting';
    return 'overview';
  }, [sp]);
}

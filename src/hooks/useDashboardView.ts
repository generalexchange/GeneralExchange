'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

export type DashboardViewId = 'overview' | 'strategies' | 'risk';

export function useDashboardView(): DashboardViewId {
  const sp = useSearchParams();
  return useMemo(() => {
    const tab = sp.get('tab');
    if (tab === 'risk') return 'risk';
    if (tab === 'strategies' || tab === 'backtesting' || tab === 'research') return 'strategies';
    return 'overview';
  }, [sp]);
}

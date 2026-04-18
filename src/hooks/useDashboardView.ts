'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

export type DashboardViewId = 'overview' | 'library' | 'backspace';

export function useDashboardView(): DashboardViewId {
  const sp = useSearchParams();
  return useMemo(() => {
    const tab = sp.get('tab');
    if (tab === 'library' || tab === 'strategies' || tab === 'backtesting' || tab === 'research') return 'library';
    if (tab === 'backspace' || tab === 'risk') return 'backspace';
    return 'overview';
  }, [sp]);
}

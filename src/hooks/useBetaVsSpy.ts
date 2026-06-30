'use client';

import { useSpyRegression } from '@/hooks/useSpyRegression';

/** Live beta vs SPY from IBKR daily bars; falls back to static table. */
export function useBetaVsSpy(symbol: string): { beta: number; live: boolean; loading: boolean } {
  const { beta, live, loading } = useSpyRegression(symbol);
  return { beta, live, loading };
}

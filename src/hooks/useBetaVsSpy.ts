'use client';

import { useSpyRegression } from '@/hooks/useSpyRegression';
import { betaVsSpy } from '@/config/symbolBeta';

export function useBetaVsSpy(symbol: string): { beta: number; live: boolean; loading: boolean } {
  const { beta, live, loading } = useSpyRegression(symbol);
  return { beta: beta ?? betaVsSpy(symbol), live, loading };
}

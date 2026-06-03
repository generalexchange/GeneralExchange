import { useCallback } from 'react';
import { useUiStore } from '@/stores/uiStore';

/** Read the active symbol and provide a setter that normalizes to uppercase. */
export function useSymbol(): [string, (symbol: string) => void] {
  const activeSymbol = useUiStore((s) => s.activeSymbol);
  const set = useUiStore((s) => s.setActiveSymbol);
  const setSymbol = useCallback((symbol: string) => set(symbol), [set]);
  return [activeSymbol, setSymbol];
}

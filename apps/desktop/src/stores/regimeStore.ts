import { create } from 'zustand';
import type { RegimeState } from '@/types/signals';

interface RegimeStore {
  regime: RegimeState | null;
  setRegime: (regime: RegimeState) => void;
  reset: () => void;
}

export const useRegimeStore = create<RegimeStore>((set) => ({
  regime: null,
  setRegime: (regime) => set({ regime }),
  reset: () => set({ regime: null }),
}));

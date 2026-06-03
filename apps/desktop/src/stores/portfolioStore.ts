import { create } from 'zustand';
import type { PortfolioState } from '@/types/portfolio';
import type { Position } from '@/types/trading';

interface PortfolioStore extends PortfolioState {
  hydrated: boolean;
  setPortfolio: (state: PortfolioState) => void;
  upsertPositions: (positions: Position[]) => void;
}

const EMPTY: PortfolioState = {
  portfolioValue: 0,
  cash: 0,
  buyingPower: 0,
  openPnl: 0,
  dayPnl: 0,
  dayPnlPct: 0,
  totalPnl: 0,
  totalPnlPct: 0,
  positions: [],
  asOf: 0,
};

export const usePortfolioStore = create<PortfolioStore>((set) => ({
  ...EMPTY,
  hydrated: false,

  setPortfolio: (state) => set({ ...state, hydrated: true }),

  upsertPositions: (positions) =>
    set((state) => {
      const index = new Map(state.positions.map((p) => [p.id, p]));
      for (const p of positions) index.set(p.id, p);
      return { positions: Array.from(index.values()) };
    }),
}));

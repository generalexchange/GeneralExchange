import { create } from 'zustand';
import type { Candle, OptionRow, OptionsChainSnapshot, GexLevel, SymbolQuote } from '@/types/market';

const MAX_CANDLES = 1500;

interface MarketState {
  quote: SymbolQuote | null;
  candles: Candle[];
  chainRows: OptionRow[];
  expirations: string[];
  spot: number | null;
  gex: GexLevel[];
  /** contract selected from the chain grid, drives the order ticket */
  selectedContract: OptionRow | null;

  setQuote: (quote: SymbolQuote) => void;
  setCandles: (candles: Candle[]) => void;
  /** append a new bar, or replace the last if it shares the same open time */
  pushCandle: (candle: Candle) => void;
  applyChainSnapshot: (snapshot: OptionsChainSnapshot) => void;
  /** merge a partial set of updated chain rows (keyed by contractSymbol) */
  mergeChainRows: (rows: OptionRow[]) => void;
  setGex: (gex: GexLevel[]) => void;
  setSelectedContract: (row: OptionRow | null) => void;
  resetForSymbol: () => void;
}

export const useMarketStore = create<MarketState>((set) => ({
  quote: null,
  candles: [],
  chainRows: [],
  expirations: [],
  spot: null,
  gex: [],
  selectedContract: null,

  setQuote: (quote) => set({ quote }),

  setCandles: (candles) => set({ candles: candles.slice(-MAX_CANDLES) }),

  pushCandle: (candle) =>
    set((state) => {
      const last = state.candles[state.candles.length - 1];
      if (last && last.t === candle.t) {
        const next = state.candles.slice();
        next[next.length - 1] = candle;
        return { candles: next };
      }
      const next = state.candles.concat(candle);
      if (next.length > MAX_CANDLES) next.splice(0, next.length - MAX_CANDLES);
      return { candles: next };
    }),

  applyChainSnapshot: (snapshot) =>
    set({ chainRows: snapshot.rows, expirations: snapshot.expirations, spot: snapshot.spot }),

  mergeChainRows: (rows) =>
    set((state) => {
      if (rows.length === 0) return {};
      const index = new Map(state.chainRows.map((r) => [r.contractSymbol, r]));
      for (const r of rows) index.set(r.contractSymbol, r);
      return { chainRows: Array.from(index.values()) };
    }),

  setGex: (gex) => set({ gex }),

  setSelectedContract: (selectedContract) => set({ selectedContract }),

  resetForSymbol: () =>
    set({ candles: [], chainRows: [], expirations: [], spot: null, gex: [], selectedContract: null, quote: null }),
}));

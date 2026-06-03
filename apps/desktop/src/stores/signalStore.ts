import { create } from 'zustand';
import type { SignalEvent, NewsItem, DarkPoolPrint } from '@/types/signals';

const MAX_SIGNALS = 100;
const MAX_NEWS = 60;
const MAX_PRINTS = 80;

interface SignalStore {
  signals: SignalEvent[];
  news: NewsItem[];
  darkpool: DarkPoolPrint[];

  setSignals: (signals: SignalEvent[]) => void;
  addSignal: (signal: SignalEvent) => void;
  setNews: (news: NewsItem[]) => void;
  addNews: (item: NewsItem) => void;
  setDarkpool: (prints: DarkPoolPrint[]) => void;
  addDarkpool: (print: DarkPoolPrint) => void;
  resetForSymbol: () => void;
}

export const useSignalStore = create<SignalStore>((set) => ({
  signals: [],
  news: [],
  darkpool: [],

  setSignals: (signals) => set({ signals: signals.slice(0, MAX_SIGNALS) }),
  addSignal: (signal) => set((s) => ({ signals: [signal, ...s.signals].slice(0, MAX_SIGNALS) })),
  setNews: (news) => set({ news: news.slice(0, MAX_NEWS) }),
  addNews: (item) => set((s) => ({ news: [item, ...s.news].slice(0, MAX_NEWS) })),
  setDarkpool: (darkpool) => set({ darkpool: darkpool.slice(0, MAX_PRINTS) }),
  addDarkpool: (print) => set((s) => ({ darkpool: [print, ...s.darkpool].slice(0, MAX_PRINTS) })),
  resetForSymbol: () => set({ signals: [], news: [], darkpool: [] }),
}));

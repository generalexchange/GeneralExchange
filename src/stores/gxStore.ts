import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type {
  CandleEvent,
  MarketDataEvent,
  PortfolioEvent,
  SignalEvent,
} from '@gx/event-schema';

interface TickerState {
  price: number;
  bid: number;
  ask: number;
  lastSeq: number;
  tsExchange: number;
}

interface GxStore {
  tickers: Record<string, TickerState>;
  candles: Record<string, Record<string, CandleEvent[]>>;
  portfolio: PortfolioEvent | null;
  signals: SignalEvent[];
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
  applyMarketData: (event: MarketDataEvent) => void;
  applyCandle: (event: CandleEvent) => void;
  applyPortfolio: (event: PortfolioEvent) => void;
  applySignal: (event: SignalEvent) => void;
  setConnectionStatus: (status: GxStore['connectionStatus']) => void;
}

export const useGxStore = create<GxStore>()(
  immer((set) => ({
    tickers: {},
    candles: {},
    portfolio: null,
    signals: [],
    connectionStatus: 'disconnected',

    applyMarketData: (event) =>
      set((state) => {
        state.tickers[event.symbol] = {
          price: event.price,
          bid: event.bid,
          ask: event.ask,
          lastSeq: event.seq,
          tsExchange: event.ts_exchange,
        };
      }),

    applyCandle: (event) =>
      set((state) => {
        if (!state.candles[event.symbol]) state.candles[event.symbol] = {};
        if (!state.candles[event.symbol][event.interval]) {
          state.candles[event.symbol][event.interval] = [];
        }
        const list = state.candles[event.symbol][event.interval];
        if (event.is_final) {
          list.push(event);
          if (list.length > 500) list.shift();
        } else if (list.length > 0 && !list[list.length - 1].is_final) {
          list[list.length - 1] = event;
        } else {
          list.push(event);
        }
      }),

    applyPortfolio: (event) =>
      set((state) => {
        state.portfolio = event;
      }),

    applySignal: (event) =>
      set((state) => {
        state.signals.unshift(event);
        if (state.signals.length > 100) state.signals.pop();
      }),

    setConnectionStatus: (status) =>
      set((state) => {
        state.connectionStatus = status;
      }),
  })),
);

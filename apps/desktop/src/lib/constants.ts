import type { ChartInterval } from '@/types/market';

// ---------------------------------------------------------------------------
// Endpoints. The CSP in tauri.conf.json only permits these origins.
// ---------------------------------------------------------------------------
export const API_BASE_URL = 'https://api.general.exchange';
export const WS_URL = 'wss://ws.general.exchange/v1/stream';
export const WEB_APP_URL = 'https://general.exchange';

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------
export const DEFAULT_SYMBOL = 'QQQ';
export const DEFAULT_INTERVAL: ChartInterval = '5m';
export const RISK_FREE_RATE = 0.045;
export const CONTRACT_MULTIPLIER = 100;

// ---------------------------------------------------------------------------
// WebSocket reconnection (exponential backoff with jitter)
// ---------------------------------------------------------------------------
export const RECONNECT = {
  baseDelayMs: 500,
  maxDelayMs: 30_000,
  factor: 2,
  jitterRatio: 0.25,
} as const;

// ---------------------------------------------------------------------------
// Topic helpers — a single source of truth for pub-sub topic naming.
// ---------------------------------------------------------------------------
export const Topics = {
  ticks: (symbol: string) => `ticks.${symbol}`,
  candles: (symbol: string, interval: ChartInterval) => `candles.${symbol}.${interval}`,
  chain: (symbol: string) => `chain.${symbol}`,
  signals: (symbol: string) => `signals.${symbol}`,
  regime: (symbol: string) => `regime.${symbol}`,
  news: (symbol: string) => `news.${symbol}`,
  darkpool: (symbol: string) => `darkpool.${symbol}`,
  portfolio: 'portfolio',
  trades: 'trades',
} as const;

/** All per-symbol topics that follow the active symbol. */
export function symbolTopics(symbol: string, interval: ChartInterval): string[] {
  return [
    Topics.ticks(symbol),
    Topics.candles(symbol, interval),
    Topics.chain(symbol),
    Topics.signals(symbol),
    Topics.regime(symbol),
    Topics.news(symbol),
    Topics.darkpool(symbol),
  ];
}

/** Account-level topics that never change with the symbol. */
export const ACCOUNT_TOPICS: string[] = [Topics.portfolio, Topics.trades];

export const WATCHLIST_DEFAULT = ['QQQ', 'SPY', 'NVDA', 'AAPL', 'TSLA', 'AMD', 'MSFT', 'META'];

// ---------------------------------------------------------------------------
// Shepherd onboarding tour — five steps, attached to stable data-tour anchors.
// ---------------------------------------------------------------------------
export interface TourStepDef {
  id: string;
  attachToSelector: string;
  on: 'right' | 'left' | 'top' | 'bottom';
  title: string;
  text: string;
}

export const TOUR_STORAGE_KEY = 'ge.terminal.tourCompleted';

export const TOUR_STEPS: TourStepDef[] = [
  {
    id: 'universe',
    attachToSelector: '[data-tour="symbol-search"]',
    on: 'right',
    title: 'Your Universe',
    text: 'Search for any symbol at the top. Toggle Advanced to open the full chart, gamma exposure, and analytics workspace.',
  },
  {
    id: 'price-flow',
    attachToSelector: '[data-tour="price-chart"]',
    on: 'left',
    title: 'Price and Flow',
    text: 'Advanced view shows the 5M chart with VWAP/EMA overlays and dealer gamma by strike. Standard view is a clean live quote like Robinhood.',
  },
  {
    id: 'the-chain',
    attachToSelector: '[data-tour="options-chain"]',
    on: 'top',
    title: 'The Chain',
    text: 'Click any row in the options chain to select that contract. The order entry panel on the right populates with it instantly.',
  },
  {
    id: 'enter-position',
    attachToSelector: '[data-tour="order-entry"]',
    on: 'left',
    title: 'Enter a Position',
    text: 'Select a contract, choose Buy or Sell, enter a quantity, and submit. A confirmation modal summarizes the order before anything is sent to the backend.',
  },
  {
    id: 'environment',
    attachToSelector: '[data-tour="regime-panel"]',
    on: 'left',
    title: 'The Environment',
    text: 'The regime panel shows the current volatility environment, the trend character of the underlying, and news sentiment — the conditions that determine which strategies tend to work.',
  },
];

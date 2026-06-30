/**
 * Ultra-low-latency feed tuning — ring buffer, micro-batch, and cache TTLs.
 * Adjust here; do not scatter magic numbers across the pipeline.
 */

/** Micro-batch window: merge IBKR ticks before emitting to UI state (20–50ms). */
export const MICRO_BATCH_MS = 32;

/** Target UI frame budget (rAF interpolation reads snapshot between batches). */
export const TARGET_UI_FPS = 60;

/** Exponential smoothing for displayed price (0–1; higher = snappier). */
export const PRICE_SMOOTH_ALPHA = 0.22;

/** Skip duplicate ticks when price unchanged within this window. */
export const TICK_DEDUPE_MS = 8;

/** Per-symbol ring buffer capacity (raw ticks). */
export const TICK_RING_CAPACITY = 20_000;

/** Visual trail points retained for tape/chart fade (500–2000). */
export const VISUAL_TRAIL_POINTS = 1_200;

/** Max intraday candles kept in memory. */
export const CANDLE_RING_CAPACITY = 2_000;

/** Max tape prints per symbol. */
export const TAPE_RING_CAPACITY = 500;

/** Desktop REST cache — quote must feel live; chain/candles can be warmer. */
export const DESKTOP_REST_CACHE_MS = {
  quote: 1_500,
  candles: 12_000,
  chain: 8_000,
} as const;

/** Server /api/v1 response cache (seconds). Short for quotes; SWR extends perceived freshness. */
export const API_RESPONSE_CACHE_SEC = {
  quote: 2,
  ticks: 1,
  candles: 15,
  'options/chain': 8,
  'options/surface': 20,
  news: 90,
  signals: 15,
  regime: 15,
  default: 10,
} as const;

/** Stale-while-revalidate max age when upstream is slow (ms). */
export const API_STALE_MAX_AGE_MS = 120_000;

/** Options chain refresh for live bid/ask tape (Robinhood Legend speed). */
export const OPTIONS_CHAIN_POLL_MS = 8_000;

/** SWR multiplier cap for Cache-Control (seconds). */
export const API_SWR_CAP_SEC = 60;

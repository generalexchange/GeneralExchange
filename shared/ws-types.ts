/** Normalized tick from IBKR live stream. */
export type MarketUpdate = {
  symbol: string;
  price: number;
  volume?: number;
  timestamp: number;
  source: 'ibkr';
};

/** Real-time stream delta from /ws/market engine. */
export type MarketStreamUpdate = MarketUpdate & {
  prev_close?: number;
  change_1m?: number;
  change_5m?: number;
  change_15m?: number;
  rsi?: number;
  vwap?: number;
  volatility?: number;
  momentum_score?: number;
  seq?: number;
};

export type MarketSnapshot = MarketStreamUpdate & {
  candles_1m?: CandleUpdate[];
};

export type CandleUpdate = {
  symbol: string;
  interval: string;
  open_time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  vwap: number;
};

export type WsOutbound =
  | { type: 'market'; data: MarketUpdate }
  | { type: 'stream'; data: MarketStreamUpdate }
  | { type: 'snapshot'; data: MarketSnapshot }
  | { type: 'candle'; data: CandleUpdate; replaceLast?: boolean }
  | { type: 'pong' };

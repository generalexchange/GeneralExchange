/** Normalized tick from IBKR live stream. */
export type MarketUpdate = {
  symbol: string;
  price: number;
  volume?: number;
  timestamp: number;
  source: 'ibkr';
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
  | { type: 'candle'; data: CandleUpdate; replaceLast?: boolean };

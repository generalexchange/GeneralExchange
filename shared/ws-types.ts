/** Normalized tick from Polygon (or synthetic fallback). */
export type MarketUpdate = {
  symbol: string;
  price: number;
  volume?: number;
  timestamp: number;
  source: 'polygon' | 'massive';
};

/** Bar pushed when Polygon sends an aggregate (AM) event. */
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

// Market data shapes. Every field here is produced by the general.exchange
// backend; the terminal never computes these values, it only renders them.

export interface Tick {
  symbol: string;
  /** epoch milliseconds */
  t: number;
  price: number;
  size: number;
  /** cumulative session volume */
  volume: number;
  bid: number;
  ask: number;
}

export interface Candle {
  /** epoch milliseconds of the bar open */
  t: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  /** volume-weighted average price for the session, if provided */
  vwap?: number;
}

export type OptionType = 'call' | 'put';

export interface OptionRow {
  /** OCC-style contract symbol, unique key for grid transactions */
  contractSymbol: string;
  underlying: string;
  expiration: string; // ISO date
  strike: number;
  type: OptionType;
  bid: number;
  ask: number;
  last: number;
  mid: number;
  volume: number;
  openInterest: number;
  impliedVolatility: number;
  ivRank: number; // 0..1
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
  /** distance from spot expressed as a signed fraction (moneyness) */
  moneyness: number;
  inTheMoney: boolean;
}

export interface OptionsChainSnapshot {
  symbol: string;
  spot: number;
  asOf: number; // epoch ms
  rows: OptionRow[];
  expirations: string[];
}

export interface SurfacePoint {
  expiration: string;
  strike: number;
  iv: number;
}

export interface OptionsSurface {
  symbol: string;
  asOf: number;
  points: SurfacePoint[];
}

export interface GexLevel {
  strike: number;
  /** net dealer gamma exposure at the strike, in notional dollars */
  gamma: number;
}

export interface SymbolQuote {
  symbol: string;
  last: number;
  change: number;
  changePct: number;
  open: number;
  prevClose: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  marketStatus: 'pre' | 'open' | 'post' | 'closed';
}

export type ChartInterval = '1m' | '5m' | '15m' | '1h' | '1d';

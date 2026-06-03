import type { Position } from './trading';

export interface PortfolioState {
  /** total account value: cash + market value of open positions */
  portfolioValue: number;
  cash: number;
  buyingPower: number;
  openPnl: number;
  dayPnl: number;
  dayPnlPct: number;
  totalPnl: number;
  totalPnlPct: number;
  positions: Position[];
  asOf: number; // epoch ms
}

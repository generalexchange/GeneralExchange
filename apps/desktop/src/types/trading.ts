import type { OptionType } from './market';

export type OrderType = 'market' | 'limit' | 'stop_limit';
export type OrderSide = 'buy' | 'sell';
export type OrderStatus = 'pending' | 'filled' | 'partial' | 'cancelled' | 'rejected';

export interface OrderRequest {
  contractSymbol: string;
  underlying: string;
  side: OrderSide;
  type: OrderType;
  quantity: number; // number of contracts
  limitPrice?: number;
  stopPrice?: number;
}

export interface OrderAck {
  orderId: string;
  status: OrderStatus;
  submittedAt: number; // epoch ms
  message?: string;
}

export interface Position {
  id: string;
  contractSymbol: string;
  underlying: string;
  type: OptionType;
  strike: number;
  expiration: string;
  side: OrderSide; // long (buy) or short (sell)
  quantity: number;
  avgPrice: number; // per-contract premium paid/received
  markPrice: number; // current per-contract mark
  costBasis: number;
  marketValue: number;
  openPnl: number;
  openPnlPct: number;
  dayPnl: number;
  delta: number;
  theta: number;
  vega: number;
}

export interface TradeRecord {
  id: string;
  contractSymbol: string;
  underlying: string;
  side: OrderSide;
  quantity: number;
  entryPrice: number;
  exitPrice: number;
  realizedPnl: number;
  realizedPnlPct: number;
  openedAt: number; // epoch ms
  closedAt: number; // epoch ms
}

export type TradeLifecycleKind = 'submitted' | 'filled' | 'partial' | 'cancelled' | 'rejected' | 'closed';

export interface TradeLifecycleEvent {
  kind: TradeLifecycleKind;
  orderId: string;
  contractSymbol: string;
  message: string;
  at: number; // epoch ms
}

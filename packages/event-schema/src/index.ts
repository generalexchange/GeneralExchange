/**
 * Unified event schema — GeneralExchange Legend System Integration Whitepaper v1.0
 * Types only; zero runtime dependencies.
 */

export type EventBase = {
  seq: number;
  ts_exchange: number;
  ts_ingest: number;
  ts_emit: number;
  source: string;
  symbol: string;
  session_id: string;
};

export type MarketDataEvent = EventBase & {
  kind: 'market_data';
  price: number;
  bid: number;
  ask: number;
  bid_sz: number;
  ask_sz: number;
  last_sz: number;
  volume: number;
  vwap: number;
  tick_type: 'trade' | 'bid' | 'ask' | 'midpoint' | 'bid_ask';
  conditions: string[];
};

export type SignalEvent = EventBase & {
  kind: 'signal';
  strategy_id: string;
  strategy_version: string;
  direction: 'long' | 'short' | 'flat';
  confidence: number;
  features: Record<string, number>;
  indicators: {
    rsi?: number;
    atr?: number;
    bbands?: { upper: number; middle: number; lower: number };
    vwap?: number;
    ema_fast?: number;
    ema_slow?: number;
    [key: string]: number | object | undefined;
  };
  metadata: Record<string, unknown>;
};

export type OrderEvent = EventBase & {
  kind: 'order';
  order_id: string;
  client_order_id: string;
  order_type: 'market' | 'limit' | 'stop' | 'stop_limit';
  side: 'buy' | 'sell';
  quantity: number;
  limit_price?: number;
  stop_price?: number;
  time_in_force: 'day' | 'gtc' | 'ioc' | 'fok';
  strategy_id: string;
  signal_seq: number;
};

export type FillEvent = EventBase & {
  kind: 'fill';
  order_id: string;
  fill_id: string;
  side: 'buy' | 'sell';
  fill_qty: number;
  fill_price: number;
  commission: number;
  liquidity: 'maker' | 'taker' | 'unknown';
  is_simulated: boolean;
  slippage_bps: number;
  exec_algo: string;
};

export type PortfolioPosition = {
  symbol: string;
  qty: number;
  avg_cost: number;
  market_value: number;
  unrealized_pnl: number;
  realized_pnl: number;
  day_pnl: number;
};

export type PortfolioEvent = EventBase & {
  kind: 'portfolio';
  trigger_seq: number;
  positions: Record<string, PortfolioPosition>;
  cash: number;
  nav: number;
  gross_exposure: number;
  net_exposure: number;
  leverage: number;
  drawdown: number;
  peak_nav: number;
};

export type CandleInterval = '1s' | '5s' | '15s' | '1m' | '5m' | '15m' | '1h' | '1d';

export type CandleEvent = EventBase & {
  kind: 'candle';
  interval: CandleInterval;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  vwap: number;
  tick_count: number;
  is_final: boolean;
};

export type SystemEvent = EventBase & {
  kind: 'system';
  level: 'info' | 'warn' | 'error' | 'fatal';
  component: string;
  code: string;
  message: string;
  payload: Record<string, unknown>;
};

export type RiskScenarioEvent = EventBase & {
  kind: 'risk_scenario';
  trigger: 'new_position' | 'scheduled' | 'user_request';
  n_paths: number;
  horizon_days: number;
  results: {
    drawdown_p5: number;
    drawdown_p50: number;
    drawdown_p95: number;
    sharpe_p5: number;
    sharpe_p50: number;
    sharpe_p95: number;
    var_95: number;
    cvar_95: number;
    win_rate_p5: number;
    win_rate_p50: number;
    win_rate_p95: number;
    paths_sample: number[][];
  };
};

export type GxEventKind =
  | MarketDataEvent
  | SignalEvent
  | OrderEvent
  | FillEvent
  | PortfolioEvent
  | CandleEvent
  | SystemEvent
  | RiskScenarioEvent;

export type WsChannel = 'md' | 'candle' | 'signal' | 'portfolio' | 'system';

export type WsEnvelope = {
  ch: WsChannel;
  seq: number;
  data: GxEventKind;
};

export type WsSubscribeMsg = {
  type: 'subscribe';
  channels: WsChannel[];
  symbols: string[];
  last_seq: Partial<Record<WsChannel, number>>;
};

export type SessionHeaderEvent = {
  kind: 'session_header';
  sessionId: string;
  startTs: number;
  engineVersion: string;
  symbols: string[];
  initialCash: number;
};

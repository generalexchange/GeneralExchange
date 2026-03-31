/**
 * Mock data for ML analytics dashboard UI only — replace with API responses later.
 */

export type ModelId = 'xgboost' | 'lstm' | 'rl';

export interface PredictionPoint {
  time: string;
  actual: number;
  predicted: number;
  confidenceLow: number;
  confidenceHigh: number;
}

export interface ModelMeta {
  id: ModelId;
  name: string;
  shortDescription: string;
  status: 'active' | 'inactive';
}

export const MODELS: ModelMeta[] = [
  {
    id: 'xgboost',
    name: 'XGBoost / Gradient Boosting',
    shortDescription: 'Tree ensembles on tabular features for short-horizon level forecasts.',
    status: 'active',
  },
  {
    id: 'lstm',
    name: 'LSTM / GRU',
    shortDescription: 'Sequence models over return and volatility paths for multi-step paths.',
    status: 'active',
  },
  {
    id: 'rl',
    name: 'Reinforcement Learning',
    shortDescription: 'Policy that maps state vectors to discrete trade actions with risk caps.',
    status: 'inactive',
  },
];

export interface OrderBookLevel {
  price: number;
  size: number;
}

export const ORDER_BOOK_MOCK: { bids: OrderBookLevel[]; asks: OrderBookLevel[] } = {
  bids: [
    { price: 185.22, size: 1800 },
    { price: 185.18, size: 2400 },
    { price: 185.14, size: 900 },
    { price: 185.10, size: 3200 },
    { price: 185.06, size: 1100 },
    { price: 185.02, size: 2750 },
  ],
  asks: [
    { price: 185.26, size: 950 },
    { price: 185.30, size: 1600 },
    { price: 185.34, size: 2100 },
    { price: 185.38, size: 800 },
    { price: 185.42, size: 1900 },
    { price: 185.46, size: 1300 },
  ],
};

export const METRIC_TOOLTIPS = {
  mae: 'Mean absolute error: average absolute gap between predicted and realized price levels over the window.',
  mse: 'Mean squared error: penalizes large misses more heavily; useful for variance of forecast error.',
  rmse: 'Root mean squared error: same units as price; common scale for comparing model revisions.',
  directionalAccuracy: 'Share of intervals where predicted direction (up/down/hold) matched realized direction.',
  modelEdge:
    'Model Edge (0–100): composite of directional accuracy, recent accuracy trend, and mock volatility regime. Higher suggests stronger statistical edge before fees and slippage.',
  expectedMove:
    'Expected move (%): implied next-step return from the latest predicted vs current reference price; sign indicates bullish vs bearish tilt in the mock path.',
  targetPrice:
    'Predicted target price: model’s horizon price objective for the active mock session (not a live quote).',
  timeToTarget:
    'Time to target: mock minutes until the forecast horizon used for this dashboard preview.',
  confidenceStrength:
    'Confidence strength: normalized width of the confidence envelope and agreement with recent path error (mock).',
} as const;

export type ModelEdgeBand = 'strong' | 'neutral' | 'weak';

export interface ModelEdge {
  score: number;
  trend: 'up' | 'down' | 'flat';
  band: ModelEdgeBand;
}

export const MODEL_EDGE_BY_MODEL: Record<ModelId, ModelEdge> = {
  xgboost: { score: 78, trend: 'up', band: 'strong' },
  lstm: { score: 56, trend: 'flat', band: 'neutral' },
  rl: { score: 38, trend: 'down', band: 'weak' },
};

export interface PredictionOutlook {
  expectedMovePct: number;
  targetPrice: number;
  timeToTargetMinutes: number;
  confidenceStrength: number;
}

export interface TradeSetup {
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  riskRewardRatio: string;
  currentPrice: number;
}

export interface OptionsContext {
  impliedVolatility: number;
  delta: number;
  gamma: number;
  strikePrice: number;
  expiration: string;
}

export const OPTIONS_CONTEXT_BY_MODEL: Record<ModelId, OptionsContext> = {
  xgboost: {
    impliedVolatility: 0.28,
    delta: 0.42,
    gamma: 0.018,
    strikePrice: 186,
    expiration: 'Apr 18 · 37 DTE',
  },
  lstm: {
    impliedVolatility: 0.34,
    delta: 0.51,
    gamma: 0.022,
    strikePrice: 187.5,
    expiration: 'Apr 18 · 37 DTE',
  },
  rl: {
    impliedVolatility: 0.31,
    delta: 0.35,
    gamma: 0.015,
    strikePrice: 185,
    expiration: 'May 16 · 65 DTE',
  },
};

export type IntelligenceTone = 'emerald' | 'violet' | 'amber' | 'rose' | 'cyan';

export interface IntelligenceItem {
  text: string;
  tone: IntelligenceTone;
}

/** Last-window prediction outlook derived from series + model (mock). */
export function getPredictionOutlook(modelId: ModelId, data: PredictionPoint[]): PredictionOutlook {
  const last = data[data.length - 1];
  const prev = data[data.length - 3] ?? data[0];
  const moveFromPath = ((last.predicted - prev.actual) / prev.actual) * 100;
  const widen = modelId === 'lstm' ? 0.08 : modelId === 'rl' ? -0.05 : 0;
  const expectedMovePct = Math.round((moveFromPath + widen) * 100) / 100;
  const horizonMin = modelId === 'xgboost' ? 45 : modelId === 'lstm' ? 75 : 120;
  const bandWidth = last.confidenceHigh - last.confidenceLow;
  const confidenceStrength = Math.max(
    28,
    Math.min(98, Math.round(82 - bandWidth * 42 + (modelId === 'xgboost' ? 6 : 0))),
  );
  return {
    expectedMovePct,
    targetPrice: Math.round((last.predicted + expectedMovePct * 0.012) * 100) / 100,
    timeToTargetMinutes: horizonMin,
    confidenceStrength,
  };
}

export function buildTradeSetupFromSeries(data: PredictionPoint[], outlook: PredictionOutlook): TradeSetup {
  const last = data[data.length - 1];
  const currentPrice = last.actual;
  const risk = Math.max(0.35, Math.abs(last.actual - last.predicted) * 0.85 + 0.25);
  const entryPrice = Math.round(currentPrice * 100) / 100;
  const targetPrice = Math.round(outlook.targetPrice * 100) / 100;
  const stopLoss = Math.round((entryPrice - risk) * 100) / 100;
  const reward = Math.abs(targetPrice - entryPrice);
  const rr = reward / Math.max(0.01, entryPrice - stopLoss);
  return {
    currentPrice,
    entryPrice,
    targetPrice,
    stopLoss,
    riskRewardRatio: `1 : ${rr.toFixed(2)}`,
  };
}

export function getSignalExplanationLines(params: {
  tradeSetup: TradeSetup;
  directionalAccuracyPct: number;
  signal: 'BUY' | 'SELL' | 'HOLD';
}): [string, string] {
  const { tradeSetup, directionalAccuracyPct, signal } = params;
  const pctAbs = Math.abs(
    ((tradeSetup.targetPrice - tradeSetup.currentPrice) / tradeSetup.currentPrice) * 100,
  ).toFixed(1);
  const ref = tradeSetup.currentPrice.toFixed(2);
  const dir =
    signal === 'BUY'
      ? `BUY because predicted price is ${pctAbs}% ${
          tradeSetup.targetPrice >= tradeSetup.currentPrice ? 'above' : 'below'
        } current price (${ref}).`
      : signal === 'SELL'
        ? `SELL because predicted price is ${pctAbs}% ${
            tradeSetup.targetPrice <= tradeSetup.currentPrice ? 'below' : 'above'
          } current price (${ref}).`
        : `HOLD: mock policy sees limited edge vs current (${ref}); size down until conviction rises.`;
  const conf = `Confidence supported by ${directionalAccuracyPct.toFixed(1)}% directional accuracy (mock window).`;
  return [dir, conf];
}

export function getIntelligenceFeed(modelId: ModelId, edge: ModelEdge): IntelligenceItem[] {
  const items: IntelligenceItem[] = [];
  if (edge.band === 'strong') {
    items.push({ text: 'Model outperforming baseline', tone: 'emerald' });
  } else if (edge.band === 'weak') {
    items.push({ text: 'Edge below desk threshold — size cautiously', tone: 'rose' });
  } else {
    items.push({ text: 'Model near neutral vs historical baseline', tone: 'cyan' });
  }
  if (edge.trend === 'up') {
    items.push({ text: 'Confidence increasing vs prior session', tone: 'violet' });
  } else if (edge.trend === 'down') {
    items.push({ text: 'Confidence rolling over — watch calibration', tone: 'amber' });
  } else {
    items.push({ text: 'Confidence stable — monitor for volatility shifts', tone: 'violet' });
  }
  if (modelId === 'lstm') {
    items.push({ text: 'Volatility expanding in mock path', tone: 'amber' });
  } else {
    items.push({ text: 'Volatility regime: controlled (mock)', tone: 'cyan' });
  }
  return items.slice(0, 3);
}

export const PRICE_SERIES: PredictionPoint[] = [
  { time: '09:30', actual: 182.4, predicted: 182.1, confidenceLow: 181.2, confidenceHigh: 183.1 },
  { time: '09:45', actual: 182.9, predicted: 182.6, confidenceLow: 181.6, confidenceHigh: 183.5 },
  { time: '10:00', actual: 183.2, predicted: 183.5, confidenceLow: 182.1, confidenceHigh: 184.2 },
  { time: '10:15', actual: 182.7, predicted: 183.1, confidenceLow: 181.8, confidenceHigh: 184.0 },
  { time: '10:30', actual: 183.8, predicted: 183.2, confidenceLow: 182.3, confidenceHigh: 184.1 },
  { time: '10:45', actual: 184.1, predicted: 184.0, confidenceLow: 182.9, confidenceHigh: 185.0 },
  { time: '11:00', actual: 183.5, predicted: 183.9, confidenceLow: 182.7, confidenceHigh: 184.8 },
  { time: '11:15', actual: 184.4, predicted: 184.1, confidenceLow: 183.0, confidenceHigh: 185.2 },
  { time: '11:30', actual: 184.9, predicted: 184.6, confidenceLow: 183.5, confidenceHigh: 185.5 },
  { time: '11:45', actual: 185.1, predicted: 184.8, confidenceLow: 183.8, confidenceHigh: 185.8 },
  { time: '12:00', actual: 184.6, predicted: 185.0, confidenceLow: 183.9, confidenceHigh: 186.1 },
  { time: '12:15', actual: 185.3, predicted: 185.1, confidenceLow: 184.1, confidenceHigh: 186.0 },
];

/** Live market mock: price + volume aligned to prediction timestamps */
export const MARKET_SERIES = PRICE_SERIES.map((p, i) => ({
  time: p.time,
  price: p.actual,
  volume: 1_420_000 + i * 52_000 + (i % 3) * 18_000,
}));

/** Mock opening equity for paper portfolio chart (scales with MARKET_SERIES path). */
export const PAPER_SESSION_OPEN_EQUITY: number = 127_842.51;

export interface PaperAccountSnapshot {
  accountLabel: string;
  sessionOpenEquity: number;
  equityNow: number;
  buyingPower: number;
  dayChange: number;
  dayChangePercent: number;
}

/** Paper account header stats: equity moves 1:1 with mock benchmark path (single-asset proxy). */
export function getPaperAccountSnapshot(market: { price: number }[]): PaperAccountSnapshot {
  const p0 = market[0]?.price ?? 1;
  const pN = market[market.length - 1]?.price ?? p0;
  const sessionOpenEquity = PAPER_SESSION_OPEN_EQUITY;
  const equityNow = Math.round(sessionOpenEquity * (pN / p0) * 100) / 100;
  const dayChange = Math.round((equityNow - sessionOpenEquity) * 100) / 100;
  const dayChangePercent =
    sessionOpenEquity !== 0 ? Math.round((dayChange / sessionOpenEquity) * 10000) / 100 : 0;
  return {
    accountLabel: 'Paper portfolio',
    sessionOpenEquity,
    equityNow,
    buyingPower: Math.round(sessionOpenEquity * 0.352 * 100) / 100,
    dayChange,
    dayChangePercent,
  };
}

export type MarketPointWithEquity = {
  time: string;
  price: number;
  volume: number;
  equity: number;
};

export function enrichMarketWithPaperEquity(
  market: { time: string; price: number; volume: number }[],
  sessionOpenEquity: number,
): MarketPointWithEquity[] {
  const p0 = market[0]?.price ?? 1;
  return market.map((row) => ({
    ...row,
    equity: Math.round(sessionOpenEquity * (row.price / p0) * 100) / 100,
  }));
}

export const METRICS_MOCK = {
  mae: { value: '0.42', trend: 'down' as const },
  mse: { value: '0.31', trend: 'down' as const },
  rmse: { value: '0.56', trend: 'up' as const },
  directionalAccuracy: { value: '62.4%', trend: 'up' as const },
  theoVsMarketError: { value: '0.18', trend: 'down' as const },
  deltaAccuracy: { value: '71.2%', trend: 'up' as const },
};

export type DashboardMetrics = typeof METRICS_MOCK;

export const CONFUSION_MATRIX = [
  { predicted: 'Up', actuals: { Up: 428, Down: 112, Hold: 34 } },
  { predicted: 'Down', actuals: { Up: 98, Down: 391, Hold: 41 } },
  { predicted: 'Hold', actuals: { Up: 44, Down: 52, Hold: 208 } },
];

export const STRATEGY_SIGNAL = {
  current: 'BUY' as const,
  confidencePct: 78,
  recent: [
    { id: '1', time: '12:14:02', signal: 'BUY' as const, confidence: 76 },
    { id: '2', time: '12:02:18', signal: 'HOLD' as const, confidence: 52 },
    { id: '3', time: '11:47:55', signal: 'SELL' as const, confidence: 64 },
    { id: '4', time: '11:31:40', signal: 'BUY' as const, confidence: 81 },
  ],
};

/** Directional accuracy numeric for copy in execution layer (matches METRICS_MOCK string). */
export function getDirectionalAccuracyPct(): number {
  return 62.4;
}

export const ROLLING_ACCURACY = [
  { t: 'Mon', acc: 58 },
  { t: 'Tue', acc: 60 },
  { t: 'Wed', acc: 59 },
  { t: 'Thu', acc: 61 },
  { t: 'Fri', acc: 62 },
  { t: 'Sat', acc: 61 },
  { t: 'Sun', acc: 63 },
];

export const ERROR_OVER_TIME = [
  { t: 'W1', err: 0.72 },
  { t: 'W2', err: 0.65 },
  { t: 'W3', err: 0.58 },
  { t: 'W4', err: 0.55 },
  { t: 'W5', err: 0.52 },
  { t: 'W6', err: 0.48 },
];

/** Slightly different predicted paths per model (front-end mock only). */
export function getPredictionSeriesForModel(modelId: ModelId): PredictionPoint[] {
  const shift = modelId === 'lstm' ? 0.12 : modelId === 'rl' ? -0.18 : 0;
  const widen = modelId === 'lstm' ? 0.15 : modelId === 'rl' ? 0.05 : 0;
  return PRICE_SERIES.map((p) => ({
    ...p,
    predicted: Math.round((p.predicted + shift) * 100) / 100,
    confidenceLow: p.confidenceLow - widen,
    confidenceHigh: p.confidenceHigh + widen,
  }));
}

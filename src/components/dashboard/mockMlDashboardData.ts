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

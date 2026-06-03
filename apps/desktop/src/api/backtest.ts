import { apiClient } from '@/api/client';

export interface BacktestRequest {
  strategyId: string;
  symbol: string;
  start: string; // ISO date
  end: string; // ISO date
  parameters: Record<string, number | string | boolean>;
}

export interface BacktestSummary {
  runId: string;
  status: 'queued' | 'running' | 'complete' | 'failed';
  totalReturnPct?: number;
  sharpe?: number;
  maxDrawdownPct?: number;
  winRatePct?: number;
  profitFactor?: number;
}

export interface BacktestResult extends BacktestSummary {
  equityCurve: { t: number; equity: number; drawdown: number }[];
  monthlyReturns: { month: string; returnPct: number }[];
}

export const backtestApi = {
  submit: (req: BacktestRequest) => apiClient.post<BacktestSummary>('/v1/backtest/runs', req),

  status: (runId: string, signal?: AbortSignal) =>
    apiClient.get<BacktestSummary>(`/v1/backtest/runs/${runId}`, signal),

  result: (runId: string, signal?: AbortSignal) =>
    apiClient.get<BacktestResult>(`/v1/backtest/runs/${runId}/result`, signal),
};

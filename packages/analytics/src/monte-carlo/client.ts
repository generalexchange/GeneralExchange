import type { TradeEvaluationInput, TradeEvaluationOutput } from '../types/dashboard';
import {
  simulatePricePaths,
  simulateStrategyOutcome,
  simulateTradeQuality,
} from './simulations';
import type { PricePathInput, PricePathOutput } from './types';
import type { StrategySimulationInput, StrategySimulationOutput } from './types';
import type { TradeQualityInput, TradeQualityOutput } from './types';

/** Public proxy path on general.exchange (Next.js forwards to compute server). */
export const DEFAULT_MONTE_CARLO_PUBLIC_PATH = '/api/v1/monte-carlo';

function trimUrl(url: string): string {
  return url.replace(/\/$/, '');
}

/** Browser / client-side base URL (defaults to same-origin proxy). */
export function getMonteCarloClientUrl(): string | null {
  const fromEnv =
    typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_MONTE_CARLO_API_URL?.trim() : undefined;
  if (fromEnv === '') return null;
  if (fromEnv) return trimUrl(fromEnv);
  if (typeof window !== 'undefined') return DEFAULT_MONTE_CARLO_PUBLIC_PATH;
  return null;
}

export function isMonteCarloRemoteEnabled(): boolean {
  return getMonteCarloClientUrl() != null;
}

async function postRemote<T>(route: string, body: unknown): Promise<T> {
  const base = getMonteCarloClientUrl();
  if (!base) throw new Error('Monte Carlo remote URL is not configured');

  const res = await fetch(`${base}/${route}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Monte Carlo I/O failed (${res.status}): ${detail.slice(0, 200)}`);
  }

  return res.json() as Promise<T>;
}

/** Price-path simulation — remote when configured, else in-process. */
export async function simulatePricePathsIO(input: PricePathInput): Promise<PricePathOutput> {
  if (!isMonteCarloRemoteEnabled()) return simulatePricePaths(input);
  return postRemote<PricePathOutput>('price-path', input);
}

export async function simulateStrategyOutcomeIO(
  input: StrategySimulationInput,
): Promise<StrategySimulationOutput> {
  if (!isMonteCarloRemoteEnabled()) return simulateStrategyOutcome(input);
  return postRemote<StrategySimulationOutput>('strategy', input);
}

export async function simulateTradeQualityIO(input: TradeQualityInput): Promise<TradeQualityOutput> {
  if (!isMonteCarloRemoteEnabled()) return simulateTradeQuality(input);
  return postRemote<TradeQualityOutput>('trade-quality', input);
}

export async function evaluateTradeIO(input: TradeEvaluationInput): Promise<TradeEvaluationOutput> {
  if (!isMonteCarloRemoteEnabled()) {
    const { evaluateTrade } = await import('../scoring/TradeEvaluationEngine');
    return evaluateTrade(input);
  }
  return postRemote<TradeEvaluationOutput>('evaluate', input);
}

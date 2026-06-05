/** Static beta vs SPY — replace with regression API when available. */
export const SYMBOL_BETA: Record<string, number> = {
  SPY: 1.0,
  QQQ: 1.12,
  AAPL: 1.24,
  MSFT: 0.98,
  NVDA: 1.86,
  TSLA: 2.04,
};

export function betaVsSpy(symbol: string): number {
  return SYMBOL_BETA[symbol.toUpperCase()] ?? 1.0;
}

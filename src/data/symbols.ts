/** Tradeable symbols for the dashboard selector (no mock prices). */
export const TRADEABLE_SYMBOLS = ['SPY', 'QQQ', 'AAPL', 'MSFT', 'NVDA', 'TSLA'] as const;

export type TradeableSymbol = (typeof TRADEABLE_SYMBOLS)[number];

const NAMES: Record<string, string> = {
  SPY: 'SPDR S&P 500 ETF Trust',
  QQQ: 'Invesco QQQ Trust',
  AAPL: 'Apple Inc.',
  MSFT: 'Microsoft Corporation',
  NVDA: 'NVIDIA Corporation',
  TSLA: 'Tesla, Inc.',
};

export function symbolDisplayName(symbol: string): string {
  return NAMES[symbol.toUpperCase()] ?? symbol;
}

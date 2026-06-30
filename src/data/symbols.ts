/** Tradeable symbols for the dashboard quick-pick dropdown. */
import { TOP_SYMBOLS, SYMBOL_NAMES } from './topSymbols';

export const TRADEABLE_SYMBOLS = ['SPY', 'QQQ', 'AAPL', 'MSFT', 'NVDA', 'TSLA'] as const;

export type TradeableSymbol = (typeof TRADEABLE_SYMBOLS)[number];

/** All searchable symbols (top liquid US names + ETFs). */
export const SEARCHABLE_SYMBOLS = [...new Set(TOP_SYMBOLS)];

export function symbolDisplayName(symbol: string): string {
  return SYMBOL_NAMES[symbol.toUpperCase()] ?? symbol;
}

export function isSearchableSymbol(symbol: string): boolean {
  return SEARCHABLE_SYMBOLS.includes(symbol.toUpperCase());
}

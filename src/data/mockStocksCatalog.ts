/**
 * Shared mock equity catalog for search / spot reference (UI only).
 */

export interface CatalogStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  marketCap: string;
}

/** All keys including aliases (APPLE → AAPL). */
export const MOCK_STOCKS_BY_KEY: Record<string, CatalogStock> = {
  AAPL: { symbol: 'AAPL', name: 'Apple Inc.', price: 178.45, change: -1.23, changePercent: -0.68, volume: '58.3M', marketCap: '$2.8T' },
  MSFT: { symbol: 'MSFT', name: 'Microsoft Corporation', price: 372.15, change: 5.89, changePercent: 1.61, volume: '32.1M', marketCap: '$2.8T' },
  NVDA: { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 456.23, change: 12.45, changePercent: 2.81, volume: '45.2M', marketCap: '$1.1T' },
  AMZN: { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 142.38, change: -1.24, changePercent: -0.86, volume: '28.7M', marketCap: '$1.5T' },
  META: { symbol: 'META', name: 'Meta Platforms Inc.', price: 312.45, change: 8.92, changePercent: 2.94, volume: '18.3M', marketCap: '$800B' },
  GOOG: { symbol: 'GOOG', name: 'Alphabet Inc. Class C', price: 138.92, change: 1.47, changePercent: 1.07, volume: '25.4M', marketCap: '$1.7T' },
  GOOGL: { symbol: 'GOOGL', name: 'Alphabet Inc. Class A', price: 139.15, change: 1.52, changePercent: 1.1, volume: '22.8M', marketCap: '$1.7T' },
  TSLA: { symbol: 'TSLA', name: 'Tesla, Inc.', price: 258.67, change: 8.92, changePercent: 3.57, volume: '102.5M', marketCap: '$822.1B' },
  'BRK.B': {
    symbol: 'BRK.B',
    name: 'Berkshire Hathaway Inc. Class B',
    price: 345.67,
    change: 2.34,
    changePercent: 0.68,
    volume: '8.2M',
    marketCap: '$800B',
  },
  JPM: { symbol: 'JPM', name: 'JPMorgan Chase & Co.', price: 145.23, change: 1.89, changePercent: 1.32, volume: '12.4M', marketCap: '$450B' },
  GS: { symbol: 'GS', name: 'Goldman Sachs Group Inc.', price: 378.45, change: 5.67, changePercent: 1.52, volume: '2.8M', marketCap: '$120B' },
  V: { symbol: 'V', name: 'Visa Inc.', price: 245.78, change: 3.45, changePercent: 1.42, volume: '6.8M', marketCap: '$520B' },
  MA: { symbol: 'MA', name: 'Mastercard Incorporated', price: 412.56, change: 5.23, changePercent: 1.28, volume: '4.2M', marketCap: '$400B' },
  COIN: { symbol: 'COIN', name: 'Coinbase Global Inc.', price: 245.67, change: 12.34, changePercent: 5.28, volume: '8.9M', marketCap: '$58B' },
  MSTR: { symbol: 'MSTR', name: 'MicroStrategy Incorporated', price: 1234.56, change: 45.67, changePercent: 3.84, volume: '1.2M', marketCap: '$21B' },
  UNH: {
    symbol: 'UNH',
    name: 'UnitedHealth Group Incorporated',
    price: 523.45,
    change: 8.92,
    changePercent: 1.73,
    volume: '3.2M',
    marketCap: '$490B',
  },
  JNJ: { symbol: 'JNJ', name: 'Johnson & Johnson', price: 156.78, change: 1.23, changePercent: 0.79, volume: '8.9M', marketCap: '$420B' },
  LLY: { symbol: 'LLY', name: 'Eli Lilly and Company', price: 612.34, change: 15.67, changePercent: 2.63, volume: '2.1M', marketCap: '$580B' },
  PFE: { symbol: 'PFE', name: 'Pfizer Inc.', price: 28.45, change: -0.34, changePercent: -1.18, volume: '45.2M', marketCap: '$160B' },
  ABBV: { symbol: 'ABBV', name: 'AbbVie Inc.', price: 156.23, change: 2.45, changePercent: 1.59, volume: '8.7M', marketCap: '$280B' },
  XOM: { symbol: 'XOM', name: 'Exxon Mobil Corporation', price: 108.45, change: 1.23, changePercent: 1.15, volume: '18.3M', marketCap: '$450B' },
  CVX: { symbol: 'CVX', name: 'Chevron Corporation', price: 156.78, change: 2.34, changePercent: 1.51, volume: '12.6M', marketCap: '$290B' },
  WMT: { symbol: 'WMT', name: 'Walmart Inc.', price: 156.23, change: 1.45, changePercent: 0.94, volume: '8.9M', marketCap: '$520B' },
  PG: { symbol: 'PG', name: 'The Procter & Gamble Company', price: 145.67, change: 0.89, changePercent: 0.61, volume: '6.2M', marketCap: '$350B' },
  HD: { symbol: 'HD', name: 'The Home Depot Inc.', price: 312.45, change: 4.23, changePercent: 1.37, volume: '4.8M', marketCap: '$320B' },
  COST: { symbol: 'COST', name: 'Costco Wholesale Corporation', price: 678.9, change: 8.45, changePercent: 1.26, volume: '2.1M', marketCap: '$300B' },
  MCD: { symbol: 'MCD', name: "McDonald's Corporation", price: 245.67, change: 2.34, changePercent: 0.96, volume: '3.4M', marketCap: '$180B' },
  KO: { symbol: 'KO', name: 'The Coca-Cola Company', price: 58.23, change: 0.45, changePercent: 0.78, volume: '12.8M', marketCap: '$250B' },
  CSCO: { symbol: 'CSCO', name: 'Cisco Systems Inc.', price: 48.56, change: 0.67, changePercent: 1.4, volume: '18.9M', marketCap: '$200B' },
  ORCL: { symbol: 'ORCL', name: 'Oracle Corporation', price: 112.34, change: 1.89, changePercent: 1.71, volume: '15.2M', marketCap: '$310B' },
  CRM: { symbol: 'CRM', name: 'Salesforce Inc.', price: 245.67, change: 4.23, changePercent: 1.75, volume: '8.4M', marketCap: '$250B' },
  AMD: { symbol: 'AMD', name: 'Advanced Micro Devices Inc.', price: 134.56, change: 3.45, changePercent: 2.63, volume: '45.2M', marketCap: '$220B' },
  INTC: { symbol: 'INTC', name: 'Intel Corporation', price: 42.34, change: 0.89, changePercent: 2.15, volume: '28.7M', marketCap: '$180B' },
  IBM: {
    symbol: 'IBM',
    name: 'International Business Machines Corporation',
    price: 142.35,
    change: 2.47,
    changePercent: 1.77,
    volume: '4.2M',
    marketCap: '$131.2B',
  },
  APPLE: { symbol: 'AAPL', name: 'Apple Inc.', price: 178.45, change: -1.23, changePercent: -0.68, volume: '58.3M', marketCap: '$2.8T' },
  TESLA: { symbol: 'TSLA', name: 'Tesla, Inc.', price: 258.67, change: 8.92, changePercent: 3.57, volume: '102.5M', marketCap: '$822.1B' },
};

function uniqueBySymbol(): Map<string, CatalogStock> {
  const map = new Map<string, CatalogStock>();
  for (const stock of Object.values(MOCK_STOCKS_BY_KEY)) {
    if (!map.has(stock.symbol)) map.set(stock.symbol, stock);
  }
  return map;
}

const UNIQUE = uniqueBySymbol();

/** Deduplicated list for chain / search UI. */
export function listUniqueStocks(): CatalogStock[] {
  return [...UNIQUE.values()].sort((a, b) => a.symbol.localeCompare(b.symbol));
}

export function getCatalogStockBySymbol(symbol: string): CatalogStock | undefined {
  return UNIQUE.get(symbol.trim().toUpperCase());
}

/** Lookup including aliases (e.g. APPLE → AAPL). */
export function getCatalogStockByQuery(query: string): CatalogStock | undefined {
  const q = query.trim().toUpperCase();
  if (!q) return undefined;
  return MOCK_STOCKS_BY_KEY[q] ?? UNIQUE.get(q);
}

export function searchCatalogStocks(query: string, limit = 12): CatalogStock[] {
  const q = query.trim().toUpperCase();
  if (!q) return [];
  const all = listUniqueStocks();
  return all
    .filter((stock) => {
      const symbolMatch = stock.symbol.includes(q);
      const nameMatch = stock.name.toUpperCase().includes(q);
      const wordsMatch = stock.name
        .toUpperCase()
        .split(' ')
        .some((word) => word.startsWith(q) && word.length > 2);
      return symbolMatch || nameMatch || wordsMatch;
    })
    .slice(0, limit);
}

export function countCatalogKeys(): number {
  return Object.keys(MOCK_STOCKS_BY_KEY).length;
}

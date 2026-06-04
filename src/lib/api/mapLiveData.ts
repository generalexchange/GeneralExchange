import type { Candle, GexBar, NewsRow, OptionRow } from '@/components/dashboard/terminal/terminalData';

type PolygonChainRow = {
  expiration_date?: string;
  strike?: number;
  option_type?: string;
  bid?: number;
  ask?: number;
  mid?: number;
  last?: number;
  volume?: number;
  open_interest?: number;
  implied_volatility?: number;
  delta?: number;
  gamma?: number;
  theta?: number;
  vega?: number;
  underlying_price?: number;
};

type PolygonNewsRow = {
  id?: string;
  title?: string;
  author?: string;
  published_at?: string;
  url?: string;
  symbols?: string[];
  summary?: string;
  sentiment?: number;
};

export function mapPolygonChain(rows: PolygonChainRow[], spot: number): OptionRow[] {
  return rows.map((r, i) => {
    const strike = r.strike ?? 0;
    const type = r.option_type === 'PUT' ? 'PUT' : 'CALL';
    const moneyness =
      Math.abs(strike - spot) / spot < 0.005
        ? 'ATM'
        : type === 'CALL'
          ? strike < spot
            ? 'ITM'
            : 'OTM'
          : strike > spot
            ? 'ITM'
            : 'OTM';
    return {
      id: `${type}-${strike}-${r.expiration_date ?? i}`,
      strike,
      type,
      bid: r.bid ?? 0,
      ask: r.ask ?? 0,
      mid: r.mid ?? 0,
      lastTraded: r.last ?? r.mid ?? 0,
      volume: r.volume ?? 0,
      openInterest: r.open_interest ?? 0,
      iv: r.implied_volatility ?? 0,
      ivRank: 50,
      moneyness,
      delta: r.delta ?? 0,
      gamma: r.gamma ?? 0,
      theta: r.theta ?? 0,
      vega: r.vega ?? 0,
      rho: 0,
      lambda: 0,
      epsilon: 0,
      charm: 0,
      vanna: 0,
      volga: 0,
      speed: 0,
      zomma: 0,
      color: 0,
      price: r.mid ?? 0,
      timestamp: Date.now(),
    };
  });
}

export function computeGexFromChain(chain: OptionRow[], spot: number): GexBar[] {
  const byStrike = new Map<number, number>();
  for (const row of chain) {
    const sign = row.type === 'CALL' ? 1 : -1;
    const gex = sign * row.openInterest * row.gamma * spot * spot * 0.0001;
    byStrike.set(row.strike, (byStrike.get(row.strike) ?? 0) + gex);
  }
  return [...byStrike.entries()]
    .map(([strike, gex]) => ({ strike, gex: gex / 1_000_000 }))
    .sort((a, b) => a.strike - b.strike)
    .slice(0, 40);
}

export function mapPolygonNews(rows: PolygonNewsRow[]): NewsRow[] {
  return rows.map((a, i) => ({
    id: a.id ?? `news-${a.published_at ?? Date.now()}-${i}`,
    time: a.published_at ? Date.parse(a.published_at) : Date.now(),
    source: a.author ?? 'Polygon',
    headline: a.title ?? '',
    sentiment: (a.sentiment ?? 0) > 0.1 ? 'POS' : (a.sentiment ?? 0) < -0.1 ? 'NEG' : 'NEU',
    impact: Math.min(1, Math.abs(a.sentiment ?? 0)),
  }));
}

export type CandleRow = {
  open_time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  vwap?: number;
};

export function mapCandleRows(rows: CandleRow[]): Candle[] {
  return rows
    .map((row) => ({
      t: Date.parse(row.open_time),
      o: row.open,
      h: row.high,
      l: row.low,
      c: row.close,
      v: row.volume,
      vwap: row.vwap ?? (row.open + row.close) / 2,
    }))
    .filter((c) => c.t > 0);
}

export function chainExpirations(chain: OptionRow[]): string[] {
  const set = new Set<string>();
  for (const row of chain) {
    const match = row.id.match(/(\d{4}-\d{2}-\d{2})/);
    if (match) set.add(match[1]);
  }
  return [...set].sort();
}

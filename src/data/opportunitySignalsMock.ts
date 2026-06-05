export type OpportunitySignal = {
  id: string;
  symbol: string;
  optionType: 'CALL' | 'PUT';
  strike: number;
  expiration: string;
  expectedReturn: number;
  confidence: number;
  delta: number;
  theta: number;
  vega: number;
  pinned?: boolean;
  createdAt: number;
};

const TICKERS = ['SPY', 'QQQ', 'NVDA', 'TSLA', 'AAPL', 'MSFT'] as const;

function rand(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Mock Monte Carlo / correlation signals — swap for live MC stream. */
export function generateMockOpportunitySignal(seed = Date.now()): OpportunitySignal {
  const r = rand(seed);
  const symbol = TICKERS[Math.floor(r() * TICKERS.length)];
  const optionType: 'CALL' | 'PUT' = r() > 0.45 ? 'CALL' : 'PUT';
  const spot = symbol === 'SPY' ? 550 : symbol === 'NVDA' ? 130 : 200;
  const strike = Math.round((spot + (r() - 0.5) * spot * 0.08) * 2) / 2;
  const confidence = Math.round(55 + r() * 44);
  const expectedReturn = Math.round((r() * 2400 + 120) * (confidence / 100));

  const exp = new Date();
  exp.setDate(exp.getDate() + 7 + Math.floor(r() * 21));

  return {
    id: `sig-${seed}-${Math.floor(r() * 1e6)}`,
    symbol,
    optionType,
    strike,
    expiration: exp.toISOString().slice(0, 10),
    expectedReturn,
    confidence,
    delta: Math.round((optionType === 'CALL' ? 0.35 + r() * 0.4 : -0.75 + r() * 0.35) * 100) / 100,
    theta: Math.round((-0.02 - r() * 0.08) * 1000) / 1000,
    vega: Math.round((0.08 + r() * 0.22) * 1000) / 1000,
    createdAt: Date.now(),
  };
}

export const OPPORTUNITY_FEED_TTL_MS = 12_000;

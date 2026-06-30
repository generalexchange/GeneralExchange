/** Lexicon sentiment — mirrors backend/python/common/nlp.py for client-side scoring. */

const POSITIVE = new Set([
  'beat', 'beats', 'surge', 'surges', 'soar', 'rally', 'record', 'growth', 'strong', 'upgrade',
  'upgraded', 'outperform', 'bullish', 'gain', 'gains', 'jumps', 'tops', 'raises', 'expands',
  'profit', 'wins', 'approval', 'breakthrough', 'optimistic', 'rebound', 'buy', 'accumulate',
  'institutional', 'inflow', 'outflow', 'momentum',
]);

const NEGATIVE = new Set([
  'miss', 'misses', 'plunge', 'plunges', 'slump', 'selloff', 'weak', 'downgrade', 'downgraded',
  'underperform', 'bearish', 'loss', 'losses', 'falls', 'drops', 'cuts', 'warning', 'warns',
  'probe', 'lawsuit', 'recall', 'bankruptcy', 'fraud', 'investigation', 'slowdown', 'layoffs',
  'sell', 'distribution', 'risk-off',
]);

const IMPACT_KEYWORDS: Record<string, number> = {
  earnings: 0.4, guidance: 0.4, fed: 0.5, fomc: 0.5, rate: 0.35, cpi: 0.45,
  inflation: 0.4, sec: 0.4, merger: 0.45, acquisition: 0.45, bankruptcy: 0.6,
  downgrade: 0.4, upgrade: 0.35, recall: 0.4, lawsuit: 0.35, halt: 0.5,
  institutional: 0.35, block: 0.3, options: 0.25, gamma: 0.2,
};

function tokenize(text: string): string[] {
  return text.toLowerCase().match(/[a-z0-9&]+/g) ?? [];
}

export function sentimentScore(text: string): number {
  const toks = tokenize(text);
  let pos = 0;
  let neg = 0;
  for (const t of toks) {
    if (POSITIVE.has(t)) pos += 1;
    if (NEGATIVE.has(t)) neg += 1;
  }
  if (pos + neg === 0) return 0;
  return Math.round(((pos - neg) / (pos + neg)) * 10000) / 10000;
}

export function impactScore(text: string, sentiment: number): number {
  const toks = new Set(tokenize(text));
  let kw = 0;
  for (const [k, w] of Object.entries(IMPACT_KEYWORDS)) {
    if (toks.has(k)) kw = Math.max(kw, w);
  }
  const base = 0.5 * kw + 0.3 * Math.abs(sentiment) + 0.2 * Math.min(1, toks.size / 20);
  return Math.round(Math.min(1, Math.max(0, base)) * 10000) / 10000;
}

export function regimeFromSentiment(sentiment: number, impact: number): 'RISK_ON' | 'RISK_OFF' | 'NEUTRAL' {
  if (impact < 0.35) return 'NEUTRAL';
  if (sentiment <= -0.3) return 'RISK_OFF';
  if (sentiment >= 0.3) return 'RISK_ON';
  return 'NEUTRAL';
}

export type NewsHeadline = { title: string; source?: string; publishedAt?: string };

export function aggregateHeadlineSentiment(headlines: NewsHeadline[]): {
  sentiment: number;
  impact: number;
  regime: 'RISK_ON' | 'RISK_OFF' | 'NEUTRAL';
  headlineCount: number;
} {
  if (!headlines.length) {
    return { sentiment: 0, impact: 0, regime: 'NEUTRAL', headlineCount: 0 };
  }
  let sumSent = 0;
  let sumImpact = 0;
  for (const h of headlines) {
    const s = sentimentScore(h.title);
    sumSent += s;
    sumImpact += impactScore(h.title, s);
  }
  const n = headlines.length;
  const sentiment = Math.round((sumSent / n) * 10000) / 10000;
  const impact = Math.round((sumImpact / n) * 10000) / 10000;
  return {
    sentiment,
    impact,
    regime: regimeFromSentiment(sentiment, impact),
    headlineCount: n,
  };
}

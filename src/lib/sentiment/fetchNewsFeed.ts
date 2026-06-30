import { aggregateHeadlineSentiment, type NewsHeadline } from './lexicon';

/** Parse Google News RSS XML into headlines (no external deps). */
export function parseGoogleNewsRss(xml: string): NewsHeadline[] {
  const items: NewsHeadline[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/i);
    const pub = block.match(/<pubDate>(.*?)<\/pubDate>/i);
    const source = block.match(/<source[^>]*>(.*?)<\/source>/i);
    const t = title?.[1] ?? title?.[2] ?? '';
    if (t) {
      items.push({
        title: t.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'),
        source: source?.[1],
        publishedAt: pub?.[1],
      });
    }
  }
  return items.slice(0, 20);
}

export type SymbolSentimentSnapshot = {
  symbol: string;
  headlines: NewsHeadline[];
  sentiment: number;
  impact: number;
  regime: 'RISK_ON' | 'RISK_OFF' | 'NEUTRAL';
  institutionalBias: number;
  fetchedAt: number;
};

/** Institutional bias: positive sentiment + impact keywords → [0,1] buy-side tilt. */
export function institutionalBias(sentiment: number, impact: number, beta: number): number {
  const betaAdj = Math.min(1.5, Math.max(0.5, beta)) / 1.2;
  const raw = 0.5 + sentiment * 0.35 + impact * 0.25;
  return Math.round(Math.min(1, Math.max(0, raw * betaAdj)) * 1000) / 1000;
}

export async function fetchSymbolSentiment(symbol: string, beta = 1): Promise<SymbolSentimentSnapshot> {
  const sym = symbol.toUpperCase();
  const name = sym;
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(`${name} stock OR ${name} earnings`)}&hl=en-US&gl=US&ceid=US:en`;

  let headlines: NewsHeadline[] = [];
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (res.ok) {
      const xml = await res.text();
      headlines = parseGoogleNewsRss(xml);
    }
  } catch {
    /* RSS unavailable — return neutral */
  }

  const agg = aggregateHeadlineSentiment(headlines);
  return {
    symbol: sym,
    headlines,
    sentiment: agg.sentiment,
    impact: agg.impact,
    regime: agg.regime,
    institutionalBias: institutionalBias(agg.sentiment, agg.impact, beta),
    fetchedAt: Date.now(),
  };
}

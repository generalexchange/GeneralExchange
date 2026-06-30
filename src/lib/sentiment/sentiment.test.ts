import { describe, expect, it } from 'vitest';
import { aggregateHeadlineSentiment, sentimentScore } from '@/lib/sentiment/lexicon';

describe('sentiment lexicon', () => {
  it('scores bullish headlines positive', () => {
    expect(sentimentScore('Apple beats earnings, stock surges on strong growth')).toBeGreaterThan(0);
  });

  it('scores bearish headlines negative', () => {
    expect(sentimentScore('Company misses guidance, shares plunge on weak demand')).toBeLessThan(0);
  });

  it('aggregates multiple headlines', () => {
    const out = aggregateHeadlineSentiment([
      { title: 'Tesla rally on record delivery beat' },
      { title: 'Analyst upgrade drives bullish momentum' },
    ]);
    expect(out.headlineCount).toBe(2);
    expect(out.sentiment).toBeGreaterThan(0);
    expect(out.regime).toBe('RISK_ON');
  });
});

import { NextRequest, NextResponse } from 'next/server';
import { fetchSymbolSentiment } from '@/lib/sentiment/fetchNewsFeed';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ symbol: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { symbol } = await ctx.params;
  const sym = (symbol ?? 'SPY').toUpperCase();
  const beta = Number(_req.nextUrl.searchParams.get('beta') ?? 1);
  try {
    const data = await fetchSymbolSentiment(sym, beta);
    return NextResponse.json({ data, source: 'google-news-rss' });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'sentiment_failed' },
      { status: 502 },
    );
  }
}

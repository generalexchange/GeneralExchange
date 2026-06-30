import { NextRequest, NextResponse } from 'next/server';
import { discoverOpportunitiesLocal } from '@/lib/opportunity/rankLocal';
import type { DiscoverResponse, OutcomesResponse } from '@/lib/opportunity/types';

export const dynamic = 'force-dynamic';

const UPSTREAM = (process.env.MONTE_CARLO_API_URL ?? '').replace(/\/$/, '');
const API_KEY = process.env.MC_API_KEY ?? process.env.GE_API_KEY ?? '';
const TIMEOUT_MS = Number(process.env.MONTE_CARLO_TIMEOUT_MS ?? 120_000);
const DISCOVER_CACHE_MS = 90_000;

let discoverCache: { key: string; expires: number; body: DiscoverResponse } | null = null;

type RouteCtx = { params: Promise<{ path?: string[] }> };

async function forwardUpstream(route: string, body: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (API_KEY) headers['X-API-Key'] = API_KEY;

  const res = await fetch(`${UPSTREAM}/v1/${route}`, {
    method: 'POST',
    headers,
    body,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(req: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params;
  const route = path?.join('/') ?? 'discover';
  const bodyText = await req.text();
  const body = bodyText ? (JSON.parse(bodyText) as Record<string, unknown>) : {};

  if (UPSTREAM) {
    try {
      return await forwardUpstream(`opportunity/${route}`, bodyText || '{}');
    } catch {
      /* fall through to local */
    }
  }

  if (route === 'discover') {
    const symbols = Array.isArray(body.symbols) ? (body.symbols as string[]) : undefined;
    const includeChain = Boolean(body.includeChain);
    const cacheKey = `${(symbols ?? []).join(',')}:${includeChain}`;
    if (discoverCache && discoverCache.key === cacheKey && Date.now() < discoverCache.expires) {
      return NextResponse.json(discoverCache.body);
    }
    const result: DiscoverResponse = await discoverOpportunitiesLocal(symbols, includeChain);
    discoverCache = { key: cacheKey, expires: Date.now() + DISCOVER_CACHE_MS, body: result };
    return NextResponse.json(result);
  }

  if (route === 'analyze') {
    const symbol = String(body.symbol ?? 'SPY');
    const result = await discoverOpportunitiesLocal([symbol], true);
    const top = result.opportunities.find((o) => o.symbol === symbol && !o.error);
    if (!top) {
      return NextResponse.json({ error: 'no_contracts' }, { status: 404 });
    }
    return NextResponse.json(top);
  }

  if (route === 'outcomes') {
    const empty: OutcomesResponse = {
      outcomes: [],
      ml: {
        weights: {},
        calibrationRuns: 0,
        expiredCount: 0,
        hitRate: null,
      },
    };
    return NextResponse.json({
      ...empty,
      ml: {
        weights: {
          expected_return: 0.25,
          probability_of_profit: 0.25,
          liquidity: 0.15,
          spread_quality: 0.15,
          gamma_positioning: 0.1,
          monte_carlo: 0.1,
        },
        calibrationRuns: 0,
        expiredCount: 0,
        hitRate: null,
        note: 'Historical ML calibration requires MONTE_CARLO_API_URL on DigitalOcean.',
      },
    });
  }

  return NextResponse.json({ error: 'unknown_route', path: route }, { status: 404 });
}

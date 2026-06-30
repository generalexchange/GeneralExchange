import { NextRequest, NextResponse } from 'next/server';
import { canUseIbkrDirect, tryIbkrDirect } from '@/lib/api/ibkrDirect';
import {
  cacheControlHeader,
  getCachedApiResponse,
  getStaleCachedApiResponse,
  setCachedApiResponse,
} from '@/lib/api/responseCache';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MARKET_PATHS = new Set(['ticks', 'candles', 'quote', 'news', 'account', 'positions', 'signals']);

function isMarketPath(path: string[]): boolean {
  if (MARKET_PATHS.has(path[0] ?? '')) return true;
  return path[0] === 'options' && path[1] === 'chain';
}

function jsonResponse(body: string, status: number, cacheTtl?: number) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (cacheTtl != null && cacheTtl > 0) {
    headers['Cache-Control'] = cacheControlHeader(cacheTtl);
  }
  return new NextResponse(body, { status, headers });
}

function unavailableJson(status = 502) {
  return NextResponse.json(
    {
      error: 'data unavailable',
      hint: 'Start IB Gateway and the IBKR service (IBKR_API_URL). See docs/IBKR_SETUP.md.',
      as_of: new Date().toISOString(),
    },
    { status },
  );
}

async function ibkrResponse(path: string[], search: string, searchParams: URLSearchParams) {
  const direct = await tryIbkrDirect(path, searchParams);
  if (!direct) return null;
  const body = JSON.stringify(direct);
  const ttl = setCachedApiResponse(path, search, body);
  return jsonResponse(body, 200, ttl);
}

async function forward(req: NextRequest, path: string[]) {
  const search = req.nextUrl.search;
  const isGet = req.method === 'GET' || req.method === 'HEAD';

  if (isGet) {
    const cached = getCachedApiResponse(path, search);
    if (cached) return jsonResponse(cached.body, 200, cached.ttl);
  }

  if (isGet && isMarketPath(path) && canUseIbkrDirect()) {
    try {
      const direct = await ibkrResponse(path, search, req.nextUrl.searchParams);
      if (direct) return direct;
    } catch (err) {
      console.error('[api/v1] ibkr failed', path.join('/'), err);
    }
    const stale = getStaleCachedApiResponse(path, search);
    if (stale) return jsonResponse(stale.body, 200, stale.ttl);
  }

  return unavailableJson();
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  return forward(req, (await ctx.params).path);
}

export async function POST(req: NextRequest, ctx: Ctx) {
  return forward(req, (await ctx.params).path);
}

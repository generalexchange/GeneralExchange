import { NextRequest, NextResponse } from 'next/server';
import { tryIbkrDirect } from '@/lib/api/ibkrDirect';
import { tryGatewayProxy } from '@/lib/api/gatewayProxy';
import { canUseIbkrDirect, canUseWebSynth } from '@/lib/api/marketRouting';
import { tryWebSynth } from '@/lib/market/webSynth';
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
      hint: 'Live market data on web uses the pipeline or API gateway — not IBKR. Use the desktop app for IB Gateway feeds.',
      as_of: new Date().toISOString(),
    },
    { status },
  );
}

async function marketResponse(path: string[], search: string, searchParams: URLSearchParams) {
  if (canUseIbkrDirect()) {
    const direct = await tryIbkrDirect(path, searchParams);
    if (direct) {
      const body = JSON.stringify(direct);
      const ttl = setCachedApiResponse(path, search, body);
      return jsonResponse(body, 200, ttl);
    }
  }

  const gateway = await tryGatewayProxy(path, search);
  if (gateway) {
    const ttl = setCachedApiResponse(path, search, gateway.body);
    return jsonResponse(gateway.body, gateway.status, ttl);
  }

  if (canUseWebSynth()) {
    const synth = await tryWebSynth(path, searchParams);
    if (synth) {
      const body = JSON.stringify(synth);
      const ttl = setCachedApiResponse(path, search, body);
      return jsonResponse(body, 200, ttl);
    }
  }

  return null;
}

async function forward(req: NextRequest, path: string[]) {
  const search = req.nextUrl.search;
  const isGet = req.method === 'GET' || req.method === 'HEAD';

  if (isGet) {
    const cached = getCachedApiResponse(path, search);
    if (cached) return jsonResponse(cached.body, 200, cached.ttl);
  }

  if (isGet && isMarketPath(path)) {
    try {
      const res = await marketResponse(path, search, req.nextUrl.searchParams);
      if (res) return res;
    } catch (err) {
      console.error('[api/v1] market failed', path.join('/'), err);
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

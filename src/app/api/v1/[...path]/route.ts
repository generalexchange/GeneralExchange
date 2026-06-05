import { NextRequest, NextResponse } from 'next/server';
import { canUsePolygonDirect, tryPolygonDirect } from '@/lib/api/polygonDirect';
import {
  cacheControlHeader,
  getCachedApiResponse,
  setCachedApiResponse,
} from '@/lib/api/responseCache';

const GO_API_URL = (process.env.GO_API_URL ?? 'http://localhost:8080').replace(/\/$/, '');
const API_KEY = process.env.GE_API_KEY ?? 'gx_live_dev_demo_key';
const GO_TIMEOUT_MS = 4_000;

export const dynamic = 'force-dynamic';
export const maxDuration = 10;

function isLocalGoUrl(url: string): boolean {
  return /localhost|127\.0\.0\.1|0\.0\.0\.0/.test(url);
}

const POLYGON_MARKET_PATHS = new Set(['ticks', 'candles', 'quote', 'news']);

function isPolygonMarketPath(path: string[]): boolean {
  if (POLYGON_MARKET_PATHS.has(path[0] ?? '')) return true;
  return path[0] === 'options' && path[1] === 'chain';
}

function isLiveSource(source: string): boolean {
  return (
    source !== 'mock' &&
    source !== 'unavailable' &&
    source !== 'unconfigured' &&
    source !== 'go'
  );
}

function jsonResponse(body: string, status: number, cacheTtl?: number) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (cacheTtl != null && cacheTtl > 0) {
    headers['Cache-Control'] = cacheControlHeader(cacheTtl);
    headers['CDN-Cache-Control'] = cacheControlHeader(cacheTtl);
    headers['Vercel-CDN-Cache-Control'] = cacheControlHeader(cacheTtl);
  }
  return new NextResponse(body, { status, headers });
}

function unavailableJson(status = 502) {
  return NextResponse.json(
    {
      error: 'data unavailable',
      hint: 'Configure POLYGON_API_KEY on Vercel or ensure the Go API is reachable.',
      as_of: new Date().toISOString(),
    },
    { status },
  );
}

async function polygonDirectResponse(path: string[], search: string, searchParams: URLSearchParams) {
  const direct = await tryPolygonDirect(path, searchParams);
  if (!direct) return null;
  const body = JSON.stringify(direct);
  const ttl = setCachedApiResponse(path, search, body);
  return jsonResponse(body, 200, ttl);
}

async function fetchGo(
  req: NextRequest,
  path: string[],
  search: string,
): Promise<{ ok: boolean; status: number; body: string; source: string } | null> {
  const headers: Record<string, string> = {
    'X-API-Key': API_KEY,
    'Content-Type': req.headers.get('content-type') ?? 'application/json',
  };
  const auth = req.headers.get('authorization');
  if (auth) headers['Authorization'] = auth;

  try {
    const res = await fetch(`${GO_API_URL}/v1/${path.join('/')}${search}`, {
      method: req.method,
      headers,
      cache: 'no-store',
      signal: AbortSignal.timeout(GO_TIMEOUT_MS),
    });
    const body = await res.text();
    let source = 'go';
    if (res.ok) {
      try {
        const parsed = JSON.parse(body) as { source?: string };
        source = parsed.source ?? source;
      } catch {
        /* keep go */
      }
    }
    return { ok: res.ok, status: res.status, body, source };
  } catch {
    return null;
  }
}

async function forward(req: NextRequest, path: string[]) {
  const search = req.nextUrl.search;
  const isGet = req.method === 'GET' || req.method === 'HEAD';
  const marketGet = isGet && isPolygonMarketPath(path);
  const vercelMarket = process.env.VERCEL === '1' && marketGet;
  const skipGo = (process.env.VERCEL === '1' && isLocalGoUrl(GO_API_URL)) || vercelMarket;

  if (isGet) {
    const cached = getCachedApiResponse(path, search);
    if (cached) {
      return jsonResponse(cached.body, 200, cached.ttl);
    }
  }

  if (marketGet && canUsePolygonDirect()) {
    try {
      const direct = await polygonDirectResponse(path, search, req.nextUrl.searchParams);
      if (direct) return direct;
    } catch (err) {
      console.error('[api/v1] polygon direct failed', path.join('/'), err);
    }
    if (vercelMarket) {
      return unavailableJson();
    }
  }

  if (!skipGo) {
    const go = await fetchGo(req, path, search);
    if (go?.ok && isLiveSource(go.source)) {
      const ttl = setCachedApiResponse(path, search, go.body);
      return jsonResponse(go.body, go.status, ttl);
    }

    if (marketGet && canUsePolygonDirect()) {
      try {
        const direct = await polygonDirectResponse(path, search, req.nextUrl.searchParams);
        if (direct) return direct;
      } catch (err) {
        console.error('[api/v1] polygon fallback failed', path.join('/'), err);
      }
    }

    if (go && !go.ok) {
      const ct = go.body.trimStart();
      if (go.status >= 500 || ct.startsWith('<')) {
        return unavailableJson(502);
      }
      return jsonResponse(go.body, go.status);
    }
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

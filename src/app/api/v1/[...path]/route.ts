import { NextRequest, NextResponse } from 'next/server';
import { canUsePolygonDirect, tryPolygonDirect } from '@/lib/api/polygonDirect';
import {
  cacheControlHeader,
  getCachedApiResponse,
  setCachedApiResponse,
} from '@/lib/api/responseCache';

const GO_API_URL = (process.env.GO_API_URL ?? 'http://localhost:8080').replace(/\/$/, '');
const API_KEY = process.env.GE_API_KEY ?? 'dev-api-key';
const UPSTREAM_TIMEOUT_MS = 5000;

export const dynamic = 'force-dynamic';

function isLocalGoUrl(url: string): boolean {
  return /localhost|127\.0\.0\.1|0\.0\.0\.0/.test(url);
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

async function forward(req: NextRequest, path: string[]) {
  const search = req.nextUrl.search;
  const isGet = req.method === 'GET' || req.method === 'HEAD';

  if (isGet) {
    const cached = getCachedApiResponse(path, search);
    if (cached) {
      return jsonResponse(cached.body, 200, cached.ttl);
    }
  }

  const target = `${GO_API_URL}/v1/${path.join('/')}${search}`;

  const headers: Record<string, string> = {
    'X-API-Key': API_KEY,
    'Content-Type': req.headers.get('content-type') ?? 'application/json',
  };
  const auth = req.headers.get('authorization');
  if (auth) headers['Authorization'] = auth;

  const init: RequestInit = {
    method: req.method,
    headers,
    cache: 'no-store',
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  };
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = await req.text();
  }

  const skipGo = process.env.VERCEL === '1' && isLocalGoUrl(GO_API_URL);

  if (!skipGo) {
    try {
      const res = await fetch(target, init);
      if (res.ok || res.status < 500) {
        const body = await res.text();
        if (isGet && res.ok) {
          const ttl = setCachedApiResponse(path, search, body);
          return jsonResponse(body, res.status, ttl);
        }
        return jsonResponse(body, res.status);
      }
    } catch {
      // fall through to Polygon direct
    }
  }

  if (isGet && canUsePolygonDirect()) {
    const direct = await tryPolygonDirect(path, req.nextUrl.searchParams);
    if (direct) {
      const body = JSON.stringify(direct);
      const ttl = setCachedApiResponse(path, search, body);
      return jsonResponse(body, 200, ttl);
    }
  }

  return NextResponse.json(
    {
      error: 'upstream data API unavailable',
      hint: skipGo
        ? 'Set GO_API_URL to a public Go API host, or POLYGON_API_KEY for direct market data on Vercel.'
        : 'Start the docker stack (docker compose --profile app up -d) or configure POLYGON_API_KEY.',
      as_of: new Date().toISOString(),
    },
    { status: 502 },
  );
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  return forward(req, (await ctx.params).path);
}
export async function POST(req: NextRequest, ctx: Ctx) {
  return forward(req, (await ctx.params).path);
}

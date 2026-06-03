/**
 * Server-side proxy to the Go data API with Polygon/Massive fallback.
 *
 * The browser calls /api/v1/* on the Next.js origin; this handler forwards to
 * the Go service when reachable. On Vercel (no hosted Go stack), set
 * POLYGON_API_KEY so read-only market routes still return live data.
 */

import { NextRequest, NextResponse } from 'next/server';
import { canUsePolygonDirect, tryPolygonDirect } from '@/lib/api/polygonDirect';

const GO_API_URL = (process.env.GO_API_URL ?? 'http://localhost:8080').replace(/\/$/, '');
const API_KEY = process.env.GE_API_KEY ?? 'dev-api-key';
const UPSTREAM_TIMEOUT_MS = 5000;

export const dynamic = 'force-dynamic';

function isLocalGoUrl(url: string): boolean {
  return /localhost|127\.0\.0\.1|0\.0\.0\.0/.test(url);
}

async function forward(req: NextRequest, path: string[]) {
  const search = req.nextUrl.search;
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

  // Skip unreachable localhost Go targets in serverless production.
  const skipGo =
    process.env.VERCEL === '1' && isLocalGoUrl(GO_API_URL);

  if (!skipGo) {
    try {
      const res = await fetch(target, init);
      if (res.ok || res.status < 500) {
        const body = await res.text();
        return new NextResponse(body, {
          status: res.status,
          headers: { 'Content-Type': res.headers.get('content-type') ?? 'application/json' },
        });
      }
    } catch {
      // fall through to Polygon direct
    }
  }

  if (req.method === 'GET' && canUsePolygonDirect()) {
    const direct = await tryPolygonDirect(path, req.nextUrl.searchParams);
    if (direct) {
      return NextResponse.json(direct);
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

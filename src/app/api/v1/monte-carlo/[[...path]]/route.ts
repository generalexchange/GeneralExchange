import { NextRequest, NextResponse } from 'next/server';
import {
  evaluateTrade,
  simulatePricePaths,
  simulateStrategyOutcome,
  simulateTradeQuality,
} from '@gx/analytics';

export const dynamic = 'force-dynamic';

const UPSTREAM = (process.env.MONTE_CARLO_API_URL ?? '').replace(/\/$/, '');
const API_KEY = process.env.MC_API_KEY ?? process.env.GE_API_KEY ?? '';
const TIMEOUT_MS = Number(process.env.MONTE_CARLO_TIMEOUT_MS ?? 120_000);

type RouteName = 'price-path' | 'strategy' | 'trade-quality' | 'evaluate';

const LOCAL: Record<RouteName, (body: unknown) => unknown> = {
  'price-path': (body) => simulatePricePaths(body as Parameters<typeof simulatePricePaths>[0]),
  strategy: (body) => simulateStrategyOutcome(body as Parameters<typeof simulateStrategyOutcome>[0]),
  'trade-quality': (body) => simulateTradeQuality(body as Parameters<typeof simulateTradeQuality>[0]),
  evaluate: (body) => evaluateTrade(body as Parameters<typeof evaluateTrade>[0]),
};

async function forwardUpstream(route: RouteName, body: string) {
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

type RouteCtx = { params: Promise<{ path?: string[] }> };

export async function POST(req: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params;
  const route = path?.[0] as RouteName | undefined;
  if (!route || !(route in LOCAL)) {
    return NextResponse.json({ error: 'unknown_route', path: path?.join('/') }, { status: 404 });
  }

  const body = await req.text();
  if (!body) return NextResponse.json({ error: 'empty body' }, { status: 400 });

  try {
    if (UPSTREAM) return await forwardUpstream(route, body);
    const parsed = JSON.parse(body) as unknown;
    return NextResponse.json(LOCAL[route](parsed));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'monte_carlo_error';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function GET(_req: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params;
  if (path?.length) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  let upstream: 'reachable' | 'unavailable' | 'local' = UPSTREAM ? 'unavailable' : 'local';
  if (UPSTREAM) {
    try {
      const res = await fetch(`${UPSTREAM}/health`, { signal: AbortSignal.timeout(5000) });
      upstream = res.ok ? 'reachable' : 'unavailable';
    } catch {
      upstream = 'unavailable';
    }
  }

  return NextResponse.json({
    ok: true,
    mode: UPSTREAM ? 'remote' : 'local',
    upstream,
    routes: Object.keys(LOCAL),
  });
}

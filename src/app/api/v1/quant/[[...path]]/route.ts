import { NextRequest, NextResponse } from 'next/server';
import { analyzeCorrelation, analyzeGraham, analyzeWinRate } from '@gx/analytics';

export const dynamic = 'force-dynamic';

const UPSTREAM = (process.env.QUANT_ANALYTICS_URL ?? '').replace(/\/$/, '');
const TIMEOUT_MS = Number(process.env.QUANT_TIMEOUT_MS ?? 60_000);

type RouteName = 'correlation' | 'win-rate' | 'graham' | 'risk' | 'evaluate';

async function forwardUpstream(route: string, body: string) {
  const res = await fetch(`${UPSTREAM}/v1/quant/${route}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const text = await res.text();
  return new NextResponse(text, { status: res.status, headers: { 'Content-Type': 'application/json' } });
}

type RouteCtx = { params: Promise<{ path?: string[] }> };

export async function POST(req: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params;
  const route = path?.[0] as RouteName | undefined;
  if (!route) return NextResponse.json({ error: 'unknown_route' }, { status: 404 });

  const body = await req.text();
  if (!body) return NextResponse.json({ error: 'empty body' }, { status: 400 });
  const parsed = JSON.parse(body) as Record<string, unknown>;

  try {
    if (UPSTREAM && route !== 'risk' && route !== 'evaluate') {
      return await forwardUpstream(route, body);
    }

    switch (route) {
      case 'correlation':
        return NextResponse.json(
          analyzeCorrelation({
            pricesBySymbol: parsed.prices_by_symbol as Record<string, number[]>,
            benchmark: parsed.benchmark as string | undefined,
          }),
        );
      case 'win-rate':
        return NextResponse.json(
          analyzeWinRate({
            pnls: parsed.pnls as number[],
            priorA: parsed.prior_a as number | undefined,
            priorB: parsed.prior_b as number | undefined,
          }),
        );
      case 'graham':
        return NextResponse.json(
          analyzeGraham({
            price: parsed.price as number,
            eps: parsed.eps as number,
            bvps: parsed.bvps as number,
            growthRate: parsed.growth_rate as number,
            aaaBondYield: parsed.aaa_bond_yield as number,
            currentAssets: parsed.current_assets as number | undefined,
            totalLiabilities: parsed.total_liabilities as number | undefined,
            sharesOutstanding: parsed.shares_outstanding as number | undefined,
            currentRatio: parsed.current_ratio as number | undefined,
            yearsPositiveEarnings: parsed.years_positive_earnings as number | undefined,
            pe: parsed.pe as number | undefined,
            pb: parsed.pb as number | undefined,
            paysDividend: parsed.pays_dividend as boolean | undefined,
          }),
        );
      default:
        return NextResponse.json({ error: 'not_found', route }, { status: 404 });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'quant_error';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function GET(_req: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params;
  if (path?.length) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({
    ok: true,
    mode: UPSTREAM ? 'remote' : 'local',
    routes: ['correlation', 'win-rate', 'graham'],
  });
}

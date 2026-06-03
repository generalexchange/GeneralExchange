/**
 * Thin server-side proxy to the Go data API.
 *
 * The browser calls /api/v1/* on the Next.js origin; this handler forwards to
 * the Go service, attaching the API key (and the user's JWT when present) on
 * the server side. GO_API_URL is never exposed to client-side code.
 */

import { NextRequest, NextResponse } from 'next/server';

const GO_API_URL = process.env.GO_API_URL ?? 'http://localhost:8080';
const API_KEY = process.env.GE_API_KEY ?? 'dev-api-key';

export const dynamic = 'force-dynamic';

async function forward(req: NextRequest, path: string[]) {
  const search = req.nextUrl.search;
  const target = `${GO_API_URL}/v1/${path.join('/')}${search}`;

  const headers: Record<string, string> = {
    'X-API-Key': API_KEY,
    'Content-Type': req.headers.get('content-type') ?? 'application/json',
  };
  // Forward the caller's bearer token (set by the session/auth layer).
  const auth = req.headers.get('authorization');
  if (auth) headers['Authorization'] = auth;

  const init: RequestInit = { method: req.method, headers, cache: 'no-store' };
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = await req.text();
  }

  try {
    const res = await fetch(target, init);
    const body = await res.text();
    return new NextResponse(body, {
      status: res.status,
      headers: { 'Content-Type': res.headers.get('content-type') ?? 'application/json' },
    });
  } catch {
    return NextResponse.json(
      { error: 'upstream data API unavailable', as_of: new Date().toISOString() },
      { status: 502 },
    );
  }
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  return forward(req, (await ctx.params).path);
}
export async function POST(req: NextRequest, ctx: Ctx) {
  return forward(req, (await ctx.params).path);
}

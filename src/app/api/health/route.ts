import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const goUrl = (process.env.GO_API_URL ?? 'http://localhost:8080').replace(/\/$/, '');
  let goStatus: 'reachable' | 'unavailable' = 'unavailable';

  try {
    const res = await fetch(`${goUrl}/healthz`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(4000),
    });
    goStatus = res.ok ? 'reachable' : 'unavailable';
  } catch {
    goStatus = 'unavailable';
  }

  return NextResponse.json({
    status: 'ok',
    go_api: goStatus,
    go_api_url: goUrl,
    polygon_configured: Boolean(process.env.POLYGON_API_KEY?.trim()),
    ws_url: process.env.NEXT_PUBLIC_WS_URL?.trim() || null,
    as_of: new Date().toISOString(),
  });
}

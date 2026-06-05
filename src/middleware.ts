import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const ROOT_DOMAIN = (process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'general.exchange').toLowerCase();

const SUBDOMAIN_TO_PATH: Record<string, string> = {
  company: '/company',
  university: '/university',
  legend: '/dashboard',
};

function subdomainFromHost(host: string): string | null {
  const h = host.split(':')[0]?.toLowerCase() ?? '';
  if (!h) return null;

  if (h === `www.${ROOT_DOMAIN}` || h === ROOT_DOMAIN) return null;

  if (h.endsWith(`.${ROOT_DOMAIN}`)) {
    const sub = h.slice(0, -(ROOT_DOMAIN.length + 1));
    if (sub && !sub.includes('.')) return sub;
    return null;
  }

  if (h.endsWith('.localhost')) {
    const sub = h.replace(/\.localhost$/, '');
    if (sub && sub !== 'localhost') return sub;
  }

  if (h === 'legend.localhost') return 'legend';

  return null;
}

function legendOrigin(host: string): string {
  const port = host.includes(':') ? host.slice(host.indexOf(':')) : '';
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    return `http://legend.localhost${port || ':3003'}`;
  }
  const envLegend = process.env.NEXT_PUBLIC_LEGEND_URL?.trim().replace(/\/$/, '');
  if (envLegend) return envLegend;
  return `https://legend.${ROOT_DOMAIN}`;
}

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? '';
  const sub = subdomainFromHost(host);
  const { pathname, search } = request.nextUrl;

  // Apex / www / Vercel: never keep /dashboard on non-legend hosts — go to legend subdomain root
  if (pathname.startsWith('/dashboard') && sub !== 'legend') {
    const target = new URL(`${legendOrigin(host)}/${search}`);
    return NextResponse.redirect(target, 307);
  }

  // legend.* with /dashboard in the bar → canonical subdomain root (still serves dashboard via rewrite)
  if (sub === 'legend' && pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url, 308);
  }

  if (!sub) return NextResponse.next();

  const pathPrefix = SUBDOMAIN_TO_PATH[sub];
  if (!pathPrefix) return NextResponse.next();

  if (pathname !== '/' && pathname !== '') return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = pathPrefix;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};

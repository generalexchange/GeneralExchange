import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { isLegendHost, isNonCanonicalLegendHost, LEGEND_ORIGIN } from '@/lib/legendUrl';

const ROOT_DOMAIN = (process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'general.exchange').toLowerCase();

const SUBDOMAIN_TO_PATH: Record<string, string> = {
  company: '/company',
  university: '/university',
  legend: '/legend',
};

function subdomainFromHost(host: string): string | null {
  const h = host.split(':')[0]?.toLowerCase() ?? '';
  if (!h) return null;

  if (isLegendHost(h)) return 'legend';

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

  return null;
}

function legendRedirectOrigin(host: string): string {
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    const port = host.includes(':') ? host.slice(host.indexOf(':')) : '';
    return `http://legend.localhost${port || ':3003'}`;
  }
  return LEGEND_ORIGIN;
}

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? '';
  const sub = subdomainFromHost(host);
  const { pathname, search } = request.nextUrl;

  if (isNonCanonicalLegendHost(host)) {
    const target = new URL(`${LEGEND_ORIGIN}${pathname}${search}`);
    return NextResponse.redirect(target, 308);
  }

  // Apex / marketing hosts: /dashboard and /legend → canonical Legend subdomain root
  if ((pathname.startsWith('/dashboard') || pathname.startsWith('/legend')) && sub !== 'legend') {
    const suffix = pathname.replace(/^\/(dashboard|legend)\/?/, '');
    const target = new URL(`${legendRedirectOrigin(host)}/${suffix}${search}`);
    return NextResponse.redirect(target, 307);
  }

  // legend.* — strip /legend or /dashboard from the bar; subdomain root serves Legend
  if (sub === 'legend' && (pathname.startsWith('/legend') || pathname.startsWith('/dashboard'))) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/(legend|dashboard)\/?/, '/') || '/';
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

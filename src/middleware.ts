import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const ROOT_DOMAIN = (process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'general.exchange').toLowerCase();

const SUBDOMAIN_TO_PATH: Record<string, string> = {
  company: '/company',
  university: '/university',
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

  // Local dev: e.g. university.localhost:3000
  if (h.endsWith('.localhost')) {
    const sub = h.replace(/\.localhost$/, '');
    if (sub && sub !== 'localhost') return sub;
  }

  return null;
}

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? '';
  const sub = subdomainFromHost(host);
  if (!sub) return NextResponse.next();

  const pathPrefix = SUBDOMAIN_TO_PATH[sub];
  if (!pathPrefix) return NextResponse.next();

  const { pathname } = request.nextUrl;
  if (pathname !== '/' && pathname !== '') return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = pathPrefix;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};

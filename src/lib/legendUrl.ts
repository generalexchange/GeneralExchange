/**
 * Legend terminal subdomain — authenticated dashboard lives at legend.{ROOT_DOMAIN}.
 */

const ROOT_DOMAIN = (process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'general.exchange').toLowerCase();

/** Build the legend dashboard URL (client-safe). */
export function legendDashboardUrl(path = '/'): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;

  if (typeof window !== 'undefined') {
    const { hostname, port, protocol } = window.location;
    if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
      const p = port ? `:${port}` : '';
      return `${protocol}//legend.localhost${p}${normalized === '/' ? '' : normalized}`;
    }
    if (hostname.startsWith('legend.')) {
      return `${protocol}//${hostname}${port ? `:${port}` : ''}${normalized === '/' ? '' : normalized}`;
    }
  }

  const base =
    process.env.NODE_ENV === 'development'
      ? `http://legend.localhost:${process.env.PORT ?? '3003'}`
      : `https://legend.${ROOT_DOMAIN}`;

  return normalized === '/' ? base : `${base}${normalized}`;
}

export function isLegendHost(host: string): boolean {
  const h = host.split(':')[0]?.toLowerCase() ?? '';
  return h === 'legend.localhost' || h.startsWith('legend.');
}

export { ROOT_DOMAIN };

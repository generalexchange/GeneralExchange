/**
 * Marketing subdomains (e.g. university.general.exchange) share the same deployment;
 * middleware rewrites the host root to the matching app route.
 */
const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'general.exchange';

export type MarketingSubdomain = 'company' | 'university' | 'library';

export function marketingSubdomainUrl(sub: MarketingSubdomain): string {
  return `https://${sub}.${ROOT_DOMAIN}`;
}

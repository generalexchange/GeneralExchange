import type { Metadata } from 'next';
import { MOCK_STOCKS_BY_KEY } from '@/data/mockStocksCatalog';

/** Canonical public site URL — override with SITE_URL in production. */
export const SITE_URL = (process.env.SITE_URL ?? 'https://general.exchange').replace(/\/$/, '');

export const SITE_NAME = 'General Exchange';
export const SITE_PUBLISHER = 'Old West Solutions';

export const DEFAULT_DESCRIPTION =
  'General Exchange is an institutional trading terminal for backtesting, options research, Interactive Brokers execution, and commodity workflows — built by Old West Solutions.';

export const DEFAULT_KEYWORDS = [
  'General Exchange',
  'institutional trading terminal',
  'backtesting platform',
  'Interactive Brokers integration',
  'options trading software',
  'algorithmic trading research',
  'commodity trading platform',
  'trading desk software',
  'Old West Solutions',
  'Monte Carlo risk analysis',
  'LLM strategy research',
];

export const OG_IMAGE = {
  url: '/images/generalexchangehorse.png',
  width: 994,
  height: 1040,
  alt: 'General Exchange — institutional trading terminal by Old West Solutions',
};

export type SitemapEntry = {
  path: string;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
};

/** Public routes included in sitemap.xml (indexable marketing & product pages). */
export const INDEXABLE_ROUTES: SitemapEntry[] = [
  { path: '/', changeFrequency: 'daily', priority: 1 },
  { path: '/tradeengine', changeFrequency: 'weekly', priority: 0.95 },
  { path: '/warehouse', changeFrequency: 'weekly', priority: 0.95 },
  { path: '/backspace', changeFrequency: 'weekly', priority: 0.95 },
  { path: '/pricing', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/download', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/features', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/town-and-cattle', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/options', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/futures', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/stocks', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/fixed-income', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/monte-carlo', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/risk-management', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/bridge-observer', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/rockefeller-press', changeFrequency: 'weekly', priority: 0.75 },
  { path: '/rockefeller', changeFrequency: 'weekly', priority: 0.75 },
  { path: '/company', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/request-access', changeFrequency: 'monthly', priority: 0.75 },
  { path: '/solutions', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/tokenomics', changeFrequency: 'monthly', priority: 0.65 },
  { path: '/our-story', changeFrequency: 'monthly', priority: 0.65 },
  { path: '/our-team', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/university', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/assembly', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/almanac', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/coffee', changeFrequency: 'monthly', priority: 0.55 },
  { path: '/help-center', changeFrequency: 'weekly', priority: 0.65 },
  { path: '/help-desk', changeFrequency: 'weekly', priority: 0.6 },
  { path: '/community', changeFrequency: 'weekly', priority: 0.65 },
  { path: '/newsletter', changeFrequency: 'weekly', priority: 0.6 },
  { path: '/investor-relations', changeFrequency: 'monthly', priority: 0.55 },
  { path: '/documents', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/governance', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/legal', changeFrequency: 'yearly', priority: 0.4 },
  { path: '/privacy-policy', changeFrequency: 'yearly', priority: 0.4 },
  { path: '/terms-and-conditions', changeFrequency: 'yearly', priority: 0.4 },
  { path: '/consultation', changeFrequency: 'monthly', priority: 0.55 },
];

export function companySymbolPaths(): string[] {
  return Object.keys(MOCK_STOCKS_BY_KEY).map((symbol) => `/company/${symbol}`);
}

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  noIndex?: boolean;
};

/** Build consistent page metadata with Open Graph, Twitter, and canonical URL. */
export function buildPageMetadata({
  title,
  description,
  path,
  keywords,
  noIndex = false,
}: PageMetadataOptions): Metadata {
  const canonical = path.startsWith('/') ? path : `/${path}`;
  const fullTitle = `${SITE_NAME} | ${title}`;

  return {
    title: { absolute: fullTitle },
    description,
    keywords: keywords ?? DEFAULT_KEYWORDS,
    alternates: { canonical },
    robots: noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : { index: true, follow: true },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      url: canonical,
      images: [OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@generalexchange',
      creator: '@generalexchange',
      title: fullTitle,
      description,
      images: [OG_IMAGE.url],
    },
  };
}

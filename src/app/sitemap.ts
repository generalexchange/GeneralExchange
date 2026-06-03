import type { MetadataRoute } from 'next';
import { companySymbolPaths, INDEXABLE_ROUTES, SITE_URL } from '@/lib/seo';

/** Required for `output: 'export'` (desktop/Tauri static bundle). */
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = INDEXABLE_ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path === '/' ? '' : path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  const companyEntries: MetadataRoute.Sitemap = companySymbolPaths().map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...companyEntries];
}

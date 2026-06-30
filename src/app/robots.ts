import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

/** Required for `output: 'export'` (desktop/Tauri static bundle). */
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/legend', '/dashboard', '/admin', '/api/', '/login'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

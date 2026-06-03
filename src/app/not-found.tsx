import Link from 'next/link';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Page Not Found',
  description: 'The page you requested could not be found on General Exchange.',
  path: '/404',
  noIndex: true,
});

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="sc-serif text-[11px] uppercase tracking-wider text-zinc-500">404</p>
      <h1 className="mt-3 font-display text-3xl text-neutral-50">Page not found</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-400">
        The route you requested does not exist or has moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex min-h-11 items-center justify-center rounded-md border border-brass bg-black px-6 py-3 text-sm font-semibold text-tan transition-colors hover:border-brass-deep hover:text-brass"
      >
        Back to homepage
      </Link>
    </main>
  );
}

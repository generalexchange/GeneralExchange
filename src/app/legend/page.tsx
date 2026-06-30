import { Suspense } from 'react';
import { Legend } from '@/screens/Legend';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Legend',
  description: 'Legend trade engine — live IBKR data, gamma exposure, Greeks, and market intelligence on General Exchange.',
  path: '/legend',
  noIndex: true,
});

function LegendFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0b0e] text-sm text-zinc-500">
      Loading Legend…
    </div>
  );
}

export default function LegendPage() {
  return (
    <Suspense fallback={<LegendFallback />}>
      <Legend />
    </Suspense>
  );
}

import { Suspense } from 'react';
import { Dashboard } from '@/screens/Dashboard';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Dashboard',
  description: 'Institutional dashboard for paper session, library assets, and BackSpace scratch on General Exchange.',
  path: '/dashboard',
  noIndex: true,
});

function DashboardFallback() {
  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center text-zinc-500 text-sm">
      Loading dashboard…
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <Dashboard />
    </Suspense>
  );
}

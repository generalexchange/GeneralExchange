'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DESKTOP_LEGEND_PATH, isTauriApp } from '@/lib/desktopNav';
import { getLegendOrigin } from '@/lib/legendUrl';

/** Legacy /dashboard — always send users to Legend (subdomain or desktop /legend/). */
export default function DashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    if (isTauriApp()) {
      router.replace(DESKTOP_LEGEND_PATH);
      return;
    }
    window.location.replace(getLegendOrigin());
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-charcoal text-sm text-zinc-500">
      Redirecting to Legend…
    </div>
  );
}

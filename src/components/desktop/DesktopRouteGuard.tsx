'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  DESKTOP_LEGEND_PATH,
  isDesktopBlockedPath,
  isDesktopLegacyDashboardPath,
} from '@/lib/desktopNav';

/** Desktop: landing → login → Legend; block marketing routes; retire /dashboard. */
export function DesktopRouteGuard() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!pathname) return;
    if (isDesktopLegacyDashboardPath(pathname)) {
      router.replace(DESKTOP_LEGEND_PATH);
      return;
    }
    if (isDesktopBlockedPath(pathname)) {
      router.replace('/');
    }
  }, [pathname, router]);

  return null;
}

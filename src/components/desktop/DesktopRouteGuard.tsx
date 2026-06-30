'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { isDesktopBlockedPath } from '@/lib/desktopNav';

/** Keep the desktop installer on landing → login → legend; block marketing site routes. */
export function DesktopRouteGuard() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!pathname || !isDesktopBlockedPath(pathname)) return;
    router.replace('/');
  }, [pathname, router]);

  return null;
}

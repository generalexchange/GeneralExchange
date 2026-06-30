import { NextResponse } from 'next/server';
import {
  fetchLatestDesktopRelease,
  fetchNewestPublishedRelease,
  type DesktopReleaseInfo,
} from '@/lib/desktopRelease';

export const dynamic = 'force-dynamic';

export async function GET() {
  const release = (await fetchNewestPublishedRelease()) ?? (await fetchLatestDesktopRelease());

  if (!release?.available) {
    return NextResponse.json(
      {
        available: false,
        releasesUrl: 'https://github.com/generalexchange/GeneralExchange/releases',
      },
      { status: 404 },
    );
  }

  return NextResponse.json(release satisfies DesktopReleaseInfo);
}

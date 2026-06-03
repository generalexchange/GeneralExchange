import { DownloadApp } from '@/screens/DownloadApp';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Download General Exchange Desktop App',
  description:
    'Download the General Exchange desktop trading terminal for Windows and macOS. Native app with live data, options chain, order entry, and full platform functionality — no browser required.',
  path: '/download',
  keywords: [
    'General Exchange download',
    'trading terminal desktop app',
    'Windows trading software',
    'macOS trading app',
  ],
});

export default function DownloadPage() {
  return <DownloadApp />;
}

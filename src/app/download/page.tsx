import type { Metadata } from 'next';
import { DownloadApp } from '@/screens/DownloadApp';

export const metadata: Metadata = {
  title: 'Download the desktop terminal',
  description:
    'Download the general.exchange desktop trading terminal for macOS, Windows, and Linux — fast, dense, and dark, built for an active session.',
  alternates: { canonical: '/download' },
};

export default function DownloadPage() {
  return <DownloadApp />;
}

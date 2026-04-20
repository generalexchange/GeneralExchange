import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f5f4' },
    { media: '(prefers-color-scheme: dark)', color: '#1c1d26' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL('https://generalexchange.com'),
  title: {
    default: 'General Exchange — Institutional Risk, Research, and Execution',
    template: '%s | General Exchange',
  },
  description:
    'Institutional-grade risk, research, and execution on tokenized compute—with GPU-accelerated engines, reproducible manifests, and a risk-first execution loop.',
  keywords: [
    'General Exchange',
    'tokenized compute',
    'institutional trading',
    'risk engine',
    'deterministic backtesting',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'General Exchange',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@generalexchange',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${cormorant.variable} font-sans antialiased`}>
        <Providers>
          <div className="bg-stone-100 dark:bg-dark-gray min-h-screen">{children}</div>
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}

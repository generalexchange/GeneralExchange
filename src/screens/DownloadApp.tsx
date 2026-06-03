/**
 * Download — the general.exchange desktop terminal.
 *
 * Detects platform, auto-starts the matching installer, and shows manual
 * Mac / Windows buttons. Uses stable GitHub release asset URLs.
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Apple, Monitor, Download } from 'lucide-react';

const easeLux = [0.22, 1, 0.36, 1] as const;

// Always resolves to the newest published release. Asset names are kept stable
// across versions by the CI assetNamePattern, so this never needs bumping.
const RELEASES_BASE =
  'https://github.com/generalexchange/GeneralExchange/releases/latest/download';

const DOWNLOADS = {
  mac: {
    label: 'Download for Mac',
    sub: 'Universal · macOS 12+',
    href: `${RELEASES_BASE}/General-Exchange_universal.dmg`,
    ext: 'DMG',
  },
  windows: {
    label: 'Download for Windows',
    sub: 'Windows 10 & 11',
    href: `${RELEASES_BASE}/General-Exchange_x64-setup.exe`,
    ext: 'EXE',
  },
} as const;

type Platform = 'mac' | 'windows' | 'unknown';

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'unknown';
  const p = `${navigator.platform} ${navigator.userAgent}`.toLowerCase();
  if (p.includes('mac')) return 'mac';
  if (p.includes('win')) return 'windows';
  return 'unknown';
}

function triggerDownload(url: string) {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.rel = 'noopener noreferrer';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

export const DownloadApp: React.FC = () => {
  const [platform, setPlatform] = useState<Platform>('unknown');
  const [autoStarted, setAutoStarted] = useState(false);
  const autoDownloaded = useRef(false);

  useEffect(() => {
    const detected = detectPlatform();
    setPlatform(detected);

    if (autoDownloaded.current || detected === 'unknown') return;

    const url = detected === 'mac' ? DOWNLOADS.mac.href : DOWNLOADS.windows.href;
    autoDownloaded.current = true;
    setAutoStarted(true);
    triggerDownload(url);
  }, []);

  const primary = platform === 'mac' || platform === 'windows' ? platform : 'mac';

  return (
    <div className="min-h-screen bg-charcoal text-neutral-100">
      <header className="border-b border-white/[0.06] bg-charcoal/95 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-6">
          <Link href="/" className="font-display text-base tracking-tight text-neutral-100">
            general.exchange
          </Link>
          <Link
            href="/tradeengine"
            className="text-[12px] tracking-wide text-zinc-400 transition-colors hover:text-tan"
          >
            Trade Engine
          </Link>
        </div>
      </header>

      <main className="relative flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-6 py-16">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(201,169,110,0.08),transparent_60%)]"
          aria-hidden
        />

        <motion.div
          className="relative z-10 w-full max-w-lg text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: easeLux }}
        >
          <p className="text-[11px] uppercase tracking-[0.25em] text-tan/80">Desktop terminal</p>
          <h1 className="mt-4 font-display text-[clamp(2rem,5vw,2.75rem)] font-normal leading-[1.1] tracking-[-0.02em] text-neutral-50">
            Trade from your desk.
          </h1>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-zinc-400">
            The full general.exchange terminal — live data, options chain, and order entry — as a native app.
          </p>

          {autoStarted && (
            <p className="mt-8 text-[13px] text-tan/90">
              Your download should start automatically. If it didn&apos;t, use the buttons below.
            </p>
          )}

          <p className="mt-8 text-[12px] uppercase tracking-[0.18em] text-zinc-600">Latest release</p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {(['mac', 'windows'] as const).map((id) => {
              const d = DOWNLOADS[id];
              const recommended = id === primary;
              const Icon = id === 'mac' ? Apple : Monitor;

              return (
                <a
                  key={id}
                  href={d.href}
                  className={`group flex min-w-[220px] flex-1 flex-col items-center rounded-xl px-6 py-5 transition-all duration-300 sm:max-w-[240px] ${
                    recommended
                      ? 'border border-brass/50 bg-tan text-charcoal shadow-[0_24px_60px_-20px_rgba(210,180,140,0.45)] hover:bg-tan-muted'
                      : 'border border-white/[0.1] bg-white/[0.03] text-neutral-100 hover:border-brass/30 hover:bg-white/[0.05]'
                  }`}
                >
                  <Icon className={`mb-3 h-6 w-6 ${recommended ? 'text-charcoal' : 'text-tan'}`} />
                  <span className="text-[15px] font-semibold tracking-wide">{d.label}</span>
                  <span className={`mt-1 text-[12px] ${recommended ? 'text-charcoal/70' : 'text-zinc-500'}`}>
                    {d.sub}
                  </span>
                  <span
                    className={`mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider ${
                      recommended ? 'text-charcoal/80' : 'text-zinc-400'
                    }`}
                  >
                    <Download className="h-3.5 w-3.5" />
                    {d.ext}
                    {recommended && platform !== 'unknown' && ' · recommended'}
                  </span>
                </a>
              );
            })}
          </div>

          <p className="mt-8 text-[13px] text-zinc-500">
            Signed builds · auto-updates · no browser required
          </p>

          <p className="mt-6 text-[12px] text-zinc-600">
            Prefer the browser?{' '}
            <Link href="/dashboard" className="text-tan underline-offset-4 hover:underline">
              Open the web terminal
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
};

/**
 * Download — the general.exchange desktop terminal.
 * Resolves the newest published GitHub release at runtime (correct version + asset URLs).
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Apple, Monitor, Download, ExternalLink } from 'lucide-react';
import {
  fetchNewestPublishedRelease,
  type DesktopReleaseInfo,
} from '@/lib/desktopRelease';
import { GITHUB_RELEASES_URL } from '@/config/desktopApp';
import { legendHref } from '@/lib/legendUrl';

const easeLux = [0.22, 1, 0.36, 1] as const;

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
  const [release, setRelease] = useState<DesktopReleaseInfo | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [autoStarted, setAutoStarted] = useState(false);
  const autoDownloaded = useRef(false);

  useEffect(() => {
    setPlatform(detectPlatform());

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/desktop-release', { cache: 'no-store' });
        const json = res.ok
          ? ((await res.json()) as DesktopReleaseInfo)
          : await fetchNewestPublishedRelease();
        if (!cancelled) {
          if (json?.available) setRelease(json);
          else setLoadError(true);
        }
      } catch {
        if (!cancelled) setLoadError(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!release || autoDownloaded.current || platform === 'unknown') return;
    const url = platform === 'mac' ? release.mac : release.windows;
    if (!url || url === GITHUB_RELEASES_URL) return;
    autoDownloaded.current = true;
    setAutoStarted(true);
    triggerDownload(url);
  }, [release, platform]);

  const primary = platform === 'mac' || platform === 'windows' ? platform : 'windows';
  const platforms = release
    ? (
        [
          release.mac && {
            id: 'mac' as const,
            href: release.mac,
            label: 'Download for Mac',
            sub: release.macName?.endsWith('.app.tar.gz')
              ? 'Universal · extract & run'
              : 'Universal · macOS 12+',
            ext: release.macName?.endsWith('.app.tar.gz') ? 'TAR.GZ' : 'DMG',
          },
          release.windows && {
            id: 'windows' as const,
            href: release.windows,
            label: 'Download for Windows',
            sub: release.windowsName ?? 'Windows 10 & 11',
            ext: release.windowsName?.endsWith('.msi') ? 'MSI' : 'EXE',
          },
        ].filter(Boolean) as Array<{
          id: 'mac' | 'windows';
          href: string;
          label: string;
          sub: string;
          ext: string;
        }>
      )
    : [];

  return (
    <div className="min-h-screen bg-charcoal text-neutral-100">
      <header className="border-b border-white/[0.06] bg-charcoal/95 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-6">
          <Link href="/" className="font-display text-base tracking-tight text-neutral-100">
            general.exchange
          </Link>
          <Link
            href={legendHref()}
            className="text-[12px] tracking-wide text-zinc-400 transition-colors hover:text-tan"
          >
            Web terminal
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
            The full Legend terminal — live IBKR data, options chain, and charts — as a native app
            on your machine.
          </p>

          {release && (
            <p className="mt-6 font-mono text-[13px] text-tan/90">
              Current release: <span className="font-semibold">v{release.version}</span>
            </p>
          )}

          {autoStarted && (
            <p className="mt-4 text-[13px] text-tan/90">
              Your download should start automatically. If it didn&apos;t, use the buttons below.
            </p>
          )}

          {loadError && !release && (
            <p className="mt-6 text-[13px] text-rose-400/90">
              Could not load release info.{' '}
              <a href={GITHUB_RELEASES_URL} className="underline hover:text-rose-300">
                Open GitHub releases
              </a>
            </p>
          )}

          {!release && !loadError && (
            <p className="mt-8 text-[13px] text-zinc-500">Loading latest installer…</p>
          )}

          {release && (
            <>
              <p className="mt-8 text-[12px] uppercase tracking-[0.18em] text-zinc-600">Download</p>
              <div
                className={`mt-6 grid w-full gap-3 ${
                  platforms.length > 1 ? 'sm:grid-cols-2' : 'max-w-xs mx-auto'
                }`}
              >
                {platforms.map(({ id, href, label, sub, ext }) => {
                  const recommended = id === primary;
                  const Icon = id === 'mac' ? Apple : Monitor;

                  return (
                    <a
                      key={id}
                      href={href}
                      className={`group flex min-w-0 flex-col items-center rounded-xl px-6 py-5 transition-all duration-300 ${
                        recommended
                          ? 'border border-brass/50 bg-tan text-charcoal shadow-[0_24px_60px_-20px_rgba(210,180,140,0.45)] hover:bg-tan-muted'
                          : 'border border-white/[0.1] bg-white/[0.03] text-neutral-100 hover:border-brass/30 hover:bg-white/[0.05]'
                      }`}
                    >
                      <Icon className={`mb-3 h-6 w-6 ${recommended ? 'text-charcoal' : 'text-tan'}`} />
                      <span className="text-center text-[15px] font-semibold tracking-wide">{label}</span>
                      <span
                        className={`mt-1 text-center text-[12px] ${recommended ? 'text-charcoal/70' : 'text-zinc-500'}`}
                      >
                        {sub}
                      </span>
                      <span
                        className={`mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider ${
                          recommended ? 'text-charcoal/80' : 'text-zinc-400'
                        }`}
                      >
                        <Download className="h-3.5 w-3.5" />
                        {ext}
                        {recommended && platform !== 'unknown' && ' · recommended'}
                      </span>
                    </a>
                  );
                })}
              </div>
              {platform === 'mac' && !release.mac && release.windows && (
                <p className="mt-4 text-[13px] text-zinc-500">
                  macOS installer is not on this release yet.{' '}
                  <a href={release.releasesUrl} className="text-tan underline-offset-4 hover:underline">
                    Check GitHub for updates
                  </a>
                </p>
              )}
            </>
          )}

          <p className="mt-8 text-[13px] text-zinc-500">
            Requires IB Gateway + local IBKR service on your machine.{' '}
            <Link href={legendHref()} className="text-tan underline-offset-4 hover:underline">
              Or use the browser terminal
            </Link>
          </p>

          <a
            href={release?.releasesUrl ?? GITHUB_RELEASES_URL}
            className="mt-4 inline-flex items-center gap-1.5 text-[12px] text-zinc-600 transition-colors hover:text-zinc-400"
          >
            All releases on GitHub
            <ExternalLink className="h-3 w-3" />
          </a>
        </motion.div>
      </main>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { Download, RefreshCw, X } from 'lucide-react';
import { GITHUB_RELEASES_URL } from '@/config/desktopApp';
import { useAppUpdateNotification } from '@/hooks/useAppUpdateNotification';
import { installDesktopUpdate, openExternalUrl } from '@/lib/tauriDesktop';

/**
 * Persistent bottom bar for desktop app updates.
 * In Tauri: one-click incremental install via the updater plugin.
 * On web: links to the latest GitHub release installer.
 */
export function UpdateNotificationBar() {
  const {
    visible,
    version,
    downloadUrl,
    inDesktopApp,
    canOneClickInstall,
    dismiss,
    refresh,
  } = useAppUpdateNotification();
  const [installing, setInstalling] = useState(false);

  if (!visible || !version) return null;

  const onDownload = async () => {
    if (inDesktopApp && canOneClickInstall) {
      setInstalling(true);
      const ok = await installDesktopUpdate();
      if (!ok) {
        setInstalling(false);
        await openExternalUrl(GITHUB_RELEASES_URL);
      }
      return;
    }

    const url = downloadUrl ?? GITHUB_RELEASES_URL;
    await openExternalUrl(url);
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-brass/40 bg-[#14151a]/95 px-4 py-2.5 shadow-[0_-8px_32px_rgba(0,0,0,0.45)] backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-500">
            {inDesktopApp ? 'App update' : 'Desktop update'}
          </p>
          <p className="truncate font-sans text-sm text-zinc-100">
            Version <span className="font-semibold text-tan">{version}</span> is available
            {inDesktopApp && canOneClickInstall
              ? ' — installs in place, no full reinstall needed.'
              : ' — download the latest build.'}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => void refresh()}
            className="rounded p-1.5 text-zinc-500 transition hover:bg-white/5 hover:text-zinc-300"
            aria-label="Check for updates again"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => void onDownload()}
            disabled={installing}
            className="inline-flex items-center gap-1.5 rounded border border-brass/50 bg-brass/15 px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-wide text-tan transition hover:bg-brass/25 disabled:opacity-60"
          >
            <Download className="h-3.5 w-3.5" />
            {installing
              ? 'Installing…'
              : inDesktopApp && canOneClickInstall
                ? 'Install & restart'
                : 'Download update'}
          </button>

          <button
            type="button"
            onClick={dismiss}
            className="rounded p-1.5 text-zinc-500 transition hover:bg-white/5 hover:text-zinc-300"
            aria-label="Dismiss update notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

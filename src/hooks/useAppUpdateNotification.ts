'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  DESKTOP_APP_VERSION,
  UPDATE_CHECK_INTERVAL_MS,
  UPDATE_DISMISS_KEY,
} from '@/config/desktopApp';
import {
  fetchDesktopReleaseInfo,
  isUpdateAvailableForVersion,
  pickPlatformDownloadUrl,
  type DesktopReleaseInfo,
} from '@/lib/desktopRelease';
import {
  checkDesktopUpdate,
  getDesktopAppVersion,
  isTauriDesktop,
  onTrayCheckUpdates,
} from '@/lib/tauriDesktop';

export type AppUpdateState = {
  visible: boolean;
  version: string | null;
  tag: string | null;
  downloadUrl: string | null;
  inDesktopApp: boolean;
  canOneClickInstall: boolean;
  loading: boolean;
  dismiss: () => void;
  refresh: () => void;
};

function isDismissed(tag: string): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(UPDATE_DISMISS_KEY) === tag;
}

function dismissTag(tag: string): void {
  localStorage.setItem(UPDATE_DISMISS_KEY, tag);
}

export function useAppUpdateNotification(): AppUpdateState {
  const inDesktopApp = isTauriDesktop();
  const [loading, setLoading] = useState(true);
  const [release, setRelease] = useState<DesktopReleaseInfo | null>(null);
  const [currentVersion, setCurrentVersion] = useState(DESKTOP_APP_VERSION);
  const [tauriUpdateReady, setTauriUpdateReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const runCheck = useCallback(async () => {
    setLoading(true);
    try {
      const installedVersion = inDesktopApp ? await getDesktopAppVersion() : DESKTOP_APP_VERSION;
      setCurrentVersion(installedVersion);

      let tauriReady = false;
      let tauriVersion: string | null = null;
      if (inDesktopApp) {
        const status = await checkDesktopUpdate();
        tauriReady = status.available && Boolean(status.version);
        tauriVersion = status.version;
      }

      const info = await fetchDesktopReleaseInfo();
      if (info && (tauriReady || isUpdateAvailableForVersion(info.version, installedVersion))) {
        setRelease({
          ...info,
          version: tauriVersion ?? info.version,
          tag: tauriVersion ? `v${tauriVersion}` : info.tag,
        });
        setTauriUpdateReady(tauriReady);
      } else {
        setRelease(null);
        setTauriUpdateReady(false);
      }
    } finally {
      setLoading(false);
    }
  }, [inDesktopApp]);

  useEffect(() => {
    let cancelled = false;
    let unlistenTray: (() => void) | undefined;

    (async () => {
      await runCheck();
      if (cancelled) return;
      unlistenTray = await onTrayCheckUpdates(() => {
        if (!cancelled) void runCheck();
      });
    })();

    const interval = window.setInterval(() => {
      if (!cancelled) void runCheck();
    }, UPDATE_CHECK_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      unlistenTray?.();
    };
  }, [runCheck]);

  const tag = release?.tag ?? null;
  const version = release?.version ?? null;
  const hasUpdate =
    Boolean(version) && isUpdateAvailableForVersion(version!, currentVersion);

  useEffect(() => {
    if (tag) setDismissed(isDismissed(tag));
  }, [tag]);

  const visible = !loading && hasUpdate && Boolean(tag) && !dismissed;

  const dismiss = useCallback(() => {
    if (tag) {
      dismissTag(tag);
      setDismissed(true);
    }
  }, [tag]);

  return {
    visible,
    version,
    tag,
    downloadUrl: release
      ? pickPlatformDownloadUrl(release)
      : null,
    inDesktopApp,
    canOneClickInstall: inDesktopApp && tauriUpdateReady,
    loading,
    dismiss,
    refresh: runCheck,
  };
}

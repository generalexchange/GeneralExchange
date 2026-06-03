import React, { useState } from 'react';
import { useUiStore } from '@/stores/uiStore';
import { isTauri } from '@/lib/tauri';

/**
 * Shown when the updater reports a new version. The download proceeds in the
 * background; the restart only happens when the user clicks the button.
 */
export const UpdateBanner: React.FC = () => {
  const available = useUiStore((s) => s.updateAvailable);
  const version = useUiStore((s) => s.updateVersion);
  const [installing, setInstalling] = useState(false);

  if (!available) return null;

  const onInstall = async () => {
    setInstalling(true);
    try {
      if (isTauri()) {
        const { check } = await import('@tauri-apps/plugin-updater');
        const { relaunch } = await import('@tauri-apps/plugin-process');
        const update = await check();
        if (update) {
          await update.downloadAndInstall();
          await relaunch();
        }
      }
    } catch {
      setInstalling(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 border-b border-brass/40 bg-brass/10 px-4 py-1.5 text-[12px]">
      <span className="text-tan">
        Update available{version ? ` — v${version}` : ''}. Downloaded in the background.
      </span>
      <button
        onClick={onInstall}
        disabled={installing}
        className="rounded border border-brass/60 bg-brass/20 px-3 py-1 font-semibold text-tan hover:bg-brass/30 disabled:opacity-60"
      >
        {installing ? 'Installing…' : 'Install and Restart'}
      </button>
    </div>
  );
};

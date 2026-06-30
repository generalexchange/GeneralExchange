/**
 * Tauri desktop helpers for the bundled Next.js UI.
 * All imports are dynamic so the web build never requires Tauri packages at runtime.
 */

export function isTauriDesktop(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

export type UpdateStatus = {
  available: boolean;
  version: string | null;
  error: string | null;
};

export async function getDesktopAppVersion(): Promise<string> {
  if (!isTauriDesktop()) return '0.0.0-web';
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<string>('get_app_version');
}

export async function checkDesktopUpdate(): Promise<UpdateStatus> {
  if (!isTauriDesktop()) return { available: false, version: null, error: null };
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<UpdateStatus>('check_for_update');
}

/** Download delta/incremental update and restart (Tauri updater plugin). */
export async function installDesktopUpdate(): Promise<boolean> {
  if (!isTauriDesktop()) return false;
  try {
    const { check } = await import('@tauri-apps/plugin-updater');
    const { relaunch } = await import('@tauri-apps/plugin-process');
    const update = await check();
    if (!update) return false;
    await update.downloadAndInstall();
    await relaunch();
    return true;
  } catch {
    return false;
  }
}

export async function openExternalUrl(url: string): Promise<void> {
  if (!isTauriDesktop()) {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }
  const { openUrl } = await import('@tauri-apps/plugin-opener');
  await openUrl(url);
}

export async function onTrayCheckUpdates(handler: () => void): Promise<() => void> {
  if (!isTauriDesktop()) return () => {};
  const { listen } = await import('@tauri-apps/api/event');
  return listen('tray://check-for-updates', () => handler());
}

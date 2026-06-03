/**
 * Thin wrappers over the five Rust commands plus tray event wiring. Everything
 * is guarded by `isTauri()` so the same React build also runs in a plain
 * browser (used for `vite` dev and CI typechecking) without throwing.
 */

import { TOUR_STORAGE_KEY } from '@/lib/constants';

interface StoredAuth {
  token: string;
  refresh_token: string;
}

export function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

async function core() {
  return import('@tauri-apps/api/core');
}

export async function getStoredAuth(): Promise<StoredAuth | null> {
  if (!isTauri()) {
    const raw = localStorage.getItem('ge.terminal.auth');
    return raw ? (JSON.parse(raw) as StoredAuth) : null;
  }
  const { invoke } = await core();
  return invoke<StoredAuth | null>('get_auth_token');
}

export async function setStoredAuth(token: string, refreshToken: string): Promise<void> {
  if (!isTauri()) {
    localStorage.setItem('ge.terminal.auth', JSON.stringify({ token, refresh_token: refreshToken }));
    return;
  }
  const { invoke } = await core();
  await invoke('set_auth_token', { token, refreshToken });
}

export async function clearStoredAuth(): Promise<void> {
  if (!isTauri()) {
    localStorage.removeItem('ge.terminal.auth');
    return;
  }
  const { invoke } = await core();
  await invoke('clear_auth_token');
}

export async function getAppVersion(): Promise<string> {
  if (!isTauri()) return '0.1.0-web';
  const { invoke } = await core();
  return invoke<string>('get_app_version');
}

export interface UpdateStatus {
  available: boolean;
  version: string | null;
  error: string | null;
}

export async function checkForUpdate(): Promise<UpdateStatus> {
  if (!isTauri()) return { available: false, version: null, error: null };
  const { invoke } = await core();
  return invoke<UpdateStatus>('check_for_update');
}

/** Open a URL in the system default browser. */
export async function openExternal(url: string): Promise<void> {
  if (!isTauri()) {
    window.open(url, '_blank', 'noopener');
    return;
  }
  const { openUrl } = await import('@tauri-apps/plugin-opener');
  await openUrl(url);
}

/** Listen for the "Check for Updates" tray menu event. Returns an unlisten fn. */
export async function onTrayCheckUpdates(handler: () => void): Promise<() => void> {
  if (!isTauri()) return () => {};
  const { listen } = await import('@tauri-apps/api/event');
  return listen('tray://check-for-updates', () => handler());
}

// --- onboarding tour persistence (local; survives restarts) ----------------
export function isTourCompleted(): boolean {
  return localStorage.getItem(TOUR_STORAGE_KEY) === '1';
}

export function markTourCompleted(): void {
  localStorage.setItem(TOUR_STORAGE_KEY, '1');
}

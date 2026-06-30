/** In-app navigation helpers for the Tauri desktop bundle (no legend subdomain). */

export function isTauriApp(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

/** Legend dashboard path inside the desktop installer. */
export const DESKTOP_LEGEND_PATH = '/dashboard/';

/** Marketing paths that should not appear in the desktop shell. */
const DESKTOP_BLOCKED_PREFIXES = [
  '/company',
  '/university',
  '/stocks',
  '/fixed-income',
  '/coffee',
  '/assembly',
  '/warehouse',
  '/tradeengine',
  '/download',
  '/pricing',
];

export function isDesktopBlockedPath(pathname: string): boolean {
  if (!isTauriApp()) return false;
  if (pathname === '/' || pathname === '') return false;
  if (pathname.startsWith('/dashboard')) return false;
  if (pathname.startsWith('/login')) return false;
  if (pathname.startsWith('/request-access')) return false;
  return DESKTOP_BLOCKED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

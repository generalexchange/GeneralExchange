/** Must stay in sync with apps/desktop/src-tauri/tauri.conf.json version. */
export const DESKTOP_APP_VERSION =
  process.env.NEXT_PUBLIC_DESKTOP_APP_VERSION?.trim() || '0.2.9';

export const UPDATE_DISMISS_KEY = 'ge-update-dismissed-tag';
export const UPDATE_CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;

export const GITHUB_RELEASES_URL =
  'https://github.com/generalexchange/GeneralExchange/releases/latest';

export const GITHUB_RELEASES_API =
  'https://api.github.com/repos/generalexchange/GeneralExchange/releases/latest';

export const GITHUB_RELEASES_LIST =
  'https://api.github.com/repos/generalexchange/GeneralExchange/releases?per_page=15';

export const GH_HEADERS = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'general-exchange-web',
};

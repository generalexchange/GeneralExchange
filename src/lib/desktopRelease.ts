import {
  DESKTOP_APP_VERSION,
  GITHUB_RELEASES_API,
  GITHUB_RELEASES_URL,
} from '@/config/desktopApp';
import { isVersionNewer, normalizeVersionTag } from '@/lib/compareVersions';

export type DesktopReleaseInfo = {
  available: boolean;
  tag: string;
  version: string;
  releasesUrl: string;
  windows: string | null;
  mac: string | null;
  windowsName: string | null;
  macName: string | null;
};

function pickWindowsAsset(assets: Array<{ name: string; browser_download_url: string }>) {
  return (
    assets.find((a) => /-setup\.exe$/i.test(a.name)) ??
    assets.find((a) => /\.exe$/i.test(a.name) && !/\.sig$/i.test(a.name))
  );
}

function pickMacAsset(assets: Array<{ name: string; browser_download_url: string }>) {
  return (
    assets.find((a) => /\.dmg$/i.test(a.name) && /universal/i.test(a.name)) ??
    assets.find((a) => /\.dmg$/i.test(a.name))
  );
}

/** Fetch latest desktop release from GitHub (works in browser and static desktop bundle). */
export async function fetchLatestDesktopRelease(): Promise<DesktopReleaseInfo | null> {
  try {
    const res = await fetch(GITHUB_RELEASES_API, {
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'general-exchange-web' },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const release = (await res.json()) as {
      tag_name: string;
      html_url: string;
      assets: Array<{ name: string; browser_download_url: string }>;
    };
    const windows = pickWindowsAsset(release.assets);
    const mac = pickMacAsset(release.assets);
    const tag = release.tag_name;
    return {
      available: Boolean(windows || mac),
      tag,
      version: normalizeVersionTag(tag),
      releasesUrl: release.html_url,
      windows: windows?.browser_download_url ?? null,
      mac: mac?.browser_download_url ?? null,
      windowsName: windows?.name ?? null,
      macName: mac?.name ?? null,
    };
  } catch {
    return null;
  }
}

/** Fetch from Next.js API when available (web deploy); fall back to GitHub. */
export async function fetchDesktopReleaseInfo(): Promise<DesktopReleaseInfo | null> {
  try {
    const res = await fetch('/api/desktop-release', { cache: 'no-store' });
    if (res.ok) {
      const json = (await res.json()) as DesktopReleaseInfo & { tag?: string };
      if (json.available && json.tag) {
        return {
          ...json,
          version: json.version ?? normalizeVersionTag(json.tag),
        };
      }
    }
  } catch {
    /* static desktop bundle has no API routes */
  }
  return fetchLatestDesktopRelease();
}

export function pickPlatformDownloadUrl(info: DesktopReleaseInfo): string {
  if (typeof navigator === 'undefined') return info.windows ?? info.mac ?? info.releasesUrl;
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('mac') && info.mac) return info.mac;
  if (info.windows) return info.windows;
  return info.mac ?? info.releasesUrl;
}

export function isUpdateAvailableForVersion(
  latestVersion: string,
  currentVersion = DESKTOP_APP_VERSION,
): boolean {
  return isVersionNewer(latestVersion, currentVersion);
}

export { GITHUB_RELEASES_URL };

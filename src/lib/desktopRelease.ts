import {
  DESKTOP_APP_VERSION,
  GITHUB_RELEASES_API,
  GITHUB_RELEASES_LIST,
  GITHUB_RELEASES_URL,
  GH_HEADERS,
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
    assets.find((a) => /\.dmg$/i.test(a.name)) ??
    assets.find((a) => /\.app\.tar\.gz$/i.test(a.name) && /universal/i.test(a.name))
  );
}

type GithubRelease = {
  tag_name: string;
  html_url: string;
  draft: boolean;
  assets: Array<{ name: string; browser_download_url: string }>;
};

function mapGithubRelease(release: GithubRelease): DesktopReleaseInfo | null {
  if (release.draft) return null;
  const windows = pickWindowsAsset(release.assets);
  const mac = pickMacAsset(release.assets);
  if (!windows && !mac) return null;
  const tag = release.tag_name;
  return {
    available: true,
    tag,
    version: normalizeVersionTag(tag),
    releasesUrl: release.html_url,
    windows: windows?.browser_download_url ?? null,
    mac: mac?.browser_download_url ?? null,
    windowsName: windows?.name ?? null,
    macName: mac?.name ?? null,
  };
}

/** Newest published (non-draft) release with installer assets. */
export async function fetchNewestPublishedRelease(): Promise<DesktopReleaseInfo | null> {
  try {
    const res = await fetch(GITHUB_RELEASES_LIST, { headers: GH_HEADERS, cache: 'no-store' });
    if (res.ok) {
      const releases = (await res.json()) as GithubRelease[];
      for (const release of releases) {
        const info = mapGithubRelease(release);
        if (info) return info;
      }
    }
  } catch {
    /* fall through */
  }
  return fetchLatestDesktopRelease();
}

/** Fetch latest desktop release from GitHub /releases/latest endpoint. */
export async function fetchLatestDesktopRelease(): Promise<DesktopReleaseInfo | null> {
  try {
    const res = await fetch(GITHUB_RELEASES_API, { headers: GH_HEADERS, cache: 'no-store' });
    if (!res.ok) return null;
    const release = (await res.json()) as GithubRelease;
    return mapGithubRelease(release);
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
  return fetchNewestPublishedRelease();
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

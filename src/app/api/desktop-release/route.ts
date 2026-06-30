import { NextResponse } from 'next/server';

const GITHUB_REPO = 'generalexchange/GeneralExchange';

type GitHubAsset = {
  name: string;
  browser_download_url: string;
};

function pickWindowsAsset(assets: GitHubAsset[]): GitHubAsset | undefined {
  return (
    assets.find((a) => /-setup\.exe$/i.test(a.name)) ??
    assets.find((a) => /\.exe$/i.test(a.name) && !/\.sig$/i.test(a.name))
  );
}

function pickMacAsset(assets: GitHubAsset[]): GitHubAsset | undefined {
  return (
    assets.find((a) => /\.dmg$/i.test(a.name) && /universal/i.test(a.name)) ??
    assets.find((a) => /\.dmg$/i.test(a.name))
  );
}

export async function GET() {
  const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'general-exchange-web',
    },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    return NextResponse.json(
      {
        available: false,
        releasesUrl: `https://github.com/${GITHUB_REPO}/releases`,
      },
      { status: 404 },
    );
  }

  const release = (await res.json()) as {
    tag_name: string;
    html_url: string;
    assets: GitHubAsset[];
  };

  const windows = pickWindowsAsset(release.assets);
  const mac = pickMacAsset(release.assets);

  return NextResponse.json({
    available: Boolean(windows || mac),
    tag: release.tag_name,
    version: release.tag_name.replace(/^v/i, ''),
    releasesUrl: release.html_url,
    windows: windows?.browser_download_url ?? null,
    mac: mac?.browser_download_url ?? null,
    windowsName: windows?.name ?? null,
    macName: mac?.name ?? null,
  });
}

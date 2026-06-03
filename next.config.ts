import type { NextConfig } from 'next';

// When DESKTOP_BUILD=1 the app is compiled to a fully static bundle that ships
// *inside* the Tauri desktop installer (no Node server at runtime). The bundled
// UI talks to the live general.exchange services over the network for data.
// The regular web/Vercel build leaves all of this untouched.
const isDesktopBuild = process.env.DESKTOP_BUILD === '1';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(isDesktopBuild
    ? {
        // Emit a static `out/` directory the desktop shell loads from disk.
        output: 'export' as const,
        // Relative asset paths so they resolve under the tauri:// origin.
        trailingSlash: true,
        // Image Optimization needs a server; the desktop bundle has none.
        images: { unoptimized: true },
      }
    : {
        images: {
          remotePatterns: [
            { protocol: 'https' as const, hostname: 'images.unsplash.com', pathname: '/**' },
          ],
        },
        // Redirects require a server; they are no-ops in a static export.
        async redirects() {
          return [
            { source: '/strategies', destination: '/stocks', permanent: true },
            { source: '/dividend-properties', destination: '/fixed-income', permanent: true },
            { source: '/ether-bonds', destination: '/town-and-cattle', permanent: true },
            { source: '/sentiment', destination: '/fixed-income', permanent: true },
            { source: '/lecture-hall', destination: '/assembly', permanent: true },
            { source: '/money-bagg', destination: '/coffee', permanent: true },
            { source: '/reconnaissance', destination: '/warehouse', permanent: true },
            { source: '/the-engine', destination: '/tradeengine', permanent: true },
            { source: '/trade-engine', destination: '/tradeengine', permanent: true },
          ];
        },
      }),
  // Apache Perspective ships ESM + WebAssembly. Transpile its packages and
  // enable async WebAssembly so the WASM data engine loads in the browser. The
  // viewer is only ever imported from a client component with ssr:false, so the
  // server bundle never touches it.
  transpilePackages: [
    '@finos/perspective',
    '@finos/perspective-viewer',
    '@finos/perspective-viewer-datagrid',
    '@finos/perspective-viewer-d3fc',
  ],
  webpack: (config, { isServer, dev }) => {
    config.experiments = { ...config.experiments, asyncWebAssembly: true, topLevelAwait: true };
    // OneDrive can miss native FS events; polling keeps dev HMR reliable on save.
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    // Perspective references Node built-ins that don't exist in the browser.
    if (!isServer) {
      config.resolve = config.resolve || {};
      config.resolve.fallback = { ...config.resolve.fallback, fs: false, path: false, crypto: false };
    }
    return config;
  },
};

export default nextConfig;

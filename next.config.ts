import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
  webpack: (config, { isServer }) => {
    config.experiments = { ...config.experiments, asyncWebAssembly: true, topLevelAwait: true };
    // Perspective references Node built-ins that don't exist in the browser.
    if (!isServer) {
      config.resolve = config.resolve || {};
      config.resolve.fallback = { ...config.resolve.fallback, fs: false, path: false, crypto: false };
    }
    return config;
  },
  async redirects() {
    return [
      { source: '/strategies', destination: '/stocks', permanent: true },
      { source: '/dividend-properties', destination: '/fixed-income', permanent: true },
      { source: '/ether-bonds', destination: '/town-and-cattle', permanent: true },
      { source: '/sentiment', destination: '/fixed-income', permanent: true },
      { source: '/lecture-hall', destination: '/assembly', permanent: true },
      { source: '/money-bagg', destination: '/coffee', permanent: true },
      { source: '/bridge-observer', destination: '/rockefeller', permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
    ],
  },
};

export default nextConfig;

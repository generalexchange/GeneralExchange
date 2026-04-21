import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
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

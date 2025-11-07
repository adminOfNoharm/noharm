/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    domains: ['qupvanpbdjpeapqrlyin.supabase.co'],
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      }
    ]
  },
  webpack: (config, { isServer }) => {
    // Canvas configuration for PDF viewer
    if (isServer) {
      config.externals = [...config.externals, 'canvas'];
    }

    // Required for PDF.js worker
    config.resolve.alias.canvas = false;

    return config;
  },
  transpilePackages: ['@react-pdf-viewer/core'],
};

module.exports = nextConfig; 
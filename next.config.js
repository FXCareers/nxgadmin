/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    unoptimized: true,
    domains: ['api.nxgmarkets.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.nxgmarkets.com',
        port: '',
        pathname: '/api/uploads/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/health',
        destination: '/api/health',
      },
      {
        source: '/api/:path*',
        destination: 'https://api.nxgmarkets.com/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
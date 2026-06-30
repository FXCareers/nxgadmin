/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    domains: ['api.yagroup.org'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.yagroup.org',
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
        destination: 'https://api.yagroup.org/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
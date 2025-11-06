/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://localhost:7025/api/:path*',
      },
    ]
  },
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '7025',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig

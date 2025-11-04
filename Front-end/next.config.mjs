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
    // ✅ Cho phép tải ảnh từ các domain này
    domains: [
      'localhost',
      'www.icantech.vn',
      's3.icankid.io',
     "cdn.mysite.com",
      "example.com"
    ],

    // ✅ Cấu hình thêm remotePatterns để Next biết cụ thể URL pattern
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '7025',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '3001',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.icantech.vn',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's3.icankid.io',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig

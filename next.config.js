/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'rokdbot.com', 'www.rokdbot.com'],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  env: {
    SITE_URL: process.env.NODE_ENV === 'production' ? 'https://rokdbot.com' : 'http://localhost:3000',
    GA_MEASUREMENT_ID: process.env.GA_MEASUREMENT_ID,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig

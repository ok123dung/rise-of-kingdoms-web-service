const { withSentryConfig } = require('@sentry/nextjs')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix Prisma EPERM on Windows - prevent Next.js from tracing Prisma files
  experimental: {
    outputFileTracingIgnores: ['node_modules/@prisma/**']
  },
  typescript: {
    ignoreBuildErrors: false // Enforce type safety
  },
  // Image optimization with remotePatterns (Next.js 16)
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'rokdbot.com' },
      { protocol: 'https', hostname: 'www.rokdbot.com' }
    ],
    formats: ['image/webp', 'image/avif']
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  // Tree-shaking for lucide-react icons - reduces bundle by 50-100KB
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}'
    }
  },
  // Next.js 16: serverComponentsExternalPackages moved to top level
  serverExternalPackages: ['@prisma/client'],
  env: {
    SITE_URL:
      process.env.NODE_ENV === 'production' ? 'https://rokdbot.com' : 'http://localhost:3000',
    GA_MEASUREMENT_ID: process.env.GA_MEASUREMENT_ID
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          }
          // CSP is handled by middleware
        ]
      }
    ]
  }
}

// Wrap with Sentry config
module.exports = withSentryConfig(
  nextConfig,
  {
    // Sentry webpack plugin options
    silent: true, // Suppresses source map uploading logs during build
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT
  },
  {
    // Additional config options
    widenClientFileUpload: true,
    transpileClientSDK: true,
    tunnelRoute: '/monitoring',
    hideSourceMaps: true,
    disableLogger: true,
    automaticVercelMonitors: true
  }
)

const { withSentryConfig } = require('@sentry/nextjs')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint during production builds
  eslint: {
    ignoreDuringBuilds: true
  },
  images: {
    domains: ['localhost', 'rokdbot.com', 'www.rokdbot.com'],
    formats: ['image/webp', 'image/avif']
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
    instrumentationHook: true
  },
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
          },
          // CSP is handled by middleware with nonces for better security
          // This is a fallback CSP without unsafe-inline or unsafe-eval
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://api.resend.com https://www.google-analytics.com https://*.sentry.io wss://rokdbot.com wss://www.rokdbot.com; frame-ancestors 'none'; form-action 'self'; base-uri 'self'; object-src 'none'; worker-src 'self' blob:;"
          }
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

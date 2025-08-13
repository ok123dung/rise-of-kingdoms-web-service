// Client-side environment variables (NEXT_PUBLIC_* only)
export const clientEnv = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL!,
  appUrl: process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL!,
  gaId: process.env.NEXT_PUBLIC_GA_ID,
  sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development'
}

// Validate required client environment variables
if (typeof window !== 'undefined') {
  const required = ['NEXT_PUBLIC_SITE_URL']
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    console.error(`Missing required client environment variables: ${missing.join(', ')}`)
  }
}
import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN

Sentry.init({
  dsn: SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Release Tracking
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Integrations
  integrations: [
    // Replay and BrowserTracing are built-in with Next.js Sentry integration
  ],
  
  // Filtering
  beforeSend(event, hint) {
    // Filter out non-error events in development
    if (process.env.NODE_ENV === 'development') {
      if (event.level !== 'error') {
        return null
      }
    }
    
    // Filter out specific errors
    const error = hint.originalException
    if (error && error instanceof Error) {
      // Ignore network errors
      if (error.message?.includes('NetworkError') || 
          error.message?.includes('Failed to fetch')) {
        return null
      }
      
      // Ignore browser extension errors
      if (error.message?.includes('extension://')) {
        return null
      }
      
      // Ignore ResizeObserver errors
      if (error.message?.includes('ResizeObserver')) {
        return null
      }
    }
    
    // Add user context
    if (event.user) {
      event.user = {
        ...event.user,
        ip_address: '{{auto}}',
      }
    }
    
    return event
  },
  
  // Ignore specific errors
  ignoreErrors: [
    // Browser errors
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    'Non-Error promise rejection captured',
    
    // Network errors
    'NetworkError',
    'Failed to fetch',
    'Load failed',
    
    // Browser extensions
    'chrome-extension',
    'moz-extension',
    'safari-extension',
    
    // Common third-party errors
    'fb_xd_fragment',
    'Can\'t find variable: ZiteReader',
    'jigsaw is not defined',
    'ComboSearch is not defined',
    
    // NextAuth errors to ignore
    'NEXT_REDIRECT',
  ],
  
  // Breadcrumbs
  beforeBreadcrumb(breadcrumb) {
    // Filter out noisy breadcrumbs
    if (breadcrumb.category === 'console' && breadcrumb.level === 'debug') {
      return null
    }
    
    // Don't log sensitive data
    if (breadcrumb.category === 'fetch' || breadcrumb.category === 'xhr') {
      if (breadcrumb.data?.url?.includes('/api/auth/')) {
        breadcrumb.data = {
          ...breadcrumb.data,
          url: '[Filtered]',
        }
      }
    }
    
    return breadcrumb
  },
})
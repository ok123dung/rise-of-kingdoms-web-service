import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

Sentry.init({
  dsn: SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Release Tracking
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Integrations
  integrations: [
    // Prisma integration will be added conditionally when available
  ],
  
  // Filtering
  beforeSend(event, hint) {
    // Filter out non-error events in development
    if (process.env.NODE_ENV === 'development') {
      if (event.level !== 'error') {
        return null
      }
    }
    
    // Don't send sensitive data
    if (event.request) {
      // Remove auth headers
      if (event.request.headers) {
        delete event.request.headers['authorization']
        delete event.request.headers['cookie']
        delete event.request.headers['x-api-key']
      }
      
      // Remove sensitive query params
      if (event.request.query_string) {
        const params = new URLSearchParams(event.request.query_string)
        params.delete('token')
        params.delete('secret')
        params.delete('key')
        event.request.query_string = params.toString()
      }
    }
    
    // Add server context
    event.contexts = {
      ...event.contexts,
      runtime: {
        name: 'node',
        version: process.version,
      },
    }
    
    return event
  },
  
  // Ignore specific errors
  ignoreErrors: [
    // Prisma errors to ignore
    'PrismaClientKnownRequestError',
    'Invalid `prisma.user.findUnique()` invocation',
    
    // Database connection errors (handled by retry logic)
    'Connection pool timeout',
    'Database connection lost',
    
    // NextAuth errors to ignore
    'NEXT_REDIRECT',
    'Callback for provider',
    
    // Common errors
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
  ],
  
  // Breadcrumbs
  beforeBreadcrumb(breadcrumb) {
    // Filter database queries with sensitive data
    if (breadcrumb.category === 'query') {
      if (breadcrumb.message?.includes('password') || 
          breadcrumb.message?.includes('token') ||
          breadcrumb.message?.includes('secret')) {
        return null
      }
    }
    
    return breadcrumb
  },
})
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

  // Edge-specific options
  transportOptions: {
    // Reduce timeout for edge functions
    fetchOptions: {
      // Note: timeout is not a standard fetch option
      // We'll handle timeouts at the application level
    }
  },

  // Filtering
  beforeSend(event, hint) {
    // Add edge runtime context
    event.contexts = {
      ...event.contexts,
      runtime: {
        name: 'edge'
      }
    }

    // Filter sensitive data
    if (event.request?.headers) {
      delete event.request.headers['authorization']
      delete event.request.headers['cookie']
    }

    return event
  },

  // Ignore specific edge errors
  ignoreErrors: [
    'Edge Function Invocation Timeout',
    'EDGE_FUNCTION_INVOCATION_TIMEOUT',
    'EDGE_RUNTIME_WEBPACK_ERRORS'
  ]
})

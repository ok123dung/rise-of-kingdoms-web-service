export async function register() {
  // Skip during Vercel build phase - critical for deployment
  if (process.env.NEXT_PHASE === 'phase-production-build' || process.env.VERCEL_ENV === undefined && process.env.VERCEL) {
    console.log('⏭️  Skipping instrumentation during build phase')
    return
  }

  // Skip if database URL is not properly configured
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('username:password')) {
    console.warn('⚠️  DATABASE_URL not configured properly. Skipping instrumentation.')
    console.warn('Please update your .env.local file with actual database credentials.')
    return
  }

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      // Server-side instrumentation
      await import('../sentry.server.config')

      // Import monitoring utilities
      const { startWebhookJobs } = await import('./lib/webhooks/processor')
      const { initializeWebSocketServer } = await import('./lib/websocket/init')

      // Start webhook processor (only in production)
      if (process.env.NODE_ENV === 'production') {
        startWebhookJobs()
      }

      // Initialize WebSocket server if needed
      if (process.env.ENABLE_WEBSOCKET === 'true') {
        const wsPort = parseInt(process.env.WS_PORT || '3001', 10)
        initializeWebSocketServer(wsPort)
      }
    } catch (error) {
      console.error('Failed to initialize instrumentation:', error)
    }
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge runtime instrumentation
    // await import('../sentry.edge.config')
  }
}

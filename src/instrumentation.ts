export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
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
  }
  
  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge runtime instrumentation
    await import('../sentry.edge.config')
  }
}
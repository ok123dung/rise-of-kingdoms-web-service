import { createServer } from 'http'

import { getLogger } from '@/lib/monitoring/logger'

import { WebSocketServer } from './server'

let wsServer: WebSocketServer | null = null

// Check if we're in a Vercel serverless environment
const isVercelServerless = process.env.VERCEL && !process.env.ENABLE_WEBSOCKET

export function initializeWebSocketServer(port = 3001) {
  // WebSocket servers don't work in Vercel's serverless environment
  if (isVercelServerless) {
    getLogger().warn('WebSocket server not supported in Vercel serverless. Skipping initialization.')
    return null
  }

  if (wsServer) {
    getLogger().info('WebSocket server already initialized')
    return wsServer
  }

  try {
    // Create HTTP server for WebSocket
    const httpServer = createServer()

    // Initialize WebSocket server
    wsServer = new WebSocketServer(httpServer)

    // Start listening
    httpServer.listen(port, () => {
      getLogger().info(`WebSocket server running on port ${port}`)
    })

    // Handle shutdown gracefully
    process.on('SIGTERM', () => {
      getLogger().info('SIGTERM received, closing WebSocket server')
      httpServer.close(() => {
        getLogger().info('WebSocket server closed')
      })
    })

    return wsServer
  } catch (error) {
    getLogger().error('Failed to initialize WebSocket server', error as Error)
    throw error
  }
}

export function getWebSocketServer(): WebSocketServer | null {
  return wsServer
}

// Helper to emit events from API routes
export function emitWebSocketEvent(
  type: 'user' | 'role' | 'booking',
  target: string,
  event: string,
  data: Record<string, unknown>
) {
  const ws = getWebSocketServer()
  if (!ws) {
    getLogger().warn('WebSocket server not initialized')
    return
  }

  switch (type) {
    case 'user':
      ws.emitToUser(target, event, data)
      break
    case 'role':
      ws.emitToRole(target, event, data)
      break
    case 'booking':
      ws.emitToBooking(target, event, data)
      break
  }
}

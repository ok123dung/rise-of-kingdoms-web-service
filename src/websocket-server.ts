import { config } from 'dotenv'

import { getLogger } from './lib/monitoring/logger'
import { initializeWebSocketServer } from './lib/websocket/init'

// Load environment variables
config()

const PORT = parseInt(process.env.WS_PORT ?? '3002', 10)
const logger = getLogger()

// Only log in development
if (process.env.NODE_ENV === 'development') {
  logger.info('Starting WebSocket server...')
}

try {
  initializeWebSocketServer(PORT)
  if (process.env.NODE_ENV === 'development') {
    logger.info(`✅ WebSocket server started on port ${PORT}`)
  }
} catch (error) {
  if (process.env.NODE_ENV === 'development') {
    logger.error(
      '❌ Failed to start WebSocket server:',
      error instanceof Error ? error : new Error(String(error))
    )
  }
  process.exit(1)
}

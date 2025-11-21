import { config } from 'dotenv'

import { initializeWebSocketServer } from './lib/websocket/init'

// Load environment variables
config()

const PORT = parseInt(process.env.WS_PORT || '3001', 10)

// Only log in development
if (process.env.NODE_ENV === 'development') {
  console.log('Starting WebSocket server...')
}

try {
  initializeWebSocketServer(PORT)
  if (process.env.NODE_ENV === 'development') {
    console.log(`✅ WebSocket server started on port ${PORT}`)
  }
} catch (error) {
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Failed to start WebSocket server:', error)
  }
  process.exit(1)
}

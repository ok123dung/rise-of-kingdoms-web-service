import { initializeWebSocketServer } from './lib/websocket/init'
import { config } from 'dotenv'
// Load environment variables
config()
const PORT = parseInt(process.env.WS_PORT || '3001', 10)
console.log('Starting WebSocket server...')
try {
  initializeWebSocketServer(PORT)
  console.log(`✅ WebSocket server started on port ${PORT}`)
} catch (error) {
  console.error('❌ Failed to start WebSocket server:', error)
  process.exit(1)
}
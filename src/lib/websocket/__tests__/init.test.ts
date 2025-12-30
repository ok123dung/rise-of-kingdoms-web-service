/**
 * WebSocket Init Tests
 * Tests for WebSocket server initialization and helper functions
 */

// Mock logger
const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
}

jest.mock('@/lib/monitoring/logger', () => ({
  getLogger: () => mockLogger
}))

// Mock http createServer
const mockListen = jest.fn((port: number, callback: () => void) => callback())
const mockClose = jest.fn((callback: () => void) => callback())
const mockHttpServer = {
  listen: mockListen,
  close: mockClose
}

jest.mock('http', () => ({
  createServer: jest.fn(() => mockHttpServer)
}))

// Mock WebSocketServer class
const mockWsEmitToUser = jest.fn()
const mockWsEmitToRole = jest.fn()
const mockWsEmitToBooking = jest.fn()

jest.mock('../server', () => ({
  WebSocketServer: jest.fn().mockImplementation(() => ({
    emitToUser: mockWsEmitToUser,
    emitToRole: mockWsEmitToRole,
    emitToBooking: mockWsEmitToBooking
  }))
}))

describe('WebSocket Init', () => {
  // Store original env
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
    process.env = { ...originalEnv }
    delete process.env.VERCEL
    delete process.env.ENABLE_WEBSOCKET
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('initializeWebSocketServer', () => {
    it('should initialize WebSocket server on specified port', async () => {
      // Fresh import after resetting modules
      const { initializeWebSocketServer } = await import('../init')

      const result = initializeWebSocketServer(3002)

      expect(result).not.toBeNull()
      expect(mockListen).toHaveBeenCalledWith(3002, expect.any(Function))
      expect(mockLogger.info).toHaveBeenCalledWith(
        'WebSocket server running on port 3002'
      )
    })

    it('should use default port 3001', async () => {
      const { initializeWebSocketServer } = await import('../init')

      initializeWebSocketServer()

      expect(mockListen).toHaveBeenCalledWith(3001, expect.any(Function))
    })

    it('should return existing server if already initialized', async () => {
      const { initializeWebSocketServer } = await import('../init')

      const first = initializeWebSocketServer()
      const second = initializeWebSocketServer()

      expect(first).toBe(second)
      expect(mockLogger.info).toHaveBeenCalledWith(
        'WebSocket server already initialized'
      )
    })

    it('should skip initialization in Vercel serverless', async () => {
      process.env.VERCEL = '1'
      // Re-import to pick up env changes
      jest.resetModules()
      const { initializeWebSocketServer } = await import('../init')

      const result = initializeWebSocketServer()

      expect(result).toBeNull()
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('WebSocket server not supported in Vercel')
      )
    })

    it('should initialize if ENABLE_WEBSOCKET is set on Vercel', async () => {
      process.env.VERCEL = '1'
      process.env.ENABLE_WEBSOCKET = 'true'
      jest.resetModules()
      const { initializeWebSocketServer } = await import('../init')

      const result = initializeWebSocketServer()

      expect(result).not.toBeNull()
    })
  })

  describe('getWebSocketServer', () => {
    it('should return null before initialization', async () => {
      jest.resetModules()
      const { getWebSocketServer } = await import('../init')

      const result = getWebSocketServer()

      expect(result).toBeNull()
    })

    it('should return server after initialization', async () => {
      jest.resetModules()
      const { initializeWebSocketServer, getWebSocketServer } = await import('../init')

      initializeWebSocketServer()
      const result = getWebSocketServer()

      expect(result).not.toBeNull()
    })
  })

  describe('emitWebSocketEvent', () => {
    it('should emit to user', async () => {
      jest.resetModules()
      const { initializeWebSocketServer, emitWebSocketEvent } = await import('../init')

      initializeWebSocketServer()
      emitWebSocketEvent('user', 'user-123', 'test:event', { data: 'test' })

      expect(mockWsEmitToUser).toHaveBeenCalledWith(
        'user-123',
        'test:event',
        { data: 'test' }
      )
    })

    it('should emit to role', async () => {
      jest.resetModules()
      const { initializeWebSocketServer, emitWebSocketEvent } = await import('../init')

      initializeWebSocketServer()
      emitWebSocketEvent('role', 'admin', 'admin:event', { data: 'admin' })

      expect(mockWsEmitToRole).toHaveBeenCalledWith(
        'admin',
        'admin:event',
        { data: 'admin' }
      )
    })

    it('should emit to booking', async () => {
      jest.resetModules()
      const { initializeWebSocketServer, emitWebSocketEvent } = await import('../init')

      initializeWebSocketServer()
      emitWebSocketEvent('booking', 'booking-456', 'booking:event', { status: 'updated' })

      expect(mockWsEmitToBooking).toHaveBeenCalledWith(
        'booking-456',
        'booking:event',
        { status: 'updated' }
      )
    })

    it('should warn when server not initialized', async () => {
      jest.resetModules()
      const { emitWebSocketEvent } = await import('../init')

      emitWebSocketEvent('user', 'user-123', 'test:event', { data: 'test' })

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'WebSocket server not initialized'
      )
      expect(mockWsEmitToUser).not.toHaveBeenCalled()
    })
  })
})

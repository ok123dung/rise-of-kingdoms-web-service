/**
 * WebSocket Server Tests
 * Tests for WebSocketServer class
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

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    bookings: {
      findFirst: jest.fn()
    },
    communications: {
      create: jest.fn()
    }
  }
}))

// Mock JWT
jest.mock('@/lib/auth/jwt', () => ({
  verifyToken: jest.fn()
}))

// Mock socket.io
const mockTo = jest.fn().mockReturnThis()
const mockEmit = jest.fn()
const mockJoin = jest.fn()
const mockOn = jest.fn()
const mockUse = jest.fn()

const mockIoTo = jest.fn().mockReturnValue({ emit: mockEmit })
const mockIoOn = jest.fn()
const mockIoUse = jest.fn()

jest.mock('socket.io', () => ({
  Server: jest.fn().mockImplementation(() => ({
    use: mockIoUse,
    on: mockIoOn,
    to: mockIoTo
  }))
}))

import { WebSocketServer } from '../server'
import { verifyToken } from '@/lib/auth/jwt'
import { prisma } from '@/lib/db'

const mockVerifyToken = verifyToken as jest.MockedFunction<typeof verifyToken>
const mockPrismaBookings = prisma.bookings as jest.Mocked<typeof prisma.bookings>
const mockPrismaCommunications = prisma.communications as jest.Mocked<typeof prisma.communications>

describe('WebSocketServer', () => {
  let wsServer: WebSocketServer
  let mockHttpServer: any

  beforeEach(() => {
    jest.clearAllMocks()
    mockHttpServer = {}
    wsServer = new WebSocketServer(mockHttpServer)
  })

  describe('constructor', () => {
    it('should create SocketIO server with correct config', () => {
      const { Server } = require('socket.io')
      expect(Server).toHaveBeenCalledWith(mockHttpServer, {
        cors: {
          origin: expect.any(String),
          credentials: true
        },
        transports: ['websocket', 'polling']
      })
    })

    it('should set up middleware', () => {
      expect(mockIoUse).toHaveBeenCalled()
    })

    it('should set up connection handler', () => {
      expect(mockIoOn).toHaveBeenCalledWith('connection', expect.any(Function))
    })
  })

  describe('emitToUser', () => {
    it('should emit event to user room', () => {
      wsServer.emitToUser('user-123', 'test:event', { data: 'test' })

      expect(mockIoTo).toHaveBeenCalledWith('user:user-123')
      expect(mockEmit).toHaveBeenCalledWith('test:event', { data: 'test' })
    })
  })

  describe('emitToRole', () => {
    it('should emit event to role room', () => {
      wsServer.emitToRole('admin', 'admin:event', { data: 'admin' })

      expect(mockIoTo).toHaveBeenCalledWith('role:admin')
      expect(mockEmit).toHaveBeenCalledWith('admin:event', { data: 'admin' })
    })
  })

  describe('emitToBooking', () => {
    it('should emit event to booking room', () => {
      wsServer.emitToBooking('booking-456', 'booking:update', { status: 'confirmed' })

      expect(mockIoTo).toHaveBeenCalledWith('booking:booking-456')
      expect(mockEmit).toHaveBeenCalledWith('booking:update', { status: 'confirmed' })
    })
  })

  describe('emitBookingStatusUpdate', () => {
    it('should emit to both booking room and user', () => {
      wsServer.emitBookingStatusUpdate('booking-123', 'confirmed', 'user-456')

      expect(mockIoTo).toHaveBeenCalledWith('booking:booking-123')
      expect(mockIoTo).toHaveBeenCalledWith('user:user-456')
      expect(mockEmit).toHaveBeenCalledWith('booking:statusUpdate', {
        booking_id: 'booking-123',
        status: 'confirmed'
      })
    })
  })

  describe('emitPaymentUpdate', () => {
    it('should emit payment update to user', () => {
      wsServer.emitPaymentUpdate('user-123', {
        payment_id: 'pay-456',
        status: 'completed'
      })

      expect(mockIoTo).toHaveBeenCalledWith('user:user-123')
      expect(mockEmit).toHaveBeenCalledWith('payment:update', {
        payment_id: 'pay-456',
        status: 'completed'
      })
    })
  })

  describe('emitNotification', () => {
    it('should emit notification to user', () => {
      wsServer.emitNotification('user-123', {
        type: 'success',
        message: 'Test notification'
      })

      expect(mockIoTo).toHaveBeenCalledWith('user:user-123')
      expect(mockEmit).toHaveBeenCalledWith('notification:new', {
        type: 'success',
        message: 'Test notification'
      })
    })
  })

  describe('isUserOnline', () => {
    it('should return false for new user', () => {
      expect(wsServer.isUserOnline('unknown-user')).toBe(false)
    })
  })

  describe('getUserSocketCount', () => {
    it('should return 0 for user with no connections', () => {
      expect(wsServer.getUserSocketCount('unknown-user')).toBe(0)
    })
  })

  describe('authentication middleware', () => {
    it('should be registered', () => {
      expect(mockIoUse).toHaveBeenCalled()

      // Get the middleware function
      const middleware = mockIoUse.mock.calls[0][0]
      expect(typeof middleware).toBe('function')
    })

    it('should reject socket without token', () => {
      const middleware = mockIoUse.mock.calls[0][0]
      const mockSocket = {
        handshake: { auth: {} }
      }
      const next = jest.fn()

      middleware(mockSocket, next)

      expect(next).toHaveBeenCalledWith(new Error('Authentication required'))
    })

    it('should reject socket with invalid token', () => {
      mockVerifyToken.mockReturnValue(null)

      const middleware = mockIoUse.mock.calls[0][0]
      const mockSocket = {
        handshake: { auth: { token: 'invalid-token' } }
      }
      const next = jest.fn()

      middleware(mockSocket, next)

      expect(mockVerifyToken).toHaveBeenCalledWith('invalid-token')
      expect(next).toHaveBeenCalledWith(new Error('Invalid token'))
    })

    it('should accept socket with valid token', () => {
      mockVerifyToken.mockReturnValue({
        user_id: 'user-123',
        role: 'customer'
      })

      const middleware = mockIoUse.mock.calls[0][0]
      const mockSocket = {
        handshake: { auth: { token: 'valid-token' } },
        id: 'socket-456'
      }
      const next = jest.fn()

      middleware(mockSocket, next)

      expect(mockSocket).toHaveProperty('user_id', 'user-123')
      expect(mockSocket).toHaveProperty('userRole', 'customer')
      expect(next).toHaveBeenCalledWith()
    })

    it('should handle authentication error', () => {
      mockVerifyToken.mockImplementation(() => {
        throw new Error('Token verification failed')
      })

      const middleware = mockIoUse.mock.calls[0][0]
      const mockSocket = {
        handshake: { auth: { token: 'error-token' } }
      }
      const next = jest.fn()

      middleware(mockSocket, next)

      expect(mockLogger.error).toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(new Error('Authentication failed'))
    })
  })

  describe('connection event handlers', () => {
    let connectionHandler: (socket: any) => void
    let mockSocket: any

    beforeEach(() => {
      // Get the connection handler
      connectionHandler = mockIoOn.mock.calls.find(
        (call: any[]) => call[0] === 'connection'
      )?.[1]

      mockSocket = {
        id: 'socket-123',
        user_id: 'user-456',
        userRole: 'customer',
        join: jest.fn().mockResolvedValue(undefined),
        emit: jest.fn(),
        to: jest.fn().mockReturnValue({ emit: jest.fn() }),
        on: jest.fn()
      }
    })

    it('should log connection', () => {
      connectionHandler(mockSocket)

      expect(mockLogger.info).toHaveBeenCalledWith(
        'WebSocket client connected',
        { socketId: 'socket-123', user_id: 'user-456' }
      )
    })

    it('should join user and role rooms', () => {
      connectionHandler(mockSocket)

      expect(mockSocket.join).toHaveBeenCalledWith('user:user-456')
      expect(mockSocket.join).toHaveBeenCalledWith('role:customer')
    })

    it('should register event handlers', () => {
      connectionHandler(mockSocket)

      // Check that event handlers are registered
      const registeredEvents = mockSocket.on.mock.calls.map((call: any[]) => call[0])
      expect(registeredEvents).toContain('booking:subscribe')
      expect(registeredEvents).toContain('chat:send')
      expect(registeredEvents).toContain('chat:typing')
      expect(registeredEvents).toContain('disconnect')
    })
  })
})

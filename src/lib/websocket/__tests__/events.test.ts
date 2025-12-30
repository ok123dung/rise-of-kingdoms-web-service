/**
 * WebSocket Events Tests
 * Tests for event emitter functions
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

// Mock WebSocket server
const mockWsServer = {
  emitToUser: jest.fn(),
  emitToRole: jest.fn(),
  emitToBooking: jest.fn(),
  emitNotification: jest.fn()
}

let mockGetWebSocketServer = jest.fn()

jest.mock('../init', () => ({
  getWebSocketServer: () => mockGetWebSocketServer()
}))

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn().mockReturnValue('mock-uuid-1234')
  }
})

import {
  emitPaymentUpdate,
  emitBookingStatusUpdate,
  emitOrderTracking,
  emitNotification,
  emitAdminDashboardUpdate
} from '../events'

describe('WebSocket Events', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetWebSocketServer = jest.fn().mockReturnValue(mockWsServer)
  })

  describe('emitPaymentUpdate', () => {
    const paymentData = {
      booking_id: 'booking-123',
      payment_id: 'payment-456',
      status: 'completed' as const,
      amount: 100000,
      payment_method: 'momo',
      transactionId: 'txn-789'
    }

    it('should emit payment update to user and admin', () => {
      emitPaymentUpdate('user-123', paymentData)

      expect(mockWsServer.emitToUser).toHaveBeenCalledWith(
        'user-123',
        'payment:update',
        expect.objectContaining({
          booking_id: 'booking-123',
          payment_id: 'payment-456',
          status: 'completed',
          timestamp: expect.any(String)
        })
      )

      expect(mockWsServer.emitToRole).toHaveBeenCalledWith(
        'admin',
        'payment:update',
        expect.objectContaining({
          user_id: 'user-123',
          booking_id: 'booking-123'
        })
      )

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Emitted payment update',
        { booking_id: 'booking-123', status: 'completed' }
      )
    })

    it('should handle when WebSocket not available', () => {
      mockGetWebSocketServer.mockReturnValue(null)

      emitPaymentUpdate('user-123', paymentData)

      expect(mockWsServer.emitToUser).not.toHaveBeenCalled()
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'WebSocket not available for payment update'
      )
    })
  })

  describe('emitBookingStatusUpdate', () => {
    const bookingData = {
      booking_number: 'BK-001',
      status: 'confirmed',
      previousStatus: 'pending',
      completion_percentage: 50,
      updatedAt: '2024-12-30T10:00:00Z'
    }

    it('should emit to user, booking room, and admin', () => {
      emitBookingStatusUpdate('user-123', 'booking-456', bookingData)

      // To user
      expect(mockWsServer.emitToUser).toHaveBeenCalledWith(
        'user-123',
        'booking:statusUpdate',
        expect.objectContaining({
          booking_id: 'booking-456',
          status: 'confirmed'
        })
      )

      // To booking room
      expect(mockWsServer.emitToBooking).toHaveBeenCalledWith(
        'booking-456',
        'booking:statusUpdate',
        expect.objectContaining({
          booking_id: 'booking-456'
        })
      )

      // To admin
      expect(mockWsServer.emitToRole).toHaveBeenCalledWith(
        'admin',
        'booking:statusUpdate',
        expect.objectContaining({
          user_id: 'user-123',
          booking_id: 'booking-456'
        })
      )

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Emitted booking status update',
        { booking_id: 'booking-456', status: 'confirmed' }
      )
    })

    it('should handle when WebSocket not available', () => {
      mockGetWebSocketServer.mockReturnValue(null)

      emitBookingStatusUpdate('user-123', 'booking-456', bookingData)

      expect(mockWsServer.emitToUser).not.toHaveBeenCalled()
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'WebSocket not available for booking update'
      )
    })
  })

  describe('emitOrderTracking', () => {
    const trackingData = {
      booking_id: 'booking-123',
      booking_number: 'BK-001',
      event: 'service_started' as const,
      message: 'Your service has started',
      progress: 25,
      timestamp: '2024-12-30T10:00:00Z'
    }

    it('should emit to user and booking room', () => {
      emitOrderTracking('user-123', trackingData)

      expect(mockWsServer.emitToUser).toHaveBeenCalledWith(
        'user-123',
        'order:tracking',
        expect.objectContaining({
          booking_id: 'booking-123',
          event: 'service_started'
        })
      )

      expect(mockWsServer.emitToBooking).toHaveBeenCalledWith(
        'booking-123',
        'order:tracking',
        expect.objectContaining({
          booking_id: 'booking-123'
        })
      )

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Emitted order tracking event',
        { booking_id: 'booking-123', event: 'service_started' }
      )
    })

    it('should handle when WebSocket not available', () => {
      mockGetWebSocketServer.mockReturnValue(null)

      emitOrderTracking('user-123', trackingData)

      expect(mockWsServer.emitToUser).not.toHaveBeenCalled()
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'WebSocket not available for order tracking'
      )
    })
  })

  describe('emitNotification', () => {
    const notification = {
      type: 'success' as const,
      title: 'Payment Received',
      message: 'Your payment has been processed',
      link: '/bookings/123'
    }

    it('should emit notification to user', () => {
      emitNotification('user-123', notification)

      expect(mockWsServer.emitNotification).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          type: 'success',
          title: 'Payment Received',
          message: 'Your payment has been processed',
          link: '/bookings/123',
          id: 'mock-uuid-1234',
          timestamp: expect.any(String)
        })
      )
    })

    it('should handle when WebSocket not available', () => {
      mockGetWebSocketServer.mockReturnValue(null)

      emitNotification('user-123', notification)

      expect(mockWsServer.emitNotification).not.toHaveBeenCalled()
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'WebSocket not available for notification'
      )
    })

    it('should work without optional link', () => {
      const notificationNoLink = {
        type: 'info' as const,
        title: 'Update',
        message: 'System update'
      }

      emitNotification('user-123', notificationNoLink)

      expect(mockWsServer.emitNotification).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          type: 'info',
          title: 'Update'
        })
      )
    })
  })

  describe('emitAdminDashboardUpdate', () => {
    const dashboardData = {
      type: 'new_booking' as const,
      summary: { total_bookings: 100, today_revenue: 5000000 }
    }

    it('should emit to admin and superadmin roles', () => {
      emitAdminDashboardUpdate(dashboardData)

      expect(mockWsServer.emitToRole).toHaveBeenCalledWith(
        'admin',
        'dashboard:update',
        expect.objectContaining({
          type: 'new_booking',
          summary: { total_bookings: 100, today_revenue: 5000000 },
          timestamp: expect.any(String)
        })
      )

      expect(mockWsServer.emitToRole).toHaveBeenCalledWith(
        'superadmin',
        'dashboard:update',
        expect.objectContaining({
          type: 'new_booking'
        })
      )
    })

    it('should handle when WebSocket not available', () => {
      mockGetWebSocketServer.mockReturnValue(null)

      emitAdminDashboardUpdate(dashboardData)

      expect(mockWsServer.emitToRole).not.toHaveBeenCalled()
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'WebSocket not available for admin update'
      )
    })

    it('should emit payment_received type', () => {
      emitAdminDashboardUpdate({
        type: 'payment_received',
        summary: { amount: 100000, method: 'momo' }
      })

      expect(mockWsServer.emitToRole).toHaveBeenCalledWith(
        'admin',
        'dashboard:update',
        expect.objectContaining({ type: 'payment_received' })
      )
    })

    it('should emit booking_completed type', () => {
      emitAdminDashboardUpdate({
        type: 'booking_completed',
        summary: { booking_id: '123' }
      })

      expect(mockWsServer.emitToRole).toHaveBeenCalledWith(
        'admin',
        'dashboard:update',
        expect.objectContaining({ type: 'booking_completed' })
      )
    })
  })
})

/**
 * Webhook Retry Service Tests
 * Tests for WebhookRetryService class
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

// Mock Prisma with transaction support
const mockTransaction = jest.fn()
const mockWebhookEvents = {
  findUnique: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  deleteMany: jest.fn()
}
const mockPayments = {
  findFirst: jest.fn(),
  update: jest.fn()
}
const mockBookings = {
  update: jest.fn()
}

jest.mock('@/lib/db', () => ({
  prisma: {
    webhook_events: mockWebhookEvents,
    payments: mockPayments,
    bookings: mockBookings,
    $transaction: (fn: (tx: any) => Promise<void>) => fn({
      payments: mockPayments,
      bookings: mockBookings
    })
  }
}))

// Mock WebSocket event emitter
const mockEmitWebSocketEvent = jest.fn()
jest.mock('@/lib/websocket/init', () => ({
  emitWebSocketEvent: mockEmitWebSocketEvent
}))

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn().mockReturnValue('mock-uuid-1234')
  }
})

import { WebhookRetryService } from '../retry-service'

describe('WebhookRetryService', () => {
  let service: WebhookRetryService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new WebhookRetryService()
  })

  describe('constructor', () => {
    it('should use default config', () => {
      const defaultService = new WebhookRetryService()
      expect(defaultService).toBeDefined()
    })

    it('should accept custom config', () => {
      const customService = new WebhookRetryService({
        maxAttempts: 3,
        initialDelay: 30000
      })
      expect(customService).toBeDefined()
    })
  })

  describe('storeWebhookEvent', () => {
    it('should create new webhook event', async () => {
      mockWebhookEvents.findUnique.mockResolvedValue(null)
      mockWebhookEvents.create.mockResolvedValue({
        id: 'mock-uuid-1234',
        event_id: 'event-123',
        provider: 'momo',
        event_type: 'payment'
      })

      const result = await service.storeWebhookEvent(
        'momo',
        'payment',
        'event-123',
        { amount: 100000 }
      )

      expect(mockWebhookEvents.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          id: 'mock-uuid-1234',
          provider: 'momo',
          event_type: 'payment',
          event_id: 'event-123',
          status: 'pending',
          attempts: 0
        })
      })
      expect(result.event_id).toBe('event-123')
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Webhook event stored',
        expect.any(Object)
      )
    })

    it('should return existing event if already exists', async () => {
      const existingEvent = {
        id: 'existing-id',
        event_id: 'event-123',
        provider: 'momo'
      }
      mockWebhookEvents.findUnique.mockResolvedValue(existingEvent)

      const result = await service.storeWebhookEvent(
        'momo',
        'payment',
        'event-123',
        { amount: 100000 }
      )

      expect(mockWebhookEvents.create).not.toHaveBeenCalled()
      expect(result).toBe(existingEvent)
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Webhook event already exists',
        { event_id: 'event-123' }
      )
    })

    it('should throw on database error', async () => {
      mockWebhookEvents.findUnique.mockResolvedValue(null)
      mockWebhookEvents.create.mockRejectedValue(new Error('DB error'))

      await expect(
        service.storeWebhookEvent('momo', 'payment', 'event-123', {})
      ).rejects.toThrow('DB error')

      expect(mockLogger.error).toHaveBeenCalled()
    })
  })

  describe('processWebhookEvent', () => {
    it('should return false if event not found', async () => {
      mockWebhookEvents.findUnique.mockResolvedValue(null)

      const result = await service.processWebhookEvent('event-123')

      expect(result).toBe(false)
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Webhook event not found',
        expect.any(Error),
        { event_id: 'event-123' }
      )
    })

    it('should return true if event already completed', async () => {
      mockWebhookEvents.findUnique.mockResolvedValue({
        id: 'id-123',
        event_id: 'event-123',
        status: 'completed'
      })

      const result = await service.processWebhookEvent('event-123')

      expect(result).toBe(true)
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Webhook event already processed',
        { event_id: 'event-123' }
      )
    })

    it('should return false if max attempts exceeded', async () => {
      mockWebhookEvents.findUnique.mockResolvedValue({
        id: 'id-123',
        event_id: 'event-123',
        status: 'failed',
        attempts: 5
      })

      const result = await service.processWebhookEvent('event-123')

      expect(result).toBe(false)
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Webhook event exceeded max attempts',
        expect.any(Error),
        { event_id: 'event-123' }
      )
    })

    it('should update status to processing', async () => {
      mockWebhookEvents.findUnique.mockResolvedValue({
        id: 'id-123',
        event_id: 'event-123',
        status: 'pending',
        attempts: 0,
        provider: 'unknown'
      })
      mockWebhookEvents.update.mockResolvedValue({})

      await service.processWebhookEvent('event-123')

      expect(mockWebhookEvents.update).toHaveBeenCalledWith({
        where: { id: 'id-123' },
        data: expect.objectContaining({
          status: 'processing'
        })
      })
    })

    it('should handle unknown provider', async () => {
      mockWebhookEvents.findUnique.mockResolvedValue({
        id: 'id-123',
        event_id: 'event-123',
        status: 'pending',
        attempts: 0,
        provider: 'unknown',
        payload: {}
      })
      mockWebhookEvents.update.mockResolvedValue({})

      const result = await service.processWebhookEvent('event-123')

      expect(result).toBe(false)
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Unknown webhook provider',
        expect.any(Error),
        { provider: 'unknown' }
      )
    })
  })

  describe('MoMo webhook handling', () => {
    const momoPayload = {
      orderId: 'order-123',
      requestId: 'req-456',
      amount: 100000,
      resultCode: 0,
      message: 'Success',
      transId: 'trans-789'
    }

    const mockPayment = {
      id: 'payment-id',
      amount: 100000,
      booking_id: 'booking-id',
      bookings: {
        id: 'booking-id',
        user_id: 'user-123',
        users: { id: 'user-123' }
      }
    }

    it('should process successful MoMo payment', async () => {
      mockWebhookEvents.findUnique.mockResolvedValue({
        id: 'id-123',
        event_id: 'event-123',
        status: 'pending',
        attempts: 0,
        provider: 'momo',
        payload: momoPayload
      })
      mockPayments.findFirst.mockResolvedValue(mockPayment)
      mockPayments.update.mockResolvedValue({})
      mockBookings.update.mockResolvedValue({})
      mockWebhookEvents.update.mockResolvedValue({})

      const result = await service.processWebhookEvent('event-123')

      expect(result).toBe(true)
      expect(mockPayments.update).toHaveBeenCalledWith({
        where: { id: 'payment-id' },
        data: expect.objectContaining({
          status: 'completed',
          gateway_transaction_id: 'trans-789'
        })
      })
      expect(mockEmitWebSocketEvent).toHaveBeenCalledWith(
        'user',
        'user-123',
        'payment:completed',
        expect.any(Object)
      )
    })

    it('should return true for failed MoMo payment (no retry)', async () => {
      mockWebhookEvents.findUnique.mockResolvedValue({
        id: 'id-123',
        event_id: 'event-123',
        status: 'pending',
        attempts: 0,
        provider: 'momo',
        payload: { ...momoPayload, resultCode: 1001 }
      })
      mockWebhookEvents.update.mockResolvedValue({})

      const result = await service.processWebhookEvent('event-123')

      expect(result).toBe(true)
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'MoMo payment failed',
        expect.any(Object)
      )
    })

    it('should return false if payment not found', async () => {
      mockWebhookEvents.findUnique.mockResolvedValue({
        id: 'id-123',
        event_id: 'event-123',
        status: 'pending',
        attempts: 0,
        provider: 'momo',
        payload: momoPayload
      })
      mockPayments.findFirst.mockResolvedValue(null)
      mockWebhookEvents.update.mockResolvedValue({})

      const result = await service.processWebhookEvent('event-123')

      expect(result).toBe(false)
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Payment not found for MoMo webhook',
        expect.any(Error),
        { orderId: 'order-123' }
      )
    })
  })

  describe('ZaloPay webhook handling', () => {
    const zaloPayPayload = {
      app_trans_id: 'app-trans-123',
      zp_trans_id: 'zp-trans-456',
      status: 1,
      amount: 50000
    }

    const mockPayment = {
      id: 'payment-id',
      amount: 50000,
      booking_id: 'booking-id',
      bookings: {
        id: 'booking-id',
        user_id: 'user-456',
        users: { id: 'user-456' }
      }
    }

    it('should process successful ZaloPay payment', async () => {
      mockWebhookEvents.findUnique.mockResolvedValue({
        id: 'id-123',
        event_id: 'event-123',
        status: 'pending',
        attempts: 0,
        provider: 'zalopay',
        payload: zaloPayPayload
      })
      mockPayments.findFirst.mockResolvedValue(mockPayment)
      mockPayments.update.mockResolvedValue({})
      mockBookings.update.mockResolvedValue({})
      mockWebhookEvents.update.mockResolvedValue({})

      const result = await service.processWebhookEvent('event-123')

      expect(result).toBe(true)
      expect(mockPayments.update).toHaveBeenCalledWith({
        where: { id: 'payment-id' },
        data: expect.objectContaining({
          status: 'completed',
          gateway_transaction_id: 'zp-trans-456'
        })
      })
    })

    it('should return true for failed ZaloPay payment', async () => {
      mockWebhookEvents.findUnique.mockResolvedValue({
        id: 'id-123',
        event_id: 'event-123',
        status: 'pending',
        attempts: 0,
        provider: 'zalopay',
        payload: { ...zaloPayPayload, status: 0 }
      })
      mockWebhookEvents.update.mockResolvedValue({})

      const result = await service.processWebhookEvent('event-123')

      expect(result).toBe(true)
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'ZaloPay payment failed',
        expect.any(Object)
      )
    })
  })

  describe('VNPay webhook handling', () => {
    const vnpayPayload = {
      vnp_TxnRef: 'txn-ref-123',
      vnp_TransactionNo: 'trans-no-456',
      vnp_ResponseCode: '00',
      vnp_Amount: 200000
    }

    const mockPayment = {
      id: 'payment-id',
      amount: 200000,
      booking_id: 'booking-id',
      bookings: {
        id: 'booking-id',
        user_id: 'user-789',
        users: { id: 'user-789' }
      }
    }

    it('should process successful VNPay payment', async () => {
      mockWebhookEvents.findUnique.mockResolvedValue({
        id: 'id-123',
        event_id: 'event-123',
        status: 'pending',
        attempts: 0,
        provider: 'vnpay',
        payload: vnpayPayload
      })
      mockPayments.findFirst.mockResolvedValue(mockPayment)
      mockPayments.update.mockResolvedValue({})
      mockBookings.update.mockResolvedValue({})
      mockWebhookEvents.update.mockResolvedValue({})

      const result = await service.processWebhookEvent('event-123')

      expect(result).toBe(true)
      expect(mockPayments.update).toHaveBeenCalledWith({
        where: { id: 'payment-id' },
        data: expect.objectContaining({
          status: 'completed',
          gateway_transaction_id: 'trans-no-456'
        })
      })
    })

    it('should return true for failed VNPay payment', async () => {
      mockWebhookEvents.findUnique.mockResolvedValue({
        id: 'id-123',
        event_id: 'event-123',
        status: 'pending',
        attempts: 0,
        provider: 'vnpay',
        payload: { ...vnpayPayload, vnp_ResponseCode: '24' }
      })
      mockWebhookEvents.update.mockResolvedValue({})

      const result = await service.processWebhookEvent('event-123')

      expect(result).toBe(true)
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'VNPay payment failed',
        expect.any(Object)
      )
    })
  })

  describe('processPendingWebhooks', () => {
    it('should process pending webhooks', async () => {
      mockWebhookEvents.findMany.mockResolvedValue([
        { event_id: 'event-1', status: 'pending' },
        { event_id: 'event-2', status: 'pending' }
      ])
      mockWebhookEvents.findUnique
        .mockResolvedValueOnce({
          id: 'id-1',
          event_id: 'event-1',
          status: 'completed'
        })
        .mockResolvedValueOnce({
          id: 'id-2',
          event_id: 'event-2',
          status: 'completed'
        })

      await service.processPendingWebhooks()

      expect(mockWebhookEvents.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          status: 'pending'
        }),
        orderBy: { created_at: 'asc' },
        take: 10
      })
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Processing 2 pending webhooks'
      )
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Webhook processing completed',
        expect.any(Object)
      )
    })

    it('should handle empty pending list', async () => {
      mockWebhookEvents.findMany.mockResolvedValue([])

      await service.processPendingWebhooks()

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Processing 0 pending webhooks'
      )
    })

    it('should handle processing errors', async () => {
      mockWebhookEvents.findMany.mockRejectedValue(new Error('DB error'))

      await service.processPendingWebhooks()

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to process pending webhooks',
        expect.any(Error)
      )
    })
  })

  describe('cleanupOldWebhooks', () => {
    it('should delete old completed and failed webhooks', async () => {
      mockWebhookEvents.deleteMany.mockResolvedValue({ count: 50 })

      await service.cleanupOldWebhooks(30)

      expect(mockWebhookEvents.deleteMany).toHaveBeenCalledWith({
        where: {
          status: { in: ['completed', 'failed'] },
          created_at: { lt: expect.any(Date) }
        }
      })
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Cleaned up 50 old webhook events'
      )
    })

    it('should use default 30 days retention', async () => {
      mockWebhookEvents.deleteMany.mockResolvedValue({ count: 10 })

      await service.cleanupOldWebhooks()

      expect(mockWebhookEvents.deleteMany).toHaveBeenCalled()
    })

    it('should handle cleanup errors', async () => {
      mockWebhookEvents.deleteMany.mockRejectedValue(new Error('DB error'))

      await service.cleanupOldWebhooks()

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to cleanup old webhooks',
        expect.any(Error)
      )
    })
  })

  describe('retry scheduling', () => {
    it('should schedule retry with exponential backoff', async () => {
      const customService = new WebhookRetryService({
        maxAttempts: 5,
        initialDelay: 1000,
        maxDelay: 60000,
        backoffMultiplier: 2
      })

      mockWebhookEvents.findUnique.mockResolvedValue({
        id: 'id-123',
        event_id: 'event-123',
        status: 'pending',
        attempts: 1,
        provider: 'momo',
        payload: { resultCode: 0, orderId: 'order-1' }
      })
      mockPayments.findFirst.mockResolvedValue(null) // Will cause retry
      mockWebhookEvents.update.mockResolvedValue({})

      await customService.processWebhookEvent('event-123')

      // Check that retry was scheduled
      expect(mockWebhookEvents.update).toHaveBeenCalledWith({
        where: { id: 'id-123' },
        data: expect.objectContaining({
          status: 'pending',
          attempts: 2
        })
      })
    })

    it('should mark as failed after max attempts', async () => {
      const customService = new WebhookRetryService({
        maxAttempts: 3,
        initialDelay: 1000,
        maxDelay: 60000,
        backoffMultiplier: 2
      })

      mockWebhookEvents.findUnique.mockResolvedValue({
        id: 'id-123',
        event_id: 'event-123',
        status: 'pending',
        attempts: 2, // One more attempt and will exceed max
        provider: 'momo',
        payload: { resultCode: 0, orderId: 'order-1' }
      })
      mockPayments.findFirst.mockResolvedValue(null)
      mockWebhookEvents.update.mockResolvedValue({})

      await customService.processWebhookEvent('event-123')

      // Should be marked as failed after this attempt
      expect(mockWebhookEvents.update).toHaveBeenCalledWith({
        where: { id: 'id-123' },
        data: expect.objectContaining({
          status: 'failed',
          attempts: 3
        })
      })
    })
  })
})

/**
 * Replay Protection Tests
 * Tests for webhook replay protection functionality
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
    webhook_events: {
      findUnique: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn()
    }
  }
}))

// Import after mocks
import { prisma } from '@/lib/db'
import {
  validateWebhookTimestamp,
  isDuplicateWebhook,
  validateWebhookReplayProtection,
  generateWebhookNonce,
  verifyWebhookNonce,
  cleanupOldWebhookProtectionData
} from '../replay-protection'

const mockWebhookEvents = prisma.webhook_events as jest.Mocked<typeof prisma.webhook_events>

describe('Replay Protection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('validateWebhookTimestamp', () => {
    it('should return true for current timestamp', () => {
      expect(validateWebhookTimestamp(Date.now())).toBe(true)
    })

    it('should return true for timestamp as string', () => {
      expect(validateWebhookTimestamp(String(Date.now()))).toBe(true)
    })

    it('should return true for timestamp within 5 minutes', () => {
      const twoMinutesAgo = Date.now() - 2 * 60 * 1000
      expect(validateWebhookTimestamp(twoMinutesAgo)).toBe(true)
    })

    it('should return false for timestamp older than 5 minutes', () => {
      const sixMinutesAgo = Date.now() - 6 * 60 * 1000
      expect(validateWebhookTimestamp(sixMinutesAgo)).toBe(false)
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Webhook timestamp is too old',
        expect.any(Object)
      )
    })

    it('should return false for timestamp in the future beyond clock skew', () => {
      const twoMinutesFromNow = Date.now() + 2 * 60 * 1000
      expect(validateWebhookTimestamp(twoMinutesFromNow)).toBe(false)
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Webhook timestamp is in the future',
        expect.any(Object)
      )
    })

    it('should allow timestamp within clock skew tolerance', () => {
      const thirtySecondsFromNow = Date.now() + 30 * 1000
      expect(validateWebhookTimestamp(thirtySecondsFromNow)).toBe(true)
    })
  })

  describe('isDuplicateWebhook', () => {
    it('should return false when no existing event found', async () => {
      mockWebhookEvents.findUnique.mockResolvedValue(null)

      const result = await isDuplicateWebhook('momo', 'event-123')

      expect(result).toBe(false)
      expect(mockWebhookEvents.findUnique).toHaveBeenCalledWith({
        where: { event_id: 'event-123' },
        select: { status: true, created_at: true }
      })
    })

    it('should return true when existing event found', async () => {
      mockWebhookEvents.findUnique.mockResolvedValue({
        status: 'completed',
        created_at: new Date()
      } as any)

      const result = await isDuplicateWebhook('momo', 'event-123')

      expect(result).toBe(true)
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Duplicate webhook detected',
        expect.any(Object)
      )
    })

    it('should return false and log error on database failure', async () => {
      mockWebhookEvents.findUnique.mockRejectedValue(new Error('DB error'))

      const result = await isDuplicateWebhook('momo', 'event-123')

      expect(result).toBe(false) // Fail open
      expect(mockLogger.error).toHaveBeenCalled()
    })
  })

  describe('validateWebhookReplayProtection', () => {
    it('should return valid when timestamp ok and not duplicate', async () => {
      mockWebhookEvents.findUnique.mockResolvedValue(null)

      const result = await validateWebhookReplayProtection(
        'momo',
        'event-123',
        Date.now()
      )

      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should return invalid when timestamp is too old', async () => {
      const oldTimestamp = Date.now() - 6 * 60 * 1000

      const result = await validateWebhookReplayProtection(
        'momo',
        'event-123',
        oldTimestamp
      )

      expect(result.valid).toBe(false)
      expect(result.error).toBe('Webhook timestamp is invalid or too old')
    })

    it('should return invalid when duplicate detected', async () => {
      mockWebhookEvents.findUnique.mockResolvedValue({
        status: 'completed',
        created_at: new Date()
      } as any)

      const result = await validateWebhookReplayProtection(
        'momo',
        'event-123',
        Date.now()
      )

      expect(result.valid).toBe(false)
      expect(result.error).toBe('Duplicate webhook event')
      expect(result.isDuplicate).toBe(true)
    })

    it('should skip timestamp validation when undefined', async () => {
      mockWebhookEvents.findUnique.mockResolvedValue(null)

      const result = await validateWebhookReplayProtection(
        'momo',
        'event-123'
        // No timestamp
      )

      expect(result.valid).toBe(true)
    })
  })

  describe('generateWebhookNonce', () => {
    it('should generate nonce with timestamp prefix', () => {
      const before = Date.now()
      const nonce = generateWebhookNonce()
      const after = Date.now()

      const [timestampStr] = nonce.split('_')
      const timestamp = parseInt(timestampStr, 10)

      expect(timestamp).toBeGreaterThanOrEqual(before)
      expect(timestamp).toBeLessThanOrEqual(after)
    })

    it('should generate nonce with 32-char hex suffix', () => {
      const nonce = generateWebhookNonce()
      const [, randomHex] = nonce.split('_')

      expect(randomHex).toHaveLength(32)
      expect(randomHex).toMatch(/^[0-9a-f]+$/)
    })

    it('should generate unique nonces', () => {
      const nonces = new Set<string>()
      for (let i = 0; i < 100; i++) {
        nonces.add(generateWebhookNonce())
      }
      expect(nonces.size).toBe(100)
    })
  })

  describe('verifyWebhookNonce', () => {
    it('should return false for invalid nonce format', async () => {
      const result = await verifyWebhookNonce('momo', 'invalid-nonce')

      expect(result).toBe(false)
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Invalid nonce format',
        expect.any(Object)
      )
    })

    it('should return false for nonce with wrong hex length', async () => {
      const result = await verifyWebhookNonce('momo', `${Date.now()}_abc123`)

      expect(result).toBe(false)
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Invalid nonce format',
        expect.any(Object)
      )
    })

    it('should return false for nonce with invalid timestamp', async () => {
      const result = await verifyWebhookNonce('momo', `notanumber_${'a'.repeat(32)}`)

      expect(result).toBe(false)
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Invalid nonce timestamp',
        expect.any(Object)
      )
    })

    it('should return false for nonce with old timestamp', async () => {
      const oldTimestamp = Date.now() - 6 * 60 * 1000
      const result = await verifyWebhookNonce('momo', `${oldTimestamp}_${'a'.repeat(32)}`)

      expect(result).toBe(false)
    })

    it('should return false for duplicate nonce', async () => {
      mockWebhookEvents.findUnique.mockResolvedValue({
        status: 'completed',
        created_at: new Date()
      } as any)

      const nonce = `${Date.now()}_${'a'.repeat(32)}`
      const result = await verifyWebhookNonce('momo', nonce)

      expect(result).toBe(false)
    })

    it('should return true and store valid nonce', async () => {
      mockWebhookEvents.findUnique.mockResolvedValue(null)
      mockWebhookEvents.create.mockResolvedValue({} as any)

      const nonce = `${Date.now()}_${'a'.repeat(32)}`
      const result = await verifyWebhookNonce('momo', nonce)

      expect(result).toBe(true)
      expect(mockWebhookEvents.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          provider: 'momo',
          event_type: 'nonce_validation',
          status: 'completed'
        })
      })
    })

    it('should return false on database error when creating nonce', async () => {
      // isDuplicateWebhook returns false (no duplicate)
      mockWebhookEvents.findUnique.mockResolvedValue(null)
      // But create fails
      mockWebhookEvents.create.mockRejectedValue(new Error('DB error'))

      const nonce = `${Date.now()}_${'a'.repeat(32)}`
      const result = await verifyWebhookNonce('momo', nonce)

      expect(result).toBe(false)
      expect(mockLogger.error).toHaveBeenCalled()
    })
  })

  describe('cleanupOldWebhookProtectionData', () => {
    it('should delete old webhook events with default retention', async () => {
      mockWebhookEvents.deleteMany.mockResolvedValue({ count: 50 })

      const result = await cleanupOldWebhookProtectionData()

      expect(result).toBe(50)
      expect(mockWebhookEvents.deleteMany).toHaveBeenCalledWith({
        where: {
          event_type: 'nonce_validation',
          created_at: { lt: expect.any(Date) }
        }
      })
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Cleaned up old webhook protection data',
        { deletedCount: 50, daysToKeep: 7 }
      )
    })

    it('should use custom retention period', async () => {
      mockWebhookEvents.deleteMany.mockResolvedValue({ count: 10 })

      const result = await cleanupOldWebhookProtectionData(30)

      expect(result).toBe(10)
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Cleaned up old webhook protection data',
        { deletedCount: 10, daysToKeep: 30 }
      )
    })

    it('should return 0 on database error', async () => {
      mockWebhookEvents.deleteMany.mockRejectedValue(new Error('DB error'))

      const result = await cleanupOldWebhookProtectionData()

      expect(result).toBe(0)
      expect(mockLogger.error).toHaveBeenCalled()
    })
  })
})

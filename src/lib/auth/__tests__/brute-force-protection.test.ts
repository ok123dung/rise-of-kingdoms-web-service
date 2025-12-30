/**
 * Brute Force Protection Tests
 * Tests rate limiting and account lockout functionality
 */

// Must import before mocking
import {
  checkBruteForce,
  recordFailedAttempt,
  clearFailedAttempts,
  isBlocked
} from '../brute-force-protection'

// Mock Redis - simulate no Redis configured (use memory fallback)
jest.mock('@upstash/redis', () => ({
  Redis: jest.fn()
}))

// Mock logger with persistent mock functions
const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
}

jest.mock('@/lib/monitoring/logger', () => ({
  getLogger: () => mockLogger
}))

describe('Brute Force Protection', () => {
  // Use unique identifiers for each test to avoid state pollution
  let testId = 0
  const getUniqueId = () => `test-user-${testId++}-${Date.now()}`

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('checkBruteForce', () => {
    it('should allow first attempt for new identifier', async () => {
      const identifier = getUniqueId()
      const result = await checkBruteForce(identifier)

      expect(result.allowed).toBe(true)
      expect(result.remainingAttempts).toBe(5) // Default maxAttempts
    })

    it('should allow attempts when under limit', async () => {
      const identifier = getUniqueId()

      // Record 3 failed attempts
      await recordFailedAttempt(identifier)
      await recordFailedAttempt(identifier)
      await recordFailedAttempt(identifier)

      const result = await checkBruteForce(identifier)

      expect(result.allowed).toBe(true)
      expect(result.remainingAttempts).toBe(2) // 5 - 3 = 2
    })

    it('should block after max attempts reached', async () => {
      const identifier = getUniqueId()

      // Record 5 failed attempts (default max)
      for (let i = 0; i < 5; i++) {
        await recordFailedAttempt(identifier)
      }

      const result = await checkBruteForce(identifier)

      expect(result.allowed).toBe(false)
      expect(result.remainingAttempts).toBe(0)
      expect(result.blockedUntil).toBeDefined()
      expect(result.message).toContain('Too many failed attempts')
    })

    it('should return blocked status when already blocked', async () => {
      const identifier = getUniqueId()

      // Record enough to trigger block
      for (let i = 0; i < 5; i++) {
        await recordFailedAttempt(identifier)
      }

      // First check triggers block
      await checkBruteForce(identifier)

      // Second check should still be blocked
      const result = await checkBruteForce(identifier)

      expect(result.allowed).toBe(false)
      expect(result.message).toContain('temporarily blocked')
    })

    it('should use custom maxAttempts config', async () => {
      const identifier = getUniqueId()
      const config = { maxAttempts: 3 }

      // Record 2 attempts
      await recordFailedAttempt(identifier, config)
      await recordFailedAttempt(identifier, config)

      const result = await checkBruteForce(identifier, config)

      expect(result.allowed).toBe(true)
      expect(result.remainingAttempts).toBe(1) // 3 - 2 = 1
    })

    it('should use custom keyPrefix config', async () => {
      const identifier = getUniqueId()
      const config1 = { keyPrefix: 'login' }
      const config2 = { keyPrefix: 'api' }

      // Record attempts with different prefixes
      for (let i = 0; i < 5; i++) {
        await recordFailedAttempt(identifier, config1)
      }

      // Check with different prefix should still be allowed
      const result = await checkBruteForce(identifier, config2)

      expect(result.allowed).toBe(true)
      expect(result.remainingAttempts).toBe(5)
    })
  })

  describe('recordFailedAttempt', () => {
    it('should record first attempt', async () => {
      const identifier = getUniqueId()

      await recordFailedAttempt(identifier)

      const result = await checkBruteForce(identifier)
      expect(result.remainingAttempts).toBe(4) // 5 - 1
    })

    it('should increment attempt count', async () => {
      const identifier = getUniqueId()

      await recordFailedAttempt(identifier)
      await recordFailedAttempt(identifier)

      const result = await checkBruteForce(identifier)
      expect(result.remainingAttempts).toBe(3) // 5 - 2
    })

    it('should log warning on failed attempt', async () => {
      const identifier = getUniqueId()

      await recordFailedAttempt(identifier)

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Failed login attempt recorded (memory)',
        expect.objectContaining({
          attemptCount: 1,
          maxAttempts: 5
        })
      )
    })
  })

  describe('clearFailedAttempts', () => {
    it('should clear all attempts for identifier', async () => {
      const identifier = getUniqueId()

      // Record some attempts
      await recordFailedAttempt(identifier)
      await recordFailedAttempt(identifier)
      await recordFailedAttempt(identifier)

      // Clear attempts
      await clearFailedAttempts(identifier)

      // Should be fresh again
      const result = await checkBruteForce(identifier)
      expect(result.allowed).toBe(true)
      expect(result.remainingAttempts).toBe(5)
    })

    it('should unblock a blocked identifier', async () => {
      const identifier = getUniqueId()

      // Block the identifier
      for (let i = 0; i < 5; i++) {
        await recordFailedAttempt(identifier)
      }
      await checkBruteForce(identifier) // Triggers block

      // Verify blocked
      let result = await checkBruteForce(identifier)
      expect(result.allowed).toBe(false)

      // Clear attempts
      await clearFailedAttempts(identifier)

      // Should be unblocked
      result = await checkBruteForce(identifier)
      expect(result.allowed).toBe(true)
    })

    it('should handle clearing non-existent identifier', async () => {
      const identifier = getUniqueId()

      // Should not throw
      await expect(clearFailedAttempts(identifier)).resolves.not.toThrow()
    })
  })

  describe('isBlocked', () => {
    it('should return false for new identifier', async () => {
      const identifier = getUniqueId()

      const blocked = await isBlocked(identifier)

      expect(blocked).toBe(false)
    })

    it('should return false when under limit', async () => {
      const identifier = getUniqueId()

      await recordFailedAttempt(identifier)
      await recordFailedAttempt(identifier)

      const blocked = await isBlocked(identifier)

      expect(blocked).toBe(false)
    })

    it('should return true when blocked', async () => {
      const identifier = getUniqueId()

      // Block the identifier
      for (let i = 0; i < 5; i++) {
        await recordFailedAttempt(identifier)
      }
      await checkBruteForce(identifier) // Triggers block

      const blocked = await isBlocked(identifier)

      expect(blocked).toBe(true)
    })
  })

  describe('Window expiration', () => {
    it('should reset after window expires', async () => {
      const identifier = getUniqueId()
      // Use very short window for testing
      const config = { windowMs: 50, maxAttempts: 3 }

      // Record attempts
      await recordFailedAttempt(identifier, config)
      await recordFailedAttempt(identifier, config)

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 100))

      // Should be reset
      const result = await checkBruteForce(identifier, config)
      expect(result.allowed).toBe(true)
      expect(result.remainingAttempts).toBe(3)
    })
  })

  describe('Multiple identifiers', () => {
    it('should track identifiers independently', async () => {
      const identifier1 = getUniqueId()
      const identifier2 = getUniqueId()

      // Block identifier1
      for (let i = 0; i < 5; i++) {
        await recordFailedAttempt(identifier1)
      }

      // Record 2 attempts for identifier2
      await recordFailedAttempt(identifier2)
      await recordFailedAttempt(identifier2)

      // Check results
      const result1 = await checkBruteForce(identifier1)
      const result2 = await checkBruteForce(identifier2)

      expect(result1.allowed).toBe(false)
      expect(result2.allowed).toBe(true)
      expect(result2.remainingAttempts).toBe(3)
    })
  })

  describe('Block duration', () => {
    it('should set blockedUntil timestamp', async () => {
      const identifier = getUniqueId()
      const blockDurationMs = 1000 // 1 second for testing

      // Block the identifier
      for (let i = 0; i < 5; i++) {
        await recordFailedAttempt(identifier, { blockDurationMs })
      }

      const now = Date.now()
      const result = await checkBruteForce(identifier, { blockDurationMs })

      expect(result.blockedUntil).toBeDefined()
      expect(result.blockedUntil).toBeGreaterThan(now)
      expect(result.blockedUntil! - now).toBeLessThanOrEqual(blockDurationMs + 100)
    })
  })
})

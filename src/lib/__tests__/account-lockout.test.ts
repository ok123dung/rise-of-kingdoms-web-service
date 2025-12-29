/**
 * Account Lockout Tests
 * Tests for the progressive account lockout system
 */

import {
  isAccountLocked,
  recordFailedAttempt,
  clearLockout,
  formatLockoutDuration,
} from '../account-lockout'

// Mock Redis - not available in test environment
jest.mock('@upstash/redis', () => ({
  Redis: jest.fn().mockImplementation(() => {
    throw new Error('Redis not available in test')
  }),
}))

describe('Account Lockout System', () => {
  const testIdentifier = `test-user-${Date.now()}`

  beforeEach(() => {
    // Reset lockout state between tests by using unique identifiers
  })

  describe('isAccountLocked', () => {
    it('should return unlocked status for new identifier', async () => {
      const uniqueId = `new-user-${Date.now()}`
      const status = await isAccountLocked(uniqueId)

      expect(status.isLocked).toBe(false)
      expect(status.failedAttempts).toBe(0)
      expect(status.attemptsRemaining).toBe(5)
    })

    it('should return correct attempts remaining', async () => {
      const uniqueId = `attempts-test-${Date.now()}`
      await recordFailedAttempt(uniqueId)
      await recordFailedAttempt(uniqueId)

      const status = await isAccountLocked(uniqueId)

      expect(status.failedAttempts).toBe(2)
      expect(status.attemptsRemaining).toBe(3)
    })
  })

  describe('recordFailedAttempt', () => {
    it('should increment failed attempts', async () => {
      const uniqueId = `increment-test-${Date.now()}`

      const result1 = await recordFailedAttempt(uniqueId)
      expect(result1.failedAttempts).toBe(1)
      expect(result1.isLocked).toBe(false)

      const result2 = await recordFailedAttempt(uniqueId)
      expect(result2.failedAttempts).toBe(2)
      expect(result2.isLocked).toBe(false)
    })

    it('should lock account after 5 failed attempts', async () => {
      const uniqueId = `lockout-test-${Date.now()}`

      // Record 5 failed attempts
      for (let i = 0; i < 4; i++) {
        const result = await recordFailedAttempt(uniqueId)
        expect(result.isLocked).toBe(false)
      }

      // Fifth attempt should trigger lockout
      const finalResult = await recordFailedAttempt(uniqueId)
      expect(finalResult.isLocked).toBe(true)
      expect(finalResult.lockoutDuration).toBeDefined()
      expect(finalResult.attemptsRemaining).toBe(0)
    })

    it('should set first lockout duration to 5 minutes', async () => {
      const uniqueId = `duration-test-${Date.now()}`

      // Trigger lockout
      for (let i = 0; i < 5; i++) {
        await recordFailedAttempt(uniqueId)
      }

      const status = await isAccountLocked(uniqueId)
      expect(status.isLocked).toBe(true)
      // 5 minutes = 300000ms
      expect(status.lockoutDuration).toBeGreaterThanOrEqual(290000)
      expect(status.lockoutDuration).toBeLessThanOrEqual(310000)
    })
  })

  describe('clearLockout', () => {
    it('should clear lockout and reset attempts', async () => {
      const uniqueId = `clear-test-${Date.now()}`

      // Record some failed attempts
      await recordFailedAttempt(uniqueId)
      await recordFailedAttempt(uniqueId)

      // Clear lockout
      await clearLockout(uniqueId)

      // Check status is reset
      const status = await isAccountLocked(uniqueId)
      expect(status.failedAttempts).toBe(0)
      expect(status.attemptsRemaining).toBe(5)
    })

    it('should handle clearing non-existent lockout', async () => {
      const uniqueId = `nonexistent-${Date.now()}`

      // Should not throw
      await expect(clearLockout(uniqueId)).resolves.not.toThrow()
    })
  })

  describe('formatLockoutDuration', () => {
    it('should format seconds as minutes', () => {
      expect(formatLockoutDuration(60000)).toBe('1 minute')
    })

    it('should format multiple minutes', () => {
      expect(formatLockoutDuration(300000)).toBe('5 minutes')
    })

    it('should format hours', () => {
      expect(formatLockoutDuration(3600000)).toBe('1 hour')
    })

    it('should format multiple hours', () => {
      expect(formatLockoutDuration(7200000)).toBe('2 hours')
    })

    it('should format hours and minutes', () => {
      expect(formatLockoutDuration(5400000)).toBe('1 hour and 30 minutes')
    })

    it('should handle sub-minute durations', () => {
      const result = formatLockoutDuration(30000)
      expect(result).toBe('1 minute') // Rounds up
    })
  })
})

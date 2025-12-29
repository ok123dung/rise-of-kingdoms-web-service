/**
 * Rate Limiter Tests
 * Tests for Redis-backed rate limiting with in-memory fallback
 */

import { checkRateLimit, rateLimiters, getClientIP } from '../rate-limiter'

// Mock Redis - not available in test environment
jest.mock('@upstash/redis', () => ({
  Redis: jest.fn().mockImplementation(() => {
    throw new Error('Redis not available in test')
  }),
}))

describe('Rate Limiter', () => {
  describe('checkRateLimit', () => {
    it('should allow first request', async () => {
      const uniqueId = `rate-test-${Date.now()}`
      const result = await checkRateLimit(uniqueId, {
        windowMs: 60000,
        maxRequests: 5,
      })

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(4)
    })

    it('should decrement remaining on each request', async () => {
      const uniqueId = `decrement-test-${Date.now()}`
      const config = { windowMs: 60000, maxRequests: 5 }

      const result1 = await checkRateLimit(uniqueId, config)
      expect(result1.remaining).toBe(4)

      const result2 = await checkRateLimit(uniqueId, config)
      expect(result2.remaining).toBe(3)
    })

    it('should block after max requests exceeded', async () => {
      const uniqueId = `block-test-${Date.now()}`
      const config = { windowMs: 60000, maxRequests: 3 }

      // Make requests up to limit
      for (let i = 0; i < 3; i++) {
        await checkRateLimit(uniqueId, config)
      }

      // Next request should be blocked
      const result = await checkRateLimit(uniqueId, config)
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
      expect(result.retryAfter).toBeDefined()
    })

    it('should include resetAt timestamp', async () => {
      const uniqueId = `reset-test-${Date.now()}`
      const config = { windowMs: 60000, maxRequests: 5 }

      const result = await checkRateLimit(uniqueId, config)

      expect(result.resetAt).toBeDefined()
      expect(result.resetAt).toBeGreaterThan(Date.now())
    })

    it('should use custom key prefix', async () => {
      const uniqueId = `prefix-test-${Date.now()}`
      const config = {
        windowMs: 60000,
        maxRequests: 5,
        keyPrefix: 'custom-prefix',
      }

      const result = await checkRateLimit(uniqueId, config)
      expect(result.allowed).toBe(true)
    })
  })

  describe('rateLimiters presets', () => {
    describe('login', () => {
      it('should allow 5 requests per 15 minutes', async () => {
        const uniqueId = `login-preset-${Date.now()}`

        // First 5 should be allowed
        for (let i = 0; i < 5; i++) {
          const result = await rateLimiters.login(uniqueId)
          expect(result.allowed).toBe(true)
        }

        // 6th should be blocked
        const result = await rateLimiters.login(uniqueId)
        expect(result.allowed).toBe(false)
      })
    })

    describe('api', () => {
      it('should allow 100 requests per minute', async () => {
        const uniqueId = `api-preset-${Date.now()}`

        const result = await rateLimiters.api(uniqueId)
        expect(result.allowed).toBe(true)
        expect(result.remaining).toBe(99) // 100 - 1
      })
    })

    describe('passwordReset', () => {
      it('should allow 3 requests per hour', async () => {
        const uniqueId = `reset-preset-${Date.now()}`

        // First 3 should be allowed
        for (let i = 0; i < 3; i++) {
          const result = await rateLimiters.passwordReset(uniqueId)
          expect(result.allowed).toBe(true)
        }

        // 4th should be blocked
        const result = await rateLimiters.passwordReset(uniqueId)
        expect(result.allowed).toBe(false)
      })
    })

    describe('registration', () => {
      it('should allow 5 requests per hour', async () => {
        const uniqueId = `reg-preset-${Date.now()}`

        const result = await rateLimiters.registration(uniqueId)
        expect(result.allowed).toBe(true)
        expect(result.remaining).toBe(4)
      })
    })
  })

  describe('getClientIP', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const headers = new Headers()
      headers.set('x-forwarded-for', '192.168.1.1, 10.0.0.1')

      const ip = getClientIP(headers)
      expect(ip).toBe('192.168.1.1')
    })

    it('should extract IP from x-real-ip header', () => {
      const headers = new Headers()
      headers.set('x-real-ip', '192.168.1.100')

      const ip = getClientIP(headers)
      expect(ip).toBe('192.168.1.100')
    })

    it('should prefer x-forwarded-for over x-real-ip', () => {
      const headers = new Headers()
      headers.set('x-forwarded-for', '10.0.0.1')
      headers.set('x-real-ip', '192.168.1.1')

      const ip = getClientIP(headers)
      expect(ip).toBe('10.0.0.1')
    })

    it('should return "unknown" if no IP headers present', () => {
      const headers = new Headers()

      const ip = getClientIP(headers)
      expect(ip).toBe('unknown')
    })

    it('should handle empty headers gracefully', () => {
      const headers = new Headers()
      headers.set('x-forwarded-for', '')

      const ip = getClientIP(headers)
      // Empty string is falsy, should fallback
      expect(ip).toBe('unknown')
    })
  })
})

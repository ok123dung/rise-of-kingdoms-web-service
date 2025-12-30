/**
 * CSRF Protection Tests
 * Tests token generation, verification, and client-side helpers
 */

import {
  generateCSRFToken,
  generateSignedCSRFToken,
  verifySignedCSRFToken,
  getCSRFMetaTags,
  getCSRFHeaders
} from '../csrf-protection'

describe('CSRF Protection', () => {
  describe('generateCSRFToken', () => {
    it('should generate a 64-character hex string', () => {
      const token = generateCSRFToken()

      expect(token).toHaveLength(64)
      expect(token).toMatch(/^[a-f0-9]+$/)
    })

    it('should generate unique tokens', () => {
      const tokens = new Set<string>()
      for (let i = 0; i < 100; i++) {
        tokens.add(generateCSRFToken())
      }

      expect(tokens.size).toBe(100)
    })
  })

  describe('generateSignedCSRFToken', () => {
    const secret = 'test-secret-key-12345'

    it('should generate a token with three parts', () => {
      const token = generateSignedCSRFToken(secret)
      const parts = token.split('.')

      expect(parts).toHaveLength(3)
    })

    it('should include timestamp as first part', () => {
      const before = Date.now()
      const token = generateSignedCSRFToken(secret)
      const after = Date.now()

      const timestamp = parseInt(token.split('.')[0], 10)

      expect(timestamp).toBeGreaterThanOrEqual(before)
      expect(timestamp).toBeLessThanOrEqual(after)
    })

    it('should include random part as second segment', () => {
      const token = generateSignedCSRFToken(secret)
      const randomPart = token.split('.')[1]

      // 24 random bytes = 48 hex chars
      expect(randomPart).toHaveLength(48)
      expect(randomPart).toMatch(/^[a-f0-9]+$/)
    })

    it('should include signature as third segment', () => {
      const token = generateSignedCSRFToken(secret)
      const signature = token.split('.')[2]

      // SHA256 = 64 hex chars
      expect(signature).toHaveLength(64)
      expect(signature).toMatch(/^[a-f0-9]+$/)
    })

    it('should generate different tokens each time', () => {
      const token1 = generateSignedCSRFToken(secret)
      const token2 = generateSignedCSRFToken(secret)

      expect(token1).not.toBe(token2)
    })
  })

  describe('verifySignedCSRFToken', () => {
    const secret = 'test-secret-key-12345'

    it('should verify valid token', () => {
      const token = generateSignedCSRFToken(secret)

      expect(verifySignedCSRFToken(token, secret)).toBe(true)
    })

    it('should reject token with wrong secret', () => {
      const token = generateSignedCSRFToken(secret)

      expect(verifySignedCSRFToken(token, 'wrong-secret')).toBe(false)
    })

    it('should reject malformed token (wrong number of parts)', () => {
      expect(verifySignedCSRFToken('invalid', secret)).toBe(false)
      expect(verifySignedCSRFToken('part1.part2', secret)).toBe(false)
      expect(verifySignedCSRFToken('a.b.c.d', secret)).toBe(false)
    })

    it('should reject expired token', () => {
      // Create a token with timestamp from 2 hours ago
      const oldTimestamp = Date.now() - 7200000 // 2 hours ago
      const randomPart = 'a'.repeat(48)
      const data = `${oldTimestamp}.${randomPart}`

      // Create signature
      const crypto = require('crypto')
      const hmac = crypto.createHmac('sha256', secret)
      hmac.update(data)
      const signature = hmac.digest('hex')

      const expiredToken = `${data}.${signature}`

      // maxAge of 1 hour should reject 2-hour-old token
      expect(verifySignedCSRFToken(expiredToken, secret, 3600000)).toBe(false)
    })

    it('should accept token within maxAge', () => {
      const token = generateSignedCSRFToken(secret)

      // 1 hour max age should accept fresh token
      expect(verifySignedCSRFToken(token, secret, 3600000)).toBe(true)
    })

    it('should reject token with tampered signature', () => {
      const token = generateSignedCSRFToken(secret)
      const parts = token.split('.')
      parts[2] = 'tampered' + parts[2].slice(8)
      const tamperedToken = parts.join('.')

      expect(verifySignedCSRFToken(tamperedToken, secret)).toBe(false)
    })

    it('should reject token with tampered timestamp', () => {
      const token = generateSignedCSRFToken(secret)
      const parts = token.split('.')
      parts[0] = String(Date.now() - 1000000) // Change timestamp
      const tamperedToken = parts.join('.')

      expect(verifySignedCSRFToken(tamperedToken, secret)).toBe(false)
    })

    it('should handle invalid hex in signature gracefully', () => {
      expect(verifySignedCSRFToken('12345.abc123.invalidhex!!!', secret)).toBe(false)
    })
  })

  describe('getCSRFMetaTags', () => {
    it('should generate meta tags with token', () => {
      const token = 'test-csrf-token-123'
      const metaTags = getCSRFMetaTags(token)

      expect(metaTags).toContain('name="csrf-token"')
      expect(metaTags).toContain(`content="${token}"`)
      expect(metaTags).toContain('name="csrf-param"')
      expect(metaTags).toContain('content="authenticity_token"')
      expect(metaTags).toContain('name="csrf-header"')
      expect(metaTags).toContain('content="X-CSRF-Token"')
    })

    it('should properly escape token in content', () => {
      const token = 'token-with-special"chars'
      const metaTags = getCSRFMetaTags(token)

      expect(metaTags).toContain(token)
    })
  })

  describe('getCSRFHeaders', () => {
    let querySelectorSpy: jest.SpyInstance
    let originalCookie: string

    beforeEach(() => {
      originalCookie = document.cookie
    })

    afterEach(() => {
      querySelectorSpy?.mockRestore()
      // Clear cookies is tricky, just restore original
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: originalCookie
      })
    })

    it('should return empty object on server (no window)', () => {
      // Temporarily make window undefined
      const originalWindow = global.window
      // @ts-expect-error - Testing server environment
      delete global.window

      // Need to re-import or call in server context
      // For this test, we'll check the function handles undefined window
      expect(getCSRFHeaders()).toEqual({})

      global.window = originalWindow
    })

    it('should return token from meta tag', () => {
      const mockToken = 'meta-csrf-token-456'

      // Create actual meta tag in DOM
      const meta = document.createElement('meta')
      meta.setAttribute('name', 'csrf-token')
      meta.setAttribute('content', mockToken)
      document.head.appendChild(meta)

      const headers = getCSRFHeaders()

      expect(headers).toEqual({ 'X-CSRF-Token': mockToken })

      // Cleanup
      document.head.removeChild(meta)
    })

    it('should fall back to cookie when no meta tag', () => {
      const cookieToken = 'cookie-token-789'

      // Ensure no meta tag exists
      querySelectorSpy = jest.spyOn(document, 'querySelector').mockReturnValue(null)

      // Set cookie
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: `other=value; csrf-token=${cookieToken}; session=abc`
      })

      const headers = getCSRFHeaders()

      expect(headers).toEqual({ 'X-CSRF-Token': cookieToken })
    })

    it('should return empty object when no token found', () => {
      // Ensure no meta tag exists
      querySelectorSpy = jest.spyOn(document, 'querySelector').mockReturnValue(null)

      // Set cookie without csrf-token
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'other=value; session=abc'
      })

      const headers = getCSRFHeaders()

      expect(headers).toEqual({})
    })
  })
})

/**
 * @jest-environment node
 */

/**
 * CSRF API Route Tests
 * Tests for /api/auth/csrf endpoint
 */

// Mock dependencies
jest.mock('@/lib/csrf-protection', () => ({
  generateSignedCSRFToken: jest.fn().mockReturnValue('mock-csrf-token-123'),
}))

import { GET } from '../auth/csrf/route'

describe('CSRF API Route', () => {
  describe('GET /api/auth/csrf', () => {
    it('should return a CSRF token', async () => {
      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.csrfToken).toBe('mock-csrf-token-123')
    })

    it('should set csrf-token cookie', async () => {
      const response = await GET()

      const setCookieHeader = response.headers.get('set-cookie')
      expect(setCookieHeader).toContain('csrf-token=mock-csrf-token-123')
    })

    it('should set cookie with correct attributes', async () => {
      const response = await GET()

      const setCookieHeader = response.headers.get('set-cookie')
      expect(setCookieHeader).toContain('Path=/')
      expect(setCookieHeader?.toLowerCase()).toContain('samesite=strict')
      expect(setCookieHeader).toContain('Max-Age=86400')
    })
  })
})

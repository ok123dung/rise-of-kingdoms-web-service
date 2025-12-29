/**
 * JWT Token Tests
 * Tests for token generation and verification
 */

import jwt from 'jsonwebtoken'

import { generateToken, verifyToken, generateWebSocketToken } from '../jwt'

// Mock the logger to prevent console output during tests
jest.mock('@/lib/monitoring/logger', () => ({
  getLogger: () => ({
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  }),
}))

describe('JWT Token Functions', () => {
  const testPayload = {
    user_id: 'test-user-123',
    email: 'test@example.com',
    role: 'customer',
  }

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(testPayload)

      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3) // JWT has 3 parts
    })

    it('should include user_id in token payload', () => {
      const token = generateToken(testPayload)
      const decoded = jwt.decode(token) as { user_id: string }

      expect(decoded.user_id).toBe(testPayload.user_id)
    })

    it('should include email in token payload', () => {
      const token = generateToken(testPayload)
      const decoded = jwt.decode(token) as { email: string }

      expect(decoded.email).toBe(testPayload.email)
    })

    it('should include role in token payload', () => {
      const token = generateToken(testPayload)
      const decoded = jwt.decode(token) as { role: string }

      expect(decoded.role).toBe(testPayload.role)
    })

    it('should generate token with expiration', () => {
      const token = generateToken(testPayload)
      const decoded = jwt.decode(token) as { exp: number }

      expect(decoded.exp).toBeDefined()
      // Token should expire in ~24 hours
      const now = Math.floor(Date.now() / 1000)
      const twentyFourHours = 24 * 60 * 60
      expect(decoded.exp - now).toBeGreaterThan(twentyFourHours - 60) // Within 1 min tolerance
      expect(decoded.exp - now).toBeLessThanOrEqual(twentyFourHours)
    })

    it('should generate tokens with iat timestamp', () => {
      const token = generateToken(testPayload)
      const decoded = jwt.decode(token) as { iat: number }

      // Token should have iat (issued at) timestamp
      expect(decoded.iat).toBeDefined()
      expect(decoded.iat).toBeGreaterThan(0)
    })

    it('should work without optional role', () => {
      const payloadWithoutRole = {
        user_id: 'test-user-123',
        email: 'test@example.com',
      }
      const token = generateToken(payloadWithoutRole)

      expect(token).toBeDefined()
      const decoded = jwt.decode(token) as { role?: string }
      expect(decoded.role).toBeUndefined()
    })
  })

  describe('verifyToken', () => {
    it('should verify and return payload for valid token', () => {
      const token = generateToken(testPayload)
      const result = verifyToken(token)

      expect(result).not.toBeNull()
      expect(result?.user_id).toBe(testPayload.user_id)
      expect(result?.email).toBe(testPayload.email)
    })

    it('should return null for invalid token', () => {
      const result = verifyToken('invalid-token')

      expect(result).toBeNull()
    })

    it('should return null for malformed token', () => {
      const result = verifyToken('part1.part2.part3')

      expect(result).toBeNull()
    })

    it('should return null for expired token', () => {
      // Create a token that's already expired
      const secret = process.env.NEXTAUTH_SECRET ?? 'your-secret-key'
      const expiredToken = jwt.sign(testPayload, secret, { expiresIn: '-1h' })

      const result = verifyToken(expiredToken)

      expect(result).toBeNull()
    })

    it('should return null for token with wrong secret', () => {
      const wrongSecretToken = jwt.sign(testPayload, 'wrong-secret', { expiresIn: '1h' })

      const result = verifyToken(wrongSecretToken)

      expect(result).toBeNull()
    })

    it('should return null for empty string', () => {
      const result = verifyToken('')

      expect(result).toBeNull()
    })
  })

  describe('generateWebSocketToken', () => {
    it('should generate token with user_id and email', () => {
      const token = generateWebSocketToken('ws-user-123', 'ws@example.com')
      const decoded = jwt.decode(token) as { user_id: string; email: string }

      expect(decoded.user_id).toBe('ws-user-123')
      expect(decoded.email).toBe('ws@example.com')
    })

    it('should include role when provided', () => {
      const token = generateWebSocketToken('ws-user-123', 'ws@example.com', 'admin')
      const decoded = jwt.decode(token) as { role: string }

      expect(decoded.role).toBe('admin')
    })

    it('should be verifiable', () => {
      const token = generateWebSocketToken('ws-user-123', 'ws@example.com', 'customer')
      const result = verifyToken(token)

      expect(result).not.toBeNull()
      expect(result?.user_id).toBe('ws-user-123')
    })
  })
})

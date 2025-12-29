/**
 * API Error Handler Tests
 * Tests for error handling utilities
 */

import {
  getAuthToken,
  requireAuthToken,
  AuthenticationError,
} from '../errors'

// Mock the error logging
jest.mock('@/lib/errors', () => {
  const actual = jest.requireActual('@/lib/errors')
  return {
    ...actual,
    logError: jest.fn(),
  }
})

// Type for mock request
interface MockRequest {
  headers: {
    get: (name: string) => string | null
  }
  nextUrl: {
    pathname: string
    searchParams: URLSearchParams
  }
  json: jest.Mock
}

// Create a mock request with headers
function createMockRequest(options: {
  headers?: Record<string, string>
  searchParams?: Record<string, string>
  pathname?: string
  body?: unknown
} = {}): MockRequest {
  const { headers = {}, searchParams = {}, pathname = '/api/test', body = {} } = options

  return {
    headers: {
      get: (name: string) => headers[name.toLowerCase()] || null,
    },
    nextUrl: {
      pathname,
      searchParams: new URLSearchParams(searchParams),
    },
    json: jest.fn().mockResolvedValue(body),
  }
}

describe('API Error Handler', () => {
  describe('getAuthToken', () => {
    it('should extract Bearer token from Authorization header', () => {
      const req = createMockRequest({
        headers: { authorization: 'Bearer abc123' },
      })

      const token = getAuthToken(req as Parameters<typeof getAuthToken>[0])
      expect(token).toBe('abc123')
    })

    it('should return null for missing Authorization header', () => {
      const req = createMockRequest()

      const token = getAuthToken(req as Parameters<typeof getAuthToken>[0])
      expect(token).toBeNull()
    })

    it('should return null for non-Bearer auth', () => {
      const req = createMockRequest({
        headers: { authorization: 'Basic abc123' },
      })

      const token = getAuthToken(req as Parameters<typeof getAuthToken>[0])
      expect(token).toBeNull()
    })

    it('should return null for malformed Bearer token', () => {
      const req = createMockRequest({
        headers: { authorization: 'Bearertoken' },
      })

      const token = getAuthToken(req as Parameters<typeof getAuthToken>[0])
      expect(token).toBeNull()
    })

    it('should handle empty Authorization header', () => {
      const req = createMockRequest({
        headers: { authorization: '' },
      })

      const token = getAuthToken(req as Parameters<typeof getAuthToken>[0])
      expect(token).toBeNull()
    })

    it('should handle Bearer with empty token', () => {
      const req = createMockRequest({
        headers: { authorization: 'Bearer ' },
      })

      const token = getAuthToken(req as Parameters<typeof getAuthToken>[0])
      expect(token).toBe('')
    })
  })

  describe('requireAuthToken', () => {
    it('should return token when present', () => {
      const req = createMockRequest({
        headers: { authorization: 'Bearer valid-token' },
      })

      const token = requireAuthToken(req as Parameters<typeof requireAuthToken>[0])
      expect(token).toBe('valid-token')
    })

    it('should throw AuthenticationError when token missing', () => {
      const req = createMockRequest()

      expect(() => {
        requireAuthToken(req as Parameters<typeof requireAuthToken>[0])
      }).toThrow(AuthenticationError)
    })

    it('should throw AuthenticationError for non-Bearer auth', () => {
      const req = createMockRequest({
        headers: { authorization: 'Basic abc123' },
      })

      expect(() => {
        requireAuthToken(req as Parameters<typeof requireAuthToken>[0])
      }).toThrow(AuthenticationError)
    })

    it('should throw AuthenticationError when Authorization header is empty', () => {
      const req = createMockRequest({
        headers: { authorization: '' },
      })

      expect(() => {
        requireAuthToken(req as Parameters<typeof requireAuthToken>[0])
      }).toThrow(AuthenticationError)
    })
  })
})

/**
 * CSP Middleware Tests
 * Tests Content Security Policy nonce generation and header application
 */

import { NextRequest, NextResponse } from 'next/server'

import { cspMiddleware } from '../csp'

// Mock the CSP library
jest.mock('@/lib/csp', () => ({
  generateNonce: jest.fn(() => 'test-nonce-12345'),
  addCSPHeaders: jest.fn((headers: Headers, nonce: string) => {
    headers.set('Content-Security-Policy', `script-src 'nonce-${nonce}'`)
  })
}))

// Helper to create mock NextRequest
function createMockRequest(): NextRequest {
  return {
    method: 'GET',
    url: 'http://localhost:3000/page',
    headers: new Headers()
  } as unknown as NextRequest
}

describe('CSP Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('cspMiddleware', () => {
    it('should generate nonce and return response', () => {
      const request = createMockRequest()

      const response = cspMiddleware(request)

      expect(response).toBeInstanceOf(NextResponse)
    })

    it('should add CSP headers to response', () => {
      const request = createMockRequest()

      const response = cspMiddleware(request)

      // Verify CSP header was added (via mock)
      expect(response.headers.get('Content-Security-Policy')).toContain('nonce-test-nonce-12345')
    })

    it('should call generateNonce', () => {
      const { generateNonce } = require('@/lib/csp')
      const request = createMockRequest()

      cspMiddleware(request)

      expect(generateNonce).toHaveBeenCalled()
    })

    it('should call addCSPHeaders with nonce', () => {
      const { addCSPHeaders } = require('@/lib/csp')
      const request = createMockRequest()

      cspMiddleware(request)

      // Verify addCSPHeaders was called with nonce as second argument
      expect(addCSPHeaders).toHaveBeenCalled()
      expect(addCSPHeaders.mock.calls[0][1]).toBe('test-nonce-12345')
    })
  })
})

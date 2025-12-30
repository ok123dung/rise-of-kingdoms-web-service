/**
 * useCSRF Hook Tests
 * Tests CSRF token management from meta tag and cookie
 */

import { renderHook, waitFor, act } from '@testing-library/react'

import { useCSRF } from '../useCSRF'

// Mock the csrf-protection module
jest.mock('@/lib/csrf-protection', () => ({
  getCSRFHeaders: jest.fn(() => ({ 'X-CSRF-Token': 'mock-csrf-token' }))
}))

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('useCSRF Hook', () => {
  let originalQuerySelector: typeof document.querySelector
  let originalCookie: PropertyDescriptor | undefined

  beforeEach(() => {
    jest.clearAllMocks()
    originalQuerySelector = document.querySelector
    originalCookie = Object.getOwnPropertyDescriptor(document, 'cookie')
  })

  afterEach(() => {
    document.querySelector = originalQuerySelector
    if (originalCookie) {
      Object.defineProperty(document, 'cookie', originalCookie)
    }
  })

  describe('Token from meta tag', () => {
    it('should get CSRF token from meta tag', async () => {
      document.querySelector = jest.fn().mockReturnValue({
        getAttribute: () => 'meta-csrf-token-123'
      })

      const { result } = renderHook(() => useCSRF())

      await waitFor(() => {
        expect(result.current.csrfToken).toBe('meta-csrf-token-123')
      })
    })

    it('should return null when no meta tag exists', async () => {
      document.querySelector = jest.fn().mockReturnValue(null)
      Object.defineProperty(document, 'cookie', {
        get: () => '',
        configurable: true
      })

      const { result } = renderHook(() => useCSRF())

      // Wait for effect to run
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(result.current.csrfToken).toBeNull()
    })
  })

  describe('Token from cookie', () => {
    it('should get CSRF token from cookie when meta tag not found', async () => {
      document.querySelector = jest.fn().mockReturnValue(null)
      Object.defineProperty(document, 'cookie', {
        get: () => 'other=value; csrf-token=cookie-token-456; session=abc',
        configurable: true
      })

      const { result } = renderHook(() => useCSRF())

      await waitFor(() => {
        expect(result.current.csrfToken).toBe('cookie-token-456')
      })
    })

    it('should prefer meta tag over cookie', async () => {
      document.querySelector = jest.fn().mockReturnValue({
        getAttribute: () => 'meta-token'
      })
      Object.defineProperty(document, 'cookie', {
        get: () => 'csrf-token=cookie-token',
        configurable: true
      })

      const { result } = renderHook(() => useCSRF())

      await waitFor(() => {
        expect(result.current.csrfToken).toBe('meta-token')
      })
    })
  })

  describe('getHeaders', () => {
    it('should return CSRF header when token exists', async () => {
      document.querySelector = jest.fn().mockReturnValue({
        getAttribute: () => 'test-token'
      })

      const { result } = renderHook(() => useCSRF())

      await waitFor(() => {
        expect(result.current.csrfToken).toBe('test-token')
      })

      const headers = result.current.getHeaders()
      expect(headers).toEqual({ 'X-CSRF-Token': 'test-token' })
    })

    it('should return empty object when no token', async () => {
      document.querySelector = jest.fn().mockReturnValue(null)
      Object.defineProperty(document, 'cookie', {
        get: () => '',
        configurable: true
      })

      const { result } = renderHook(() => useCSRF())

      // Token should be null, so headers should be empty
      const headers = result.current.getHeaders()
      expect(headers).toEqual({})
    })
  })

  describe('fetchWithCSRF', () => {
    it('should call fetch with CSRF headers', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true })

      const { result } = renderHook(() => useCSRF())

      await result.current.fetchWithCSRF('/api/test')

      expect(mockFetch).toHaveBeenCalledWith('/api/test', {
        headers: { 'X-CSRF-Token': 'mock-csrf-token' },
        credentials: 'same-origin'
      })
    })

    it('should merge custom headers with CSRF headers', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true })

      const { result } = renderHook(() => useCSRF())

      await result.current.fetchWithCSRF('/api/test', {
        headers: { 'Content-Type': 'application/json' }
      })

      expect(mockFetch).toHaveBeenCalledWith('/api/test', {
        headers: {
          'X-CSRF-Token': 'mock-csrf-token',
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin'
      })
    })

    it('should pass other fetch options', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true })

      const { result } = renderHook(() => useCSRF())

      await result.current.fetchWithCSRF('/api/test', {
        method: 'POST',
        body: JSON.stringify({ data: 'test' })
      })

      expect(mockFetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        body: JSON.stringify({ data: 'test' }),
        headers: { 'X-CSRF-Token': 'mock-csrf-token' },
        credentials: 'same-origin'
      })
    })

    it('should always use same-origin credentials', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true })

      const { result } = renderHook(() => useCSRF())

      await result.current.fetchWithCSRF('/api/test', {
        credentials: 'include' // Should be overwritten
      })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          credentials: 'same-origin'
        })
      )
    })
  })

  describe('Return values', () => {
    it('should return csrfToken, getHeaders, and fetchWithCSRF', () => {
      document.querySelector = jest.fn().mockReturnValue(null)
      Object.defineProperty(document, 'cookie', {
        get: () => '',
        configurable: true
      })

      const { result } = renderHook(() => useCSRF())

      expect(result.current).toHaveProperty('csrfToken')
      expect(result.current).toHaveProperty('getHeaders')
      expect(result.current).toHaveProperty('fetchWithCSRF')
      expect(typeof result.current.getHeaders).toBe('function')
      expect(typeof result.current.fetchWithCSRF).toBe('function')
    })
  })
})

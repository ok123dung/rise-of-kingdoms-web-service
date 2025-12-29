/**
 * Test Helpers
 * Common utilities for testing API routes and components
 */

import { type NextRequest } from 'next/server'

/**
 * Create a mock NextRequest for API route testing
 */
export function createMockRequest(options: {
  method?: string
  url?: string
  body?: unknown
  headers?: Record<string, string>
  searchParams?: Record<string, string>
}): NextRequest {
  const {
    method = 'GET',
    url = 'http://localhost:3000/api/test',
    body,
    headers = {},
    searchParams = {},
  } = options

  // Build URL with search params
  const urlObj = new URL(url)
  Object.entries(searchParams).forEach(([key, value]) => {
    urlObj.searchParams.set(key, value)
  })

  const requestInit: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  }

  if (body && method !== 'GET' && method !== 'HEAD') {
    requestInit.body = JSON.stringify(body)
  }

  return new Request(urlObj.toString(), requestInit) as unknown as NextRequest
}

/**
 * Create auth headers with Bearer token
 */
export function createAuthHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
  }
}

/**
 * Parse JSON response from API route
 */
export async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json()
  return data as T
}

/**
 * Create a test user data object
 */
export function createTestUserData(overrides: Partial<{
  id: string
  email: string
  password: string
  full_name: string
}> = {}) {
  return {
    id: overrides.id ?? `test-user-${Date.now()}`,
    email: overrides.email ?? `test-${Date.now()}@example.com`,
    password: overrides.password ?? 'TestPassword123!',
    full_name: overrides.full_name ?? 'Test User',
  }
}

/**
 * Create a test booking data object
 */
export function createTestBookingData(overrides: Partial<{
  id: string
  booking_number: string
  user_id: string
  service_tier_id: string
  total_amount: number
}> = {}) {
  return {
    id: overrides.id ?? `booking-${Date.now()}`,
    booking_number: overrides.booking_number ?? `BK-${Date.now()}`,
    user_id: overrides.user_id ?? 'test-user-id',
    service_tier_id: overrides.service_tier_id ?? 'test-tier-id',
    total_amount: overrides.total_amount ?? 100000,
  }
}

/**
 * Wait for a condition to be true (useful for async tests)
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeout = 5000,
  interval = 100
): Promise<void> {
  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return
    }
    await new Promise((resolve) => setTimeout(resolve, interval))
  }

  throw new Error(`Condition not met within ${timeout}ms`)
}

/**
 * Mock console methods for clean test output
 */
export function mockConsole(): {
  restore: () => void
  getErrors: () => unknown[]
  getWarns: () => unknown[]
  getLogs: () => unknown[]
} {
  const errors: unknown[] = []
  const warns: unknown[] = []
  const logs: unknown[] = []

  const originalError = console.error
  const originalWarn = console.warn
  const originalLog = console.log

  console.error = (...args: unknown[]) => errors.push(args)
  console.warn = (...args: unknown[]) => warns.push(args)
  console.log = (...args: unknown[]) => logs.push(args)

  return {
    restore: () => {
      console.error = originalError
      console.warn = originalWarn
      console.log = originalLog
    },
    getErrors: () => errors,
    getWarns: () => warns,
    getLogs: () => logs,
  }
}

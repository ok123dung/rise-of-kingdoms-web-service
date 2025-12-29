/**
 * Test helpers for API route testing
 */

/**
 * Creates a mock NextRequest object for testing
 */
export function createMockRequest(options: {
  method?: string
  url?: string
  headers?: Record<string, string>
  body?: unknown
  searchParams?: Record<string, string>
} = {}): any {
  const {
    method = 'GET',
    url = 'http://localhost:3000/api/test',
    headers = {},
    body,
    searchParams = {},
  } = options

  const urlObj = new URL(url)
  Object.entries(searchParams).forEach(([key, value]) => {
    urlObj.searchParams.set(key, value)
  })

  return {
    method,
    url: urlObj.toString(),
    nextUrl: urlObj,
    headers: {
      get: (name: string) => headers[name.toLowerCase()] || null,
      has: (name: string) => name.toLowerCase() in headers,
      entries: () => Object.entries(headers),
    },
    json: async () => body,
    text: async () => JSON.stringify(body),
  }
}

/**
 * Extracts JSON from NextResponse
 * Note: In Node.js environment, response.json() works directly
 */
export async function getJson(response: Response): Promise<any> {
  return response.json()
}

/**
 * Creates authenticated mock request with user headers
 */
export function createAuthenticatedRequest(options: {
  method?: string
  url?: string
  body?: unknown
  searchParams?: Record<string, string>
  userId?: string
  userRole?: string
} = {}): any {
  const { userId = 'user-123', userRole = 'CUSTOMER', ...rest } = options
  return createMockRequest({
    ...rest,
    headers: {
      'x-user-id': userId,
      'x-user-role': userRole,
      'content-type': 'application/json',
    },
  })
}

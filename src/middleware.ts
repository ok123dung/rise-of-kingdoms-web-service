import { NextResponse } from 'next/server'

import { authMiddleware, validateCSRFToken } from './middleware/auth'

import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Security headers
  const headers = new Headers(req.headers)
  headers.set('X-Frame-Options', 'DENY')
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('X-XSS-Protection', '1; mode=block')
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // CORS configuration for API routes
  if (pathname.startsWith('/api')) {
    const origin = req.headers.get('origin')
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'https://rokdbot.com',
      'https://www.rokdbot.com'
    ]

    if (origin && allowedOrigins.includes(origin)) {
      headers.set('Access-Control-Allow-Origin', origin)
      headers.set('Access-Control-Allow-Credentials', 'true')
      headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token')
    }

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers })
    }

    // Validate CSRF token for state-changing requests
    if (!validateCSRFToken(req)) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
    }
  }

  // Apply authentication and rate limiting
  const authResponse = await authMiddleware(req)
  if (authResponse) {
    // Add security headers to auth response
    authResponse.headers.forEach((value, key) => {
      headers.set(key, value)
    })
    return authResponse
  }

  // Add security headers to all responses
  const response = NextResponse.next({
    request: {
      headers
    }
  })

  // Set security headers on response
  headers.forEach((value, key) => {
    response.headers.set(key, value)
  })

  // Generate CSRF token for session
  if (!req.cookies.get('csrf-token')) {
    const csrfToken = generateCSRFToken()
    response.cookies.set('csrf-token', csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 // 24 hours
    })
  }

  return response
}

// Specify which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)'
  ]
}

function generateCSRFToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

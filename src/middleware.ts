import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { buildCSPHeader, currentCSPDirectives, generateCSPNonce, cspReportOnly } from '@/lib/security/csp-config'

export async function middleware(req: NextRequest) {
  const response = NextResponse.next()

  // Skip middleware in development for easier debugging
  if (process.env.NODE_ENV === 'development') {
    return response
  }

  // Basic security headers (no crypto needed)
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // Content Security Policy
  // Generate nonce for this request (for future strict CSP migration)
  const nonce = generateCSPNonce()

  // Build CSP header from centralized config
  const cspHeader = buildCSPHeader(currentCSPDirectives, nonce)

  // Use report-only mode during testing, enforce mode in production
  const cspHeaderName = cspReportOnly ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy'
  response.headers.set(cspHeaderName, cspHeader)

  // Store nonce in response headers for use in components (for future strict CSP)
  // response.headers.set('X-CSP-Nonce', nonce)

  // Production security headers
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }

  return response
}

// Only run on pages, not API routes or static files
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
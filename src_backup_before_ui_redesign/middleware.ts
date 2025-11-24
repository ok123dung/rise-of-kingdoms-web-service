import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

import {
  buildCSPHeader,
  currentCSPDirectives,
  generateCSPNonce,
  cspReportOnly
} from '@/lib/security/csp-config'

export default withAuth(
  function middleware(req) {
    const response = NextResponse.next()
    const token = req.nextauth.token

    // Skip middleware in development for easier debugging (Optional: remove this in strict mode)
    // if (process.env.NODE_ENV === 'development') {
    //   return response
    // }

    // Admin Route Protection
    if (req.nextUrl.pathname.startsWith('/admin')) {
      if (token?.role !== 'admin' && token?.role !== 'superadmin') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    // Basic security headers (no crypto needed)
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

    // Content Security Policy
    const nonce = generateCSPNonce()
    const cspHeader = buildCSPHeader(currentCSPDirectives, nonce)
    const cspHeaderName = cspReportOnly
      ? 'Content-Security-Policy-Report-Only'
      : 'Content-Security-Policy'
    response.headers.set(cspHeaderName, cspHeader)

    // Production security headers
    if (process.env.NODE_ENV === 'production') {
      response.headers.set(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      )
    }

    return response
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
    pages: {
      signIn: '/auth/signin'
    }
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/profile/:path*',
    '/booking/:path*',
    '/settings/:path*'
  ]
}

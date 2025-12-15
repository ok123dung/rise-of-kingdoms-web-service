import { NextResponse } from 'next/server'

import { generateSignedCSRFToken } from '@/lib/csrf-protection'

/**
 * GET /api/auth/csrf
 * Returns a CSRF token and sets it as an HttpOnly cookie
 * Used by public pages (signup, signin) to get a valid CSRF token
 */
export async function GET(): Promise<NextResponse> {
  const csrfSecret = process.env.CSRF_SECRET ?? process.env.NEXTAUTH_SECRET ?? 'default-csrf-secret'
  const token = generateSignedCSRFToken(csrfSecret)

  const response = NextResponse.json({ csrfToken: token })

  // Set the token as an HttpOnly cookie
  response.cookies.set('csrf-token', token, {
    httpOnly: false, // Must be readable by JS to send in header
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 // 24 hours
  })

  return response
}

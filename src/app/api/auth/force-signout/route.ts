import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Note: cookies() returns synchronously in Next.js 14 route handlers, async not needed
export function GET() {
  const cookieStore = cookies()

  // Delete standard NextAuth session token
  cookieStore.delete('next-auth.session-token')

  // Delete secure session token (for production/HTTPS)
  cookieStore.delete('__Secure-next-auth.session-token')

  // Delete CSRF token just in case
  cookieStore.delete('next-auth.csrf-token')
  cookieStore.delete('__Host-next-auth.csrf-token')

  return NextResponse.json({
    success: true,
    message: 'Session cookies cleared'
  })
}

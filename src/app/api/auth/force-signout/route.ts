import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Note: cookies() is async in Next.js 16+
export async function GET() {
  const cookieStore = await cookies()

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

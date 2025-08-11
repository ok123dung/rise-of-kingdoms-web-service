import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { generateNonce, addCSPHeaders } from '@/lib/csp'

export function cspMiddleware(request: NextRequest): NextResponse {
  const nonce = generateNonce()
  const response = NextResponse.next()
  
  // Add nonce to request headers for use in components
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  
  // Add CSP headers to response
  addCSPHeaders(response.headers, nonce)
  
  return response
}
import { type NextRequest, type NextResponse } from 'next/server'

import { prismaAdmin } from '@/lib/db'
import { AuthenticationError, AuthorizationError } from '@/lib/errors'

import { verifyToken } from './jwt'

export interface AuthenticatedUser {
  id: string
  email: string
  full_name: string | null
  role: string
}

export interface AuthenticatedRequest extends NextRequest {
  user: AuthenticatedUser
}

/**
 * Extract and verify JWT token from request
 * Returns user data if valid, null otherwise
 */
export async function getAuthenticatedUser(
  request: NextRequest
): Promise<AuthenticatedUser | null> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.slice(7)
  const payload = verifyToken(token)
  if (!payload) {
    return null
  }

  // Fetch user from DB to ensure still exists
  const user = await prismaAdmin.users.findUnique({
    where: { id: payload.user_id },
    select: {
      id: true,
      email: true,
      full_name: true
    }
  })

  if (!user) {
    return null
  }

  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: payload.role || 'customer'
  }
}

/**
 * Auth middleware wrapper for protected routes
 * Throws AuthenticationError if not authenticated
 */
export function withAuth<T extends NextRequest>(
  handler: (request: T & { user: AuthenticatedUser }) => Promise<NextResponse>
): (request: T) => Promise<NextResponse> {
  return async (request: T) => {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      throw new AuthenticationError('Bạn cần đăng nhập để thực hiện thao tác này')
    }

    // Attach user to request
    const authenticatedRequest = request as T & { user: AuthenticatedUser }
    authenticatedRequest.user = user

    return handler(authenticatedRequest)
  }
}

/**
 * Auth middleware with role check
 * Throws AuthorizationError if user doesn't have required role
 */
export function withRole<T extends NextRequest>(
  allowedRoles: string[],
  handler: (request: T & { user: AuthenticatedUser }) => Promise<NextResponse>
): (request: T) => Promise<NextResponse> {
  return withAuth(async request => {
    if (!allowedRoles.includes(request.user.role)) {
      throw new AuthorizationError('Bạn không có quyền thực hiện thao tác này')
    }
    return handler(request)
  })
}

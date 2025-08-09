import { type NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

import { getLogger } from '@/lib/monitoring/logger'

// JWT Token interface
interface AuthToken {
  userId: string
  email: string
  role: string
  name?: string
  picture?: string
  sub?: string
  iat?: number
  exp?: number
  jti?: string
}

// Admin role checking middleware
export async function withAdminAuth(
  request: NextRequest,
  handler: (request: NextRequest, user: AuthToken) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Get JWT token from request
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    })

    // Check if user is authenticated
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Check if user has admin role
    if (token.role !== 'admin' && token.role !== 'superadmin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // User is authenticated and has admin role
    return await handler(request, token as AuthToken)
  } catch (error) {
    console.error('Admin auth middleware error:', error)
    return NextResponse.json({ error: 'Authentication check failed' }, { status: 500 })
  }
}

// Super admin role checking middleware
export async function withSuperAdminAuth(
  request: NextRequest,
  handler: (request: NextRequest, user: AuthToken) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    })

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    if (token.role !== 'superadmin') {
      return NextResponse.json({ error: 'Super admin access required' }, { status: 403 })
    }

    return await handler(request, token as AuthToken)
  } catch (error) {
    console.error('Super admin auth middleware error:', error)
    return NextResponse.json({ error: 'Authentication check failed' }, { status: 500 })
  }
}

// Customer role checking middleware
export async function withCustomerAuth(
  request: NextRequest,
  handler: (request: NextRequest, user: AuthToken) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    })

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Allow admin, superadmin, or customer
    const allowedRoles = ['customer', 'admin', 'superadmin']
    if (!allowedRoles.includes(token.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return await handler(request, token as AuthToken)
  } catch (error) {
    console.error('Customer auth middleware error:', error)
    return NextResponse.json({ error: 'Authentication check failed' }, { status: 500 })
  }
}

// Role-based access control helper
export function hasPermission(userRole: string, requiredRoles: string[]): boolean {
  // Superadmin has access to everything
  if (userRole === 'superadmin') {
    return true
  }

  // Admin has access to most things except superadmin-only features
  if (userRole === 'admin' && !requiredRoles.includes('superadmin')) {
    return true
  }

  // Check specific role requirements
  return requiredRoles.includes(userRole)
}

// Resource ownership checking
export async function checkResourceOwnership(
  userId: string,
  resourceType: 'booking' | 'payment' | 'user',
  resourceId: string
): Promise<boolean> {
  try {
    const { prisma } = await import('@/lib/db')

    switch (resourceType) {
      case 'booking':
        const booking = await prisma.booking.findUnique({
          where: { id: resourceId },
          select: { userId: true }
        })
        return booking?.userId === userId

      case 'payment':
        const payment = await prisma.payment.findUnique({
          where: { id: resourceId },
          include: { booking: { select: { userId: true } } }
        })
        return payment?.booking?.userId === userId

      case 'user':
        return resourceId === userId

      default:
        return false
    }
  } catch (error) {
    console.error('Resource ownership check failed:', error)
    return false
  }
}

// API endpoint protection wrapper
export function protectApiRoute(requiredRole: 'admin' | 'superadmin' | 'customer' = 'customer') {
  return function (handler: Function) {
    return async function (request: NextRequest, context?: unknown) {
      const middlewareMap = {
        admin: withAdminAuth,
        superadmin: withSuperAdminAuth,
        customer: withCustomerAuth
      }

      const middleware = middlewareMap[requiredRole]

      return await middleware(request, async (req, user) => {
        // Add user info to request context
        const requestWithUser = Object.assign(req, { user })
        return await handler(requestWithUser, context)
      })
    }
  }
}

// Client-side role checking for pages
export function useAdminCheck() {
  if (typeof window === 'undefined') {
    return { isAdmin: false, isLoading: true }
  }

  // This would typically use a React hook to check user session
  // For now, return a placeholder
  return { isAdmin: false, isLoading: false }
}

// Admin route protection for pages
export async function requireAdminAccess(request: NextRequest): Promise<{
  allowed: boolean
  user?: AuthToken
  redirectUrl?: string
}> {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    })

    if (!token) {
      // Log unauthorized access attempt
      await logSecurityEvent('unauthorized_admin_access', {
        url: request.url,
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent')
      })

      return {
        allowed: false,
        redirectUrl: '/auth/signin?callbackUrl=' + encodeURIComponent(request.url)
      }
    }

    if (token.role !== 'admin' && token.role !== 'superadmin') {
      // Log access denied attempt
      await logSecurityEvent('admin_access_denied', {
        userId: token.userId,
        userRole: token.role,
        url: request.url,
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      })

      return {
        allowed: false,
        redirectUrl: '/auth/error?error=accessdenied'
      }
    }

    // Log successful admin access
    await logSecurityEvent('admin_access_granted', {
      userId: token.userId,
      userRole: token.role,
      url: request.url
    })

    return {
      allowed: true,
      user: {
        userId: token.sub || '',
        email: token.email || '',
        role: 'admin',
        name: token.name
      } as AuthToken
    }
  } catch (error) {
    console.error('Admin access check failed:', error)
    return {
      allowed: false,
      redirectUrl: '/auth/error?error=configuration'
    }
  }
}

// Security event logging helper
async function logSecurityEvent(event: string, data: Record<string, unknown>) {
  try {
    const { prisma } = await import('@/lib/db')
    await prisma.securityLog.create({
      data: {
        event,
        userId: data.userId as string | undefined,
        ip: data.ip as string | undefined,
        userAgent: data.userAgent as string | undefined,
        url: data.url as string | undefined,
        data: data as any,
        timestamp: new Date()
      }
    })
  } catch (error) {
    console.error('Failed to log security event:', error)
    // Fallback logging
    getLogger().warn(`SECURITY EVENT: ${event}`, {
      data: JSON.stringify(data),
      timestamp: new Date().toISOString()
    })
  }
}

// Audit logging for admin actions
export async function logAdminAction(
  adminId: string,
  action: string,
  resource: string,
  resourceId: string,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    const { prisma } = await import('@/lib/db')

    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action,
        resource,
        resourceId,
        details: details as any,
        ip: details?.ip as string | undefined,
        userAgent: details?.userAgent as string | undefined,
        timestamp: new Date()
      }
    })

    getLogger().info('Audit log created', { adminId, action, resource, resourceId })
  } catch (error) {
    console.error('Failed to log admin action:', error)
    // Fallback to console logging for critical security events
    getLogger().error('SECURITY AUDIT FAILED', error as Error, {
      timestamp: new Date().toISOString(),
      adminId,
      action,
      resource,
      resourceId,
      details: JSON.stringify(details)
    })
  }
}

// Rate limiting for admin actions
const adminActionLimits = new Map<string, { count: number; resetTime: number }>()

export function checkAdminRateLimit(
  adminId: string,
  action: string,
  maxRequests = 100,
  windowMs = 60000 // 1 minute
): boolean {
  const key = `${adminId}:${action}`
  const now = Date.now()
  const limit = adminActionLimits.get(key)

  if (!limit || now > limit.resetTime) {
    // Reset or create new limit
    adminActionLimits.set(key, {
      count: 1,
      resetTime: now + windowMs
    })
    return true
  }

  if (limit.count >= maxRequests) {
    return false
  }

  limit.count++
  return true
}

// Export commonly used permissions
export const ADMIN_PERMISSIONS = {
  READ_USERS: ['admin', 'superadmin'],
  WRITE_USERS: ['admin', 'superadmin'],
  DELETE_USERS: ['superadmin'],
  READ_BOOKINGS: ['admin', 'superadmin'],
  WRITE_BOOKINGS: ['admin', 'superadmin'],
  DELETE_BOOKINGS: ['superadmin'],
  READ_PAYMENTS: ['admin', 'superadmin'],
  WRITE_PAYMENTS: ['admin', 'superadmin'],
  READ_ANALYTICS: ['admin', 'superadmin'],
  SYSTEM_SETTINGS: ['superadmin']
} as const

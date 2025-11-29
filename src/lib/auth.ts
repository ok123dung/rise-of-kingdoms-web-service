import { PrismaAdapter } from '@next-auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { type NextAuthOptions, getServerSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import DiscordProvider from 'next-auth/providers/discord'
import { z } from 'zod'

import { prisma, basePrisma } from '@/lib/db'
import { getLogger, type LogContext } from '@/lib/monitoring/logger'
import type { User } from '@/types/prisma'

import type { NextRequest } from 'next/server'

// Extended user type with staff profile
interface UserWithStaff extends User {
  staffProfile?: {
    id: string
    role: string
    permissions?: unknown
    specializations?: unknown
    isActive: boolean
  } | null
}

// Discord profile type
interface DiscordProfile {
  id: string
  username: string
  global_name?: string
  email?: string
}

// Session type
interface SessionWithSecurity {
  user?: {
    id: string
    email: string
    name?: string | null
    image?: string | null
    role?: string
  }
  security?: {
    lastActivity: string
    userAgent?: string
    ip?: string
    sessionId: string
  }
}

// Handler function type
type RouteHandler = (req: NextRequest, ...args: unknown[]) => Promise<Response> | Response

// Utility functions
export const hashPassword = async (password: string) => {
  // Use 14 rounds for better security (OWASP recommendation for 2024)
  return await bcrypt.hash(password, 14)
}

// Check password history to prevent reuse
export const checkPasswordHistory = async (
  userId: string,
  newPassword: string,
  historyLimit = 5
): Promise<boolean> => {
  const passwordHistory = await prisma.passwordHistory.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: historyLimit
  })

  for (const history of passwordHistory) {
    const isMatch = await bcrypt.compare(newPassword, history.passwordHash)
    if (isMatch) {
      return false // Password was used before
    }
  }

  return true // Password is new
}

// Save password to history
export const savePasswordToHistory = async (userId: string, passwordHash: string) => {
  await prisma.passwordHistory.create({
    data: {
      userId,
      passwordHash
    }
  })

  // Clean up old password history (keep last 10)
  const oldPasswords = await prisma.passwordHistory.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    skip: 10
  })

  if (oldPasswords.length > 0) {
    await prisma.passwordHistory.deleteMany({
      where: {
        id: { in: oldPasswords.map(p => p.id) }
      }
    })
  }
}

export const getCurrentSession = async () => {
  return await getServerSession(authOptions)
}

export const getCurrentUser = async () => {
  const session = await getCurrentSession()
  if (!session?.user?.id) return null

  return await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      staffProfile: true,
      bookings: {
        include: {
          serviceTier: {
            include: { service: true }
          }
        }
      }
    }
  })
}

export const isAdmin = (user: UserWithStaff | null) => {
  return user?.staffProfile?.role === 'admin' || user?.staffProfile?.role === 'manager'
}

export const withAuth = (handler: RouteHandler) => {
  return async (
    req: NextRequest & { user?: { id: string; email: string; role?: string } },
    ...args: unknown[]
  ) => {
    const session = await getCurrentSession()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Add user context to request
    req.user = {
      id: session.user.id,
      email: session.user.email || '',
      role: session.user.role
    }
    return handler(req, ...args)
  }
}

// Rate limiting implementation
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export const withRateLimit = (maxRequests = 60, windowMs = 60000) => {
  return (handler: RouteHandler) => {
    return async (req: NextRequest & { headers?: Headers; ip?: string }, ...args: unknown[]) => {
      const ip = req.headers?.get?.('x-forwarded-for') || req.ip || 'anonymous'
      const key = `${ip}:${req.url}`
      const now = Date.now()
      const limit = rateLimitMap.get(key)

      if (!limit || now > limit.resetTime) {
        rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
        return handler(req, ...args)
      }

      if (limit.count >= maxRequests) {
        return Response.json(
          { error: 'Too many requests', retryAfter: Math.ceil((limit.resetTime - now) / 1000) },
          { status: 429 }
        )
      }

      limit.count++
      return handler(req, ...args)
    }
  }
}

export const isStaff = async () => {
  const user = await getCurrentUser()
  return (
    user?.staffProfile?.role === 'admin' ||
    user?.staffProfile?.role === 'manager' ||
    user?.staffProfile?.role === 'staff'
  )
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(basePrisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        totpCode: { label: '2FA Code', type: 'text' }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          const { email, password } = loginSchema.parse(credentials)

          const user = await prisma.user.findUnique({
            where: { email },
            include: {
              staffProfile: true
            }
          })

          if (!user) {
            return null
          }

          const isValidPassword = await bcrypt.compare(password, user.password || '')

          if (!isValidPassword) {
            return null
          }

          // Check 2FA if enabled
          const { TwoFactorAuthService } = await import('@/lib/auth/two-factor')
          const is2FAEnabled = await TwoFactorAuthService.isEnabled(user.id)

          if (is2FAEnabled) {
            // Require 2FA code
            if (!credentials.totpCode) {
              // Return null with a way to indicate 2FA is required
              // NextAuth doesn't support custom error codes in authorize
              // We'll handle this differently
              return null
            }

            // Verify 2FA code
            const verifyResult = await TwoFactorAuthService.verifyToken(
              user.id,
              credentials.totpCode
            )

            if (!verifyResult.verified) {
              return null
            }
          }

          await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
          })

          return {
            id: user.id,
            email: user.email,
            name: user.fullName,
            image: null,
            role: user.staffProfile?.role || 'customer'
          }
        } catch (error) {
          // Log failed authentication attempt for security monitoring
          const { getLogger } = await import('@/lib/monitoring/logger')
          getLogger().error('Auth error', error as Error)
          getLogger().logSecurityEvent('auth_failed', {
            email: credentials?.email,
            timestamp: new Date().toISOString()
          })

          return null
        }
      }
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || '',
      clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
      authorization: {
        params: {
          scope: 'identify email guilds'
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.role = user.role || 'user'
        token.userId = user.id
      }

      if (account?.provider === 'discord' && profile) {
        try {
          const existingUser = await prisma.user.findFirst({
            where: {
              OR: [{ email: profile.email }, { discordId: (profile as DiscordProfile).id }]
            },
            include: {
              staffProfile: true
            }
          })

          if (existingUser) {
            if (!existingUser.discordId) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                  discordId: (profile as DiscordProfile).id,
                  discordUsername: (profile as DiscordProfile).username,
                  lastLogin: new Date()
                }
              })
            }

            token.userId = existingUser.id
            token.role = existingUser.staffProfile?.role || 'customer'
          } else {
            const newUser = await prisma.user.create({
              data: {
                email: profile.email || '',
                fullName:
                  (profile as DiscordProfile).global_name ||
                  (profile as DiscordProfile).username ||
                  'Discord User',
                discordId: (profile as DiscordProfile).id,
                discordUsername: (profile as DiscordProfile).username,
                password: '',
                lastLogin: new Date()
              }
            })

            token.userId = newUser.id
            token.role = 'customer'
          }
        } catch (error) {
          getLogger().error('Discord auth error', error as Error)
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId
        session.user.role = token.role
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return `${baseUrl}/dashboard`
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      const { getLogger } = await import('@/lib/monitoring/logger')
      getLogger().info('User signed in', {
        user: user.email,
        provider: account?.provider,
        isNewUser
      })
    },
    async createUser({ user }) {
      const { getLogger } = await import('@/lib/monitoring/logger')
      getLogger().info('New user created', { email: user.email })

      try {
        await prisma.lead.create({
          data: {
            email: user.email,
            fullName: user.name || '',
            source: 'registration',
            status: 'converted',
            leadScore: 50
          }
        })
      } catch (error) {
        // Lead might already exist, ignore error
      }
    }
  },
  debug: process.env.NODE_ENV === 'development'
}

// Security event logging
export const logSecurityEvent = async (event: string, data: Record<string, unknown>) => {
  try {
    // Log security events to console for now since database tables don't exist
    getLogger().warn(`Security event: ${event}`, data as LogContext)
  } catch (error) {
    getLogger().error('Failed to log security event', error as Error)
  }
}

// Password strength validation
export const validatePasswordStrength = (password: string) => {
  const minLength = 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  const score = [
    password.length >= minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar
  ].filter(Boolean).length

  return {
    isValid: score >= 4,
    score,
    feedback: {
      minLength: password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar
    }
  }
}

// Session security enhancement
export const enhanceSession = async (session: SessionWithSecurity, request?: NextRequest) => {
  if (!session?.user) return session

  // Add security context
  const securityContext = {
    lastActivity: new Date().toISOString(),
    userAgent: request?.headers?.get?.('user-agent'),
    ip: request?.headers?.get?.('x-forwarded-for') || request?.ip,
    sessionId: session.user.id + '_' + Date.now()
  }

  return {
    ...session,
    security: securityContext
  }
}

// Brute force protection
const failedAttempts = new Map<
  string,
  { count: number; lastAttempt: number; blockedUntil?: number }
>()

export const checkBruteForce = (
  identifier: string,
  maxAttempts = 5,
  blockDurationMs = 15 * 60 * 1000
) => {
  const now = Date.now()
  const attempts = failedAttempts.get(identifier)

  if (!attempts) {
    return { allowed: true, remainingAttempts: maxAttempts }
  }

  if (attempts.blockedUntil && now < attempts.blockedUntil) {
    return {
      allowed: false,
      remainingAttempts: 0,
      blockedUntil: attempts.blockedUntil,
      message: 'Account temporarily blocked due to too many failed attempts'
    }
  }

  if (attempts.count >= maxAttempts) {
    attempts.blockedUntil = now + blockDurationMs
    return {
      allowed: false,
      remainingAttempts: 0,
      blockedUntil: attempts.blockedUntil,
      message: 'Too many failed attempts. Account blocked temporarily.'
    }
  }

  return {
    allowed: true,
    remainingAttempts: maxAttempts - attempts.count
  }
}

export const recordFailedAttempt = (identifier: string) => {
  const now = Date.now()
  const attempts = failedAttempts.get(identifier) || { count: 0, lastAttempt: 0 }

  // Reset count if last attempt was more than 1 hour ago
  if (now - attempts.lastAttempt > 60 * 60 * 1000) {
    attempts.count = 0
  }

  attempts.count++
  attempts.lastAttempt = now
  failedAttempts.set(identifier, attempts)
}

export const clearFailedAttempts = (identifier: string) => {
  failedAttempts.delete(identifier)
}

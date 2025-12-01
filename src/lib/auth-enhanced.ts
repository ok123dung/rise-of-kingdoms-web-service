import { PrismaAdapter } from '@next-auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import DiscordProvider from 'next-auth/providers/discord'
import { z } from 'zod'

import { accountLockout, sessionTokenManager } from '@/lib/auth-security'
import { prisma, basePrisma } from '@/lib/db'
import { getLogger } from '@/lib/monitoring/logger'

// Enhanced login schema with additional validation
const loginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(8).max(100),
  fingerprint: z.string().optional(),
  rememberMe: z.boolean().optional()
})

// Enhanced session type with security metadata
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: string
    }
    security: {
      sessionId: string
      fingerprint?: string
      lastActivity: string
      tokenRotatedAt?: string
      ipAddress?: string
      userAgent?: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string
    role: string
    sessionId: string
    fingerprint?: string
    tokenIssuedAt: number
  }
}

export const authOptionsEnhanced: NextAuthOptions = {
  adapter: PrismaAdapter(basePrisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        fingerprint: { label: 'Device Fingerprint', type: 'hidden' }
      },
      async authorize(credentials, req) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          const { email, password, fingerprint } = loginSchema.parse(credentials)

          // Check account lockout first
          const lockoutStatus = accountLockout.checkLockout(email)
          if (lockoutStatus.isLocked) {
            getLogger().logSecurityEvent('login_attempt_while_locked', {
              email,
              lockedUntil: lockoutStatus.lockedUntil?.toISOString()
            })
            throw new Error(lockoutStatus.message || 'Account is locked')
          }

          // Find user with rate limit check
          const user = await prisma.user.findUnique({
            where: { email },
            include: {
              staffProfile: true
            }
          })

          if (!user) {
            // Record failed attempt
            accountLockout.recordFailedAttempt(email, {
              reason: 'user_not_found',
              ip: (req?.headers?.['x-forwarded-for'] ?? req?.headers?.['x-real-ip']) as
                | string
                | undefined
            })
            return null
          }

          // Verify password with timing attack protection
          const isValidPassword = await bcrypt.compare(password, user.password ?? '')

          if (!isValidPassword) {
            // Record failed attempt
            const lockResult = accountLockout.recordFailedAttempt(email, {
              reason: 'invalid_password',
              userId: user.id,
              ip: (req?.headers?.['x-forwarded-for'] ?? req?.headers?.['x-real-ip']) as
                | string
                | undefined
            })

            getLogger().logSecurityEvent('login_failed', {
              email,
              userId: user.id,
              remainingAttempts: lockResult.remainingAttempts,
              isLocked: lockResult.isLocked
            })

            return null
          }

          // Clear failed attempts on successful login
          accountLockout.clearFailedAttempts(email)

          // Update user login info
          await prisma.user.update({
            where: { id: user.id },
            data: {
              lastLogin: new Date()
            }
          })

          // Log successful login
          getLogger().logSecurityEvent('login_success', {
            userId: user.id,
            email: user.email,
            role: user.staffProfile?.role ?? 'customer',
            fingerprint
          })

          return {
            id: user.id,
            email: user.email,
            name: user.fullName,
            image: null,
            role: user.staffProfile?.role ?? 'customer'
          }
        } catch (error) {
          getLogger().error('Auth error', error as Error)
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60 // Update session every 24 hours
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60
  },

  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/new-user'
  },

  callbacks: {
    async jwt({ token, user, trigger }) {
      // Initial sign in
      if (user) {
        token.userId = user.id
        token.role = user.role || 'customer'
        token.sessionId = sessionTokenManager.generateSessionId(user.id)
        token.tokenIssuedAt = Date.now()
      }

      // Token rotation on role change or periodic rotation
      if (trigger === 'update' || sessionTokenManager.shouldRotate(token.tokenIssuedAt)) {
        const rotated = sessionTokenManager.rotateToken(token.sessionId, token.userId)

        token.sessionId = rotated.sessionId
        token.tokenIssuedAt = Date.now()

        // Re-fetch user role in case it changed
        const currentUser = await prisma.user.findUnique({
          where: { id: token.userId },
          include: { staffProfile: true }
        })

        if (currentUser) {
          token.role = currentUser.staffProfile?.role || 'customer'
        }
      }

      return token
    },

    session({ session, token }) {
      if (token) {
        session.user.id = token.userId
        session.user.role = token.role

        session.security = {
          sessionId: token.sessionId,
          fingerprint: token.fingerprint,
          lastActivity: new Date().toISOString(),
          tokenRotatedAt: new Date(token.tokenIssuedAt).toISOString()
        }
      }

      return session
    },

    async signIn({ account, profile }) {
      // Additional security checks during sign in
      if (account?.provider === 'discord' && profile) {
        try {
          const discordProfile = profile as {
            email?: string
            id?: string
            global_name?: string
            username?: string
          }

          // Check if Discord account exists or create/update
          let existingUser = await prisma.user.findFirst({
            where: {
              OR: [{ email: discordProfile.email ?? '' }, { discordId: discordProfile.id ?? '' }]
            }
          })

          if (!existingUser && discordProfile.email) {
            // Create new user from Discord
            existingUser = await prisma.user.create({
              data: {
                email: discordProfile.email,
                fullName: discordProfile.global_name ?? discordProfile.username ?? '',
                discordId: discordProfile.id ?? '',
                discordUsername: discordProfile.username ?? '',
                password: '', // No password for OAuth users
                lastLogin: new Date()
              }
            })
          } else if (existingUser && !existingUser.discordId) {
            // Link Discord to existing account
            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                discordId: discordProfile.id ?? '',
                discordUsername: discordProfile.username ?? ''
              }
            })
          }

          getLogger().logSecurityEvent('oauth_login', {
            provider: 'discord',
            userId: existingUser?.id,
            discordId: discordProfile.id ?? ''
          })
        } catch (error) {
          getLogger().error('Discord sign in error', error as Error)
          return false
        }
      }

      return true
    }
  },

  events: {
    signIn({ user, account, isNewUser }) {
      getLogger().logSecurityEvent('signin', {
        userId: user.id,
        provider: account?.provider,
        isNewUser
      })
    },

    signOut({ token }) {
      getLogger().logSecurityEvent('signout', {
        userId: token?.sub,
        sessionId: token?.sessionId
      })
    },

    session({ token }) {
      // Track active sessions
      getLogger().debug('Session accessed', {
        userId: token?.sub,
        sessionId: token?.sessionId
      })
    }
  },

  debug: process.env.NODE_ENV === 'development'
}

import { PrismaAdapter } from '@next-auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import DiscordProvider from 'next-auth/providers/discord'
import { z } from 'zod'

import {
  checkBruteForce,
  recordFailedAttempt,
  clearFailedAttempts
} from '@/lib/auth/brute-force-protection'
import { TwoFactorAuthService } from '@/lib/auth/two-factor'
import { sessionTokenManager } from '@/lib/auth-security'
import { prisma, basePrisma } from '@/lib/db'
import { getLogger } from '@/lib/monitoring/logger'

// Enhanced login schema with additional validation
const loginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(8).max(100),
  totpCode: z.string().max(20).optional(), // 6-digit TOTP or backup code (XXXX-XXXX format)
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
      user_agent?: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    user_id: string
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
        totpCode: { label: '2FA Code', type: 'text' },
        fingerprint: { label: 'Device Fingerprint', type: 'hidden' }
      },
      async authorize(credentials, req) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          const { email, password, totpCode, fingerprint } = loginSchema.parse(credentials)

          // Get client IP for defense-in-depth protection
          const clientIp =
            (req?.headers?.['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
            (req?.headers?.['x-real-ip'] as string) ??
            'unknown'

          // Check brute-force protection (Redis-backed with memory fallback)
          const bruteForceResult = await checkBruteForce(email)
          if (!bruteForceResult.allowed) {
            getLogger().logSecurityEvent('login_attempt_while_locked', {
              email,
              blockedUntil: bruteForceResult.blockedUntil
                ? new Date(bruteForceResult.blockedUntil).toISOString()
                : undefined,
              remainingAttempts: bruteForceResult.remainingAttempts
            })
            throw new Error(bruteForceResult.message ?? 'Too many failed attempts. Please try again later.')
          }

          // Check IP-based brute-force protection (defense in depth)
          const ipBruteForceResult = await checkBruteForce(`ip:${clientIp}`, {
            maxAttempts: 20,
            blockDurationMs: 30 * 60 * 1000,
            windowMs: 60 * 60 * 1000,
            keyPrefix: 'bruteforce:ip'
          })
          if (!ipBruteForceResult.allowed) {
            getLogger().logSecurityEvent('rate_limit_exceeded', { ip: clientIp, type: 'ip' })
            throw new Error('Too many requests. Please try again later.')
          }

          // Find user with rate limit check
          const user = await prisma.users.findUnique({
            where: { email },
            include: {
              staff: true
            }
          })

          if (!user) {
            // Record failed attempts for both email and IP
            await Promise.all([
              recordFailedAttempt(email),
              recordFailedAttempt(`ip:${clientIp}`, {
                keyPrefix: 'bruteforce:ip',
                maxAttempts: 20,
                blockDurationMs: 30 * 60 * 1000,
                windowMs: 60 * 60 * 1000
              })
            ])
            getLogger().logSecurityEvent('login_failed', {
              email,
              reason: 'user_not_found',
              ip: clientIp
            })
            return null
          }

          // Verify password with timing attack protection (bcrypt is constant-time)
          const isValidPassword = await bcrypt.compare(password, user.password ?? '')

          if (!isValidPassword) {
            // Record failed attempts for both email and IP
            await Promise.all([
              recordFailedAttempt(email),
              recordFailedAttempt(`ip:${clientIp}`, {
                keyPrefix: 'bruteforce:ip',
                maxAttempts: 20,
                blockDurationMs: 30 * 60 * 1000,
                windowMs: 60 * 60 * 1000
              })
            ])

            getLogger().logSecurityEvent('login_failed', {
              email,
              user_id: user.id,
              reason: 'invalid_password',
              ip: clientIp
            })

            return null
          }

          // Check if 2FA is enabled and verify if required
          const is2FAEnabled = await TwoFactorAuthService.isEnabled(user.id)
          if (is2FAEnabled) {
            if (!totpCode) {
              // 2FA required but no code provided - client should check via /api/auth/check-2fa first
              getLogger().logSecurityEvent('login_failed', {
                email,
                user_id: user.id,
                reason: '2fa_code_required'
              })
              return null
            }

            // Verify 2FA code
            const twoFactorResult = await TwoFactorAuthService.verifyToken(user.id, totpCode)
            if (!twoFactorResult.verified) {
              // Record failed attempts for both email and IP
              await Promise.all([
                recordFailedAttempt(email),
                recordFailedAttempt(`ip:${clientIp}`, {
                  keyPrefix: 'bruteforce:ip',
                  maxAttempts: 20,
                  blockDurationMs: 30 * 60 * 1000,
                  windowMs: 60 * 60 * 1000
                })
              ])

              getLogger().logSecurityEvent('login_failed', {
                email,
                user_id: user.id,
                reason: '2fa_verification_failed',
                ip: clientIp
              })

              return null
            }
          }

          // Clear failed attempts on successful login (email only - IP shared by many users)
          await clearFailedAttempts(email)

          // Update user login info
          await prisma.users.update({
            where: { id: user.id },
            data: {
              updated_at: new Date(),
              last_login: new Date()
            }
          })

          // Log successful login
          getLogger().logSecurityEvent('login_success', {
            user_id: user.id,
            email: user.email,
            role: user.staff?.role ?? 'customer',
            fingerprint
          })

          return {
            id: user.id,
            email: user.email,
            name: user.full_name,
            image: null,
            role: user.staff?.role ?? 'customer'
          }
        } catch (error) {
          getLogger().error('Auth error', error as Error)
          return null
        }
      }
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID ?? '',
      clientSecret: process.env.DISCORD_CLIENT_SECRET ?? '',
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
        token.user_id = user.id
        token.role = user.role ?? 'customer'
        token.sessionId = sessionTokenManager.generateSessionId(user.id)
        token.tokenIssuedAt = Date.now()
      }

      // Token rotation on role change or periodic rotation
      if (trigger === 'update' || sessionTokenManager.shouldRotate(token.tokenIssuedAt)) {
        const rotated = sessionTokenManager.rotateToken(token.sessionId, token.user_id)

        token.sessionId = rotated.sessionId
        token.tokenIssuedAt = Date.now()

        // Re-fetch user role in case it changed
        const currentUser = await prisma.users.findUnique({
          where: { id: token.user_id },
          include: { staff: true }
        })

        if (currentUser) {
          token.role = currentUser.staff?.role ?? 'customer'
        }
      }

      return token
    },

    session({ session, token }) {
      if (token) {
        session.user.id = token.user_id
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
          let existingUser = await prisma.users.findFirst({
            where: {
              OR: [{ email: discordProfile.email ?? '' }, { discord_id: discordProfile.id ?? '' }]
            }
          })

          if (!existingUser && discordProfile.email) {
            // Create new user from Discord
            existingUser = await prisma.users.create({
              data: {
                id: crypto.randomUUID(),
                email: discordProfile.email,
                full_name: discordProfile.global_name ?? discordProfile.username ?? '',
                discord_id: discordProfile.id ?? '',
                discord_username: discordProfile.username ?? '',
                password: '', // No password for OAuth users
                updated_at: new Date(),
                last_login: new Date()
              }
            })
          } else if (existingUser && !existingUser.discord_id) {
            // Link Discord to existing account
            await prisma.users.update({
              where: { id: existingUser.id },
              data: {
                discord_id: discordProfile.id ?? '',
                discord_username: discordProfile.username ?? ''
              }
            })
          }

          getLogger().logSecurityEvent('oauth_login', {
            provider: 'discord',
            user_id: existingUser?.id,
            discord_id: discordProfile.id ?? ''
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
        user_id: user.id,
        provider: account?.provider,
        isNewUser
      })
    },

    signOut({ token }) {
      getLogger().logSecurityEvent('signout', {
        user_id: token?.sub,
        sessionId: token?.sessionId
      })
    },

    session({ token }) {
      // Track active sessions
      getLogger().debug('Session accessed', {
        user_id: token?.sub,
        sessionId: token?.sessionId
      })
    }
  },

  debug: process.env.NODE_ENV === 'development'
}

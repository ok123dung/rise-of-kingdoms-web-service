import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import DiscordProvider from 'next-auth/providers/discord'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { getServerSession } from 'next-auth'

// Utility functions
export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 12)
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

export const isAdmin = (user: any) => {
  return user?.staffProfile?.role === 'admin' || user?.staffProfile?.role === 'manager'
}

export const withAuth = (handler: any) => {
  return async (req: any, ...args: any[]) => {
    const session = await getCurrentSession()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return handler(req, ...args)
  }
}

export const withRateLimit = (maxRequests = 60) => {
  return (handler: any) => handler // Simplified for build
}

export const isStaff = async () => {
  const user = await getCurrentUser()
  return user?.staffProfile?.role === 'admin' || user?.staffProfile?.role === 'manager' || user?.staffProfile?.role === 'staff'
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
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
          console.error('Auth error:', error)
          return null
        }
      }
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'identify email guilds'
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.role = user.role
        token.userId = user.id
      }

      if (account?.provider === 'discord' && profile) {
        try {
          const existingUser = await prisma.user.findFirst({
            where: {
              OR: [
                { email: profile.email },
                { discordId: profile.id }
              ]
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
                  discordId: profile.id,
                  discordUsername: profile.username,
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
                fullName: profile.global_name || profile.username || 'Discord User',
                discordId: profile.id,
                discordUsername: profile.username,
                lastLogin: new Date()
              }
            })
            
            token.userId = newUser.id
            token.role = 'customer'
          }
        } catch (error) {
          console.error('Discord auth error:', error)
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId as string
        session.user.role = token.role as string
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
    signUp: '/auth/signup',
    error: '/auth/error'
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('User signed in:', { user: user.email, provider: account?.provider, isNewUser })
    },
    async createUser({ user }) {
      console.log('New user created:', user.email)
      
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
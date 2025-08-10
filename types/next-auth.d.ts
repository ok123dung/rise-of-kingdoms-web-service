import { type DefaultSession, type DefaultUser } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      fullName?: string
      phone?: string | null
      discordUsername?: string | null
      rokPlayerId?: string | null
      rokKingdom?: string | null
      createdAt?: string
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    role: string
    fullName?: string
    phone?: string | null
    discordUsername?: string | null
    rokPlayerId?: string | null
    rokKingdom?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string
    role: string
  }
}

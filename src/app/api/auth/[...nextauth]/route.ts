import NextAuth from 'next-auth'

import { authOptionsEnhanced as authOptions } from '@/lib/auth-enhanced'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

import NextAuth from 'next-auth'

import { authOptionsEnhanced as authOptions } from '@/lib/auth-enhanced'

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

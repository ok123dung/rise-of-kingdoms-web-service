import jwt from 'jsonwebtoken'

import { getLogger } from '@/lib/monitoring/logger'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key'

interface TokenPayload {
  user_id: string
  email: string
  role?: string
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '24h'
  })
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload
    return decoded
  } catch (error) {
    getLogger().error('JWT verification error', error as Error)
    return null
  }
}

export function generateWebSocketToken(user_id: string, email: string, role?: string): string {
  return generateToken({ user_id, email, role })
}

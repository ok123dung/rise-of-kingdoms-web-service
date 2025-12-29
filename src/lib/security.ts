import crypto from 'crypto'

import jwt from 'jsonwebtoken'
import sanitizeHtml from 'sanitize-html'

import { type NextRequest, type NextResponse } from 'next/server'

// Helper to get JWT secret - avoids hardcoding env var name in multiple places
const getJwtSecret = (): string | undefined => process.env['NEXTAUTH_SECRET']

// Security headers configuration
export const securityHeaders = {
  // Prevent XSS attacks
  'X-XSS-Protection': '1; mode=block',

  // Prevent clickjacking
  'X-Frame-Options': 'DENY',

  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // Referrer policy
  'Referrer-Policy': 'origin-when-cross-origin',

  // Permissions policy
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',

  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://www.google-analytics.com https://vitals.vercel-insights.com wss://",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    'upgrade-insecure-requests'
  ].join('; '),

  // Strict Transport Security (only in production)
  ...(process.env.NODE_ENV === 'production' && {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
  })
}

// CSRF token generation and validation
export class CSRFProtection {
  private static readonly TOKEN_LENGTH = 32
  private static readonly TOKEN_HEADER = 'x-csrf-token'
  private static readonly TOKEN_COOKIE = 'csrf-token'

  // Generate CSRF token
  static generateToken(): string {
    return crypto.randomBytes(this.TOKEN_LENGTH).toString('hex')
  }

  // Validate CSRF token
  static validateToken(request: NextRequest): boolean {
    // Skip validation for safe methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return true
    }

    // Get token from header
    const headerToken = request.headers.get(this.TOKEN_HEADER)

    // Get token from cookie
    const cookieToken = request.cookies.get(this.TOKEN_COOKIE)?.value

    // Both must exist and match
    return !!(headerToken && cookieToken && headerToken === cookieToken)
  }

  // Add CSRF token to response
  static addTokenToResponse(response: NextResponse): NextResponse {
    const token = this.generateToken()

    // Set cookie
    response.cookies.set(this.TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 // 24 hours
    })

    // Also add to header for client access
    response.headers.set(this.TOKEN_HEADER, token)

    return response
  }
}

// HTML-encode special characters to prevent XSS - safer than regex stripping
function htmlEncode(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

// Input sanitization - uses HTML encoding for XSS prevention
export function sanitizeInput(input: string): string {
  // HTML-encode first to prevent injection - this is safer than trying to strip patterns
  return htmlEncode(input.trim())
}

// For cases where HTML is allowed but dangerous content must be stripped
// Uses sanitize-html library for proper XSS prevention
export function stripDangerousPatterns(input: string): string {
  return sanitizeHtml(input.trim(), {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt', 'title', 'width', 'height'],
      a: ['href', 'name', 'target', 'rel'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    disallowedTagsMode: 'discard',
  })
}

// SQL injection prevention (for raw queries)
export function escapeSqlString(str: string): string {
  // eslint-disable-next-line no-control-regex, no-useless-escape
  return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, char => {
    switch (char) {
      case '\0':
        return '\\0'
      case '\x08':
        return '\\b'
      case '\x09':
        return '\\t'
      case '\x1a':
        return '\\z'
      case '\n':
        return '\\n'
      case '\r':
        return '\\r'
      case '"':
      case "'":
      case '\\':
      case '%':
        return '\\' + char
      default:
        return char
    }
  })
}

// Path traversal prevention
export function sanitizePath(path: string): string {
  // Remove any directory traversal attempts
  return path.replace(/\.\./g, '').replace(/\/\//g, '/').replace(/\\/g, '/').replace(/^\//, '')
}

// Environment variable validation
export function validateEnvironmentVariables(): {
  valid: boolean
  missing: string[]
} {
  const required = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL', 'NEXT_PUBLIC_SITE_URL']

  const missing = required.filter(key => !process.env[key])

  return {
    valid: missing.length === 0,
    missing
  }
}

// Password validation
export function validatePassword(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Phone validation (Vietnamese format)
export function validatePhoneNumber(phone: string): boolean {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '')

  // Check if it's a valid Vietnamese phone number
  // Must be 10 digits and start with valid prefixes
  const validPrefixes = ['03', '05', '07', '08', '09', '01']

  if (cleaned.length !== 10) {
    return false
  }

  const prefix = cleaned.substring(0, 2)
  return validPrefixes.includes(prefix)
}

// JWT token validation - CRITICAL: Uses jwt.verify() for cryptographic signature verification
export function validateJWT(token: string): {
  valid: boolean
  payload?: jwt.JwtPayload
  error?: string
} {
  const secret = getJwtSecret()
  if (!secret) {
    console.error('JWT secret is not configured')
    return { valid: false, error: 'JWT secret not configured' }
  }

  try {
    // CRITICAL: Use jwt.verify() which validates the signature cryptographically
    // This prevents token forgery attacks that the previous implementation was vulnerable to
    const payload = jwt.verify(token, secret, {
      algorithms: ['HS256'],
    }) as jwt.JwtPayload

    return { valid: true, payload }
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { valid: false, error: 'Token expired' }
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return { valid: false, error: 'Invalid signature' }
    }
    if (error instanceof jwt.NotBeforeError) {
      return { valid: false, error: 'Token not yet valid' }
    }
    return { valid: false, error: 'Token validation failed' }
  }
}

// IP address validation
export function isValidIP(ip: string): boolean {
  // IPv4
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
  if (ipv4Regex.test(ip)) {
    const parts = ip.split('.')
    return parts.every(part => {
      const num = parseInt(part, 10)
      return num >= 0 && num <= 255
    })
  }

  // IPv6 (simplified)
  const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/
  return ipv6Regex.test(ip)
}

// Secure random string generation
export function generateSecureToken(length = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

// Hash sensitive data
export function hashData(data: string, salt?: string): string {
  const actualSalt = salt ?? crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(data, actualSalt, 10000, 64, 'sha512').toString('hex')

  return salt ? hash : `${actualSalt}:${hash}`
}

// Verify hashed data
export function verifyHash(data: string, hashedData: string): boolean {
  const [salt, hash] = hashedData.split(':')
  const computedHash = crypto.pbkdf2Sync(data, salt, 10000, 64, 'sha512').toString('hex')

  return hash === computedHash
}

// Content type validation
export function isValidContentType(contentType: string | null, allowedTypes: string[]): boolean {
  if (!contentType) return false

  return allowedTypes.some(type => contentType.toLowerCase().includes(type.toLowerCase()))
}

// File upload validation
export function validateFileUpload(
  file: File,
  options: {
    maxSize?: number // in bytes
    allowedTypes?: string[]
    allowedExtensions?: string[]
  } = {}
): {
  valid: boolean
  error?: string
} {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  } = options

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${maxSize / 1024 / 1024}MB limit`
    }
  }

  // Check MIME type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type'
    }
  }

  // Check file extension
  const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
  if (!allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: 'Invalid file extension'
    }
  }

  return { valid: true }
}

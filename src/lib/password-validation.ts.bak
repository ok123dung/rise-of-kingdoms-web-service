import * as nodeCrypto from 'crypto'

import { z } from 'zod'

// Password strength requirements
export const PASSWORD_MIN_LENGTH = 12
export const PASSWORD_MAX_LENGTH = 128

// Password validation schema
export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
  .max(PASSWORD_MAX_LENGTH, `Password must be at most ${PASSWORD_MAX_LENGTH} characters`)
  .refine(password => /[A-Z]/.test(password), 'Password must contain at least one uppercase letter')
  .refine(password => /[a-z]/.test(password), 'Password must contain at least one lowercase letter')
  .refine(password => /[0-9]/.test(password), 'Password must contain at least one number')
  .refine(
    password => /[^A-Za-z0-9]/.test(password),
    'Password must contain at least one special character'
  )

// Check for common weak passwords
const COMMON_PASSWORDS = [
  'password123',
  'admin123',
  'qwerty123',
  'letmein123',
  '123456789012',
  'password@123',
  'Welcome@123',
  'Admin@123',
  'P@ssw0rd123',
  'Rokservices@123'
]

export function isCommonPassword(password: string): boolean {
  const lower = password.toLowerCase()
  return COMMON_PASSWORDS.some(
    common => lower === common.toLowerCase() || lower.includes(common.toLowerCase())
  )
}

// Check for patterns
export function hasRepeatingCharacters(password: string, maxRepeats = 3): boolean {
  const regex = new RegExp(`(.)\\1{${maxRepeats - 1},}`)
  return regex.test(password)
}

// Check for sequential characters
export function hasSequentialCharacters(password: string, maxSequence = 3): boolean {
  for (let i = 0; i < password.length - maxSequence + 1; i++) {
    let isSequential = true
    for (let j = 0; j < maxSequence - 1; j++) {
      const charCode = password.charCodeAt(i + j)
      const nextCharCode = password.charCodeAt(i + j + 1)
      if (nextCharCode - charCode !== 1) {
        isSequential = false
        break
      }
    }
    if (isSequential) return true
  }
  return false
}

// Calculate password strength score (0-100)
export function calculatePasswordStrength(password: string): {
  score: number
  strength: 'weak' | 'fair' | 'good' | 'strong'
  feedback: string[]
} {
  let score = 0
  const feedback: string[] = []

  // Length scoring
  if (password.length >= PASSWORD_MIN_LENGTH) score += 20
  if (password.length >= 16) score += 10
  if (password.length >= 20) score += 10

  // Character variety
  if (/[a-z]/.test(password)) score += 10
  if (/[A-Z]/.test(password)) score += 10
  if (/[0-9]/.test(password)) score += 10
  if (/[^A-Za-z0-9]/.test(password)) score += 15

  // Special character variety
  const specialChars = password.match(/[^A-Za-z0-9]/g) || []
  if (new Set(specialChars).size >= 2) score += 10

  // Penalties
  if (isCommonPassword(password)) {
    score -= 30
    feedback.push('Avoid common passwords')
  }
  if (hasRepeatingCharacters(password)) {
    score -= 10
    feedback.push('Avoid repeating characters')
  }
  if (hasSequentialCharacters(password)) {
    score -= 10
    feedback.push('Avoid sequential characters')
  }

  // Ensure score is between 0 and 100
  score = Math.max(0, Math.min(100, score))

  // Determine strength
  let strength: 'weak' | 'fair' | 'good' | 'strong'
  if (score < 40) {
    strength = 'weak'
    if (feedback.length === 0) feedback.push('Use a stronger password')
  } else if (score < 60) {
    strength = 'fair'
    if (feedback.length === 0) feedback.push('Consider using a longer password')
  } else if (score < 80) {
    strength = 'good'
  } else {
    strength = 'strong'
  }

  return { score, strength, feedback }
}

// Validate password with all rules
export function validatePassword(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  try {
    passwordSchema.parse(password)
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push(...error.errors.map(e => e.message))
    }
  }

  if (isCommonPassword(password)) {
    errors.push('Password is too common')
  }

  if (hasRepeatingCharacters(password, 4)) {
    errors.push('Password contains too many repeating characters')
  }

  if (hasSequentialCharacters(password, 4)) {
    errors.push('Password contains sequential characters')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// Generate a secure random password
export function generateSecurePassword(length = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?'

  const allChars = uppercase + lowercase + numbers + special

  let password = ''

  // Ensure at least one of each required character type
  password += uppercase[nodeCrypto.randomInt(uppercase.length)]
  password += lowercase[nodeCrypto.randomInt(lowercase.length)]
  password += numbers[nodeCrypto.randomInt(numbers.length)]
  password += special[nodeCrypto.randomInt(special.length)]

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[nodeCrypto.randomInt(allChars.length)]
  }

  // Shuffle the password
  return password
    .split('')
    .sort(() => nodeCrypto.randomInt(3) - 1)
    .join('')
}

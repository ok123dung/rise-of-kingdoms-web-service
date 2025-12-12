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

// Top 100+ common weak passwords (source: SecLists, Have I Been Pwned)
// Extended list to prevent common breached passwords
const COMMON_PASSWORDS = [
  // Original list
  'password123', 'admin123', 'qwerty123', 'letmein123', '123456789012',
  'password@123', 'Welcome@123', 'Admin@123', 'P@ssw0rd123', 'Rokservices@123',
  // Top breached passwords (extended to 12+ chars)
  'password1234', 'qwerty123456', '123456789abc', 'iloveyou1234',
  'sunshine1234', 'princess1234', 'football1234', 'welcome12345',
  'monkey123456', 'shadow123456', 'superman1234', 'michael12345',
  'charlie12345', 'master123456', 'dragon123456', 'passw0rd1234',
  'trustno12345', 'whatever1234', 'computer1234', 'starwars1234',
  // Common patterns
  'abcd12345678', '1234567890ab', 'qwertyuiop12', 'asdfghjkl123',
  'zxcvbnm12345', '!qaz2wsx3edc', 'password!234', 'p@ssword1234',
  'Password1234', 'PASSWORD1234', 'Passw0rd1234', 'Pa$$word1234',
  // Keyboard patterns
  '1qaz2wsx3edc', 'qazwsxedcrfv', 'zaq12wsx3edc', '!qaz@wsx#edc',
  // Year-based
  'password2023', 'password2024', 'password2025', 'welcome2023',
  'welcome2024', 'welcome2025', 'admin2023456', 'admin2024567',
  // Vietnamese common
  'matkhau12345', 'taikhoan1234', 'dangky123456', 'xinchao12345',
  'vietnam12345', 'saigon123456', 'hanoi1234567',
  // Gaming related (RoK specific)
  'kingdom12345', 'alliance1234', 'commander123', 'riseofking12',
  'rokplayer123', 'gamerok12345', 'kvk123456789',
  // Service name variations
  'rokservice12', 'rokservices1', 'rokdbot12345',
  // Common weak with special chars
  'password!@#$', 'admin!@#$567', 'qwerty!@#$12', 'Welcome!@#$1',
  'Test@1234567', 'User@1234567', 'Login@123456', 'Account@1234'
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
  const specialChars = password.match(/[^A-Za-z0-9]/g) ?? []
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

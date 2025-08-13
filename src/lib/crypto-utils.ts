import crypto from 'crypto'

/**
 * Generate a cryptographically secure random string
 * @param length - Length of the string to generate
 * @returns Hexadecimal string of specified length
 */
export function generateSecureRandomString(length: number): string {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length)
}

/**
 * Generate a secure random integer between min and max (inclusive)
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Random integer
 */
export function generateSecureRandomInt(min: number, max: number): number {
  const range = max - min + 1
  const bytesNeeded = Math.ceil(Math.log2(range) / 8)
  const maxValue = Math.pow(256, bytesNeeded) - 1
  const threshold = maxValue - (maxValue % range)

  let randomValue: number
  do {
    randomValue = crypto.randomBytes(bytesNeeded).readUIntBE(0, bytesNeeded)
  } while (randomValue >= threshold)

  return min + (randomValue % range)
}

/**
 * Generate a secure random ID with optional prefix
 * @param prefix - Optional prefix for the ID
 * @param length - Length of random part (default 16)
 * @returns Random ID string
 */
export function generateSecureId(prefix: string = '', length: number = 16): string {
  const randomPart = generateSecureRandomString(length)
  return prefix ? `${prefix}_${randomPart}` : randomPart
}

/**
 * Generate a secure random alphanumeric string
 * @param length - Length of the string
 * @returns Random alphanumeric string
 */
export function generateSecureAlphanumeric(length: number): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  let result = ''
  
  for (let i = 0; i < length; i++) {
    result += chars[generateSecureRandomInt(0, chars.length - 1)]
  }
  
  return result
}

/**
 * Generate a secure booking/order number
 * @param prefix - Prefix for the number
 * @returns Formatted booking number
 */
export function generateSecureBookingNumber(prefix: string = 'BK'): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = generateSecureAlphanumeric(6)
  return `${prefix}${timestamp}${random}`
}

/**
 * Generate a secure payment reference
 * @param provider - Payment provider name
 * @returns Payment reference
 */
export function generateSecurePaymentRef(provider: string): string {
  const timestamp = Date.now()
  const random = generateSecureRandomInt(1000, 9999)
  const hash = crypto.createHash('sha256')
    .update(`${provider}${timestamp}${random}`)
    .digest('hex')
    .substring(0, 8)
    .toUpperCase()
  
  return `${provider.toUpperCase()}_${timestamp}_${hash}`
}

/**
 * Generate a UUID v4 using crypto
 */
export function generateSecureUUID(): string {
  return crypto.randomUUID()
}

/**
 * Generate a short unique ID (similar to nanoid)
 * @param length - Length of the ID (default 21)
 * @returns Short unique ID
 */
export function generateShortId(length: number = 21): string {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'
  let id = ''
  
  const bytes = crypto.randomBytes(length)
  for (let i = 0; i < length; i++) {
    id += alphabet[bytes[i] & 63]
  }
  
  return id
}

/**
 * Generate a secure numeric code
 * @param digits - Number of digits
 * @returns Numeric string
 */
export function generateSecureNumericCode(digits: number): string {
  const min = Math.pow(10, digits - 1)
  const max = Math.pow(10, digits) - 1
  return generateSecureRandomInt(min, max).toString()
}
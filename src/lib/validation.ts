import { z } from 'zod'

import { passwordSchema } from './password-validation'

// Email validation schema
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .min(5, 'Email must be at least 5 characters')
  .max(255, 'Email must be less than 255 characters')

// Phone number validation for Vietnamese numbers
export const phoneSchema = z
  .string()
  .regex(
    /^(\+84|84|0)(3[2-9]|5[689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/,
    'Invalid Vietnamese phone number format'
  )
  .optional()

// RoK Player ID validation (9-10 digits)
export const rok_player_idSchema = z
  .string()
  .regex(/^\d{9,10}$/, 'RoK Player ID must be 9-10 digits')
  .optional()

// RoK Kingdom validation (4 digits)
export const rok_kingdomSchema = z
  .string()
  .regex(/^\d{4}$/, 'Kingdom must be 4 digits (e.g., 1234)')
  .optional()

// RoK Power validation (must be positive integer)
export const rok_powerSchema = z
  .bigint()
  .min(BigInt(0), 'Power cannot be negative')
  .optional()
  .or(
    z
      .string()
      .regex(/^\d+$/, 'Power must be a number')
      .transform(val => BigInt(val))
      .optional()
  )

// User registration/update validation
export const userValidationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  full_name: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .regex(/^[a-zA-ZÀ-ỹ\s]+$/, 'Full name can only contain letters and spaces'),
  phone: phoneSchema,
  discord_username: z
    .string()
    .regex(/^.{3,32}#\d{4}$/, 'Discord username must be in format username#1234')
    .optional(),
  rok_player_id: rok_player_idSchema,
  rok_kingdom: rok_kingdomSchema,
  rok_power: rok_powerSchema
})

// Signup validation schema (using strong password validation)
export const signupSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ tên không được quá 100 ký tự')
    .regex(/^[a-zA-ZÀ-ỹ\s]+$/, 'Họ tên chỉ được chứa chữ cái và khoảng trắng'),
  email: z
    .string()
    .email('Định dạng email không hợp lệ')
    .min(5, 'Email phải có ít nhất 5 ký tự')
    .max(255, 'Email không được quá 255 ký tự'),
  password: passwordSchema,
  phone: z
    .string()
    .regex(
      /^(\+84|84|0)(3[2-9]|5[689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/,
      'Số điện thoại không đúng định dạng Việt Nam'
    )
    .optional()
    .nullable()
})

// Lead validation schema
export const leadValidationSchema = z.object({
  email: emailSchema.optional(),
  phone: phoneSchema,
  full_name: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .optional(),
  service_interest: z
    .enum(['strategy', 'farming', 'kvk', 'alliance', 'premium', 'coaching'])
    .optional(),
  source: z
    .enum(['website', 'discord', 'facebook', 'referral', 'google_ads', 'other'])
    .default('website'),
  utm_source: z.string().max(100).optional(),
  utm_medium: z.string().max(100).optional(),
  utm_campaign: z.string().max(100).optional(),
  notes: z.string().max(1000).optional()
})

// Booking validation schema
export const bookingValidationSchema = z.object({
  service_tier_id: z.string().cuid('Invalid service tier ID'),
  customer_requirements: z
    .string()
    .min(10, 'Requirements must be at least 10 characters')
    .max(2000, 'Requirements must be less than 2000 characters')
    .optional(),
  booking_details: z.record(z.unknown()).optional()
})

// Payment validation schema
export const paymentValidationSchema = z.object({
  booking_id: z.string().cuid('Invalid booking ID'),
  amount: z
    .number()
    .positive('Amount must be positive')
    .max(10000000, 'Amount cannot exceed 10M VNĐ'),
  currency: z.enum(['VND']).default('VND'),
  payment_method: z.enum(['momo', 'zalopay', 'vnpay', 'banking'])
})

// Service validation schema (admin only)
export const serviceValidationSchema = z.object({
  name: z
    .string()
    .min(3, 'Service name must be at least 3 characters')
    .max(100, 'Service name must be less than 100 characters'),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .min(3, 'Slug must be at least 3 characters')
    .max(50, 'Slug must be less than 50 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  short_description: z
    .string()
    .max(200, 'Short description must be less than 200 characters')
    .optional(),
  base_price: z
    .number()
    .positive('Base price must be positive')
    .max(10000000, 'Base price cannot exceed 10M VNĐ'),
  currency: z.enum(['VND']).default('VND'),
  category: z
    .enum(['consulting', 'farming', 'kvk', 'management', 'coaching', 'analysis'])
    .optional()
})

// Service tier validation schema
export const service_tiersValidationSchema = z.object({
  service_id: z.string().cuid('Invalid service ID'),
  name: z
    .string()
    .min(3, 'Tier name must be at least 3 characters')
    .max(50, 'Tier name must be less than 50 characters'),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  price: z.number().positive('Price must be positive').max(10000000, 'Price cannot exceed 10M VNĐ'),
  original_price: z
    .number()
    .positive('Original price must be positive')
    .max(10000000, 'Original price cannot exceed 10M VNĐ')
    .optional(),
  features: z
    .array(z.string().min(3, 'Feature must be at least 3 characters'))
    .min(1, 'At least one feature is required'),
  limitations: z.array(z.string()).optional(),
  max_customers: z.number().int().positive('Max customers must be positive').optional()
})

// Validation helper functions
export function validateEmail(email: string): { valid: boolean; error?: string } {
  try {
    emailSchema.parse(email)
    return { valid: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.errors[0]?.message }
    }
    return { valid: false, error: 'Invalid email' }
  }
}

export function validatePhone(phone: string): { valid: boolean; error?: string } {
  try {
    phoneSchema.parse(phone)
    return { valid: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.errors[0]?.message }
    }
    return { valid: false, error: 'Invalid phone number' }
  }
}

export function validateRoKData(data: {
  playerId?: string
  kingdom?: string
  power?: string | bigint
}): { valid: boolean; errors?: string[] } {
  const errors: string[] = []

  if (data.playerId) {
    const playerIdResult = rok_player_idSchema.safeParse(data.playerId)
    if (!playerIdResult.success) {
      errors.push('Invalid Player ID format')
    }
  }

  if (data.kingdom) {
    const kingdomResult = rok_kingdomSchema.safeParse(data.kingdom)
    if (!kingdomResult.success) {
      errors.push('Invalid Kingdom format')
    }
  }

  if (data.power) {
    const powerResult = rok_powerSchema.safeParse(data.power)
    if (!powerResult.success) {
      errors.push('Invalid Power value')
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  }
}

// Sanitization functions
// HTML-encode special characters to prevent XSS - safer than regex stripping
function htmlEncode(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

export function sanitizeInput(input: string): string {
  // For plain text inputs, HTML-encode to prevent injection
  // This is safer than trying to strip dangerous patterns
  return htmlEncode(input.trim())
}

// For cases where you need to allow some HTML but strip dangerous content
// Recommend using a library like DOMPurify instead of this function
export function stripDangerousHtml(input: string): string {
  let sanitized = input.trim()

  // Iteratively remove dangerous patterns
  let iterations = 0
  const maxIterations = 10 // Prevent infinite loops
  let previous: string
  do {
    previous = sanitized
    iterations++
    // Remove all tags that could execute scripts
    sanitized = sanitized
      .replace(/<script\b[^>]*>.*?<\/script>/gis, '')
      .replace(/<script\b[^>]*>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/\bon\w+=/gi, '')
      .replace(/data:/gi, '')
      .replace(/vbscript:/gi, '')
  } while (sanitized !== previous && iterations < maxIterations)

  return sanitized
}

export function sanitizeUserInput(input: string): string {
  return sanitizeInput(input)
}

export function sanitizePhoneNumber(phone: string): string {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '')

  // Convert Vietnamese phone formats to standard format
  if (cleaned.startsWith('84')) {
    return '+' + cleaned
  } else if (cleaned.startsWith('0')) {
    return '+84' + cleaned.slice(1)
  } else if (cleaned.startsWith('+84')) {
    return cleaned
  }

  return cleaned
}

// Export all schemas for use in API routes
export {
  z,
  userValidationSchema as userSchema,
  leadValidationSchema as leadSchema,
  bookingValidationSchema as bookingSchema,
  paymentValidationSchema as paymentSchema,
  serviceValidationSchema as serviceSchema,
  service_tiersValidationSchema as service_tiersSchema
}

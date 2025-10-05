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
export const rokPlayerIdSchema = z
  .string()
  .regex(/^\d{9,10}$/, 'RoK Player ID must be 9-10 digits')
  .optional()

// RoK Kingdom validation (4 digits)
export const rokKingdomSchema = z
  .string()
  .regex(/^\d{4}$/, 'Kingdom must be 4 digits (e.g., 1234)')
  .optional()

// RoK Power validation (must be positive integer)
export const rokPowerSchema = z
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
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .regex(/^[a-zA-ZÀ-ỹ\s]+$/, 'Full name can only contain letters and spaces'),
  phone: phoneSchema,
  discordUsername: z
    .string()
    .regex(/^.{3,32}#\d{4}$/, 'Discord username must be in format username#1234')
    .optional(),
  rokPlayerId: rokPlayerIdSchema,
  rokKingdom: rokKingdomSchema,
  rokPower: rokPowerSchema
})

// Signup validation schema (using strong password validation)
export const signupSchema = z.object({
  fullName: z
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
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .optional(),
  serviceInterest: z
    .enum(['strategy', 'farming', 'kvk', 'alliance', 'premium', 'coaching'])
    .optional(),
  source: z
    .enum(['website', 'discord', 'facebook', 'referral', 'google_ads', 'other'])
    .default('website'),
  utmSource: z.string().max(100).optional(),
  utmMedium: z.string().max(100).optional(),
  utmCampaign: z.string().max(100).optional(),
  notes: z.string().max(1000).optional()
})

// Booking validation schema
export const bookingValidationSchema = z.object({
  serviceTierId: z.string().cuid('Invalid service tier ID'),
  customerRequirements: z
    .string()
    .min(10, 'Requirements must be at least 10 characters')
    .max(2000, 'Requirements must be less than 2000 characters')
    .optional(),
  bookingDetails: z.record(z.unknown()).optional()
})

// Payment validation schema
export const paymentValidationSchema = z.object({
  bookingId: z.string().cuid('Invalid booking ID'),
  amount: z
    .number()
    .positive('Amount must be positive')
    .max(10000000, 'Amount cannot exceed 10M VNĐ'),
  currency: z.enum(['VND']).default('VND'),
  paymentMethod: z.enum(['momo', 'zalopay', 'vnpay', 'banking'])
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
  shortDescription: z
    .string()
    .max(200, 'Short description must be less than 200 characters')
    .optional(),
  basePrice: z
    .number()
    .positive('Base price must be positive')
    .max(10000000, 'Base price cannot exceed 10M VNĐ'),
  currency: z.enum(['VND']).default('VND'),
  category: z
    .enum(['consulting', 'farming', 'kvk', 'management', 'coaching', 'analysis'])
    .optional()
})

// Service tier validation schema
export const serviceTierValidationSchema = z.object({
  serviceId: z.string().cuid('Invalid service ID'),
  name: z
    .string()
    .min(3, 'Tier name must be at least 3 characters')
    .max(50, 'Tier name must be less than 50 characters'),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  price: z.number().positive('Price must be positive').max(10000000, 'Price cannot exceed 10M VNĐ'),
  originalPrice: z
    .number()
    .positive('Original price must be positive')
    .max(10000000, 'Original price cannot exceed 10M VNĐ')
    .optional(),
  features: z
    .array(z.string().min(3, 'Feature must be at least 3 characters'))
    .min(1, 'At least one feature is required'),
  limitations: z.array(z.string()).optional(),
  maxCustomers: z.number().int().positive('Max customers must be positive').optional()
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
    const playerIdResult = rokPlayerIdSchema.safeParse(data.playerId)
    if (!playerIdResult.success) {
      errors.push('Invalid Player ID format')
    }
  }

  if (data.kingdom) {
    const kingdomResult = rokKingdomSchema.safeParse(data.kingdom)
    if (!kingdomResult.success) {
      errors.push('Invalid Kingdom format')
    }
  }

  if (data.power) {
    const powerResult = rokPowerSchema.safeParse(data.power)
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
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/javascript:/gi, '') // Remove javascript: links
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
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
  serviceTierValidationSchema as serviceTierSchema
}

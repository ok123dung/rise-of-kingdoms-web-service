import { z } from 'zod'
import { getLogger } from './monitoring/logger'

// Define environment variable schemas
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  
  // NextAuth
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  
  // Site Configuration
  NEXT_PUBLIC_SITE_URL: z.string().url('NEXT_PUBLIC_SITE_URL must be a valid URL'),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  
  // Email
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required'),
  RESEND_FROM_EMAIL: z.string().email('RESEND_FROM_EMAIL must be a valid email'),
  
  // Payment Providers
  MOMO_PARTNER_CODE: z.string().optional(),
  MOMO_ACCESS_KEY: z.string().optional(),
  MOMO_SECRET_KEY: z.string().optional(),
  MOMO_API_URL: z.string().url().optional(),
  
  VNPAY_TMN_CODE: z.string().optional(),
  VNPAY_HASH_SECRET: z.string().optional(),
  VNPAY_URL: z.string().url().optional(),
  
  ZALOPAY_APP_ID: z.string().optional(),
  ZALOPAY_KEY1: z.string().optional(),
  ZALOPAY_KEY2: z.string().optional(),
  ZALOPAY_ENDPOINT: z.string().url().optional(),
  
  // Storage
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().optional(),
  R2_PUBLIC_URL: z.string().url().optional(),
  
  // Discord
  DISCORD_BOT_TOKEN: z.string().optional(),
  DISCORD_PAYMENT_CHANNEL_ID: z.string().optional(),
  DISCORD_BOOKING_CHANNEL_ID: z.string().optional(),
  DISCORD_STAFF_CHANNEL_ID: z.string().optional(),
  DISCORD_NOTIFICATION_WEBHOOK_URL: z.string().url().optional(),
  
  // Monitoring
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  GA_MEASUREMENT_ID: z.string().optional(),
  
  // Redis/Upstash
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  
  // Security
  ALLOWED_ORIGINS: z.string().optional(),
  ALLOWED_WS_ORIGINS: z.string().optional(),
  CSRF_SECRET: z.string().optional(),
  
  // Node Environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
})

// Define sensitive environment variables that should never be exposed
const SENSITIVE_KEYS = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'RESEND_API_KEY',
  'MOMO_SECRET_KEY',
  'VNPAY_HASH_SECRET',
  'ZALOPAY_KEY1',
  'ZALOPAY_KEY2',
  'R2_SECRET_ACCESS_KEY',
  'DISCORD_BOT_TOKEN',
  'SENTRY_AUTH_TOKEN',
  'UPSTASH_REDIS_REST_TOKEN',
  'CSRF_SECRET'
]

// Validate environment variables
export function validateEnv() {
  try {
    const env = envSchema.parse(process.env)
    
    // Log successful validation (without sensitive values)
    getLogger().info('Environment variables validated successfully', {
      nodeEnv: env.NODE_ENV,
      hasDatabase: !!env.DATABASE_URL,
      hasEmail: !!env.RESEND_API_KEY,
      hasPayment: !!(env.MOMO_PARTNER_CODE || env.VNPAY_TMN_CODE || env.ZALOPAY_APP_ID),
      hasStorage: !!env.R2_ACCOUNT_ID,
      hasMonitoring: !!env.SENTRY_DSN
    })
    
    return env
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(e => e.path.join('.')).join(', ')
      throw new Error(`Missing or invalid environment variables: ${missingVars}`)
    }
    throw error
  }
}

// Get safe environment variables (excludes sensitive keys)
export function getSafeEnv(): Record<string, string | undefined> {
  const safeEnv: Record<string, string | undefined> = {}
  
  Object.keys(process.env).forEach(key => {
    if (!SENSITIVE_KEYS.includes(key) && key.startsWith('NEXT_PUBLIC_')) {
      safeEnv[key] = process.env[key]
    }
  })
  
  return safeEnv
}

// Check if a key is sensitive
export function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEYS.includes(key) || 
    key.includes('SECRET') || 
    key.includes('KEY') || 
    key.includes('TOKEN') ||
    key.includes('PASSWORD')
}

// Mask sensitive values for logging
export function maskSensitiveValue(value: string, showChars: number = 4): string {
  if (value.length <= showChars * 2) {
    return '***'
  }
  
  const start = value.substring(0, showChars)
  const end = value.substring(value.length - showChars)
  return `${start}...${end}`
}

// Get environment variable with validation
export function getEnvVar(key: keyof typeof envSchema.shape, required: boolean = true): string | undefined {
  const value = process.env[key]
  
  if (required && !value) {
    throw new Error(`Environment variable ${key} is required but not set`)
  }
  
  return value
}

// Typed environment variables
export const env = {
  // Database
  databaseUrl: getEnvVar('DATABASE_URL', true)!,
  
  // Auth
  nextAuthUrl: getEnvVar('NEXTAUTH_URL', false),
  nextAuthSecret: getEnvVar('NEXTAUTH_SECRET', true)!,
  
  // Site
  siteUrl: getEnvVar('NEXT_PUBLIC_SITE_URL', true)!,
  appUrl: getEnvVar('NEXT_PUBLIC_APP_URL', false) || getEnvVar('NEXT_PUBLIC_SITE_URL', true)!,
  
  // Email
  resendApiKey: getEnvVar('RESEND_API_KEY', true)!,
  resendFromEmail: getEnvVar('RESEND_FROM_EMAIL', true)!,
  
  // Node
  nodeEnv: (getEnvVar('NODE_ENV', false) || 'development') as 'development' | 'test' | 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  
  // Payment providers (optional)
  momo: {
    partnerCode: getEnvVar('MOMO_PARTNER_CODE', false),
    accessKey: getEnvVar('MOMO_ACCESS_KEY', false),
    secretKey: getEnvVar('MOMO_SECRET_KEY', false),
    apiUrl: getEnvVar('MOMO_API_URL', false)
  },
  
  vnpay: {
    tmnCode: getEnvVar('VNPAY_TMN_CODE', false),
    hashSecret: getEnvVar('VNPAY_HASH_SECRET', false),
    url: getEnvVar('VNPAY_URL', false)
  },
  
  zalopay: {
    appId: getEnvVar('ZALOPAY_APP_ID', false),
    key1: getEnvVar('ZALOPAY_KEY1', false),
    key2: getEnvVar('ZALOPAY_KEY2', false),
    endpoint: getEnvVar('ZALOPAY_ENDPOINT', false)
  }
}
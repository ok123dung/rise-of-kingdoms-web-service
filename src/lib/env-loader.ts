import { validateEnv, getSafeEnv, isSensitiveKey, maskSensitiveValue } from './env-validation'
import { getLogger } from './monitoring/logger'

// Load and validate environment variables at startup
export function loadEnvironment() {
  try {
    // Skip validation in some environments
    if (process.env.SKIP_ENV_VALIDATION === 'true') {
      getLogger().warn('Environment validation skipped')
      return
    }

    // Validate environment
    validateEnv()

    // Log safe environment info
    const safeEnv = getSafeEnv()
    getLogger().info('Environment loaded', {
      nodeEnv: process.env.NODE_ENV,
      publicVars: Object.keys(safeEnv).length,
      totalVars: Object.keys(process.env).length
    })

    // In development, warn about missing optional variables
    if (process.env.NODE_ENV === 'development') {
      checkOptionalVariables()
    }

  } catch (error) {
    getLogger().error('Failed to load environment', error as Error)
    
    // In production, fail fast on invalid environment
    if (process.env.NODE_ENV === 'production') {
      throw error
    }
    
    // In development, show helpful error message
    console.error('\n⚠️  Environment Configuration Error\n')
    console.error((error as Error).message)
    console.error('\nPlease check your .env.local file and ensure all required variables are set.')
    console.error('See .env.example for reference.\n')
  }
}

// Check for optional but recommended variables
function checkOptionalVariables() {
  const recommendations: Record<string, string> = {
    SENTRY_DSN: 'Error tracking',
    GA_MEASUREMENT_ID: 'Analytics',
    UPSTASH_REDIS_REST_URL: 'Caching and rate limiting',
    R2_ACCOUNT_ID: 'File uploads',
    DISCORD_BOT_TOKEN: 'Discord notifications'
  }

  const missing = Object.entries(recommendations)
    .filter(([key]) => !process.env[key])
    .map(([key, feature]) => `- ${key} (for ${feature})`)

  if (missing.length > 0) {
    console.warn('\n📋 Optional environment variables not set:')
    console.warn(missing.join('\n'))
    console.warn('\nThese features will be disabled.\n')
  }
}

// Create a proxy to prevent accidental exposure of sensitive values
export function createSecureEnvProxy(): typeof process.env {
  return new Proxy(process.env, {
    get(target, prop: string) {
      const value = target[prop]
      
      // Warn when accessing sensitive values directly
      if (isSensitiveKey(prop) && process.env.NODE_ENV === 'development') {
        console.warn(`⚠️  Accessing sensitive environment variable: ${prop}`)
        console.trace()
      }
      
      return value
    },
    
    set(target, prop: string, value) {
      // Prevent setting environment variables at runtime
      if (process.env.NODE_ENV === 'production') {
        throw new Error(`Cannot set environment variable ${prop} at runtime`)
      }
      
      target[prop] = value
      return true
    }
  })
}

// Helper to log environment variables safely
export function logEnvironmentInfo() {
  const info: Record<string, any> = {
    nodeEnv: process.env.NODE_ENV,
    hasRequiredVars: true,
    features: {
      email: !!process.env.RESEND_API_KEY,
      payments: {
        momo: !!process.env.MOMO_PARTNER_CODE,
        vnpay: !!process.env.VNPAY_TMN_CODE,
        zalopay: !!process.env.ZALOPAY_APP_ID
      },
      storage: !!process.env.R2_ACCOUNT_ID,
      monitoring: !!process.env.SENTRY_DSN,
      cache: !!process.env.UPSTASH_REDIS_REST_URL,
      discord: !!process.env.DISCORD_BOT_TOKEN
    }
  }

  // Add masked values for debugging (only in development)
  if (process.env.NODE_ENV === 'development') {
    info.masked = {
      databaseUrl: process.env.DATABASE_URL ? maskSensitiveValue(process.env.DATABASE_URL) : 'not set',
      nextAuthSecret: process.env.NEXTAUTH_SECRET ? 'set' : 'not set',
      apiKeys: {
        resend: process.env.RESEND_API_KEY ? maskSensitiveValue(process.env.RESEND_API_KEY) : 'not set',
        sentry: process.env.SENTRY_AUTH_TOKEN ? 'set' : 'not set'
      }
    }
  }

  return info
}
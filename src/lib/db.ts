import { PrismaClient, type Prisma } from '@prisma/client'

import { getLogger } from '@/lib/monitoring/logger'

import type { UnwrapTuple } from '@prisma/client/runtime/library'

// Connection pool configuration
const CONNECTION_POOL_CONFIG = {
  // Connection pool size based on environment
  connection_limit: parseInt(process.env.DATABASE_CONNECTION_LIMIT || '5'),
  // Maximum time to wait for a connection from pool (ms)
  pool_timeout: parseInt(process.env.DATABASE_POOL_TIMEOUT || '10000'),
  // Connection idle timeout (ms)
  idle_in_transaction_session_timeout: parseInt(process.env.DATABASE_IDLE_TIMEOUT || '10000'),
  // Statement timeout (ms)
  statement_timeout: parseInt(process.env.DATABASE_STATEMENT_TIMEOUT || '20000')
}

// Circuit breaker configuration
class CircuitBreaker {
  private failures = 0
  private lastFailureTime = 0
  private state: 'closed' | 'open' | 'half-open' = 'closed'

  constructor(
    private readonly threshold = 5,
    private readonly timeout = 60000, // 1 minute
    private readonly halfOpenRequests = 3
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'half-open'
        this.failures = 0
      } else {
        throw new Error('Circuit breaker is OPEN - database unavailable')
      }
    }

    try {
      const result = await fn()
      if (this.state === 'half-open') {
        this.failures = 0
        this.state = 'closed'
      }
      return result
    } catch (error) {
      this.recordFailure()
      throw error
    }
  }

  private recordFailure() {
    this.failures++
    this.lastFailureTime = Date.now()

    if (this.failures >= this.threshold) {
      this.state = 'open'
      getLogger().error(`Circuit breaker opened after ${this.failures} failures`)
    }
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime
    }
  }
}

// Enhanced Prisma client with monitoring and error recovery
class EnhancedPrismaClient extends PrismaClient {
  private circuitBreaker = new CircuitBreaker()
  private connectionAttempts = 0
  private lastConnectionCheck = 0
  private isHealthy = true

  constructor() {
    let databaseUrl = process.env.DATABASE_URL

    if (!databaseUrl) {
      getLogger().warn(
        'DATABASE_URL environment variable is not set. Database functionality will be limited.'
      )
    } else {
      // Add connection pool parameters to URL if not present
      const url = new URL(databaseUrl)
      if (!url.searchParams.has('connection_limit')) {
        url.searchParams.set('connection_limit', String(CONNECTION_POOL_CONFIG.connection_limit))
      }
      if (!url.searchParams.has('pool_timeout')) {
        url.searchParams.set('pool_timeout', String(CONNECTION_POOL_CONFIG.pool_timeout / 1000))
      }
      // Update the databaseUrl with the modified parameters
      databaseUrl = url.toString()
    }

    super({
      datasources: {
        db: {
          url: databaseUrl || 'postgresql://dummy:dummy@localhost:5432/dummy'
        }
      },
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' }
      ],
      errorFormat: 'pretty'
    })

    this.setupEventHandlers()
  }

  private setupEventHandlers() {
    // Query logging
    this.$on('query' as never, (e: { duration?: number; query?: string }) => {
      if (e.duration && e.duration > 1000) {
        getLogger().warn(`Slow query detected: ${e.query ?? 'unknown'} (${e.duration}ms)`)
      }
    })

    // Error logging
    this.$on('error' as never, (e: { message?: string; target?: string; timestamp?: string }) => {
      getLogger().error('Database error', new Error(e.message ?? 'Unknown database error'), {
        target: e.target,
        timestamp: e.timestamp
      })
      this.isHealthy = false
    })

    // Warning logging
    this.$on('warn' as never, (e: { message?: string; timestamp?: string }) => {
      getLogger().warn('Database warning', {
        message: e.message,
        timestamp: e.timestamp
      })
    })
  }

  async $connect(): Promise<void> {
    try {
      await this.circuitBreaker.execute(async () => {
        this.connectionAttempts++
        await super.$connect()
        this.connectionAttempts = 0
        this.isHealthy = true
        getLogger().info('Database connected successfully')
      })
    } catch (error) {
      getLogger().error('Database connection failed', error as Error, {
        attempts: this.connectionAttempts
      })

      // Implement exponential backoff for reconnection
      if (this.connectionAttempts < 5) {
        const delay = Math.min(1000 * Math.pow(2, this.connectionAttempts), 30000)
        getLogger().info(`Retrying database connection in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
        return this.$connect()
      }

      throw error
    }
  }

  async healthCheck(): Promise<{
    isHealthy: boolean
    circuitBreaker: ReturnType<CircuitBreaker['getState']>
    connectionPool: {
      active: number
      idle: number
      total: number
    }
  }> {
    const now = Date.now()

    // Only check every 5 seconds to avoid overloading
    if (now - this.lastConnectionCheck < 5000) {
      return {
        isHealthy: this.isHealthy,
        circuitBreaker: this.circuitBreaker.getState(),
        connectionPool: { active: 0, idle: 0, total: CONNECTION_POOL_CONFIG.connection_limit }
      }
    }

    this.lastConnectionCheck = now

    try {
      await this.circuitBreaker.execute(async () => {
        await this.$queryRaw`SELECT 1`
      })
      this.isHealthy = true
    } catch (error) {
      this.isHealthy = false
      getLogger().error('Health check failed', error as Error)
    }

    // Get connection pool stats (this is a simplified version)
    const poolStats = {
      active: this.isHealthy ? 1 : 0,
      idle: this.isHealthy ? CONNECTION_POOL_CONFIG.connection_limit - 1 : 0,
      total: CONNECTION_POOL_CONFIG.connection_limit
    }

    return {
      isHealthy: this.isHealthy,
      circuitBreaker: this.circuitBreaker.getState(),
      connectionPool: poolStats
    }
  }

  // Override $transaction to add timeout and retry logic
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $transaction<P extends Prisma.PrismaPromise<unknown>[]>(arg: [...P]): Promise<UnwrapTuple<P>>
  $transaction<R>(
    fn: (
      prisma: Omit<
        PrismaClient,
        '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
      >
    ) => Promise<R>,
    options?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  ): Promise<R>
  async $transaction<T = unknown>(arg: unknown, options?: unknown): Promise<T> {
    const defaultOptions = {
      maxWait: CONNECTION_POOL_CONFIG.pool_timeout,
      timeout: CONNECTION_POOL_CONFIG.statement_timeout,
      ...(options as object)
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.circuitBreaker.execute(async () => {
      try {
        if (Array.isArray(arg)) {
          return (await super.$transaction(
            arg as Prisma.PrismaPromise<unknown>[],
            options as { isolationLevel?: Prisma.TransactionIsolationLevel }
          )) as T
        } else {
          return (await super.$transaction(
            arg as (
              prisma: Omit<
                PrismaClient,
                '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
              >
            ) => Promise<T>,
            defaultOptions
          )) as T
        }
      } catch (error) {
        // Log transaction errors with context
        getLogger().error('Transaction failed', error as Error, {
          maxWait: defaultOptions.maxWait,
          timeout: defaultOptions.timeout
        })
        throw error
      }
    })
  }
}
// Guard against build-time instantiation
// Only check NEXT_PHASE - not VERCEL_ENV as it causes issues in serverless runtime
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build'

// Global instance management
const globalForPrisma = globalThis as unknown as {
  prismaEnhanced: EnhancedPrismaClient | undefined
}

// Only instantiate if not in build phase
export const prismaEnhanced = isBuildPhase
  ? (null as unknown as EnhancedPrismaClient)
  : (globalForPrisma.prismaEnhanced ?? new EnhancedPrismaClient())

if (process.env.NODE_ENV !== 'production' && !isBuildPhase) {
  globalForPrisma.prismaEnhanced = prismaEnhanced
}

// Auto-connect on first use
let isConnecting = false
async function ensureConnected() {
  if (!isConnecting) {
    isConnecting = true
    try {
      await prismaEnhanced.$connect()
    } finally {
      isConnecting = false
    }
  }
}

// Middleware to ensure connection before queries
// During build phase, export a dummy object that will never be called
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const prisma: EnhancedPrismaClient = isBuildPhase
  ? (null as unknown as EnhancedPrismaClient)
  : new Proxy(prismaEnhanced, {
      get(target, prop, receiver) {
        // For model operations, ensure connected first
        if (typeof prop === 'string' && prop in target && !prop.startsWith('$')) {
          const modelProxy = Reflect.get(target, prop, receiver) as object
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return new Proxy(modelProxy, {
            get(modelTarget, modelProp) {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              const value = Reflect.get(modelTarget, modelProp)
              if (typeof value === 'function') {
                return async (...args: unknown[]) => {
                  await ensureConnected()
                  return (value as (...args: unknown[]) => unknown).apply(modelTarget, args)
                }
              }
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return
              return value
            }
          })
        }

        // For $-prefixed methods
        if (typeof prop === 'string' && prop.startsWith('$') && prop !== '$connect') {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const value = Reflect.get(target, prop, receiver)
          if (typeof value === 'function') {
            return async (...args: unknown[]) => {
              await ensureConnected()
              return (value as (...args: unknown[]) => unknown).apply(target, args)
            }
          }
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return Reflect.get(target, prop, receiver)
      }
    })

// Export health check function
export async function checkDatabaseHealth() {
  return prismaEnhanced.healthCheck()
}

// Enhanced database connection health check (Legacy support)
export async function checkDatabaseConnection() {
  try {
    const health = await checkDatabaseHealth()

    if (health.isHealthy) {
      return {
        status: 'healthy',
        message: 'Database connection successful',
        details: health
      }
    } else {
      return {
        status: 'unhealthy',
        message: 'Database connection unhealthy',
        details: health
      }
    }
  } catch (error) {
    getLogger().error('Database connection check failed', error as Error)
    return {
      status: 'unhealthy',
      message: 'Database connection failed',
      error
    }
  }
}

// Graceful shutdown
export async function disconnectDatabase() {
  await prismaEnhanced.$disconnect()
  getLogger().info('Database disconnected')
}

// Export base Prisma client for NextAuth adapter
// The PrismaAdapter doesn't work well with our enhanced client
// Lazy instantiation to avoid build-time side effects
const globalForBasePrisma = globalThis as unknown as {
  basePrisma: PrismaClient | undefined
}

// Only create during runtime, not build
export const basePrisma: PrismaClient = isBuildPhase
  ? (null as unknown as PrismaClient)
  : (globalForBasePrisma.basePrisma ??= new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    }))

// Admin Prisma client for auth operations (signup, password reset)
// Using DATABASE_URL (pooler) since DIRECT_URL (port 5432) is unreachable from Vercel serverless
const globalForPrismaAdmin = globalThis as unknown as {
  prismaAdmin: PrismaClient | undefined
}

export const prismaAdmin: PrismaClient = isBuildPhase
  ? (null as unknown as PrismaClient)
  : (globalForPrismaAdmin.prismaAdmin ??= new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    }))

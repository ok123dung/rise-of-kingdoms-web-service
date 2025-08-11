import { PrismaClient } from '@prisma/client'
import { getLogger } from '@/lib/monitoring/logger'

// Serverless-optimized Prisma configuration
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'minimal',
    // Serverless optimizations
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })
}

// Prevent multiple instances in serverless environment
export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Connection management for serverless
export async function ensureDbConnected(): Promise<void> {
  try {
    await prisma.$connect()
  } catch (error) {
    getLogger().error('Failed to connect to database', error instanceof Error ? error : new Error(String(error)))
    throw new Error('Database connection failed')
  }
}

// Disconnect helper for serverless cleanup
export async function disconnectDb(): Promise<void> {
  try {
    await prisma.$disconnect()
  } catch (error) {
    getLogger().error('Failed to disconnect from database', error instanceof Error ? error : new Error(String(error)))
  }
}

// Serverless-safe query wrapper
export async function queryWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: Error | null = null
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      await ensureDbConnected()
      return await operation()
    } catch (error) {
      lastError = error as Error
      getLogger().error('Database operation failed', error instanceof Error ? error : new Error(String(error)), { 
        attempt: i + 1,
        maxRetries 
      })
      
      // Check if it's a connection error
      if (error instanceof Error && error.message.includes('P1001')) {
        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
        continue
      }
      
      // If not a connection error, throw immediately
      throw error
    }
  }
  
  throw lastError || new Error('Database operation failed after retries')
}
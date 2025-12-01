import { headers } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface DiagnosticCheck {
  status?: string
  configured?: boolean
  hasPooling?: boolean
  hasConnectionLimit?: boolean
  provider?: string
  connectionTimeMs?: number
  isHealthy?: boolean
  queryTimeMs?: number
  error?: string
  errorCode?: string
  totalTables?: number
  missingTables?: string[]
  existingTables?: string[]
  activeConnections?: number
  note?: string
  NEXTAUTH_URL?: boolean
  NEXTAUTH_SECRET?: boolean
  NODE_ENV?: string
}

interface DiagnosticsResult {
  timestamp: string
  environment: string
  checks: Record<string, DiagnosticCheck>
  overallStatus?: string
  recommendations?: string[]
  quickFixUrl?: string
}

export async function GET(_request: NextRequest) {
  const headersList = headers()
  const authHeader = headersList.get('authorization')

  // Basic protection - only allow with secret header in production
  if (
    process.env.NODE_ENV === 'production' &&
    authHeader !== `Bearer ${process.env.NEXTAUTH_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const diagnostics: DiagnosticsResult = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV ?? 'unknown',
    checks: {}
  }

  // 1. Check DATABASE_URL exists
  diagnostics.checks.databaseUrl = {
    configured: !!process.env.DATABASE_URL,
    hasPooling: process.env.DATABASE_URL?.includes('pgbouncer=true') ?? false,
    hasConnectionLimit: process.env.DATABASE_URL?.includes('connection_limit=') ?? false,
    provider: detectDatabaseProvider(process.env.DATABASE_URL || '')
  }

  // 2. Check other required env vars
  diagnostics.checks.requiredEnvVars = {
    NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    NODE_ENV: process.env.NODE_ENV || 'not set'
  }

  // 3. Test database connection
  try {
    const startTime = Date.now()
    await prisma.$connect()
    const connectionTime = Date.now() - startTime

    diagnostics.checks.connection = {
      status: 'connected',
      connectionTimeMs: connectionTime,
      isHealthy: connectionTime < 5000 // Under 5 seconds is healthy
    }

    // 4. Test query execution
    try {
      const queryStart = Date.now()
      await prisma.$queryRaw`SELECT 1 as test`
      const queryTime = Date.now() - queryStart

      diagnostics.checks.query = {
        status: 'success',
        queryTimeMs: queryTime,
        isHealthy: queryTime < 1000 // Under 1 second is healthy
      }
    } catch (queryError) {
      diagnostics.checks.query = {
        status: 'failed',
        error: queryError instanceof Error ? queryError.message : 'Unknown query error'
      }
    }

    // 5. Check tables exist
    try {
      const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename;
      `

      const expectedTables = ['users', 'services', 'service_tiers', 'bookings', 'payments', 'leads']
      const existingTables = tables.map(t => t.tablename)
      const missingTables = expectedTables.filter(t => !existingTables.includes(t))

      diagnostics.checks.schema = {
        status: missingTables.length === 0 ? 'complete' : 'incomplete',
        totalTables: tables.length,
        missingTables,
        existingTables: existingTables.slice(0, 10) // First 10 for brevity
      }
    } catch (schemaError) {
      diagnostics.checks.schema = {
        status: 'error',
        error: schemaError instanceof Error ? schemaError.message : 'Unknown schema error'
      }
    }

    // 6. Check connection pool status
    try {
      const poolStatus = await prisma.$queryRaw<Array<{ count: number }>>`
        SELECT COUNT(*) as count 
        FROM pg_stat_activity 
        WHERE datname = current_database()
      `

      diagnostics.checks.connectionPool = {
        activeConnections: poolStatus[0]?.count || 0,
        status: 'healthy'
      }
    } catch (poolError) {
      diagnostics.checks.connectionPool = {
        status: 'unable to check',
        note: 'This is normal for some database providers'
      }
    }
  } catch (connectionError) {
    diagnostics.checks.connection = {
      status: 'failed',
      error:
        connectionError instanceof Error ? connectionError.message : 'Unknown connection error',
      errorCode:
        connectionError instanceof Error && 'code' in connectionError
          ? String((connectionError as Error & { code?: unknown }).code)
          : undefined
    }

    // Provide specific recommendations based on error
    if (connectionError instanceof Error) {
      diagnostics.recommendations = getRecommendations(connectionError.message)
    }
  } finally {
    try {
      await prisma.$disconnect()
    } catch (disconnectError) {
      diagnostics.checks.disconnect = {
        status: 'failed',
        error:
          disconnectError instanceof Error ? disconnectError.message : 'Unknown disconnect error'
      }
    }
  }

  // Overall health status
  diagnostics.overallStatus = determineOverallStatus(diagnostics.checks)

  // Add quick fix URL if unhealthy
  if (diagnostics.overallStatus !== 'healthy') {
    diagnostics.quickFixUrl = '/VERCEL-DEPLOYMENT-FIX.md'
  }

  return NextResponse.json(diagnostics, {
    status: diagnostics.overallStatus === 'healthy' ? 200 : 503
  })
}

function detectDatabaseProvider(url: string): string {
  if (url.includes('supabase.co')) return 'Supabase'
  if (url.includes('railway.app') || url.includes('rlwy.net')) return 'Railway'
  if (url.includes('neon.tech')) return 'Neon'
  if (url.includes('amazonaws.com')) return 'AWS RDS'
  if (url.includes('planetscale')) return 'PlanetScale'
  if (url.includes('localhost') || url.includes('127.0.0.1')) return 'Local'
  return 'Unknown'
}

function getRecommendations(errorMessage: string): string[] {
  const recommendations = []

  if (errorMessage.includes('P1001') || errorMessage.includes('connect')) {
    recommendations.push('Ensure DATABASE_URL is set in Vercel environment variables')
    recommendations.push('Add connection pooling: ?pgbouncer=true&connection_limit=1')
    recommendations.push('Verify database server is accessible from Vercel')
  }

  if (errorMessage.includes('timeout')) {
    recommendations.push('Add connection timeout: ?connect_timeout=30')
    recommendations.push('Ensure database region is close to Vercel deployment region')
  }

  if (errorMessage.includes('SSL') || errorMessage.includes('certificate')) {
    recommendations.push('Add SSL mode to DATABASE_URL: ?sslmode=require')
    recommendations.push('For some providers, try: ?ssl=true')
  }

  if (errorMessage.includes('too many connections')) {
    recommendations.push('Enable connection pooling: ?pgbouncer=true')
    recommendations.push('Limit connections: ?connection_limit=1')
    recommendations.push('Consider upgrading database plan for more connections')
  }

  return recommendations
}

function determineOverallStatus(checks: Record<string, DiagnosticCheck>): string {
  // Critical checks
  if (!checks.databaseUrl?.configured) return 'critical'
  if (checks.connection?.status !== 'connected') return 'unhealthy'
  if (checks.query?.status !== 'success') return 'unhealthy'
  if (
    checks.schema?.status === 'incomplete' &&
    checks.schema?.missingTables &&
    checks.schema.missingTables.length > 0
  )
    return 'warning'

  // Performance checks
  if (checks.connection?.connectionTimeMs && checks.connection.connectionTimeMs > 10000)
    return 'degraded'
  if (checks.query?.queryTimeMs && checks.query.queryTimeMs > 2000) return 'degraded'

  return 'healthy'
}

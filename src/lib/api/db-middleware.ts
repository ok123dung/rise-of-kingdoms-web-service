import { NextResponse } from 'next/server'

import { basePrisma as prisma } from '@/lib/db'
import { getLogger } from '@/lib/monitoring/logger'

import type { NextRequest } from 'next/server'

export interface DatabaseErrorResponse {
  success: false
  message: string
  error_code: string
  help_url?: string
  details?: unknown
}

export type ApiHandler<T = unknown> = (
  request: NextRequest,
  context?: { params?: Record<string, string> }
) => Promise<NextResponse<T | DatabaseErrorResponse>>

/**
 * Database connection middleware for API routes
 * Checks database configuration and connection before executing the handler
 */
export function withDatabaseConnection<T = unknown>(
  handler: ApiHandler<T>
): ApiHandler<T | DatabaseErrorResponse> {
  return async (request: NextRequest, context?: { params?: Record<string, string> }) => {
    const logger = getLogger()

    try {
      // Check if database is configured
      if (!process.env.DATABASE_URL) {
        logger.error('DATABASE_URL not configured')
        return NextResponse.json(
          {
            success: false,
            message:
              'Database not configured. Please set DATABASE_URL environment variable in Vercel Dashboard.',
            error_code: 'DB_NOT_CONFIGURED',
            help_url:
              'https://github.com/ok123dung/rok-services/blob/main/docs/VERCEL_DATABASE_SETUP.md'
          },
          { status: 503 }
        )
      }

      // Test database connection
      try {
        await prisma.$connect()
        await prisma.$queryRaw`SELECT 1`
      } catch (dbError) {
        logger.error('Database connection failed', dbError as Error)

        const errorInfo: DatabaseErrorResponse = {
          success: false,
          error_code: 'DB_CONNECTION_FAILED',
          message:
            'Unable to connect to database. This is usually due to missing or incorrect DATABASE_URL configuration.'
        }

        // Provide helpful error messages based on error type
        if (dbError instanceof Error) {
          if (dbError.message.includes('ENOTFOUND')) {
            errorInfo.message =
              'Database host not found. Check your DATABASE_URL host configuration.'
            errorInfo.error_code = 'DB_HOST_NOT_FOUND'
          } else if (dbError.message.includes('password authentication failed')) {
            errorInfo.message = 'Database authentication failed. Check your DATABASE_URL password.'
            errorInfo.error_code = 'DB_AUTH_FAILED'
          } else if (
            dbError.message.includes('database') &&
            dbError.message.includes('does not exist')
          ) {
            errorInfo.message = 'Database does not exist. Check your DATABASE_URL database name.'
            errorInfo.error_code = 'DB_NOT_EXISTS'
          } else if (dbError.message.includes('SELF_SIGNED_CERT_IN_CHAIN')) {
            errorInfo.message = 'SSL certificate error. Add ?sslmode=require to your DATABASE_URL.'
            errorInfo.error_code = 'DB_SSL_ERROR'
          }

          errorInfo.details = {
            message: dbError.message,
            name: dbError.name
          }
        }

        return NextResponse.json(errorInfo, { status: 503 })
      }

      // Connection successful, proceed with the handler
      return handler(request, context)
    } catch (error) {
      logger.error('Unexpected error in database middleware', error as Error)
      return NextResponse.json(
        {
          success: false,
          message: 'Internal server error',
          error_code: 'INTERNAL_ERROR'
        },
        { status: 500 }
      )
    } finally {
      // Ensure connection is cleaned up
      try {
        await prisma.$disconnect()
      } catch (disconnectError) {
        logger.warn('Error disconnecting from database')
      }
    }
  }
}

/**
 * Higher-order function to create database-aware API handlers
 */
export const createDatabaseHandler = withDatabaseConnection

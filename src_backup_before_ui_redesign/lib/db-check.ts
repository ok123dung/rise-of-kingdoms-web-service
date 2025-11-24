import { NextResponse } from 'next/server'

import { prisma } from '@/lib/db'
import { getLogger } from '@/lib/monitoring/logger'

export async function checkDatabaseConnection() {
  // Check if database is configured
  if (!process.env.DATABASE_URL) {
    getLogger().error('DATABASE_URL not configured')
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
    return null // Connection successful
  } catch (dbError) {
    getLogger().error('Database connection failed', dbError as Error)

    const errorInfo: any = {
      success: false,
      error_code: 'DB_CONNECTION_FAILED',
      message:
        'Unable to connect to database. This is usually due to missing or incorrect DATABASE_URL configuration.'
    }

    // Provide helpful error messages based on error type
    if (dbError instanceof Error) {
      if (dbError.message.includes('P1001')) {
        errorInfo.message =
          'Cannot reach database server. Please check DATABASE_URL and ensure it includes connection pooling parameters.'
        errorInfo.hint = 'Add ?pgbouncer=true&connection_limit=1 to your DATABASE_URL'
      } else if (dbError.message.includes('P1002')) {
        errorInfo.message =
          'Database server reached timeout. This usually happens with serverless databases that need to wake up.'
        errorInfo.hint =
          'Try again in a few seconds or consider using a different database provider.'
      } else if (
        dbError.message.includes('authentication') ||
        dbError.message.includes('password')
      ) {
        errorInfo.message = 'Invalid database credentials. Please check your DATABASE_URL.'
        errorInfo.hint = 'Ensure the username, password, and database name are correct.'
      } else if (dbError.message.includes('P1003')) {
        errorInfo.message = 'Database does not exist. Please create the database first.'
        errorInfo.hint =
          'Run "prisma db push" or "prisma migrate deploy" to create the database schema.'
      }

      // Include technical details in development
      if (process.env.NODE_ENV === 'development') {
        errorInfo.technical_details = dbError.message
      }
    }

    errorInfo.help_url =
      'https://github.com/ok123dung/rok-services/blob/main/docs/VERCEL_DATABASE_SETUP.md'

    return NextResponse.json(errorInfo, { status: 503 })
  }
}



import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function GET() {
    const dbUrl = process.env.DATABASE_URL
    const directUrl = process.env.DIRECT_URL

    const response: any = {
        timestamp: new Date().toISOString(),
        environment: {
            NODE_ENV: process.env.NODE_ENV,
            VERCEL: process.env.VERCEL,
            DATABASE_URL_SET: !!dbUrl,
            DIRECT_URL_SET: !!directUrl,
            DATABASE_URL_FORMAT: dbUrl ? 'postgresql://...' : 'NOT_SET',
            DATABASE_URL_LENGTH: dbUrl?.length || 0,
            DATABASE_URL_MASKED: dbUrl?.replace(/:[^:]*@/, ':****@').substring(0, 100) || 'NOT_SET'
        }
    }

    if (!dbUrl) {
        response.error = 'DATABASE_URL is not set'
        return NextResponse.json(response, { status: 500 })
    }

    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: dbUrl
            }
        },
        log: ['query', 'info', 'warn', 'error']
    })

    try {
        console.log('[DEBUG-DB] Attempting connection...')
        await prisma.$connect()
        console.log('[DEBUG-DB] Connection successful')

        const result = await prisma.$queryRaw`SELECT 1 as result, current_database() as db, version() as version`
        console.log('[DEBUG-DB] Query successful:', result)

        await prisma.$disconnect()

        response.success = true
        response.message = 'Connection successful'
        response.result = result

        return NextResponse.json(response)
    } catch (error: any) {
        console.error('[DEBUG-DB] Connection failed:', error)

        response.success = false
        response.message = 'Connection failed'
        response.error = {
            name: error.name,
            message: error.message,
            code: error.code,
            meta: error.meta,
            stack: error.stack?.split('\n').slice(0, 5)
        }

        return NextResponse.json(response, { status: 500 })
    }
}

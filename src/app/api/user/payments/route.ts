import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getLogger } from '@/lib/monitoring/logger'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    interface PaymentWhereClause {
      booking: {
        user_id: string
      }
      status?: string
    }

    const whereClause: PaymentWhereClause = {
      booking: {
        user_id: session.user.id
      }
    }

    if (status) {
      whereClause.status = status
    }

    const payments = await prisma.payments.findMany({
      where: whereClause,
      include: {
        booking: {
          include: {
            service_tiers: {
              include: {
                service: true
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      payments
    })
  } catch (error) {
    getLogger().error('Error fetching user payments', error as Error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}

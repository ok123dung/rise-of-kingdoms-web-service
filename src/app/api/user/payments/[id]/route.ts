import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getLogger } from '@/lib/monitoring/logger'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const payment = await prisma.payment.findUnique({
      where: {
        id: params.id
      },
      include: {
        booking: {
          include: {
            user: true,
            serviceTier: {
              include: {
                service: true
              }
            }
          }
        }
      }
    })

    if (!payment) {
      return NextResponse.json(
        { success: false, message: 'Payment not found' },
        { status: 404 }
      )
    }

    // Check if payment belongs to user
    if (payment.booking.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      payment
    })
  } catch (error) {
    getLogger().error('Error fetching payment detail', error as Error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch payment' },
      { status: 500 }
    )
  }
}
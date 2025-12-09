import { Prisma } from '@prisma/client'

import { generateSecureNumericCode } from '@/lib/crypto-utils'
import { prisma } from '@/lib/db'
import { NotFoundError, ValidationError, ConflictError } from '@/lib/errors'
import { getLogger } from '@/lib/monitoring/logger'
import { BookingStatus, PaymentStatus } from '@/types/enums'

export class BookingService {
  private logger = getLogger()

  /**
   * Create a new booking
   */
  async createBooking(data: {
    user_id: string
    service_tier_id: string
    customer_requirements?: string
    scheduledDate?: Date
    notes?: string
  }): Promise<unknown> {
    return prisma.$transaction(async tx => {
      // Validate service tier exists
      const service_tiers = await this.getServiceTier(data.service_tier_id)

      // Check if user has active booking for same service
      // Note: We use the transaction client 'tx' here to ensure consistency
      const existingBookingCount = await tx.bookings.count({
        where: {
          user_id: data.user_id,
          service_tiers: { service_id: service_tiers.service_id },
          status: {
            in: [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS]
          }
        }
      })

      if (existingBookingCount > 0) {
        throw new ConflictError('User already has an active booking for this service')
      }

      // Generate booking number
      const booking_number = this.generateBookingNumber()

      // Create booking
      const booking = await tx.bookings.create({
        data: {
          booking_number,
          user_id: data.user_id,
          service_tier_id: data.service_tier_id,
          status: BookingStatus.PENDING,
          payment_status: PaymentStatus.PENDING,
          total_amount: new Prisma.Decimal(
            typeof service_tiers.price === 'number'
              ? service_tiers.price
              : service_tiers.price.toNumber()
          ),
          final_amount: new Prisma.Decimal(
            typeof service_tiers.price === 'number'
              ? service_tiers.price
              : service_tiers.price.toNumber()
          ),
          currency: 'VND',
          customer_requirements: data.customer_requirements,
          start_date: data.scheduledDate,
          internal_notes: data.notes,
          id: crypto.randomUUID(),
          updated_at: new Date()
        },
        include: {
          users: true,
          service_tiers: {
            include: { services: true }
          }
        }
      })

      this.logger.info('Booking created', {
        booking_id: booking.id,
        user_id: data.user_id,
        service_tier_id: data.service_tier_id
      })

      return booking
    })
  }

  /**
   * Get booking by ID
   */
  async getBookingById(booking_id: string, user_id?: string) {
    const booking = await prisma.bookings.findUnique({
      where: { id: booking_id },
      include: {
        users: true,
        service_tiers: {
          include: { services: true }
        },
        payments: true
      }
    })

    if (!booking) {
      throw new NotFoundError('Booking')
    }

    // Check ownership if user_id provided
    if (user_id && booking.user_id !== user_id) {
      throw new ValidationError('Unauthorized access to booking')
    }

    return booking
  }

  /**
   * Get user bookings
   */
  async getUserBookings(
    user_id: string,
    options?: {
      status?: string
      limit?: number
      offset?: number
    }
  ) {
    interface BookingWhereInput {
      user_id: string
      status?: string
    }

    const where: BookingWhereInput = { user_id }

    if (options?.status) {
      where.status = options.status
    }

    const [bookings, total] = await Promise.all([
      prisma.bookings.findMany({
        where,
        include: {
          service_tiers: {
            include: { services: true }
          },
          payments: true
        },
        orderBy: { created_at: 'desc' },
        take: options?.limit ?? 10,
        skip: options?.offset ?? 0
      }),
      prisma.bookings.count({ where })
    ])

    return { bookings, total }
  }

  /**
   * Update booking status
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateBookingStatus(
    booking_id: string,
    status: string,
    options?: {
      user_id?: string
      notes?: string
    }
  ): Promise<unknown> {
    const booking = await this.getBookingById(booking_id, options?.user_id)

    const updated = await prisma.bookings.update({
      where: { id: booking_id },
      data: {
        status,
        internal_notes: options?.notes
          ? `${booking.internal_notes}\n[${new Date().toISOString()}] ${options.notes}`
          : booking.internal_notes
      },
      include: {
        users: true,
        service_tiers: {
          include: { services: true }
        }
      }
    })

    this.logger.info('Booking status updated', {
      booking_id,
      oldStatus: booking.status,
      newStatus: status
    })

    return updated
  }

  /**
   * Cancel booking
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async cancelBooking(booking_id: string, user_id: string, reason: string): Promise<unknown> {
    const booking = await this.getBookingById(booking_id, user_id)

    // Check if booking can be cancelled
    if (
      [BookingStatus.COMPLETED, BookingStatus.CANCELLED].includes(booking.status as BookingStatus)
    ) {
      throw new ValidationError('Booking cannot be cancelled')
    }

    const updated = await prisma.bookings.update({
      where: { id: booking_id },
      data: {
        status: BookingStatus.CANCELLED,
        internal_notes: reason ? `Cancelled: ${reason}` : 'Booking cancelled'
      },
      include: {
        users: true,
        service_tiers: {
          include: { services: true }
        }
      }
    })

    this.logger.info('Booking cancelled', {
      booking_id,
      user_id,
      reason
    })

    return updated
  }

  /**
   * Private helper methods
   */
  private async getServiceTier(service_tier_id: string): Promise<
    Prisma.service_tiersGetPayload<{
      include: { services: true }
    }>
  > {
    const service_tiers = await prisma.service_tiers.findUnique({
      where: { id: service_tier_id },
      include: { services: true }
    })

    if (!service_tiers) {
      throw new NotFoundError('Service tier')
    }

    if (!service_tiers.is_available) {
      throw new ValidationError('Service tier is not available')
    }

    return service_tiers
  }

  // checkExistingBooking method is removed as it's now integrated into the transaction within createBooking

  private generateBookingNumber(): string {
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const random = generateSecureNumericCode(4)

    return `BK${year}${month}${day}${random}`
  }
}

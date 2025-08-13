import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { NotFoundError, ValidationError, ConflictError } from '@/lib/errors'
import { getLogger } from '@/lib/monitoring/logger'
import { generateSecureNumericCode } from '@/lib/crypto-utils'
import type { Booking, ServiceTier, User } from '@/types/database'

export class BookingService {
  private logger = getLogger()

  /**
   * Create a new booking
   */
  async createBooking(data: {
    userId: string
    serviceTierId: string
    customerRequirements?: string
    scheduledDate?: Date
    notes?: string
  }): Promise<Booking> {
    // Validate service tier exists
    const serviceTier = await this.getServiceTier(data.serviceTierId)
    
    // Check if user has active booking for same service
    const existingBooking = await this.checkExistingBooking(data.userId, serviceTier.serviceId)
    if (existingBooking) {
      throw new ConflictError('User already has an active booking for this service')
    }

    // Generate booking number
    const bookingNumber = await this.generateBookingNumber()

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        userId: data.userId,
        serviceTierId: data.serviceTierId,
        status: 'pending',
        paymentStatus: 'pending',
        totalAmount: new Prisma.Decimal(typeof serviceTier.price === 'number' ? serviceTier.price : serviceTier.price.toNumber()),
        finalAmount: new Prisma.Decimal(typeof serviceTier.price === 'number' ? serviceTier.price : serviceTier.price.toNumber()),
        currency: 'VND',
        customerRequirements: data.customerRequirements,
        startDate: data.scheduledDate,
        internalNotes: data.notes
      },
      include: {
        user: true,
        serviceTier: {
          include: { service: true }
        }
      }
    })

    this.logger.info('Booking created', { 
      bookingId: booking.id, 
      userId: data.userId,
      serviceTierId: data.serviceTierId 
    })

    return booking
  }

  /**
   * Get booking by ID
   */
  async getBookingById(bookingId: string, userId?: string): Promise<Booking> {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        serviceTier: {
          include: { service: true }
        },
        payments: true
      }
    })

    if (!booking) {
      throw new NotFoundError('Booking')
    }

    // Check ownership if userId provided
    if (userId && booking.userId !== userId) {
      throw new ValidationError('Unauthorized access to booking')
    }

    return booking
  }

  /**
   * Get user bookings
   */
  async getUserBookings(userId: string, options?: {
    status?: string
    limit?: number
    offset?: number
  }) {
    const where: any = { userId }
    
    if (options?.status) {
      where.status = options.status
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          serviceTier: {
            include: { service: true }
        },
        payments: true
      },
        orderBy: { createdAt: 'desc' },
        take: options?.limit || 10,
        skip: options?.offset || 0
      }),
      prisma.booking.count({ where })
    ])

    return { bookings, total }
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(
    bookingId: string,
    status: string,
    options?: { 
      userId?: string
      notes?: string 
    }
  ): Promise<Booking> {
    const booking = await this.getBookingById(bookingId, options?.userId)

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status,
        internalNotes: options?.notes 
          ? `${booking.internalNotes}\n[${new Date().toISOString()}] ${options.notes}`
          : booking.internalNotes
      },
      include: {
        user: true,
        serviceTier: {
          include: { service: true }
        }
      }
    })

    this.logger.info('Booking status updated', {
      bookingId,
      oldStatus: booking.status,
      newStatus: status
    })

    return updated
  }

  /**
   * Cancel booking
   */
  async cancelBooking(
    bookingId: string,
    userId: string,
    reason: string
  ): Promise<Booking> {
    const booking = await this.getBookingById(bookingId, userId)

    // Check if booking can be cancelled
    if (['completed', 'cancelled'].includes(booking.status)) {
      throw new ValidationError('Booking cannot be cancelled')
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'cancelled',
        internalNotes: reason ? `Cancelled: ${reason}` : 'Booking cancelled'
      },
      include: {
        user: true,
        serviceTier: {
          include: { service: true }
        }
      }
    })

    this.logger.info('Booking cancelled', {
      bookingId,
      userId,
      reason
    })

    return updated
  }

  /**
   * Private helper methods
   */
  private async getServiceTier(serviceTierId: string): Promise<ServiceTier> {
    const serviceTier = await prisma.serviceTier.findUnique({
      where: { id: serviceTierId },
      include: { service: true }
    })

    if (!serviceTier) {
      throw new NotFoundError('Service tier')
    }

    if (!serviceTier.isAvailable) {
      throw new ValidationError('Service tier is not available')
    }

    return serviceTier
  }

  private async checkExistingBooking(
    userId: string,
    serviceId: string
  ): Promise<boolean> {
    const count = await prisma.booking.count({
      where: {
        userId,
        serviceTier: { serviceId },
        status: {
          in: ['pending', 'confirmed', 'in_progress']
        }
      }
    })

    return count > 0
  }

  private async generateBookingNumber(): Promise<string> {
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const random = generateSecureNumericCode(4)
    
    return `BK${year}${month}${day}${random}`
  }
}
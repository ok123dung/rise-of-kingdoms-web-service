/**
 * Booking Service Tests
 * Tests for booking CRUD operations and business logic
 */

import { Prisma } from '@prisma/client'

import { BookingService } from '../booking.service'
import { NotFoundError, ValidationError, ConflictError } from '@/lib/errors'
import { BookingStatus, PaymentStatus } from '@/types/enums'

// Mock dependencies
jest.mock('@/lib/db', () => ({
  prisma: {
    $transaction: jest.fn(),
    bookings: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    service_tiers: {
      findUnique: jest.fn(),
    },
  },
}))

jest.mock('@/lib/monitoring/logger', () => ({
  getLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}))

jest.mock('@/lib/crypto-utils', () => ({
  generateSecureNumericCode: jest.fn(() => '1234'),
}))

// Import mocked prisma
import { prisma } from '@/lib/db'

const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('BookingService', () => {
  let service: BookingService

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    full_name: 'Test User',
  }

  const mockServiceTier = {
    id: 'tier-123',
    service_id: 'service-123',
    name: 'Premium',
    price: new Prisma.Decimal(500000),
    is_available: true,
    services: {
      id: 'service-123',
      name: 'Account Upgrade',
    },
  }

  const mockBooking = {
    id: 'booking-123',
    booking_number: 'BK241230001234',
    user_id: 'user-123',
    service_tier_id: 'tier-123',
    status: BookingStatus.PENDING,
    payment_status: PaymentStatus.PENDING,
    total_amount: new Prisma.Decimal(500000),
    final_amount: new Prisma.Decimal(500000),
    currency: 'VND',
    customer_requirements: 'Test requirements',
    internal_notes: null,
    start_date: null,
    created_at: new Date(),
    updated_at: new Date(),
    users: mockUser,
    service_tiers: mockServiceTier,
  }

  beforeEach(() => {
    service = new BookingService()
    jest.clearAllMocks()
  })

  describe('createBooking', () => {
    it('should create a new booking successfully', async () => {
      const txMock = {
        bookings: {
          count: jest.fn().mockResolvedValue(0),
          create: jest.fn().mockResolvedValue(mockBooking),
        },
      }

      mockPrisma.$transaction.mockImplementation(async (callback: Function) => {
        return callback(txMock)
      })

      mockPrisma.service_tiers.findUnique.mockResolvedValue(mockServiceTier as any)

      const result = await service.createBooking({
        user_id: 'user-123',
        service_tier_id: 'tier-123',
        customer_requirements: 'Test requirements',
      })

      expect(result).toBeDefined()
      expect(txMock.bookings.create).toHaveBeenCalled()
    })

    it('should throw ConflictError if user has active booking for same service', async () => {
      const txMock = {
        bookings: {
          count: jest.fn().mockResolvedValue(1),
        },
      }

      mockPrisma.$transaction.mockImplementation(async (callback: Function) => {
        return callback(txMock)
      })

      mockPrisma.service_tiers.findUnique.mockResolvedValue(mockServiceTier as any)

      await expect(
        service.createBooking({
          user_id: 'user-123',
          service_tier_id: 'tier-123',
        })
      ).rejects.toThrow(ConflictError)
    })

    it('should throw NotFoundError if service tier not found', async () => {
      mockPrisma.service_tiers.findUnique.mockResolvedValue(null)

      await expect(
        service.createBooking({
          user_id: 'user-123',
          service_tier_id: 'nonexistent-tier',
        })
      ).rejects.toThrow(NotFoundError)
    })

    it('should throw ValidationError if service tier is not available', async () => {
      mockPrisma.service_tiers.findUnique.mockResolvedValue({
        ...mockServiceTier,
        is_available: false,
      } as any)

      await expect(
        service.createBooking({
          user_id: 'user-123',
          service_tier_id: 'tier-123',
        })
      ).rejects.toThrow(ValidationError)
    })
  })

  describe('getBookingById', () => {
    it('should return booking when found', async () => {
      mockPrisma.bookings.findUnique.mockResolvedValue(mockBooking as any)

      const result = await service.getBookingById('booking-123')

      expect(result).toEqual(mockBooking)
      expect(mockPrisma.bookings.findUnique).toHaveBeenCalledWith({
        where: { id: 'booking-123' },
        include: expect.any(Object),
      })
    })

    it('should throw NotFoundError when booking not found', async () => {
      mockPrisma.bookings.findUnique.mockResolvedValue(null)

      await expect(service.getBookingById('nonexistent')).rejects.toThrow(NotFoundError)
    })

    it('should throw ValidationError when user_id does not match', async () => {
      mockPrisma.bookings.findUnique.mockResolvedValue(mockBooking as any)

      await expect(
        service.getBookingById('booking-123', 'different-user')
      ).rejects.toThrow(ValidationError)
    })

    it('should return booking when user_id matches', async () => {
      mockPrisma.bookings.findUnique.mockResolvedValue(mockBooking as any)

      const result = await service.getBookingById('booking-123', 'user-123')

      expect(result).toEqual(mockBooking)
    })
  })

  describe('getUserBookings', () => {
    it('should return user bookings with pagination', async () => {
      const bookings = [mockBooking]
      mockPrisma.bookings.findMany.mockResolvedValue(bookings as any)
      mockPrisma.bookings.count.mockResolvedValue(1)

      const result = await service.getUserBookings('user-123', {
        limit: 10,
        offset: 0,
      })

      expect(result.bookings).toEqual(bookings)
      expect(result.total).toBe(1)
    })

    it('should filter by status when provided', async () => {
      mockPrisma.bookings.findMany.mockResolvedValue([])
      mockPrisma.bookings.count.mockResolvedValue(0)

      await service.getUserBookings('user-123', { status: BookingStatus.PENDING })

      expect(mockPrisma.bookings.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: 'user-123', status: BookingStatus.PENDING },
        })
      )
    })

    it('should use default pagination when not provided', async () => {
      mockPrisma.bookings.findMany.mockResolvedValue([])
      mockPrisma.bookings.count.mockResolvedValue(0)

      await service.getUserBookings('user-123')

      expect(mockPrisma.bookings.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          skip: 0,
        })
      )
    })
  })

  describe('updateBookingStatus', () => {
    it('should update booking status successfully', async () => {
      mockPrisma.bookings.findUnique.mockResolvedValue(mockBooking as any)
      mockPrisma.bookings.update.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.CONFIRMED,
      } as any)

      const result = await service.updateBookingStatus('booking-123', BookingStatus.CONFIRMED)

      expect(result.status).toBe(BookingStatus.CONFIRMED)
      expect(mockPrisma.bookings.update).toHaveBeenCalledWith({
        where: { id: 'booking-123' },
        data: expect.objectContaining({ status: BookingStatus.CONFIRMED }),
        include: expect.any(Object),
      })
    })

    it('should append notes when provided', async () => {
      mockPrisma.bookings.findUnique.mockResolvedValue(mockBooking as any)
      mockPrisma.bookings.update.mockResolvedValue(mockBooking as any)

      await service.updateBookingStatus('booking-123', BookingStatus.CONFIRMED, {
        notes: 'Status update note',
      })

      expect(mockPrisma.bookings.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            internal_notes: expect.stringContaining('Status update note'),
          }),
        })
      )
    })
  })

  describe('cancelBooking', () => {
    it('should cancel booking successfully', async () => {
      mockPrisma.bookings.findUnique.mockResolvedValue(mockBooking as any)
      mockPrisma.bookings.update.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.CANCELLED,
      } as any)

      const result = await service.cancelBooking('booking-123', 'user-123', 'Changed my mind')

      expect(result.status).toBe(BookingStatus.CANCELLED)
    })

    it('should throw ValidationError when booking is already completed', async () => {
      mockPrisma.bookings.findUnique.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.COMPLETED,
      } as any)

      await expect(
        service.cancelBooking('booking-123', 'user-123', 'Reason')
      ).rejects.toThrow(ValidationError)
    })

    it('should throw ValidationError when booking is already cancelled', async () => {
      mockPrisma.bookings.findUnique.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.CANCELLED,
      } as any)

      await expect(
        service.cancelBooking('booking-123', 'user-123', 'Reason')
      ).rejects.toThrow(ValidationError)
    })

    it('should throw ValidationError when user does not own booking', async () => {
      mockPrisma.bookings.findUnique.mockResolvedValue(mockBooking as any)

      await expect(
        service.cancelBooking('booking-123', 'different-user', 'Reason')
      ).rejects.toThrow(ValidationError)
    })
  })
})

/**
 * Dashboard Service Tests
 * Tests for customer dashboard data aggregation
 */

import { DashboardService } from '../dashboard.service'
import { BookingStatus, PaymentStatus } from '@/types/enums'

// Mock dependencies
jest.mock('@/lib/db', () => ({
  prisma: {
    bookings: {
      count: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    payments: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    users: {
      findUnique: jest.fn(),
    },
    services: {
      findMany: jest.fn(),
    },
  },
}))

import { prisma } from '@/lib/db'

const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('DashboardService', () => {
  let service: DashboardService

  const mockUser = {
    id: 'user-123',
    created_at: new Date('2024-01-01'),
  }

  const mockService = {
    id: 'service-123',
    name: 'Test Service',
    slug: 'test-service',
    description: 'Test description',
    short_description: 'Short desc',
    base_price: 1000000,
    category: 'gaming',
    is_featured: true,
    is_active: true,
  }

  const mockServiceTier = {
    id: 'tier-123',
    name: 'Basic Tier',
    price: 500000,
    service_id: 'service-123',
    services: mockService,
  }

  const mockBooking = {
    id: 'booking-123',
    booking_number: 'BK-001',
    user_id: 'user-123',
    status: BookingStatus.IN_PROGRESS,
    start_date: new Date('2024-06-01'),
    end_date: new Date('2024-06-30'),
    completion_percentage: 50,
    created_at: new Date('2024-05-01'),
    service_tiers: mockServiceTier,
  }

  const mockPayment = {
    id: 'payment-123',
    payment_number: 'PM-001',
    booking_id: 'booking-123',
    amount: 500000,
    status: PaymentStatus.COMPLETED,
    payment_method: 'bank_transfer',
    created_at: new Date('2024-05-15'),
    paid_at: new Date('2024-05-15'),
    bookings: {
      ...mockBooking,
      service_tiers: mockServiceTier,
    },
  }

  beforeEach(() => {
    service = new DashboardService()
    jest.clearAllMocks()
  })

  describe('getCustomerDashboardData', () => {
    beforeEach(() => {
      // Setup default mocks for parallel queries
      mockPrisma.bookings.count
        .mockResolvedValueOnce(10) // totalBookings
        .mockResolvedValueOnce(3) // activeServices
        .mockResolvedValueOnce(7) // completedServices

      mockPrisma.payments.findMany
        .mockResolvedValueOnce([{ amount: 500000 }, { amount: 750000 }] as any) // payments for totalSpent
        .mockResolvedValueOnce([mockPayment] as any) // recentPaymentsData

      mockPrisma.users.findUnique.mockResolvedValue(mockUser as any)

      mockPrisma.bookings.findFirst
        .mockResolvedValueOnce({ created_at: new Date('2024-05-01') } as any) // lastBooking
        .mockResolvedValueOnce({ start_date: new Date('2024-07-01') } as any) // upcomingBooking

      mockPrisma.payments.findFirst.mockResolvedValue({
        paid_at: new Date('2024-05-15'),
      } as any)

      mockPrisma.bookings.findMany.mockResolvedValue([mockBooking] as any)

      mockPrisma.services.findMany.mockResolvedValue([
        {
          ...mockService,
          service_tiers: [mockServiceTier],
        },
      ] as any)
    })

    it('should return complete dashboard data', async () => {
      const result = await service.getCustomerDashboardData('user-123')

      expect(result).toHaveProperty('stats')
      expect(result).toHaveProperty('activeBookings')
      expect(result).toHaveProperty('recentPayments')
      expect(result).toHaveProperty('recommendations')
    })

    it('should calculate stats correctly', async () => {
      const result = await service.getCustomerDashboardData('user-123')

      expect(result.stats.totalBookings).toBe(10)
      expect(result.stats.activeServices).toBe(3)
      expect(result.stats.completedServices).toBe(7)
      expect(result.stats.totalSpent).toBe(1250000)
    })

    it('should calculate tier progress correctly', async () => {
      const result = await service.getCustomerDashboardData('user-123')

      // totalSpent = 1,250,000 / 20,000,000 * 100 = 6.25%
      expect(result.stats.currentTierProgress).toBeCloseTo(6.25, 2)
      expect(result.stats.nextTierThreshold).toBe(20000000)
    })

    it('should cap tier progress at 100%', async () => {
      mockPrisma.payments.findMany
        .mockReset()
        .mockResolvedValueOnce([{ amount: 25000000 }] as any)
        .mockResolvedValueOnce([mockPayment] as any)

      const result = await service.getCustomerDashboardData('user-123')

      expect(result.stats.currentTierProgress).toBe(100)
    })

    it('should include member since date', async () => {
      const result = await service.getCustomerDashboardData('user-123')

      expect(result.stats.memberSince).toBe('2024-01-01T00:00:00.000Z')
    })

    it('should handle missing user gracefully', async () => {
      mockPrisma.users.findUnique.mockResolvedValue(null)

      const result = await service.getCustomerDashboardData('user-123')

      // Should use current date as fallback
      expect(result.stats.memberSince).toBeDefined()
    })

    it('should include recent activity', async () => {
      const result = await service.getCustomerDashboardData('user-123')

      expect(result.stats.recentActivity).toHaveProperty('lastBooking')
      expect(result.stats.recentActivity).toHaveProperty('lastPayment')
      expect(result.stats.recentActivity).toHaveProperty('upcomingService')
    })

    it('should handle null recent activity values', async () => {
      mockPrisma.bookings.findFirst
        .mockReset()
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
      mockPrisma.payments.findFirst.mockResolvedValue(null)

      const result = await service.getCustomerDashboardData('user-123')

      expect(result.stats.recentActivity.lastBooking).toBeNull()
      expect(result.stats.recentActivity.lastPayment).toBeNull()
      expect(result.stats.recentActivity.upcomingService).toBeNull()
    })

    it('should map active bookings correctly', async () => {
      const result = await service.getCustomerDashboardData('user-123')

      expect(result.activeBookings).toHaveLength(1)
      expect(result.activeBookings[0]).toEqual({
        id: 'booking-123',
        booking_number: 'BK-001',
        serviceName: 'Test Service',
        tierName: 'Basic Tier',
        status: BookingStatus.IN_PROGRESS,
        start_date: '2024-06-01T00:00:00.000Z',
        end_date: '2024-06-30T00:00:00.000Z',
        progress: 50,
        nextSession: undefined,
        assignedStaff: null,
      })
    })

    it('should handle bookings with null dates', async () => {
      mockPrisma.bookings.findMany.mockResolvedValue([
        {
          ...mockBooking,
          start_date: null,
          end_date: null,
        },
      ] as any)

      const result = await service.getCustomerDashboardData('user-123')

      expect(result.activeBookings[0].start_date).toBeNull()
      expect(result.activeBookings[0].end_date).toBeNull()
    })

    it('should map recent payments correctly', async () => {
      const result = await service.getCustomerDashboardData('user-123')

      expect(result.recentPayments).toHaveLength(1)
      expect(result.recentPayments[0]).toEqual({
        id: 'payment-123',
        payment_number: 'PM-001',
        booking_id: 'booking-123',
        serviceName: 'Test Service',
        amount: 500000,
        status: PaymentStatus.COMPLETED,
        method: 'bank_transfer',
        created_at: expect.any(String),
        paid_at: expect.any(String),
      })
    })

    it('should handle payments with null paid_at', async () => {
      mockPrisma.payments.findMany
        .mockReset()
        .mockResolvedValueOnce([{ amount: 500000 }] as any)
        .mockResolvedValueOnce([
          {
            ...mockPayment,
            paid_at: null,
          },
        ] as any)

      const result = await service.getCustomerDashboardData('user-123')

      expect(result.recentPayments[0].paid_at).toBeNull()
    })

    it('should fetch recommendations excluding active services', async () => {
      // Return 3 services to prevent fallback query
      mockPrisma.services.findMany.mockResolvedValue([
        { ...mockService, id: 'rec-1', service_tiers: [mockServiceTier] },
        { ...mockService, id: 'rec-2', service_tiers: [mockServiceTier] },
        { ...mockService, id: 'rec-3', service_tiers: [mockServiceTier] },
      ] as any)

      const result = await service.getCustomerDashboardData('user-123')

      expect(mockPrisma.services.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            is_active: true,
            id: { notIn: ['service-123'] },
          }),
        })
      )
      expect(result.recommendations).toHaveLength(3)
    })

    it('should map recommendations correctly', async () => {
      const result = await service.getCustomerDashboardData('user-123')

      expect(result.recommendations[0]).toEqual({
        id: 'service-123',
        name: 'Test Service',
        slug: 'test-service',
        description: 'Short desc',
        base_price: 1000000,
        original_price: null,
        discount: 0,
        category: 'gaming',
        rating: 5.0,
        reviewCount: 0,
        is_popular: false,
        is_featured: true,
        recommendationReason: 'featured',
        estimatedDuration: 'N/A',
      })
    })

    it('should use description when short_description is null', async () => {
      mockPrisma.services.findMany.mockResolvedValue([
        {
          ...mockService,
          short_description: null,
          service_tiers: [mockServiceTier],
        },
      ] as any)

      const result = await service.getCustomerDashboardData('user-123')

      expect(result.recommendations[0].description).toBe('Test description')
    })

    it('should set recommendationReason to suggested for non-featured', async () => {
      mockPrisma.services.findMany.mockResolvedValue([
        {
          ...mockService,
          is_featured: false,
          service_tiers: [mockServiceTier],
        },
      ] as any)

      const result = await service.getCustomerDashboardData('user-123')

      expect(result.recommendations[0].recommendationReason).toBe('suggested')
    })

    it('should fetch fallback services when recommendations < 3', async () => {
      // First call returns only 2 services
      mockPrisma.services.findMany
        .mockReset()
        .mockResolvedValueOnce([
          { ...mockService, id: 'service-1', service_tiers: [mockServiceTier] },
          { ...mockService, id: 'service-2', service_tiers: [mockServiceTier] },
        ] as any)
        .mockResolvedValueOnce([
          { ...mockService, id: 'service-3', service_tiers: [mockServiceTier] },
        ] as any)

      const result = await service.getCustomerDashboardData('user-123')

      expect(mockPrisma.services.findMany).toHaveBeenCalledTimes(2)
      expect(result.recommendations).toHaveLength(3)
    })

    it('should not fetch fallback when recommendations >= 3', async () => {
      mockPrisma.services.findMany.mockResolvedValue([
        { ...mockService, id: 'service-1', service_tiers: [mockServiceTier] },
        { ...mockService, id: 'service-2', service_tiers: [mockServiceTier] },
        { ...mockService, id: 'service-3', service_tiers: [mockServiceTier] },
      ] as any)

      await service.getCustomerDashboardData('user-123')

      expect(mockPrisma.services.findMany).toHaveBeenCalledTimes(1)
    })

    it('should handle empty active bookings', async () => {
      mockPrisma.bookings.findMany.mockResolvedValue([])

      const result = await service.getCustomerDashboardData('user-123')

      expect(result.activeBookings).toEqual([])
      // Should still fetch recommendations without excluding any services
      expect(mockPrisma.services.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: { notIn: [] },
          }),
        })
      )
    })

    it('should handle empty payments', async () => {
      mockPrisma.payments.findMany
        .mockReset()
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const result = await service.getCustomerDashboardData('user-123')

      expect(result.stats.totalSpent).toBe(0)
      expect(result.recentPayments).toEqual([])
    })

    it('should handle zero bookings', async () => {
      mockPrisma.bookings.count
        .mockReset()
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)

      const result = await service.getCustomerDashboardData('user-123')

      expect(result.stats.totalBookings).toBe(0)
      expect(result.stats.activeServices).toBe(0)
      expect(result.stats.completedServices).toBe(0)
    })

    it('should include default average rating', async () => {
      const result = await service.getCustomerDashboardData('user-123')

      expect(result.stats.averageRating).toBe(5.0)
    })
  })
})

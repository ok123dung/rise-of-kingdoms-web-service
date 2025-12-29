/**
 * @jest-environment node
 */

/**
 * User Bookings API Route Tests
 * Tests for /api/user/bookings endpoint
 */

import { createMockRequest, getJson } from './test-helpers'

// Mock dependencies
jest.mock('@/lib/db', () => ({
  prisma: {
    bookings: {
      findMany: jest.fn(),
    },
  },
}))

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

jest.mock('@/lib/auth', () => ({
  authOptions: {},
}))

jest.mock('@/lib/monitoring/logger', () => ({
  getLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}))

import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { GET } from '../user/bookings/route'

const mockPrisma = prisma as jest.Mocked<typeof prisma>
const mockGetSession = getServerSession as jest.MockedFunction<typeof getServerSession>

describe('User Bookings API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockBookings = [
    {
      id: 'booking-1',
      user_id: 'user-123',
      status: 'confirmed',
      total_amount: 500000,
      created_at: new Date('2024-01-15'),
      service_tiers: {
        id: 'tier-1',
        name: 'Basic',
        services: {
          id: 'service-1',
          name: 'Power Leveling',
        },
      },
      payments: [
        {
          id: 'payment-1',
          amount: 500000,
          status: 'completed',
        },
      ],
    },
    {
      id: 'booking-2',
      user_id: 'user-123',
      status: 'pending',
      total_amount: 1000000,
      created_at: new Date('2024-01-20'),
      service_tiers: {
        id: 'tier-2',
        name: 'Premium',
        services: {
          id: 'service-2',
          name: 'Account Recovery',
        },
      },
      payments: [],
    },
  ]

  describe('GET /api/user/bookings', () => {
    it('should return 401 for unauthenticated requests', async () => {
      mockGetSession.mockResolvedValue(null)

      const req = createMockRequest({
        url: 'http://localhost:3000/api/user/bookings',
      })

      const response = await GET(req)
      const data = await getJson(response)

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Unauthorized')
    })

    it('should return 401 when session has no user id', async () => {
      mockGetSession.mockResolvedValue({ user: {} } as any)

      const req = createMockRequest({
        url: 'http://localhost:3000/api/user/bookings',
      })

      const response = await GET(req)

      expect(response.status).toBe(401)
    })

    it('should return user bookings successfully', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: 'user-123', email: 'user@example.com' },
      } as any)
      mockPrisma.bookings.findMany.mockResolvedValue(mockBookings as any)

      const req = createMockRequest({
        url: 'http://localhost:3000/api/user/bookings',
      })

      const response = await GET(req)
      const data = await getJson(response)

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(Array.isArray(data.bookings)).toBe(true)
      expect(data.bookings.length).toBe(2)
    })

    it('should return empty array when user has no bookings', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: 'user-no-bookings', email: 'user@example.com' },
      } as any)
      mockPrisma.bookings.findMany.mockResolvedValue([])

      const req = createMockRequest({
        url: 'http://localhost:3000/api/user/bookings',
      })

      const response = await GET(req)
      const data = await getJson(response)

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.bookings).toEqual([])
    })

    it('should query bookings with correct user id', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: 'user-123', email: 'user@example.com' },
      } as any)
      mockPrisma.bookings.findMany.mockResolvedValue([])

      const req = createMockRequest({
        url: 'http://localhost:3000/api/user/bookings',
      })

      await GET(req)

      expect(mockPrisma.bookings.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: 'user-123' },
        })
      )
    })

    it('should include service_tiers and payments in response', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: 'user-123', email: 'user@example.com' },
      } as any)
      mockPrisma.bookings.findMany.mockResolvedValue(mockBookings as any)

      const req = createMockRequest({
        url: 'http://localhost:3000/api/user/bookings',
      })

      await GET(req)

      expect(mockPrisma.bookings.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            service_tiers: expect.any(Object),
            payments: true,
          }),
        })
      )
    })

    it('should order bookings by created_at descending', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: 'user-123', email: 'user@example.com' },
      } as any)
      mockPrisma.bookings.findMany.mockResolvedValue([])

      const req = createMockRequest({
        url: 'http://localhost:3000/api/user/bookings',
      })

      await GET(req)

      expect(mockPrisma.bookings.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { created_at: 'desc' },
        })
      )
    })

    it('should return 500 on database error', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: 'user-123', email: 'user@example.com' },
      } as any)
      mockPrisma.bookings.findMany.mockRejectedValue(new Error('Database error'))

      const req = createMockRequest({
        url: 'http://localhost:3000/api/user/bookings',
      })

      const response = await GET(req)
      const data = await getJson(response)

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.message).toContain('Failed to fetch bookings')
    })
  })
})

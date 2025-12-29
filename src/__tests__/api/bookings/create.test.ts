/**
 * Bookings API Route Tests
 * Tests booking creation flow including user creation and validation
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'

// Mock dependencies before importing route
jest.mock('@/lib/db', () => ({
  prisma: {
    users: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    service_tiers: {
      findFirst: jest.fn(),
    },
    leads: {
      create: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  },
}))

jest.mock('@/services/booking.service', () => ({
  BookingService: jest.fn().mockImplementation(() => ({
    createBooking: jest.fn().mockResolvedValue({
      id: 'booking-123',
      booking_number: 'BK-20241229-001',
    }),
  })),
}))

jest.mock('@/lib/auth', () => ({
  hashPassword: jest.fn().mockResolvedValue('$2a$10$hashedpassword'),
}))

jest.mock('@/lib/email', () => ({
  sendAccountCreatedEmail: jest.fn().mockResolvedValue(true),
  sendBookingReceivedEmail: jest.fn().mockResolvedValue(true),
}))

jest.mock('@/lib/monitoring/logger', () => ({
  getLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}))

// Import after mocks
import { POST } from '@/app/api/bookings/route'
import { prisma } from '@/lib/db'
import { createMockRequest, parseResponse } from '../../utils/test-helpers'

// Type assertions for mocks
const mockPrismaUsersFindUnique = prisma.users.findUnique as jest.MockedFunction<
  typeof prisma.users.findUnique
>
const mockPrismaUsersCreate = prisma.users.create as jest.MockedFunction<
  typeof prisma.users.create
>
const mockPrismaServiceTiersFindFirst = prisma.service_tiers.findFirst as jest.MockedFunction<
  typeof prisma.service_tiers.findFirst
>
const mockPrismaLeadsCreate = prisma.leads.create as jest.MockedFunction<
  typeof prisma.leads.create
>

describe('POST /api/bookings', () => {
  const validBookingData = {
    service_id: 'rok-coaching',
    full_name: 'Nguyen Van A',
    email: 'test@example.com',
    phone: '0912345678',
    kingdom: '1234',
    notes: 'Test booking notes',
  }

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    full_name: 'Nguyen Van A',
    phone: '0912345678',
  }

  const mockServiceTier = {
    id: 'tier-123',
    name: 'Basic',
    price: 100000,
    services: {
      id: 'service-123',
      name: 'ROK Coaching',
      slug: 'rok-coaching',
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('Successful Booking', () => {
    it('should create booking for existing user', async () => {
      mockPrismaUsersFindUnique.mockResolvedValue(mockUser as never)
      mockPrismaServiceTiersFindFirst.mockResolvedValue(mockServiceTier as never)
      mockPrismaLeadsCreate.mockResolvedValue({ id: 'lead-123' } as never)

      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/bookings',
        body: validBookingData,
      })

      const response = await POST(request)
      const data = await parseResponse<{ success: boolean; booking_id: string }>(response)

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.booking_id).toBe('booking-123')
    })

    it('should create new user if not exists', async () => {
      mockPrismaUsersFindUnique.mockResolvedValue(null as never)
      mockPrismaUsersCreate.mockResolvedValue(mockUser as never)
      mockPrismaServiceTiersFindFirst.mockResolvedValue(mockServiceTier as never)
      mockPrismaLeadsCreate.mockResolvedValue({ id: 'lead-123' } as never)

      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/bookings',
        body: validBookingData,
      })

      const response = await POST(request)
      const data = await parseResponse<{ success: boolean; booking_id: string }>(response)

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockPrismaUsersCreate).toHaveBeenCalled()
    })
  })

  describe('Service Validation', () => {
    it('should return 404 for invalid service', async () => {
      mockPrismaUsersFindUnique.mockResolvedValue(null as never)
      mockPrismaServiceTiersFindFirst.mockResolvedValue(null as never)

      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/bookings',
        body: {
          ...validBookingData,
          service_id: 'invalid-service',
        },
      })

      const response = await POST(request)
      const data = await parseResponse<{ success: boolean; error: string }>(response)

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error).toContain('not found')
    })
  })

  describe('Input Validation', () => {
    it('should return 400 for invalid email', async () => {
      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/bookings',
        body: {
          ...validBookingData,
          email: 'invalid-email',
        },
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
    })

    it('should return 400 for invalid phone number', async () => {
      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/bookings',
        body: {
          ...validBookingData,
          phone: '123456',
        },
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
    })

    it('should return 400 for missing required fields', async () => {
      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/bookings',
        body: {
          email: 'test@example.com',
          // Missing service_id, full_name, phone
        },
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
    })

    it('should return 400 for full name too short', async () => {
      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/bookings',
        body: {
          ...validBookingData,
          full_name: 'A',
        },
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
    })

    it('should accept valid Vietnamese phone formats', async () => {
      mockPrismaUsersFindUnique.mockResolvedValue(mockUser as never)
      mockPrismaServiceTiersFindFirst.mockResolvedValue(mockServiceTier as never)
      mockPrismaLeadsCreate.mockResolvedValue({ id: 'lead-123' } as never)

      const validPhones = ['0912345678', '0812345678', '0712345678', '+84912345678']

      for (const phone of validPhones) {
        const request = createMockRequest({
          method: 'POST',
          url: 'http://localhost:3000/api/bookings',
          body: { ...validBookingData, phone },
        })

        const response = await POST(request)
        expect(response.status).toBe(200)
      }
    })
  })

  describe('DoS Prevention', () => {
    it('should reject overly long notes', async () => {
      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/bookings',
        body: {
          ...validBookingData,
          notes: 'x'.repeat(2001), // Exceeds 2000 char limit
        },
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
    })

    it('should reject overly long full name', async () => {
      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/bookings',
        body: {
          ...validBookingData,
          full_name: 'x'.repeat(101), // Exceeds 100 char limit
        },
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
    })
  })
})

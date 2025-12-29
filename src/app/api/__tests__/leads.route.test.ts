/**
 * @jest-environment node
 */

/**
 * Leads API Route Tests
 * Tests for /api/leads endpoint
 */

import { createMockRequest, getJson } from './test-helpers'

// Mock dependencies
jest.mock('@/lib/db', () => ({
  prisma: {
    leads: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    users: {
      findFirst: jest.fn(),
    },
    communications: {
      create: jest.fn(),
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

jest.mock('@/lib/validation', () => ({
  leadValidationSchema: {
    parse: jest.fn((data) => data),
  },
  sanitizeUserInput: jest.fn((input) => input),
  sanitizePhoneNumber: jest.fn((phone) => phone),
}))

jest.mock('@/lib/discord', () => ({
  discordNotifier: {
    sendLeadNotification: jest.fn().mockResolvedValue(undefined),
  },
}))

jest.mock('@/lib/email/service', () => ({
  getEmailService: () => ({
    sendLeadFollowUp: jest.fn().mockResolvedValue(undefined),
  }),
}))

jest.mock('@/lib/auth', () => ({
  getCurrentUser: jest.fn(),
}))

import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { leadValidationSchema } from '@/lib/validation'
import { POST, GET } from '../leads/route'

const mockPrisma = prisma as jest.Mocked<typeof prisma>
const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>
const mockValidationSchema = leadValidationSchema as jest.Mocked<typeof leadValidationSchema>

describe('Leads API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/leads', () => {
    const mockLead = {
      id: 'lead-123',
      email: 'test@example.com',
      phone: '0912345678',
      full_name: 'Test User',
      service_interest: 'premium',
      source: 'website',
      status: 'new',
      lead_score: 65,
      assigned_to: null,
      created_at: new Date(),
      updated_at: new Date(),
    }

    it('should create a new lead successfully', async () => {
      mockPrisma.leads.findFirst.mockResolvedValue(null)
      mockPrisma.leads.create.mockResolvedValue(mockLead as any)
      mockPrisma.users.findFirst.mockResolvedValue(null)

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/leads',
        body: {
          email: 'test@example.com',
          full_name: 'Test User',
          source: 'website',
        },
      })

      const response = await POST(req)
      const data = await getJson(response)

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data).toBeDefined()
    })

    it('should update existing lead instead of creating duplicate', async () => {
      mockPrisma.leads.findFirst.mockResolvedValue(mockLead as any)
      mockPrisma.leads.update.mockResolvedValue({
        ...mockLead,
        full_name: 'Updated Name',
      } as any)

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/leads',
        body: {
          email: 'test@example.com',
          full_name: 'Updated Name',
          source: 'website',
        },
      })

      const response = await POST(req)
      const data = await getJson(response)

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toContain('updated')
      expect(mockPrisma.leads.update).toHaveBeenCalled()
      expect(mockPrisma.leads.create).not.toHaveBeenCalled()
    })

    it('should return 400 for validation errors', async () => {
      const { z } = await import('zod')
      mockValidationSchema.parse.mockImplementation(() => {
        throw new z.ZodError([
          {
            code: 'invalid_type',
            expected: 'string',
            received: 'undefined',
            path: ['email'],
            message: 'Required',
          },
        ])
      })

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/leads',
        body: {},
      })

      const response = await POST(req)
      const data = await getJson(response)

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Validation error')
    })

    it('should handle database errors gracefully', async () => {
      mockValidationSchema.parse.mockImplementation((data) => data)
      mockPrisma.leads.findFirst.mockRejectedValue(new Error('Database error'))

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/leads',
        body: {
          email: 'test@example.com',
          source: 'website',
        },
      })

      const response = await POST(req)
      const data = await getJson(response)

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
    })

    it('should schedule follow-up communication', async () => {
      mockPrisma.leads.findFirst.mockResolvedValue(null)
      mockPrisma.leads.create.mockResolvedValue(mockLead as any)
      mockPrisma.users.findFirst.mockResolvedValue({
        id: 'system-user',
        email: 'system@rokdbot.com',
      } as any)
      mockPrisma.communications.create.mockResolvedValue({} as any)

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/leads',
        body: {
          email: 'test@example.com',
          source: 'website',
        },
      })

      await POST(req)

      expect(mockPrisma.communications.create).toHaveBeenCalled()
    })
  })

  describe('GET /api/leads', () => {
    const mockLeads = [
      {
        id: 'lead-1',
        email: 'lead1@example.com',
        status: 'new',
        lead_score: 80,
      },
      {
        id: 'lead-2',
        email: 'lead2@example.com',
        status: 'contacted',
        lead_score: 60,
      },
    ]

    it('should return 403 for unauthenticated requests', async () => {
      mockGetCurrentUser.mockResolvedValue(null)

      const req = createMockRequest({
        url: 'http://localhost:3000/api/leads',
      })

      const response = await GET(req)
      const data = await getJson(response)

      expect(response.status).toBe(403)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Unauthorized')
    })

    it('should return 403 for non-admin users', async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: 'user-123',
        email: 'user@example.com',
        staff: null,
      } as any)

      const req = createMockRequest({
        url: 'http://localhost:3000/api/leads',
      })

      const response = await GET(req)
      const data = await getJson(response)

      expect(response.status).toBe(403)
      expect(data.success).toBe(false)
    })

    it('should return leads for admin users', async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: 'admin-123',
        email: 'admin@example.com',
        staff: { role: 'admin' },
      } as any)
      mockPrisma.leads.findMany.mockResolvedValue(mockLeads as any)

      const req = createMockRequest({
        url: 'http://localhost:3000/api/leads',
      })

      const response = await GET(req)
      const data = await getJson(response)

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockLeads)
      expect(data.count).toBe(2)
    })

    it('should return leads for manager users', async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: 'manager-123',
        email: 'manager@example.com',
        staff: { role: 'manager' },
      } as any)
      mockPrisma.leads.findMany.mockResolvedValue(mockLeads as any)

      const req = createMockRequest({
        url: 'http://localhost:3000/api/leads',
      })

      const response = await GET(req)
      const data = await getJson(response)

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('should filter leads by status', async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: 'admin-123',
        staff: { role: 'admin' },
      } as any)
      mockPrisma.leads.findMany.mockResolvedValue([mockLeads[0]] as any)

      const req = createMockRequest({
        url: 'http://localhost:3000/api/leads',
        searchParams: { status: 'new' },
      })

      await GET(req)

      expect(mockPrisma.leads.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'new' }),
        })
      )
    })

    it('should filter leads by source', async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: 'admin-123',
        staff: { role: 'admin' },
      } as any)
      mockPrisma.leads.findMany.mockResolvedValue([])

      const req = createMockRequest({
        url: 'http://localhost:3000/api/leads',
        searchParams: { source: 'referral' },
      })

      await GET(req)

      expect(mockPrisma.leads.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ source: 'referral' }),
        })
      )
    })

    it('should handle database errors', async () => {
      mockGetCurrentUser.mockResolvedValue({
        id: 'admin-123',
        staff: { role: 'admin' },
      } as any)
      mockPrisma.leads.findMany.mockRejectedValue(new Error('Database error'))

      const req = createMockRequest({
        url: 'http://localhost:3000/api/leads',
      })

      const response = await GET(req)
      const data = await getJson(response)

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
    })
  })
})

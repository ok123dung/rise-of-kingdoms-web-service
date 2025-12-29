/**
 * Lead Service Tests
 * Tests for lead management and conversion
 */

import { LeadService } from '../lead.service'
import { ValidationError, NotFoundError } from '@/lib/errors'

// Mock dependencies
jest.mock('@/lib/db', () => ({
  prisma: {
    leads: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
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

jest.mock('@/lib/email', () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
}))

import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email'

const mockPrisma = prisma as jest.Mocked<typeof prisma>
const mockSendEmail = sendEmail as jest.MockedFunction<typeof sendEmail>

describe('LeadService', () => {
  let service: LeadService

  const mockLead = {
    id: 'lead-123',
    email: 'lead@example.com',
    phone: '0912345678',
    full_name: 'Test Lead',
    service_interest: 'Account Upgrade',
    source: 'website',
    status: 'new',
    utm_source: 'google',
    utm_medium: 'cpc',
    utm_campaign: 'summer_promo',
    notes: 'Initial contact',
    assigned_to: null,
    follow_up_date: null,
    converted_at: null,
    converted_booking_id: null,
    created_at: new Date(),
    updated_at: new Date(),
  }

  beforeEach(() => {
    service = new LeadService()
    jest.clearAllMocks()
  })

  describe('createLead', () => {
    it('should create a new lead with email', async () => {
      mockPrisma.leads.findFirst.mockResolvedValue(null)
      mockPrisma.leads.create.mockResolvedValue(mockLead as any)

      const result = await service.createLead({
        email: 'newlead@example.com',
        source: 'website',
        fullName: 'New Lead',
      })

      expect(result).toBeDefined()
      expect(mockPrisma.leads.create).toHaveBeenCalled()
      expect(mockSendEmail).toHaveBeenCalled()
    })

    it('should create a new lead with phone only', async () => {
      mockPrisma.leads.findFirst.mockResolvedValue(null)
      mockPrisma.leads.create.mockResolvedValue(mockLead as any)

      const result = await service.createLead({
        phone: '0912345678',
        source: 'referral',
      })

      expect(result).toBeDefined()
    })

    it('should throw ValidationError without email or phone', async () => {
      await expect(
        service.createLead({ source: 'website' })
      ).rejects.toThrow(ValidationError)
    })

    it('should update existing lead instead of creating duplicate', async () => {
      mockPrisma.leads.findFirst.mockResolvedValue(mockLead as any)
      mockPrisma.leads.findUnique.mockResolvedValue(mockLead as any)
      mockPrisma.leads.update.mockResolvedValue({
        ...mockLead,
        notes: 'Updated notes',
      } as any)

      const result = await service.createLead({
        email: 'lead@example.com',
        source: 'website',
        notes: 'New note',
      })

      expect(result).toBeDefined()
      expect(mockPrisma.leads.update).toHaveBeenCalled()
      expect(mockPrisma.leads.create).not.toHaveBeenCalled()
    })

    it('should include UTM parameters', async () => {
      mockPrisma.leads.findFirst.mockResolvedValue(null)
      mockPrisma.leads.create.mockResolvedValue(mockLead as any)

      await service.createLead({
        email: 'lead@example.com',
        source: 'website',
        utmSource: 'google',
        utmMedium: 'cpc',
        utmCampaign: 'summer_promo',
      })

      expect(mockPrisma.leads.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            utm_source: 'google',
            utm_medium: 'cpc',
            utm_campaign: 'summer_promo',
          }),
        })
      )
    })

    it('should handle email notification failure gracefully', async () => {
      mockPrisma.leads.findFirst.mockResolvedValue(null)
      mockPrisma.leads.create.mockResolvedValue(mockLead as any)
      mockSendEmail.mockRejectedValue(new Error('Email failed'))

      const result = await service.createLead({
        email: 'lead@example.com',
        source: 'website',
      })

      expect(result).toBeDefined()
    })

    it('should lowercase email before creating', async () => {
      mockPrisma.leads.findFirst.mockResolvedValue(null)
      mockPrisma.leads.create.mockResolvedValue(mockLead as any)

      await service.createLead({
        email: 'LEAD@EXAMPLE.COM',
        source: 'website',
      })

      expect(mockPrisma.leads.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'lead@example.com',
          }),
        })
      )
    })
  })

  describe('getLeadById', () => {
    it('should return lead when found', async () => {
      mockPrisma.leads.findUnique.mockResolvedValue(mockLead as any)

      const result = await service.getLeadById('lead-123')

      expect(result).toEqual(mockLead)
    })

    it('should throw NotFoundError when lead not found', async () => {
      mockPrisma.leads.findUnique.mockResolvedValue(null)

      await expect(service.getLeadById('nonexistent')).rejects.toThrow(NotFoundError)
    })
  })

  describe('updateLead', () => {
    it('should update lead successfully', async () => {
      mockPrisma.leads.findUnique.mockResolvedValue(mockLead as any)
      mockPrisma.leads.update.mockResolvedValue({
        ...mockLead,
        status: 'contacted',
      } as any)

      const result = await service.updateLead('lead-123', {
        status: 'contacted',
      })

      expect(result.status).toBe('contacted')
    })

    it('should throw NotFoundError for nonexistent lead', async () => {
      mockPrisma.leads.findUnique.mockResolvedValue(null)

      await expect(
        service.updateLead('nonexistent', { status: 'contacted' })
      ).rejects.toThrow(NotFoundError)
    })

    it('should update multiple fields at once', async () => {
      mockPrisma.leads.findUnique.mockResolvedValue(mockLead as any)
      mockPrisma.leads.update.mockResolvedValue(mockLead as any)

      await service.updateLead('lead-123', {
        status: 'follow_up_scheduled',
        assigned_to: 'admin-123',
        notes: 'Follow up scheduled',
      })

      expect(mockPrisma.leads.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'follow_up_scheduled',
            assigned_to: 'admin-123',
            notes: 'Follow up scheduled',
          }),
        })
      )
    })
  })

  describe('convertToBooking', () => {
    it('should convert lead to booking successfully', async () => {
      mockPrisma.leads.findUnique.mockResolvedValue(mockLead as any)
      mockPrisma.leads.update.mockResolvedValue({
        ...mockLead,
        status: 'converted',
        converted_at: new Date(),
        converted_booking_id: 'booking-123',
      } as any)

      const result = await service.convertToBooking('lead-123', {
        userId: 'user-123',
        serviceTierId: 'tier-123',
        bookingId: 'booking-123',
      })

      expect(result.status).toBe('converted')
      expect(result.converted_booking_id).toBe('booking-123')
    })

    it('should throw ValidationError for already converted lead', async () => {
      mockPrisma.leads.findUnique.mockResolvedValue({
        ...mockLead,
        status: 'converted',
      } as any)

      await expect(
        service.convertToBooking('lead-123', {
          userId: 'user-123',
          serviceTierId: 'tier-123',
          bookingId: 'booking-123',
        })
      ).rejects.toThrow(ValidationError)
    })
  })

  describe('getLeads', () => {
    it('should return leads with pagination', async () => {
      mockPrisma.leads.findMany.mockResolvedValue([mockLead] as any)
      mockPrisma.leads.count.mockResolvedValue(1)

      const result = await service.getLeads({})

      expect(result.leads).toHaveLength(1)
      expect(result.total).toBe(1)
    })

    it('should filter by status', async () => {
      mockPrisma.leads.findMany.mockResolvedValue([])
      mockPrisma.leads.count.mockResolvedValue(0)

      await service.getLeads({ status: 'new' })

      expect(mockPrisma.leads.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'new' }),
        })
      )
    })

    it('should filter by source', async () => {
      mockPrisma.leads.findMany.mockResolvedValue([])
      mockPrisma.leads.count.mockResolvedValue(0)

      await service.getLeads({ source: 'referral' })

      expect(mockPrisma.leads.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ source: 'referral' }),
        })
      )
    })

    it('should filter by assigned_to', async () => {
      mockPrisma.leads.findMany.mockResolvedValue([])
      mockPrisma.leads.count.mockResolvedValue(0)

      await service.getLeads({ assigned_to: 'admin-123' })

      expect(mockPrisma.leads.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ assigned_to: 'admin-123' }),
        })
      )
    })

    it('should search by email, phone, or name', async () => {
      mockPrisma.leads.findMany.mockResolvedValue([])
      mockPrisma.leads.count.mockResolvedValue(0)

      await service.getLeads({ search: 'test' })

      expect(mockPrisma.leads.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ email: expect.any(Object) }),
              expect.objectContaining({ phone: expect.any(Object) }),
              expect.objectContaining({ full_name: expect.any(Object) }),
            ]),
          }),
        })
      )
    })

    it('should filter by date range', async () => {
      mockPrisma.leads.findMany.mockResolvedValue([])
      mockPrisma.leads.count.mockResolvedValue(0)

      const fromDate = new Date('2024-01-01')
      const toDate = new Date('2024-12-31')

      await service.getLeads({ fromDate, toDate })

      expect(mockPrisma.leads.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            created_at: {
              gte: fromDate,
              lte: toDate,
            },
          }),
        })
      )
    })

    it('should apply pagination', async () => {
      mockPrisma.leads.findMany.mockResolvedValue([])
      mockPrisma.leads.count.mockResolvedValue(0)

      await service.getLeads({ limit: 50, offset: 10 })

      expect(mockPrisma.leads.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 50,
          skip: 10,
        })
      )
    })
  })

  describe('getLeadStats', () => {
    it('should return lead statistics', async () => {
      mockPrisma.leads.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(30) // converted
      mockPrisma.leads.groupBy
        .mockResolvedValueOnce([
          { status: 'new', _count: 50 },
          { status: 'contacted', _count: 20 },
          { status: 'converted', _count: 30 },
        ] as any)
        .mockResolvedValueOnce([
          { source: 'website', _count: 60 },
          { source: 'referral', _count: 40 },
        ] as any)

      const result = await service.getLeadStats()

      expect(result.total).toBe(100)
      expect(result.byStatus).toEqual({
        new: 50,
        contacted: 20,
        converted: 30,
      })
      expect(result.bySource).toEqual({
        website: 60,
        referral: 40,
      })
      expect(result.conversionRate).toBe(30)
    })

    it('should handle zero leads', async () => {
      mockPrisma.leads.count.mockResolvedValue(0)
      mockPrisma.leads.groupBy.mockResolvedValue([])

      const result = await service.getLeadStats()

      expect(result.total).toBe(0)
      expect(result.conversionRate).toBe(0)
    })

    it('should filter stats by date range', async () => {
      mockPrisma.leads.count.mockResolvedValue(50)
      mockPrisma.leads.groupBy.mockResolvedValue([])

      const fromDate = new Date('2024-06-01')
      const toDate = new Date('2024-06-30')

      await service.getLeadStats({ fromDate, toDate })

      expect(mockPrisma.leads.count).toHaveBeenCalledWith({
        where: expect.objectContaining({
          created_at: {
            gte: fromDate,
            lte: toDate,
          },
        }),
      })
    })
  })

  describe('scheduleFollowUp', () => {
    it('should schedule follow-up successfully', async () => {
      mockPrisma.leads.findUnique.mockResolvedValue(mockLead as any)
      mockPrisma.leads.update.mockResolvedValue({
        ...mockLead,
        status: 'follow_up_scheduled',
        follow_up_date: new Date('2024-12-31'),
        assigned_to: 'admin-123',
      } as any)

      const followUpDate = new Date('2024-12-31')
      const result = await service.scheduleFollowUp('lead-123', {
        date: followUpDate,
        assignTo: 'admin-123',
        notes: 'Follow up call',
      })

      expect(result.status).toBe('follow_up_scheduled')
      expect(result.assigned_to).toBe('admin-123')
    })

    it('should schedule without assignment', async () => {
      mockPrisma.leads.findUnique.mockResolvedValue(mockLead as any)
      mockPrisma.leads.update.mockResolvedValue({
        ...mockLead,
        status: 'follow_up_scheduled',
        follow_up_date: new Date('2024-12-31'),
      } as any)

      const result = await service.scheduleFollowUp('lead-123', {
        date: new Date('2024-12-31'),
      })

      expect(result.status).toBe('follow_up_scheduled')
    })
  })
})

import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { ValidationError, NotFoundError } from '@/lib/errors'
import { getLogger } from '@/lib/monitoring/logger'
import type { Lead } from '@/types/prisma'

export class LeadService {
  private logger = getLogger()

  /**
   * Create a new lead
   */
  async createLead(data: {
    email?: string
    phone?: string
    fullName?: string
    serviceInterest?: string
    source: string
    utmSource?: string
    utmMedium?: string
    utmCampaign?: string
    notes?: string
  }): Promise<Lead> {
    // Validate at least email or phone is provided
    if (!data.email && !data.phone) {
      throw new ValidationError('Email or phone number is required')
    }

    // Check for existing lead
    const existingLead = await this.checkExistingLead(data.email, data.phone)
    if (existingLead) {
      // Update existing lead instead of creating duplicate
      return this.updateLead(existingLead.id, {
        service_interest: data.serviceInterest ?? existingLead.service_interest ?? undefined,
        notes: data.notes
          ? `${existingLead.notes ?? ''}\n[${new Date().toISOString()}] ${data.notes}`
          : (existingLead.notes ?? undefined)
      })
    }

    // Create new lead
    const lead = await prisma.leads.create({
      data: {
        id: crypto.randomUUID(),
        email: data.email?.toLowerCase(),
        phone: data.phone,
        full_name: data.fullName,
        service_interest: data.serviceInterest,
        source: data.source,
        utm_source: data.utmSource,
        utm_medium: data.utmMedium,
        utm_campaign: data.utmCampaign,
        notes: data.notes,
        status: 'new',
        updated_at: new Date()
      }
    })

    // Send notification email
    await this.sendLeadNotification(lead)

    this.logger.info('Lead created', {
      leadId: lead.id,
      source: data.source
    })

    return lead
  }

  /**
   * Get lead by ID
   */
  async getLeadById(leadId: string): Promise<Lead> {
    const lead = await prisma.leads.findUnique({
      where: { id: leadId },
      include: {
        users: true,
        bookings: true
      }
    })

    if (!lead) {
      throw new NotFoundError('Lead')
    }

    return lead
  }

  /**
   * Update lead
   */
  async updateLead(
    leadId: string,
    data: Partial<{
      status: string
      assigned_to: string | null
      service_interest: string
      notes: string
      follow_up_date: Date
    }>
  ): Promise<Lead> {
    // Validate lead exists
    await this.getLeadById(leadId)

    const updated = await prisma.leads.update({
      where: { id: leadId },
      data: {
        ...data,
        updated_at: new Date()
      }
    })

    this.logger.info('Lead updated', {
      leadId,
      updatedFields: Object.keys(data).join(', ')
    })

    return updated
  }

  /**
   * Convert lead to booking
   */
  async convertToBooking(
    leadId: string,
    data: {
      userId: string
      serviceTierId: string
      bookingId: string
    }
  ): Promise<Lead> {
    const lead = await this.getLeadById(leadId)

    if (lead.status === 'converted') {
      throw new ValidationError('Lead already converted')
    }

    const updated = await prisma.leads.update({
      where: { id: leadId },
      data: {
        status: 'converted',
        converted_at: new Date(),
        converted_booking_id: data.bookingId
      }
    })

    this.logger.info('Lead converted to booking', {
      leadId,
      bookingId: data.bookingId
    })

    return updated
  }

  /**
   * Get leads with filters
   */
  async getLeads(query: {
    status?: string
    assigned_to?: string | null
    source?: string
    search?: string
    fromDate?: Date
    toDate?: Date
    limit?: number
    offset?: number
  }) {
    interface LeadWhereInput {
      status?: string
      assigned_to?: string | null
      source?: string
      OR?: Array<Record<string, unknown>>
      created_at?: { gte?: Date; lte?: Date }
    }

    const where: LeadWhereInput = {}

    if (query.status) {
      where.status = query.status
    }

    if (query.assigned_to !== undefined) {
      where.assigned_to = query.assigned_to
    }

    if (query.source) {
      where.source = query.source
    }

    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search } },
        { full_name: { contains: query.search, mode: 'insensitive' } }
      ]
    }

    if (query.fromDate ?? query.toDate) {
      where.created_at = {}
      if (query.fromDate) where.created_at.gte = query.fromDate
      if (query.toDate) where.created_at.lte = query.toDate
    }

    const [leads, total] = await Promise.all([
      prisma.leads.findMany({
        where,
        include: {
          users: {
            select: { id: true, full_name: true }
          }
        },
        orderBy: { created_at: 'desc' },
        take: query.limit ?? 20,
        skip: query.offset ?? 0
      }),
      prisma.leads.count({ where })
    ])

    return { leads, total }
  }

  /**
   * Get lead statistics
   */
  async getLeadStats(query?: { fromDate?: Date; toDate?: Date }) {
    interface LeadStatsWhere {
      created_at?: { gte?: Date; lte?: Date }
      status?: string
    }

    const where: LeadStatsWhere = {}

    if (query?.fromDate ?? query?.toDate) {
      where.created_at = {}
      if (query?.fromDate) where.created_at.gte = query.fromDate
      if (query?.toDate) where.created_at.lte = query.toDate
    }

    const convertedWhere: LeadStatsWhere = { ...where, status: 'converted' }

    const [total, byStatus, bySource, conversionRate] = await Promise.all([
      prisma.leads.count({ where }),
      prisma.leads.groupBy({
        by: ['status'],
        where,
        _count: true
      }),
      prisma.leads.groupBy({
        by: ['source'],
        where,
        _count: true
      }),
      prisma.leads.count({
        where: convertedWhere
      })
    ])

    return {
      total,
      byStatus: byStatus.reduce(
        (acc, item) => ({
          ...acc,
          [item.status]: item._count
        }),
        {}
      ),
      bySource: bySource.reduce(
        (acc, item) => ({
          ...acc,
          [item.source ?? 'unknown']: item._count
        }),
        {}
      ),
      conversionRate: total > 0 ? (conversionRate / total) * 100 : 0
    }
  }

  /**
   * Schedule follow-up
   */
  async scheduleFollowUp(
    leadId: string,
    data: {
      date: Date
      notes?: string
      assignTo?: string
    }
  ): Promise<Lead> {
    const updated = await this.updateLead(leadId, {
      follow_up_date: data.date,
      assigned_to: data.assignTo,
      notes: data.notes,
      status: 'follow_up_scheduled'
    })

    // Create reminder task (implement based on your task system)
    // await this.createFollowUpTask(leadId, data.date)

    return updated
  }

  /**
   * Private helper methods
   */
  private async checkExistingLead(email?: string, phone?: string): Promise<Lead | null> {
    if (!email && !phone) return null

    interface LeadSearchWhere {
      OR: Array<{ email?: string; phone?: string }>
    }

    const where: LeadSearchWhere = { OR: [] }

    if (email) {
      where.OR.push({ email: email.toLowerCase() })
    }

    if (phone) {
      where.OR.push({ phone })
    }

    return prisma.leads.findFirst({ where })
  }

  private async sendLeadNotification(lead: Lead): Promise<void> {
    try {
      // Send email notification to sales team
      const emailContent = `
        <h2>New Lead Received</h2>
        <p><strong>Name:</strong> ${lead.full_name ?? 'Not provided'}</p>
        <p><strong>Email:</strong> ${lead.email ?? 'Not provided'}</p>
        <p><strong>Phone:</strong> ${lead.phone ?? 'Not provided'}</p>
        <p><strong>Service Interest:</strong> ${lead.service_interest ?? 'Not specified'}</p>
        <p><strong>Source:</strong> ${lead.source}</p>
        ${lead.notes ? `<p><strong>Notes:</strong> ${lead.notes}</p>` : ''}
        <p><strong>Created:</strong> ${new Date(lead.created_at).toLocaleString('vi-VN')}</p>
      `

      await sendEmail({
        to: process.env.SALES_NOTIFICATION_EMAIL ?? 'sales@rokdbot.com',
        subject: `New Lead: ${lead.full_name ?? lead.email ?? lead.phone}`,
        html: emailContent
      })
    } catch (error) {
      this.logger.warn('Failed to send lead notification', {
        leadId: lead.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}

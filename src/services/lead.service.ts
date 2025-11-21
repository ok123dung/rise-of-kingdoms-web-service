import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { ValidationError, NotFoundError } from '@/lib/errors'
import { getLogger } from '@/lib/monitoring/logger'

import type { Lead } from '@prisma/client'

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
      return await this.updateLead(existingLead.id, {
        serviceInterest: data.serviceInterest || existingLead.serviceInterest || undefined,
        notes: data.notes
          ? `${existingLead.notes || ''}\n[${new Date().toISOString()}] ${data.notes}`
          : existingLead.notes || undefined
      })
    }

    // Create new lead
    const lead = await prisma.lead.create({
      data: {
        email: data.email?.toLowerCase(),
        phone: data.phone,
        fullName: data.fullName,
        serviceInterest: data.serviceInterest,
        source: data.source,
        utmSource: data.utmSource,
        utmMedium: data.utmMedium,
        utmCampaign: data.utmCampaign,
        notes: data.notes,
        status: 'new'
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
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        assignedUser: true,
        convertedBooking: true
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
      assignedTo: string | null
      serviceInterest: string
      notes: string
      followUpDate: Date
    }>
  ): Promise<Lead> {
    const lead = await this.getLeadById(leadId)

    const updated = await prisma.lead.update({
      where: { id: leadId },
      data: {
        ...data,
        updatedAt: new Date()
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

    const updated = await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: 'converted',
        convertedAt: new Date(),
        convertedBookingId: data.bookingId
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
    assignedTo?: string | null
    source?: string
    search?: string
    fromDate?: Date
    toDate?: Date
    limit?: number
    offset?: number
  }) {
    const where: any = {}

    if (query.status) {
      where.status = query.status
    }

    if (query.assignedTo !== undefined) {
      where.assignedTo = query.assignedTo
    }

    if (query.source) {
      where.source = query.source
    }

    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search } },
        { fullName: { contains: query.search, mode: 'insensitive' } }
      ]
    }

    if (query.fromDate || query.toDate) {
      where.createdAt = {}
      if (query.fromDate) where.createdAt.gte = query.fromDate
      if (query.toDate) where.createdAt.lte = query.toDate
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          assignedUser: {
            select: { id: true, fullName: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: query.limit || 20,
        skip: query.offset || 0
      }),
      prisma.lead.count({ where })
    ])

    return { leads, total }
  }

  /**
   * Get lead statistics
   */
  async getLeadStats(query?: { fromDate?: Date; toDate?: Date }) {
    const where: any = {}

    if (query?.fromDate || query?.toDate) {
      where.createdAt = {}
      if (query.fromDate) where.createdAt.gte = query.fromDate
      if (query.toDate) where.createdAt.lte = query.toDate
    }

    const [total, byStatus, bySource, conversionRate] = await Promise.all([
      prisma.lead.count({ where }),
      prisma.lead.groupBy({
        by: ['status'],
        where,
        _count: true
      }),
      prisma.lead.groupBy({
        by: ['source'],
        where,
        _count: true
      }),
      prisma.lead.count({
        where: { ...where, status: 'converted' }
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
          [item.source || 'unknown']: item._count
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
      followUpDate: data.date,
      assignedTo: data.assignTo,
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

    const where: any = { OR: [] }

    if (email) {
      where.OR.push({ email: email.toLowerCase() })
    }

    if (phone) {
      where.OR.push({ phone })
    }

    return await prisma.lead.findFirst({ where })
  }

  private async sendLeadNotification(lead: Lead): Promise<void> {
    try {
      // Send email notification to sales team
      const emailContent = `
        <h2>New Lead Received</h2>
        <p><strong>Name:</strong> ${lead.fullName || 'Not provided'}</p>
        <p><strong>Email:</strong> ${lead.email || 'Not provided'}</p>
        <p><strong>Phone:</strong> ${lead.phone || 'Not provided'}</p>
        <p><strong>Service Interest:</strong> ${lead.serviceInterest || 'Not specified'}</p>
        <p><strong>Source:</strong> ${lead.source}</p>
        ${lead.notes ? `<p><strong>Notes:</strong> ${lead.notes}</p>` : ''}
        <p><strong>Created:</strong> ${new Date(lead.createdAt).toLocaleString('vi-VN')}</p>
      `

      await sendEmail({
        to: process.env.SALES_NOTIFICATION_EMAIL || 'sales@rokdbot.com',
        subject: `New Lead: ${lead.fullName || lead.email || lead.phone}`,
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

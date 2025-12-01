import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { prisma } from '@/lib/db'
import { getLogger } from '@/lib/monitoring/logger'
import { leadValidationSchema, sanitizeUserInput, sanitizePhoneNumber } from '@/lib/validation'

// POST /api/leads - Tạo lead mới từ contact form

interface LeadRequestBody {
  fullName?: string
  phone?: string
  notes?: string
  email?: string
  serviceInterest?: string
  source?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as LeadRequestBody

    // Sanitize input data
    const sanitizedData = {
      ...body,
      fullName: body.fullName ? sanitizeUserInput(body.fullName) : undefined,
      phone: body.phone ? sanitizePhoneNumber(body.phone) : undefined,
      notes: body.notes ? sanitizeUserInput(body.notes) : undefined
    }

    const validatedData = leadValidationSchema.parse(sanitizedData)

    // Check for existing lead with same email or phone
    const existingLead = await prisma.lead.findFirst({
      where: {
        OR: [
          ...(validatedData.email ? [{ email: validatedData.email }] : []),
          ...(validatedData.phone ? [{ phone: validatedData.phone }] : [])
        ]
      }
    })

    if (existingLead) {
      // Update existing lead instead of creating new one
      const updatedLead = await prisma.lead.update({
        where: { id: existingLead.id },
        data: {
          ...validatedData,
          leadScore: Math.max(existingLead.leadScore, calculateLeadScore(validatedData)),
          updatedAt: new Date()
        }
      })

      return NextResponse.json({
        success: true,
        data: updatedLead,
        message: 'Lead updated successfully'
      })
    }

    // Create new lead
    const leadData = {
      ...validatedData,
      leadScore: calculateLeadScore(validatedData),
      status: 'new'
    }

    const lead = await prisma.lead.create({
      data: leadData
    })

    // Trigger automated follow-up sequence
    try {
      // Schedule follow-up in communication table instead
      const followUpDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
      // Get a default system user for automated tasks
      const systemUser = await prisma.user.findFirst({
        where: { email: 'system@rokdbot.com' }
      })

      if (systemUser || lead.assignedTo) {
        await prisma.communication.create({
          data: {
            userId: lead.assignedTo || systemUser?.id || '',
            type: 'system',
            channel: 'task',
            subject: `Follow up with lead: ${lead.fullName || lead.email}`,
            content: `Send follow-up email to lead interested in ${lead.serviceInterest || 'RoK services'}`,
            templateId: 'lead_followup_reminder',
            templateData: { leadId: lead.id, scheduledFor: followUpDate.toISOString() },
            status: 'pending'
          }
        })
      }
    } catch (error) {
      getLogger().warn(
        `Failed to schedule follow-up: ${error instanceof Error ? error.message : String(error)}`,
        { leadId: lead.id }
      )
    }

    // Send notification to Discord
    try {
      const { discordNotifier } = await import('@/lib/discord')
      await discordNotifier.sendLeadNotification({
        leadId: lead.id,
        fullName: lead.fullName,
        email: lead.email,
        phone: lead.phone,
        serviceInterest: lead.serviceInterest,
        source: lead.source,
        leadScore: lead.leadScore
      })
    } catch (error) {
      getLogger().warn(
        `Failed to send Discord notification: ${error instanceof Error ? error.message : String(error)}`,
        { leadId: lead.id }
      )
    }

    // Send confirmation email
    if (lead.email) {
      try {
        const { getEmailService } = await import('@/lib/email/service')
        const emailService = getEmailService()
        await emailService.sendLeadFollowUp(lead)
      } catch (error) {
        getLogger().warn(
          `Failed to send confirmation email: ${error instanceof Error ? error.message : String(error)}`,
          { leadId: lead.id }
        )
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: lead,
        message: 'Lead created successfully'
      },
      { status: 201 }
    )
  } catch (error) {
    getLogger().error(
      'Error creating lead',
      error instanceof Error ? error : new Error(String(error))
    )

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create lead',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET /api/leads - Lấy danh sách leads (Admin only)
export async function GET(request: NextRequest) {
  try {
    // Add authentication check for admin role
    const { getCurrentUser } = await import('@/lib/auth')
    const user = await getCurrentUser()

    if (!user || !user.staffProfile || !['admin', 'manager'].includes(user.staffProfile.role)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized access'
        },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const source = searchParams.get('source')
    const assignedTo = searchParams.get('assignedTo')

    interface LeadFilters {
      status?: string
      source?: string
      assignedTo?: string
    }
    const filters: LeadFilters = {}
    if (status) filters.status = status
    if (source) filters.source = source
    if (assignedTo) filters.assignedTo = assignedTo

    const leads = await prisma.lead.findMany({
      where: filters,
      orderBy: [{ leadScore: 'desc' }, { createdAt: 'desc' }],
      include: {
        assignedUser: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: leads,
      count: leads.length
    })
  } catch (error) {
    getLogger().error(
      'Error fetching leads',
      error instanceof Error ? error : new Error(String(error))
    )

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch leads',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function calculateLeadScore(data: {
  email?: string
  phone?: string
  fullName?: string
  serviceInterest?: string
  source?: string
}): number {
  let score = 0

  // Contact information scoring
  if (data.email) score += 20
  if (data.phone) score += 25
  if (data.fullName) score += 15

  // Service interest scoring
  if (data.serviceInterest === 'premium') score += 30
  else if (data.serviceInterest === 'pro') score += 20
  else if (data.serviceInterest === 'basic') score += 10

  // Source scoring
  if (data.source === 'referral') score += 15
  else if (data.source === 'discord') score += 10
  else if (data.source === 'website') score += 5

  return Math.min(score, 100)
}

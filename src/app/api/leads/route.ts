import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { prisma } from '@/lib/db'
import { getLogger } from '@/lib/monitoring/logger'
import { leadValidationSchema, sanitizeUserInput, sanitizePhoneNumber } from '@/lib/validation'

// POST /api/leads - Tạo lead mới từ contact form

interface LeadRequestBody {
  full_name?: string
  phone?: string
  notes?: string
  email?: string
  service_interest?: string
  source?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as LeadRequestBody

    // Sanitize input data
    const sanitizedData = {
      ...body,
      full_name: body.full_name ? sanitizeUserInput(body.full_name) : undefined,
      phone: body.phone ? sanitizePhoneNumber(body.phone) : undefined,
      notes: body.notes ? sanitizeUserInput(body.notes) : undefined
    }

    const validatedData = leadValidationSchema.parse(sanitizedData)

    // Check for existing lead with same email or phone
    const existingLead = await prisma.leads.findFirst({
      where: {
        OR: [
          ...(validatedData.email ? [{ email: validatedData.email }] : []),
          ...(validatedData.phone ? [{ phone: validatedData.phone }] : [])
        ]
      }
    })

    if (existingLead) {
      // Update existing lead instead of creating new one
      const updatedLead = await prisma.leads.update({
        where: { id: existingLead.id },
        data: {
          ...validatedData,
          lead_score: Math.max(existingLead.lead_score, calculateLeadScore(validatedData)),
          updated_at: new Date()
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
      lead_score: calculateLeadScore(validatedData),
      status: 'new'
    }

    const lead = await prisma.leads.create({
      data: leadData
    })

    // Trigger automated follow-up sequence
    try {
      // Schedule follow-up in communication table instead
      const followUpDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
      // Get a default system user for automated tasks
      const systemUser = await prisma.users.findFirst({
        where: { email: 'system@rokdbot.com' }
      })

      if (systemUser || lead.assigned_to) {
        await prisma.communication.create({
          data: {
            user_id: lead.assigned_to || systemUser?.id || '',
            type: 'system',
            channel: 'task',
            subject: `Follow up with lead: ${lead.full_name || lead.email}`,
            content: `Send follow-up email to lead interested in ${lead.service_interest || 'RoK services'}`,
            template_id: 'lead_followup_reminder',
            template_data: { leadId: lead.id, scheduledFor: followUpDate.toISOString() },
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
        full_name: lead.full_name,
        email: lead.email,
        phone: lead.phone,
        service_interest: lead.service_interest,
        source: lead.source,
        lead_score: lead.lead_score
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

    if (!user || !user.staff || !['admin', 'manager'].includes(user.staff.role)) {
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
    const assigned_to = searchParams.get('assigned_to')

    interface LeadFilters {
      status?: string
      source?: string
      assigned_to?: string
    }
    const filters: LeadFilters = {}
    if (status) filters.status = status
    if (source) filters.source = source
    if (assigned_to) filters.assigned_to = assigned_to

    const leads = await prisma.leads.findMany({
      where: filters,
      orderBy: [{ lead_score: 'desc' }, { created_at: 'desc' }],
      include: {
        assignedUser: {
          select: {
            id: true,
            full_name: true,
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
  full_name?: string
  service_interest?: string
  source?: string
}): number {
  let score = 0

  // Contact information scoring
  if (data.email) score += 20
  if (data.phone) score += 25
  if (data.full_name) score += 15

  // Service interest scoring
  if (data.service_interest === 'premium') score += 30
  else if (data.service_interest === 'pro') score += 20
  else if (data.service_interest === 'basic') score += 10

  // Source scoring
  if (data.source === 'referral') score += 15
  else if (data.source === 'discord') score += 10
  else if (data.source === 'website') score += 5

  return Math.min(score, 100)
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { leadValidationSchema, sanitizeUserInput, sanitizePhoneNumber } from '@/lib/validation'
import { z } from 'zod'

// POST /api/leads - Tạo lead mới từ contact form

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Sanitize input data
    const sanitizedData = {
      ...body,
      fullName: body.fullName ? sanitizeUserInput(body.fullName) : undefined,
      phone: body.phone ? sanitizePhoneNumber(body.phone) : undefined,
      notes: body.notes ? sanitizeUserInput(body.notes) : undefined,
    }
    
    const validatedData = leadValidationSchema.parse(sanitizedData)
    
    // Check for existing lead with same email or phone
    const existingLead = await prisma.lead.findFirst({
      where: {
        OR: [
          ...(validatedData.email ? [{ email: validatedData.email }] : []),
          ...(validatedData.phone ? [{ phone: validatedData.phone }] : []),
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
      status: 'new',
    }
    
    const lead = await prisma.lead.create({
      data: leadData
    })
    
    // TODO: Trigger automated follow-up sequence
    // TODO: Send notification to Discord
    // TODO: Send confirmation email
    
    return NextResponse.json({
      success: true,
      data: lead,
      message: 'Lead created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating lead:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation error',
        details: error.errors
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create lead',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET /api/leads - Lấy danh sách leads (Admin only)
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check for admin role
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const source = searchParams.get('source')
    const assignedTo = searchParams.get('assignedTo')
    
    const filters: any = {}
    if (status) filters.status = status
    if (source) filters.source = source
    if (assignedTo) filters.assignedTo = assignedTo
    
    const leads = await prisma.lead.findMany({
      where: filters,
      orderBy: [
        { leadScore: 'desc' },
        { createdAt: 'desc' }
      ],
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
    console.error('Error fetching leads:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch leads',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
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

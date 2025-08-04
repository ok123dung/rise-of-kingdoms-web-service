import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { trackRequest } from '@/lib/monitoring'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/services - Lấy danh sách tất cả services
export const GET = trackRequest('/api/services')(async function(request: NextRequest) {
  try {
    const services = await prisma.service.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { isFeatured: 'desc' },
        { sortOrder: 'asc' },
        { name: 'asc' }
      ],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        shortDescription: true,
        basePrice: true,
        currency: true,
        category: true,
        isActive: true,
        isFeatured: true,
        sortOrder: true,
        metadata: true,
        createdAt: true,
        updatedAt: true
      }
    })
    
    return NextResponse.json({
      success: true,
      data: services,
      count: services.length
    })
  } catch (error) {
    console.error('Error fetching services:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch services',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
})

// POST /api/services - Tạo service mới (Admin only)
const createServiceSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  slug: z.string().min(1, 'Service slug is required'),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  basePrice: z.number().positive('Base price must be positive'),
  currency: z.string().default('VND'),
  category: z.string().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().default(0),
  metadata: z.any().optional()
})

export const POST = trackRequest('/api/services')(async function(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Find user first, then check staff role
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true,
        staffProfile: {
          select: { role: true, isActive: true }
        }
      }
    })

    if (!user?.staffProfile || !user.staffProfile.isActive || !['admin', 'manager'].includes(user.staffProfile.role)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const validatedData = createServiceSchema.parse(body)
    
    const service = await prisma.service.create({
      data: validatedData
    })
    
    return NextResponse.json({
      success: true,
      data: service,
      message: 'Service created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating service:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation error',
        details: error.errors
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create service',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
})

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface RouteParams {
  params: {
    slug: string
  }
}

// GET /api/services/[slug] - Lấy thông tin service theo slug
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = params
    
    const service = await db.service.findBySlug(slug)
    
    if (!service) {
      return NextResponse.json({
        success: false,
        error: 'Service not found',
        message: `Service with slug '${slug}' does not exist`
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: service
    })
  } catch (error) {
    console.error('Error fetching service:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch service',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

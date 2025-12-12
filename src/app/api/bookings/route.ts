import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { prisma } from '@/lib/db'
import { sendAccountCreatedEmail, sendBookingReceivedEmail } from '@/lib/email'
import { NotFoundError, ConflictError } from '@/lib/errors'
import { getLogger } from '@/lib/monitoring/logger'
import { BookingService } from '@/services/booking.service'

// Stricter Schema validation with max length limits (DoS prevention)
const bookingSchema = z.object({
  service_id: z.string().min(1, 'Service ID is required').max(100, 'Service ID too long'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters').max(100, 'Full name too long'),
  email: z.string().email('Invalid email address').max(255, 'Email too long'),
  phone: z.string().regex(/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/, 'Invalid Vietnamese phone number').max(20, 'Phone too long'),
  kingdom: z.string().max(50, 'Kingdom too long').optional(),
  notes: z.string().max(2000, 'Notes too long').optional()
})

interface CreateBookingRequest {
  service_id: string
  full_name: string
  email: string
  phone: string
  kingdom?: string
  notes?: string
}

const bookingService = new BookingService()

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateBookingRequest
    const data = bookingSchema.parse(body)

    // Run user lookup and service tier lookup in parallel (N+1 optimization)
    const [existingUser, service_tiers] = await Promise.all([
      prisma.users.findUnique({ where: { email: data.email } }),
      prisma.service_tiers.findFirst({
        where: { services: { slug: data.service_id } },
        orderBy: { sort_order: 'asc' },
        include: { services: true }
      })
    ])

    // Validate service tier first (fail fast)
    if (!service_tiers) {
      return NextResponse.json(
        { success: false, error: 'Service not found or unavailable' },
        { status: 404 }
      )
    }

    // Find or Create User
    let user = existingUser
    if (!user) {
      // Create new user with random password
      const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
      const { hashPassword } = await import('@/lib/auth')
      const hashedPassword = await hashPassword(password)

      user = await prisma.users.create({
        data: {
          id: crypto.randomUUID(),
          email: data.email,
          full_name: data.full_name,
          phone: data.phone,
          password: hashedPassword,
          rok_kingdom: data.kingdom,
          status: 'active',
          updated_at: new Date()
        }
      })

      // Send account created email (fire and forget)
      sendAccountCreatedEmail(data.email, data.full_name, password).catch((err: unknown) =>
        getLogger().error(
          'Failed to send account created email',
          err instanceof Error ? err : new Error(String(err))
        )
      )
      getLogger().info(`Created new user for booking: ${user.email}`)
    }

    // 3. Create Booking using Service
    const bookingResult = await bookingService.createBooking({
      user_id: user.id,
      service_tier_id: service_tiers.id,
      customer_requirements: data.notes,
      notes: `Kingdom: ${data.kingdom ?? 'N/A'}`
    })
    const booking = bookingResult as { id: string; booking_number: string }

    // 4. Create Lead (for tracking)
    // This could be moved to an event listener or service, but keeping here for now
    await prisma.leads.create({
      data: {
        id: crypto.randomUUID(),
        email: data.email,
        full_name: data.full_name,
        phone: data.phone,
        service_interest: data.service_id,
        source: 'booking_form',
        status: 'converted',
        converted_booking_id: booking.id,
        lead_score: 80,
        updated_at: new Date()
      }
    })

    // Send booking received email
    const serviceName: string = service_tiers.services?.name ?? 'Service'
    sendBookingReceivedEmail(data.email, data.full_name, booking.booking_number, serviceName).catch(
      (err: unknown) =>
        getLogger().error(
          'Failed to send booking received email',
          err instanceof Error ? err : new Error(String(err))
        )
    )

    return NextResponse.json({
      success: true,
      booking_id: booking.id,
      message: 'Booking created successfully'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    if (error instanceof NotFoundError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 404 })
    }
    if (error instanceof ConflictError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 409 })
    }

    getLogger().error('Booking creation failed', error as Error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

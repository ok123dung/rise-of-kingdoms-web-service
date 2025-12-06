import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { prisma } from '@/lib/db'
import { sendAccountCreatedEmail, sendBookingReceivedEmail } from '@/lib/email'
import { NotFoundError, ConflictError } from '@/lib/errors'
import { getLogger } from '@/lib/monitoring/logger'
import { BookingService } from '@/services/booking.service'

// Stricter Schema validation
const bookingSchema = z.object({
  service_id: z.string().min(1, 'Service ID is required'),
  // Assuming service_id sent from frontend is actually the service SLUG.
  // Ideally, frontend should send service_tiersId, but if it sends serviceSlug, we need to handle that.
  // Based on previous code, it seems to expect a slug.

  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/, 'Invalid Vietnamese phone number'),
  kingdom: z.string().optional(),
  notes: z.string().optional()
  // Add gameId validation if it's part of the form, previous tests showed it might be
  // If not in schema, we can't validate it. Assuming it's passed in metadata or notes for now based on previous code structure
  // or if it was missing from the previous schema but present in tests.
  // The previous schema didn't have gameId, but tests did. Let's add it as optional or required based on business logic.
  // For now, keeping it consistent with previous schema but stricter on existing fields.
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

    // 1. Find or Create User
    // We keep this logic here or move to UserService. For now, keeping it here to minimize scope creep.
    let user = await prisma.users.findUnique({
      where: { email: data.email }
    })

    if (!user) {
      // Create new user with random password
      const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
      const { hashPassword } = await import('@/lib/auth')
      const hashedPassword = await hashPassword(password)

      user = await prisma.users.create({
        data: {
          email: data.email,
          full_name: data.full_name,
          phone: data.phone,
          password: hashedPassword,
          rok_kingdom: data.kingdom,
          status: 'active'
        }
      })

      // Send account created email
      sendAccountCreatedEmail(data.email, data.full_name, password).catch((err: unknown) =>
        getLogger().error(
          'Failed to send account created email',
          err instanceof Error ? err : new Error(String(err))
        )
      )
      getLogger().info(`Created new user for booking: ${user.email}`)
    }

    // 2. Resolve Service Tier
    // The frontend sends 'service_id' which is likely the Service Slug.
    // We need to find the default (first) tier for this service.
    const service_tiers = await prisma.service_tiers.findFirst({
      where: { service: { slug: data.service_id } },
      orderBy: { sort_order: 'asc' },
      include: { services: true }
    })

    if (!service_tiers) {
      // No Self-Healing anymore. Fail if not found.
      return NextResponse.json(
        { success: false, error: 'Service not found or unavailable' },
        { status: 404 }
      )
    }

    // 3. Create Booking using Service
    const booking = await bookingService.createBooking({
      user_id: user.id,
      service_tiersId: service_tiers.id,
      customer_requirements: data.notes,
      notes: `Kingdom: ${data.kingdom ?? 'N/A'}`
    })

    // 4. Create Lead (for tracking)
    // This could be moved to an event listener or service, but keeping here for now
    await prisma.leads.create({
      data: {
        email: data.email,
        full_name: data.full_name,
        phone: data.phone,
        service_interest: data.service_id,
        source: 'booking_form',
        status: 'converted',
        converted_booking_id: booking.id,
        lead_score: 80
      }
    })

    // Send booking received email
    sendBookingReceivedEmail(
      data.email,
      data.full_name,
      booking.booking_number,
      service_tiers.services.name
    ).catch((err: unknown) =>
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

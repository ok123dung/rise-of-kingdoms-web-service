import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { prisma } from '@/lib/db'
import { sendAccountCreatedEmail, sendBookingReceivedEmail } from '@/lib/email'
import { getLogger } from '@/lib/monitoring/logger'
import { BookingService } from '@/services/booking.service'
import { NotFoundError, ConflictError } from '@/lib/errors'

// Stricter Schema validation
const bookingSchema = z.object({
  serviceId: z.string().min(1, 'Service ID is required'),
  // Assuming serviceId sent from frontend is actually the service SLUG.
  // Ideally, frontend should send serviceTierId, but if it sends serviceSlug, we need to handle that.
  // Based on previous code, it seems to expect a slug.

  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/, 'Invalid Vietnamese phone number'),
  kingdom: z.string().optional(),
  notes: z.string().optional(),
  // Add gameId validation if it's part of the form, previous tests showed it might be
  // If not in schema, we can't validate it. Assuming it's passed in metadata or notes for now based on previous code structure
  // or if it was missing from the previous schema but present in tests.
  // The previous schema didn't have gameId, but tests did. Let's add it as optional or required based on business logic.
  // For now, keeping it consistent with previous schema but stricter on existing fields.
})

const bookingService = new BookingService()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = bookingSchema.parse(body)

    // 1. Find or Create User
    // We keep this logic here or move to UserService. For now, keeping it here to minimize scope creep.
    let user = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (!user) {
      // Create new user with random password
      const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
      const { hashPassword } = await import('@/lib/auth')
      const hashedPassword = await hashPassword(password)

      user = await prisma.user.create({
        data: {
          email: data.email,
          fullName: data.fullName,
          phone: data.phone,
          password: hashedPassword,
          rokKingdom: data.kingdom,
          status: 'active'
        }
      })

      // Send account created email
      sendAccountCreatedEmail(data.email, data.fullName, password).catch(err =>
        getLogger().error('Failed to send account created email', err)
      )
      getLogger().info(`Created new user for booking: ${user.email}`)
    }

    // 2. Resolve Service Tier
    // The frontend sends 'serviceId' which is likely the Service Slug.
    // We need to find the default (first) tier for this service.
    const serviceTier = await prisma.serviceTier.findFirst({
      where: { service: { slug: data.serviceId } },
      orderBy: { sortOrder: 'asc' },
      include: { service: true }
    })

    if (!serviceTier) {
      // No Self-Healing anymore. Fail if not found.
      return NextResponse.json(
        { success: false, error: 'Service not found or unavailable' },
        { status: 404 }
      )
    }

    // 3. Create Booking using Service
    const booking = await bookingService.createBooking({
      userId: user.id,
      serviceTierId: serviceTier.id,
      customerRequirements: data.notes,
      notes: `Kingdom: ${data.kingdom || 'N/A'}`
    })

    // 4. Create Lead (for tracking)
    // This could be moved to an event listener or service, but keeping here for now
    await prisma.lead.create({
      data: {
        email: data.email,
        fullName: data.fullName,
        phone: data.phone,
        serviceInterest: data.serviceId,
        source: 'booking_form',
        status: 'converted',
        convertedBookingId: booking.id,
        leadScore: 80
      }
    })

    // Send booking received email
    sendBookingReceivedEmail(
      data.email,
      data.fullName,
      booking.bookingNumber,
      serviceTier.service.name
    ).catch(err => getLogger().error('Failed to send booking received email', err))

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      message: 'Booking created successfully'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 })
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

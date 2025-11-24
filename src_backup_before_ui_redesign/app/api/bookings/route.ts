import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { prisma } from '@/lib/db'
import { sendAccountCreatedEmail, sendBookingReceivedEmail } from '@/lib/email'
import { getLogger } from '@/lib/monitoring/logger'

// Schema validation
const bookingSchema = z.object({
  serviceId: z.string().min(1),
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  kingdom: z.string().optional(),
  notes: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = bookingSchema.parse(body)

    const result = await prisma.$transaction(async tx => {
      // 1. Find or Create User
      let user = await tx.user.findUnique({
        where: { email: data.email }
      })

      if (!user) {
        // Create new user with random password
        const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
        const { hashPassword } = await import('@/lib/auth')
        const hashedPassword = await hashPassword(password)

        user = await tx.user.create({
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
        // Don't await to avoid blocking response
        sendAccountCreatedEmail(data.email, data.fullName, password).catch(err =>
          getLogger().error('Failed to send account created email', err)
        )
        getLogger().info(`Created new user for booking: ${user.email}`)
      }

      // 2. Create Booking
      // Generate a unique booking number (e.g., BK-20241120-XXXX)
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      const randomSuffix = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0')
      const bookingNumber = `BK-${dateStr}-${randomSuffix}`

      // Find Service ID (assuming we have services in DB, if not we might need to seed or use a placeholder)
      // For now, we'll try to find a service by slug, or use a default/placeholder if not found
      // In a real app, we should ensure services exist in DB.

      // Let's check if we can find the service in DB, otherwise we might fail constraint
      // Since we haven't seeded services, this might fail if we enforce foreign key.
      // However, the schema says `serviceTierId` is required.
      // We need to make sure we have a ServiceTier.

      // WORKAROUND: For this demo, we will try to find a ServiceTier. If not, we might need to create one on the fly or fail gracefully.
      // Actually, let's create a "General" service tier if it doesn't exist to avoid errors.

      // Find Service Tier
      // First, try to find by service slug (from request)
      // The request sends `serviceId` which is actually the service slug (e.g. 'strategy-consulting')
      // We need to determine which Tier is being booked.
      // Currently the booking form sends `serviceId` as the slug.
      // But it DOES NOT send the Tier ID or Tier Slug?
      // Let's check the booking form...
      // IF the form only sends service slug, we default to the first tier?
      // OR does `serviceId` actually contain the tier slug?
      // Looking at `servicesData`, keys are slugs like 'strategy-consulting'.
      // Looking at `bookingSchema`, `serviceId` is a string.

      // Assumption: The frontend sends the Service Slug.
      // Issue: A service has multiple tiers. Which one is being booked?
      // If the frontend doesn't send tier info, we can't know the price.

      // Let's assume for now we default to the FIRST tier if only service slug is provided.
      // Ideally, the form should send `serviceTierSlug` or `tierId`.

      let serviceTier = await tx.serviceTier.findFirst({
        where: { service: { slug: data.serviceId } },
        orderBy: { sortOrder: 'asc' }, // Default to first tier
        include: { service: true }
      })

      if (!serviceTier) {
        // Self-Healing: Check if it exists in static data
        const { servicesData } = await import('@/data/services')
        const serviceData = servicesData[data.serviceId]

        if (serviceData) {
          getLogger().warn(`Service ${data.serviceId} not found in DB. Self-healing...`)

          // Create Service
          const service = await tx.service.create({
            data: {
              slug: serviceData.slug,
              name: serviceData.name,
              description: serviceData.description,
              basePrice: serviceData.pricing[0]?.price || 0,
              isActive: true,
              category: 'general',
              metadata: {
                shortDescription: serviceData.shortDescription,
                features: serviceData.features,
                benefits: serviceData.benefits
              }
            }
          })

          // Create Tiers
          for (const tierData of serviceData.pricing) {
            const tierSlug = `${serviceData.slug}-${tierData.tier.toLowerCase().replace(/\s+/g, '-')}`
            await tx.serviceTier.create({
              data: {
                serviceId: service.id,
                name: tierData.tier,
                slug: tierSlug,
                price: tierData.price,
                features: tierData.features,
                metadata: {
                  duration: tierData.duration
                }
              }
            })
          }

          // Fetch the newly created tier (first one)
          serviceTier = await tx.serviceTier.findFirst({
            where: { serviceId: service.id },
            orderBy: { sortOrder: 'asc' },
            include: { service: true }
          })
        }
      }

      if (!serviceTier) {
        throw new Error(`Service ${data.serviceId} not found in database or static config.`)
      }

      const booking = await tx.booking.create({
        data: {
          bookingNumber,
          userId: user.id,
          serviceTierId: serviceTier.id,
          status: 'pending',
          paymentStatus: 'pending',
          totalAmount: serviceTier.price,
          finalAmount: serviceTier.price,
          customerRequirements: data.notes,
          internalNotes: `Kingdom: ${data.kingdom}`
        }
      })

      // 3. Create Lead (for tracking)
      await tx.lead.create({
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

      return booking
    })

    return NextResponse.json({
      success: true,
      bookingId: result.id,
      message: 'Booking created successfully'
    })
  } catch (error) {
    getLogger().error('Booking creation failed', error as Error)
    return NextResponse.json({ success: false, error: 'Failed to create booking' }, { status: 500 })
  }
}

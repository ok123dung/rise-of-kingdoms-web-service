import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function analyzeDatabase() {
  console.log('🔍 DATABASE ANALYSIS REPORT')
  console.log('='.repeat(50))

  try {
    // Check Users
    const userCount = await prisma.user.count()
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        rokPower: true,
        status: true,
        createdAt: true
      },
      take: 5
    })
    console.log(`\n👥 USERS (${userCount} total):`)
    users.forEach(user => {
      console.log(
        `   - ${user.fullName} (${user.email}): ${user.rokPower ? `${user.rokPower} power` : 'No power set'} - ${user.status}`
      )
    })

    // Check Services
    const serviceCount = await prisma.service.count()
    const services = await prisma.service.findMany({
      include: {
        serviceTiers: true
      }
    })
    console.log(`\n🛠️ SERVICES (${serviceCount} total):`)
    services.forEach(service => {
      console.log(
        `   - ${service.name} (${service.slug}): ${service.serviceTiers.length} tiers, ${service.basePrice} VNĐ`
      )
    })

    // Check Bookings
    const bookingCount = await prisma.booking.count()
    const bookings = await prisma.booking.findMany({
      include: {
        user: {
          select: { fullName: true, email: true }
        },
        serviceTier: {
          include: {
            service: {
              select: { name: true }
            }
          }
        },
        payments: true
      }
    })
    console.log(`\n📋 BOOKINGS (${bookingCount} total):`)
    bookings.forEach(booking => {
      const service = booking.serviceTier.service.name
      const tier = booking.serviceTier.name
      const customer = booking.user.fullName
      const amount = booking.finalAmount
      const paymentCount = booking.payments.length
      console.log(
        `   - ${customer}: ${service} (${tier}) - ${amount} VNĐ - ${paymentCount} payment(s) - ${booking.status}`
      )
    })

    // Check Payments
    const paymentCount = await prisma.payment.count()
    const payments = await prisma.payment.findMany({
      include: {
        booking: {
          include: {
            user: {
              select: { fullName: true }
            }
          }
        }
      }
    })
    console.log(`\n💳 PAYMENTS (${paymentCount} total):`)
    payments.forEach(payment => {
      const customer = payment.booking.user.fullName
      console.log(
        `   - ${customer}: ${payment.amount} VNĐ via ${payment.paymentMethod} - ${payment.status}`
      )
    })

    // Check Leads
    const leadCount = await prisma.lead.count()
    const leads = await prisma.lead.findMany({
      select: {
        fullName: true,
        email: true,
        serviceInterest: true,
        leadScore: true,
        status: true,
        source: true
      }
    })
    console.log(`\n🎯 LEADS (${leadCount} total):`)
    leads.forEach(lead => {
      console.log(
        `   - ${lead.fullName} (${lead.email}): ${lead.serviceInterest} interest, score ${lead.leadScore}, ${lead.status} from ${lead.source}`
      )
    })

    // Revenue Analysis
    const totalRevenue = await prisma.payment.aggregate({
      where: { status: 'completed' },
      _sum: { amount: true }
    })
    const avgBookingValue = await prisma.booking.aggregate({
      _avg: { finalAmount: true }
    })
    console.log(`\n💰 REVENUE ANALYSIS:`)
    console.log(`   - Total Revenue: ${totalRevenue._sum.amount || 0} VNĐ`)
    console.log(
      `   - Average Booking Value: ${Math.round(Number(avgBookingValue._avg.finalAmount) || 0)} VNĐ`
    )

    // Database Health Check
    console.log(`\n🔧 DATABASE HEALTH:`)
    console.log(`   - Users: ${userCount} records`)
    console.log(`   - Services: ${serviceCount} records`)
    console.log(`   - Bookings: ${bookingCount} records`)
    console.log(`   - Payments: ${paymentCount} records`)
    console.log(`   - Leads: ${leadCount} records`)
    console.log(`   - Staff: ${await prisma.staff.count()} records`)

    // Check for data integrity issues
    const usersWithoutBookings = await prisma.user.count({
      where: {
        bookings: {
          none: {}
        }
      }
    })
    const bookingsWithoutPayments = await prisma.booking.count({
      where: {
        payments: {
          none: {}
        }
      }
    })
    console.log(`\n⚠️ POTENTIAL ISSUES:`)
    console.log(`   - Users without bookings: ${usersWithoutBookings}`)
    console.log(`   - Bookings without payments: ${bookingsWithoutPayments}`)
  } catch (error) {
    console.error('❌ Database analysis failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

analyzeDatabase()

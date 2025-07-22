import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Database connection health check
export async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return { status: 'healthy', message: 'Database connection successful' }
  } catch (error) {
    console.error('Database connection failed:', error)
    return { status: 'unhealthy', message: 'Database connection failed', error }
  }
}

// Database utilities
export const db = {
  // User operations
  user: {
    async findByEmail(email: string) {
      return prisma.user.findUnique({
        where: { email },
        include: {
          bookings: {
            include: {
              serviceTier: {
                include: {
                  service: true
                }
              },
              payments: true
            }
          },
          staffProfile: true
        }
      })
    },

    async findByDiscordId(discordId: string) {
      return prisma.user.findFirst({
        where: { discordId },
        include: {
          bookings: true,
          staffProfile: true
        }
      })
    },

    async create(data: {
      email: string
      fullName: string
      phone?: string
      discordUsername?: string
      discordId?: string
      rokPlayerId?: string
      rokKingdom?: string
    }) {
      return prisma.user.create({
        data,
        include: {
          bookings: true
        }
      })
    },

    async updateLastLogin(id: string) {
      return prisma.user.update({
        where: { id },
        data: { lastLogin: new Date() }
      })
    }
  },

  // Service operations
  service: {
    async findAll() {
      return prisma.service.findMany({
        where: { isActive: true },
        include: {
          serviceTiers: {
            where: { isAvailable: true },
            orderBy: { sortOrder: 'asc' }
          }
        },
        orderBy: { sortOrder: 'asc' }
      })
    },

    async findBySlug(slug: string) {
      return prisma.service.findUnique({
        where: { slug },
        include: {
          serviceTiers: {
            where: { isAvailable: true },
            orderBy: { sortOrder: 'asc' }
          }
        }
      })
    },

    async findTierById(id: string) {
      return prisma.serviceTier.findUnique({
        where: { id },
        include: {
          service: true
        }
      })
    }
  },

  // Booking operations
  booking: {
    async create(data: {
      userId: string
      serviceTierId: string
      totalAmount: number
      finalAmount: number
      bookingDetails?: any
      customerRequirements?: string
      startDate?: Date
      endDate?: Date
    }) {
      const bookingNumber = await generateBookingNumber()
      
      return prisma.booking.create({
        data: {
          ...data,
          bookingNumber,
          discountAmount: data.totalAmount - data.finalAmount
        },
        include: {
          user: true,
          serviceTier: {
            include: {
              service: true
            }
          }
        }
      })
    },

    async findById(id: string) {
      return prisma.booking.findUnique({
        where: { id },
        include: {
          user: true,
          serviceTier: {
            include: {
              service: true
            }
          },
          payments: true,
          communications: true
        }
      })
    },

    async findByUser(userId: string) {
      return prisma.booking.findMany({
        where: { userId },
        include: {
          serviceTier: {
            include: {
              service: true
            }
          },
          payments: true
        },
        orderBy: { createdAt: 'desc' }
      })
    },

    async updateStatus(id: string, status: string) {
      return prisma.booking.update({
        where: { id },
        data: { status, updatedAt: new Date() }
      })
    },

    async updatePaymentStatus(id: string, paymentStatus: string) {
      return prisma.booking.update({
        where: { id },
        data: { paymentStatus, updatedAt: new Date() }
      })
    }
  },

  // Payment operations
  payment: {
    async create(data: {
      bookingId: string
      amount: number
      paymentMethod: string
      paymentGateway: string
      gatewayTransactionId?: string
      gatewayOrderId?: string
    }) {
      const paymentNumber = await generatePaymentNumber()
      
      return prisma.payment.create({
        data: {
          ...data,
          paymentNumber
        },
        include: {
          booking: {
            include: {
              user: true,
              serviceTier: {
                include: {
                  service: true
                }
              }
            }
          }
        }
      })
    },

    async updateStatus(id: string, status: string, gatewayResponse?: any) {
      const updateData: any = { 
        status, 
        updatedAt: new Date() 
      }
      
      if (gatewayResponse) {
        updateData.gatewayResponse = gatewayResponse
      }
      
      if (status === 'completed') {
        updateData.paidAt = new Date()
      }

      return prisma.payment.update({
        where: { id },
        data: updateData
      })
    },

    async findByGatewayTransactionId(gatewayTransactionId: string) {
      return prisma.payment.findFirst({
        where: { gatewayTransactionId },
        include: {
          booking: {
            include: {
              user: true
            }
          }
        }
      })
    }
  },

  // Lead operations
  lead: {
    async create(data: {
      email?: string
      phone?: string
      fullName?: string
      serviceInterest?: string
      source?: string
      utmSource?: string
      utmMedium?: string
      utmCampaign?: string
    }) {
      return prisma.lead.create({
        data: {
          ...data,
          leadScore: calculateLeadScore(data)
        }
      })
    },

    async findAll(filters?: {
      status?: string
      source?: string
      assignedTo?: string
    }) {
      return prisma.lead.findMany({
        where: filters,
        include: {
          assignedUser: true,
          convertedBooking: true
        },
        orderBy: { createdAt: 'desc' }
      })
    },

    async updateStatus(id: string, status: string) {
      return prisma.lead.update({
        where: { id },
        data: { status, updatedAt: new Date() }
      })
    },

    async convertToBooking(id: string, bookingId: string) {
      return prisma.lead.update({
        where: { id },
        data: {
          status: 'converted',
          convertedAt: new Date(),
          convertedBookingId: bookingId,
          updatedAt: new Date()
        }
      })
    }
  },

  // Communication operations
  communication: {
    async create(data: {
      userId: string
      bookingId?: string
      type: string
      channel?: string
      subject?: string
      content: string
      templateId?: string
      templateData?: any
    }) {
      return prisma.communication.create({
        data
      })
    },

    async updateStatus(id: string, status: string, metadata?: {
      sentAt?: Date
      deliveredAt?: Date
      readAt?: Date
      errorMessage?: string
    }) {
      return prisma.communication.update({
        where: { id },
        data: {
          status,
          ...metadata
        }
      })
    }
  }
}

// Helper functions
async function generateBookingNumber(): Promise<string> {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  
  const count = await prisma.booking.count({
    where: {
      createdAt: {
        gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
      }
    }
  })
  
  const sequence = (count + 1).toString().padStart(3, '0')
  return `RK${year}${month}${day}${sequence}`
}

async function generatePaymentNumber(): Promise<string> {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  
  const count = await prisma.payment.count({
    where: {
      createdAt: {
        gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
      }
    }
  })
  
  const sequence = (count + 1).toString().padStart(4, '0')
  return `PAY${year}${month}${day}${sequence}`
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

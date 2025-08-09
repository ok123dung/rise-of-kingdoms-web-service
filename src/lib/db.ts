import { PrismaClient, type Prisma } from '@prisma/client'

import { handleDatabaseError, NotFoundError, retryWithBackoff } from '@/lib/errors'
import { getLogger } from '@/lib/monitoring/logger'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create Prisma client with proper error handling
function createPrismaClient() {
  try {
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      errorFormat: 'pretty'
    })
  } catch (error) {
    getLogger().error('Failed to create Prisma client', error as Error)
    throw error
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Database connection health check
export async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return { status: 'healthy', message: 'Database connection successful' }
  } catch (error) {
    getLogger().error('Database connection failed', error as Error)
    return { status: 'unhealthy', message: 'Database connection failed', error }
  }
}

// Database utilities with proper error handling
export const db = {
  // User operations
  user: {
    async findByEmail(email: string) {
      try {
        const user = await prisma.user.findUnique({
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
        return user
      } catch (error) {
        handleDatabaseError(error)
      }
    },

    async findByDiscordId(discordId: string) {
      try {
        const user = await prisma.user.findFirst({
          where: { discordId },
          include: {
            bookings: true,
            staffProfile: true
          }
        })
        return user
      } catch (error) {
        handleDatabaseError(error)
      }
    },

    async create(data: {
      email: string
      fullName: string
      password?: string
      phone?: string
      discordUsername?: string
      discordId?: string
      rokPlayerId?: string
      rokKingdom?: string
    }) {
      try {
        return await prisma.user.create({
          data: {
            ...data,
            password: data.password || ''
          },
          include: {
            bookings: true
          }
        })
      } catch (error) {
        handleDatabaseError(error)
      }
    },

    async updateLastLogin(id: string) {
      try {
        return await prisma.user.update({
          where: { id },
          data: { lastLogin: new Date() }
        })
      } catch (error) {
        handleDatabaseError(error)
      }
    }
  },

  // Service operations
  service: {
    async findAll() {
      try {
        return await prisma.service.findMany({
          where: { isActive: true },
          include: {
            serviceTiers: {
              where: { isAvailable: true },
              orderBy: { sortOrder: 'asc' }
            }
          },
          orderBy: { sortOrder: 'asc' }
        })
      } catch (error) {
        handleDatabaseError(error)
      }
    },

    async findBySlug(slug: string) {
      try {
        const service = await prisma.service.findUnique({
          where: { slug },
          include: {
            serviceTiers: {
              where: { isAvailable: true },
              orderBy: { sortOrder: 'asc' }
            }
          }
        })

        if (!service) {
          throw new NotFoundError('Service')
        }

        return service
      } catch (error) {
        if (error instanceof NotFoundError) throw error
        handleDatabaseError(error)
      }
    },

    async findTierById(id: string) {
      try {
        const tier = await prisma.serviceTier.findUnique({
          where: { id },
          include: {
            service: true
          }
        })

        if (!tier) {
          throw new NotFoundError('Service tier')
        }

        return tier
      } catch (error) {
        if (error instanceof NotFoundError) throw error
        handleDatabaseError(error)
      }
    }
  },

  // Booking operations
  booking: {
    async create(data: {
      userId: string
      serviceTierId: string
      totalAmount: number
      finalAmount: number
      bookingDetails?: Record<string, unknown>
      customerRequirements?: string
      startDate?: Date
      endDate?: Date
    }) {
      try {
        const bookingNumber = await generateBookingNumber()

        return await prisma.booking.create({
          data: {
            bookingNumber,
            userId: data.userId,
            serviceTierId: data.serviceTierId,
            totalAmount: data.totalAmount,
            finalAmount: data.finalAmount,
            discountAmount: data.totalAmount - data.finalAmount,
            ...(data.bookingDetails && {
              bookingDetails: data.bookingDetails as Prisma.InputJsonValue
            }),
            customerRequirements: data.customerRequirements,
            startDate: data.startDate,
            endDate: data.endDate
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
      } catch (error) {
        handleDatabaseError(error)
      }
    },

    async findById(id: string) {
      try {
        const booking = await prisma.booking.findUnique({
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

        if (!booking) {
          throw new NotFoundError('Booking')
        }

        return booking
      } catch (error) {
        if (error instanceof NotFoundError) throw error
        handleDatabaseError(error)
      }
    },

    async findByUser(userId: string) {
      try {
        return await prisma.booking.findMany({
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
      } catch (error) {
        handleDatabaseError(error)
      }
    },

    async updateStatus(id: string, status: string) {
      try {
        return await prisma.booking.update({
          where: { id },
          data: { status, updatedAt: new Date() }
        })
      } catch (error) {
        handleDatabaseError(error)
      }
    },

    async updatePaymentStatus(id: string, paymentStatus: string) {
      try {
        return await prisma.booking.update({
          where: { id },
          data: { paymentStatus, updatedAt: new Date() }
        })
      } catch (error) {
        handleDatabaseError(error)
      }
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
      try {
        const paymentNumber = await generatePaymentNumber()

        return await prisma.payment.create({
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
      } catch (error) {
        handleDatabaseError(error)
      }
    },

    async updateStatus(id: string, status: string, gatewayResponse?: Record<string, unknown>) {
      try {
        const updateData: Record<string, unknown> = {
          status,
          updatedAt: new Date()
        }

        if (gatewayResponse) {
          updateData.gatewayResponse = gatewayResponse
        }

        if (status === 'completed') {
          updateData.paidAt = new Date()
        }

        return await prisma.payment.update({
          where: { id },
          data: updateData
        })
      } catch (error) {
        handleDatabaseError(error)
      }
    },

    async findByGatewayTransactionId(gatewayTransactionId: string) {
      try {
        const payment = await prisma.payment.findFirst({
          where: { gatewayTransactionId },
          include: {
            booking: {
              include: {
                user: true
              }
            }
          }
        })

        return payment
      } catch (error) {
        handleDatabaseError(error)
      }
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
      try {
        return await prisma.lead.create({
          data: {
            ...data,
            leadScore: calculateLeadScore(data)
          }
        })
      } catch (error) {
        handleDatabaseError(error)
      }
    },

    async findAll(filters?: { status?: string; source?: string; assignedTo?: string }) {
      try {
        return await prisma.lead.findMany({
          where: filters,
          include: {
            assignedUser: true,
            convertedBooking: true
          },
          orderBy: { createdAt: 'desc' }
        })
      } catch (error) {
        handleDatabaseError(error)
      }
    },

    async updateStatus(id: string, status: string) {
      try {
        return await prisma.lead.update({
          where: { id },
          data: { status, updatedAt: new Date() }
        })
      } catch (error) {
        handleDatabaseError(error)
      }
    },

    async convertToBooking(id: string, bookingId: string) {
      try {
        return await prisma.lead.update({
          where: { id },
          data: {
            status: 'converted',
            convertedAt: new Date(),
            convertedBookingId: bookingId,
            updatedAt: new Date()
          }
        })
      } catch (error) {
        handleDatabaseError(error)
      }
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
      templateData?: Record<string, unknown>
    }) {
      try {
        const { templateData, ...restData } = data
        return await prisma.communication.create({
          data: {
            ...restData,
            ...(templateData && { templateData: templateData as Prisma.InputJsonValue })
          }
        })
      } catch (error) {
        handleDatabaseError(error)
      }
    },

    async updateStatus(
      id: string,
      status: string,
      metadata?: {
        sentAt?: Date
        deliveredAt?: Date
        readAt?: Date
        errorMessage?: string
      }
    ) {
      try {
        return await prisma.communication.update({
          where: { id },
          data: {
            status,
            ...metadata
          }
        })
      } catch (error) {
        handleDatabaseError(error)
      }
    }
  }
}

// Helper functions with proper error handling
async function generateBookingNumber(): Promise<string> {
  try {
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
  } catch (error) {
    getLogger().error('Failed to generate booking number', error as Error)
    // Fallback to timestamp-based number
    return `RK${Date.now()}`
  }
}

async function generatePaymentNumber(): Promise<string> {
  try {
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
  } catch (error) {
    getLogger().error('Failed to generate payment number', error as Error)
    // Fallback to timestamp-based number
    return `PAY${Date.now()}`
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

// Database transaction wrapper with retry
export async function withTransaction<T>(
  fn: (tx: PrismaClient) => Promise<T>,
  options?: { maxRetries?: number }
): Promise<T> {
  return retryWithBackoff(
    async () => {
      return await prisma.$transaction(async tx => {
        return await fn(tx as PrismaClient)
      })
    },
    {
      maxRetries: options?.maxRetries || 3,
      onRetry: (error, attempt) => {
        getLogger().warn('Database transaction retry', {
          errorMessage: error instanceof Error ? error.message : String(error),
          attempt
        })
      }
    }
  )
}

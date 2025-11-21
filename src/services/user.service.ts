import { hash, compare } from 'bcryptjs'

import { prisma } from '@/lib/db'
import { sendWelcomeEmail } from '@/lib/email'
import { NotFoundError, ValidationError, AuthenticationError, ConflictError } from '@/lib/errors'
import { getLogger } from '@/lib/monitoring/logger'
import type { User } from '@/types/database'

export class UserService {
  private logger = getLogger()

  /**
   * Create a new user
   */
  async createUser(data: {
    email: string
    password: string
    fullName: string
    phone?: string
    rokPlayerId?: string
    rokKingdom?: string
  }): Promise<User> {
    // Check if email already exists
    const existingUser = await this.getUserByEmail(data.email)
    if (existingUser) {
      throw new ConflictError('Email already registered')
    }

    // Hash password
    const hashedPassword = await hash(data.password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        password: hashedPassword,
        fullName: data.fullName,
        phone: data.phone,
        rokPlayerId: data.rokPlayerId,
        rokKingdom: data.rokKingdom,
        status: 'active'
      }
    })

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.fullName)
    } catch (error) {
      this.logger.warn('Failed to send welcome email', {
        userId: user.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    this.logger.info('User created', {
      userId: user.id,
      email: user.email
    })

    return user
  }

  /**
   * Authenticate user
   */
  async authenticateUser(email: string, password: string): Promise<User> {
    const user = await this.getUserByEmail(email)
    if (!user) {
      throw new AuthenticationError('Invalid credentials')
    }

    const isValid = await compare(password, user.password)
    if (!isValid) {
      throw new AuthenticationError('Invalid credentials')
    }

    if (user.status !== 'active') {
      throw new ValidationError('Account is not active')
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    })

    return user
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id: userId }
    })
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: string,
    data: {
      fullName?: string
      phone?: string
      rokPlayerId?: string
      rokKingdom?: string
      rokPower?: bigint
      discordUsername?: string
    }
  ): Promise<User> {
    const user = await this.getUserById(userId)
    if (!user) {
      throw new NotFoundError('User')
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName: data.fullName || user.fullName,
        phone: data.phone || user.phone,
        rokPlayerId: data.rokPlayerId || user.rokPlayerId,
        rokKingdom: data.rokKingdom || user.rokKingdom,
        rokPower: data.rokPower || user.rokPower,
        discordUsername: data.discordUsername || user.discordUsername
      }
    })

    this.logger.info('User profile updated', {
      userId,
      updatedFields: Object.keys(data).join(', ')
    })

    return updated
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.getUserById(userId)
    if (!user) {
      throw new NotFoundError('User')
    }

    // Verify current password
    const isValid = await compare(currentPassword, user.password)
    if (!isValid) {
      throw new ValidationError('Current password is incorrect')
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 12)

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    })

    this.logger.info('User password changed', { userId })
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string) {
    const [user, totalBookings, activeBookings, completedBookings, totalSpent, lastBooking] =
      await Promise.all([
        prisma.user.findUnique({ where: { id: userId } }),
        prisma.booking.count({
          where: { userId }
        }),
        prisma.booking.count({
          where: {
            userId,
            status: { in: ['pending', 'confirmed', 'in_progress'] }
          }
        }),
        prisma.booking.count({
          where: { userId, status: 'completed' }
        }),
        prisma.payment.aggregate({
          where: {
            booking: { userId },
            status: 'completed'
          },
          _sum: { amount: true }
        }),
        prisma.booking.findFirst({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true }
        })
      ])

    return {
      totalBookings,
      activeBookings,
      completedBookings,
      totalSpent: totalSpent._sum.amount?.toNumber() || 0,
      lastBookingDate: lastBooking?.createdAt,
      memberSince: user?.createdAt
    }
  }

  /**
   * Search users (admin only)
   */
  async searchUsers(query: {
    search?: string
    status?: string
    role?: string
    limit?: number
    offset?: number
  }) {
    const where: any = {}

    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { fullName: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search } }
      ]
    }

    if (query.status) {
      where.status = query.status
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          status: true,
          createdAt: true,
          lastLogin: true
        },
        orderBy: { createdAt: 'desc' },
        take: query.limit || 20,
        skip: query.offset || 0
      }),
      prisma.user.count({ where })
    ])

    return { users, total }
  }
}

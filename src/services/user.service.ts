import { hash, compare } from 'bcryptjs'

import { prisma } from '@/lib/db'
import { sendWelcomeEmail } from '@/lib/email'
import { NotFoundError, ValidationError, AuthenticationError, ConflictError } from '@/lib/errors'
import { getLogger } from '@/lib/monitoring/logger'
import type { User } from '@/types/prisma'

export class UserService {
  private logger = getLogger()

  /**
   * Create a new user
   */
  async createUser(data: {
    email: string
    password: string
    full_name: string
    phone?: string
    rok_player_id?: string
    rok_kingdom?: string
  }): Promise<User> {
    // Check if email already exists
    const existingUser = await this.getUserByEmail(data.email)
    if (existingUser) {
      throw new ConflictError('Email already registered')
    }

    // Hash password
    const hashedPassword = await hash(data.password, 12)

    // Create user
    const user = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        email: data.email.toLowerCase(),
        password: hashedPassword,
        full_name: data.full_name,
        phone: data.phone,
        rok_player_id: data.rok_player_id,
        rok_kingdom: data.rok_kingdom,
        status: 'active',
        updated_at: new Date()
      }
    })

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.full_name)
    } catch (error) {
      this.logger.warn('Failed to send welcome email', {
        user_id: user.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    this.logger.info('User created', {
      user_id: user.id,
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
    await prisma.users.update({
      where: { id: user.id },
      data: { last_login: new Date() }
    })

    return user
  }

  /**
   * Get user by ID
   */
  async getUserById(user_id: string): Promise<User | null> {
    return prisma.users.findUnique({
      where: { id: user_id }
    })
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    return prisma.users.findUnique({
      where: { email: email.toLowerCase() }
    })
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    user_id: string,
    data: {
      full_name?: string
      phone?: string
      rok_player_id?: string
      rok_kingdom?: string
      rok_power?: bigint
      discord_username?: string
    }
  ): Promise<User> {
    const user = await this.getUserById(user_id)
    if (!user) {
      throw new NotFoundError('User')
    }

    const updated = await prisma.users.update({
      where: { id: user_id },
      data: {
        full_name: data.full_name ?? user.full_name,
        phone: data.phone ?? user.phone,
        rok_player_id: data.rok_player_id ?? user.rok_player_id,
        rok_kingdom: data.rok_kingdom ?? user.rok_kingdom,
        rok_power: data.rok_power ?? user.rok_power,
        discord_username: data.discord_username ?? user.discord_username
      }
    })

    this.logger.info('User profile updated', {
      user_id,
      updatedFields: Object.keys(data).join(', ')
    })

    return updated
  }

  /**
   * Change user password
   */
  async changePassword(
    user_id: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.getUserById(user_id)
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
    await prisma.users.update({
      where: { id: user_id },
      data: { password: hashedPassword }
    })

    this.logger.info('User password changed', { user_id })
  }

  /**
   * Get user statistics
   */
  async getUserStats(user_id: string) {
    const [user, totalBookings, activeBookings, completedBookings, totalSpent, lastBooking] =
      await Promise.all([
        prisma.users.findUnique({ where: { id: user_id } }),
        prisma.bookings.count({
          where: { user_id }
        }),
        prisma.bookings.count({
          where: {
            user_id,
            status: { in: ['pending', 'confirmed', 'in_progress'] }
          }
        }),
        prisma.bookings.count({
          where: { user_id, status: 'completed' }
        }),
        prisma.payments.aggregate({
          where: {
            bookings: { user_id },
            status: 'completed'
          },
          _sum: { amount: true }
        }),
        prisma.bookings.findFirst({
          where: { user_id },
          orderBy: { created_at: 'desc' },
          select: { created_at: true }
        })
      ])

    return {
      totalBookings,
      activeBookings,
      completedBookings,
      totalSpent: totalSpent._sum?.amount?.toNumber() ?? 0,
      lastBookingDate: lastBooking?.created_at,
      memberSince: user?.created_at
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
    interface UserSearchWhere {
      OR?: Array<Record<string, unknown>>
      status?: string
    }

    const where: UserSearchWhere = {}

    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { full_name: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search } }
      ]
    }

    if (query.status) {
      where.status = query.status
    }

    const [users, total] = await Promise.all([
      prisma.users.findMany({
        where,
        select: {
          id: true,
          email: true,
          full_name: true,
          phone: true,
          status: true,
          created_at: true,
          last_login: true
        },
        orderBy: { created_at: 'desc' },
        take: query.limit ?? 20,
        skip: query.offset ?? 0
      }),
      prisma.users.count({ where })
    ])

    return { users, total }
  }
}

/**
 * User Service Tests
 * Tests for user authentication and profile management
 */

import { UserService } from '../user.service'
import { NotFoundError, ValidationError, AuthenticationError, ConflictError } from '@/lib/errors'

// Mock dependencies
jest.mock('@/lib/db', () => ({
  prisma: {
    users: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    bookings: {
      count: jest.fn(),
      findFirst: jest.fn(),
    },
    payments: {
      aggregate: jest.fn(),
    },
  },
}))

jest.mock('@/lib/monitoring/logger', () => ({
  getLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}))

jest.mock('@/lib/email', () => ({
  sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn(),
}))

import { prisma } from '@/lib/db'
import { compare, hash } from 'bcryptjs'
import { sendWelcomeEmail } from '@/lib/email'

const mockPrisma = prisma as jest.Mocked<typeof prisma>
const mockCompare = compare as jest.MockedFunction<typeof compare>
const mockHash = hash as jest.MockedFunction<typeof hash>
const mockSendWelcomeEmail = sendWelcomeEmail as jest.MockedFunction<typeof sendWelcomeEmail>

describe('UserService', () => {
  let service: UserService

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    password: 'hashed-password',
    full_name: 'Test User',
    phone: '0912345678',
    status: 'active',
    rok_player_id: 'ROK123',
    rok_kingdom: '1234',
    rok_power: BigInt(50000000),
    discord_username: 'testuser#1234',
    created_at: new Date(),
    updated_at: new Date(),
    last_login: null,
  }

  beforeEach(() => {
    service = new UserService()
    jest.clearAllMocks()
  })

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      mockPrisma.users.findUnique.mockResolvedValue(null)
      mockPrisma.users.create.mockResolvedValue(mockUser as any)

      const result = await service.createUser({
        email: 'newuser@example.com',
        password: 'password123',
        full_name: 'New User',
      })

      expect(result.email).toBe(mockUser.email)
      expect(mockHash).toHaveBeenCalledWith('password123', 12)
      expect(mockPrisma.users.create).toHaveBeenCalled()
      expect(mockSendWelcomeEmail).toHaveBeenCalled()
    })

    it('should throw ConflictError if email already exists', async () => {
      mockPrisma.users.findUnique.mockResolvedValue(mockUser as any)

      await expect(
        service.createUser({
          email: 'test@example.com',
          password: 'password123',
          full_name: 'Test User',
        })
      ).rejects.toThrow(ConflictError)
    })

    it('should lowercase email before creating', async () => {
      mockPrisma.users.findUnique.mockResolvedValue(null)
      mockPrisma.users.create.mockResolvedValue(mockUser as any)

      await service.createUser({
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
        full_name: 'Test User',
      })

      expect(mockPrisma.users.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'test@example.com',
          }),
        })
      )
    })

    it('should handle email sending failure gracefully', async () => {
      mockPrisma.users.findUnique.mockResolvedValue(null)
      mockPrisma.users.create.mockResolvedValue(mockUser as any)
      mockSendWelcomeEmail.mockRejectedValue(new Error('Email failed'))

      // Should not throw, just log warning
      const result = await service.createUser({
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User',
      })

      expect(result).toBeDefined()
    })

    it('should include optional fields when provided', async () => {
      mockPrisma.users.findUnique.mockResolvedValue(null)
      mockPrisma.users.create.mockResolvedValue(mockUser as any)

      await service.createUser({
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User',
        phone: '0912345678',
        rok_player_id: 'ROK123',
        rok_kingdom: '1234',
      })

      expect(mockPrisma.users.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            phone: '0912345678',
            rok_player_id: 'ROK123',
            rok_kingdom: '1234',
          }),
        })
      )
    })
  })

  describe('authenticateUser', () => {
    it('should authenticate valid user', async () => {
      mockPrisma.users.findUnique.mockResolvedValue(mockUser as any)
      mockCompare.mockResolvedValue(true as never)
      mockPrisma.users.update.mockResolvedValue(mockUser as any)

      const result = await service.authenticateUser('test@example.com', 'password123')

      expect(result.email).toBe(mockUser.email)
      expect(mockPrisma.users.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { last_login: expect.any(Date) },
      })
    })

    it('should throw AuthenticationError for non-existent user', async () => {
      mockPrisma.users.findUnique.mockResolvedValue(null)

      await expect(
        service.authenticateUser('nonexistent@example.com', 'password123')
      ).rejects.toThrow(AuthenticationError)
    })

    it('should throw AuthenticationError for invalid password', async () => {
      mockPrisma.users.findUnique.mockResolvedValue(mockUser as any)
      mockCompare.mockResolvedValue(false as never)

      await expect(
        service.authenticateUser('test@example.com', 'wrongpassword')
      ).rejects.toThrow(AuthenticationError)
    })

    it('should throw ValidationError for inactive user', async () => {
      mockPrisma.users.findUnique.mockResolvedValue({
        ...mockUser,
        status: 'inactive',
      } as any)
      mockCompare.mockResolvedValue(true as never)

      await expect(
        service.authenticateUser('test@example.com', 'password123')
      ).rejects.toThrow(ValidationError)
    })
  })

  describe('getUserById', () => {
    it('should return user when found', async () => {
      mockPrisma.users.findUnique.mockResolvedValue(mockUser as any)

      const result = await service.getUserById('user-123')

      expect(result).toEqual(mockUser)
    })

    it('should return null when user not found', async () => {
      mockPrisma.users.findUnique.mockResolvedValue(null)

      const result = await service.getUserById('nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('getUserByEmail', () => {
    it('should return user when found', async () => {
      mockPrisma.users.findUnique.mockResolvedValue(mockUser as any)

      const result = await service.getUserByEmail('test@example.com')

      expect(result).toEqual(mockUser)
    })

    it('should lowercase email before searching', async () => {
      mockPrisma.users.findUnique.mockResolvedValue(mockUser as any)

      await service.getUserByEmail('TEST@EXAMPLE.COM')

      expect(mockPrisma.users.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      })
    })
  })

  describe('updateUserProfile', () => {
    it('should update user profile successfully', async () => {
      mockPrisma.users.findUnique.mockResolvedValue(mockUser as any)
      mockPrisma.users.update.mockResolvedValue({
        ...mockUser,
        full_name: 'Updated Name',
      } as any)

      const result = await service.updateUserProfile('user-123', {
        full_name: 'Updated Name',
      })

      expect(result.full_name).toBe('Updated Name')
    })

    it('should throw NotFoundError when user not found', async () => {
      mockPrisma.users.findUnique.mockResolvedValue(null)

      await expect(
        service.updateUserProfile('nonexistent', { full_name: 'Name' })
      ).rejects.toThrow(NotFoundError)
    })

    it('should preserve existing values when not updating', async () => {
      mockPrisma.users.findUnique.mockResolvedValue(mockUser as any)
      mockPrisma.users.update.mockResolvedValue(mockUser as any)

      await service.updateUserProfile('user-123', {
        phone: '0987654321',
      })

      expect(mockPrisma.users.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            full_name: mockUser.full_name,
            phone: '0987654321',
          }),
        })
      )
    })
  })

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      mockPrisma.users.findUnique.mockResolvedValue(mockUser as any)
      mockCompare.mockResolvedValue(true as never)
      mockPrisma.users.update.mockResolvedValue(mockUser as any)

      await service.changePassword('user-123', 'current-password', 'new-password')

      expect(mockHash).toHaveBeenCalledWith('new-password', 12)
      expect(mockPrisma.users.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { password: 'hashed-password' },
      })
    })

    it('should throw NotFoundError when user not found', async () => {
      mockPrisma.users.findUnique.mockResolvedValue(null)

      await expect(
        service.changePassword('nonexistent', 'current', 'new')
      ).rejects.toThrow(NotFoundError)
    })

    it('should throw ValidationError when current password is incorrect', async () => {
      mockPrisma.users.findUnique.mockResolvedValue(mockUser as any)
      mockCompare.mockResolvedValue(false as never)

      await expect(
        service.changePassword('user-123', 'wrong-password', 'new-password')
      ).rejects.toThrow(ValidationError)
    })
  })

  describe('getUserStats', () => {
    it('should return user statistics', async () => {
      mockPrisma.users.findUnique.mockResolvedValue(mockUser as any)
      mockPrisma.bookings.count
        .mockResolvedValueOnce(10) // totalBookings
        .mockResolvedValueOnce(2) // activeBookings
        .mockResolvedValueOnce(7) // completedBookings
      mockPrisma.payments.aggregate.mockResolvedValue({
        _sum: { amount: { toNumber: () => 5000000 } },
      } as any)
      mockPrisma.bookings.findFirst.mockResolvedValue({
        created_at: new Date('2024-01-15'),
      } as any)

      const result = await service.getUserStats('user-123')

      expect(result.totalBookings).toBe(10)
      expect(result.activeBookings).toBe(2)
      expect(result.completedBookings).toBe(7)
      expect(result.totalSpent).toBe(5000000)
    })

    it('should handle user with no bookings', async () => {
      mockPrisma.users.findUnique.mockResolvedValue(mockUser as any)
      mockPrisma.bookings.count.mockResolvedValue(0)
      mockPrisma.payments.aggregate.mockResolvedValue({
        _sum: { amount: null },
      } as any)
      mockPrisma.bookings.findFirst.mockResolvedValue(null)

      const result = await service.getUserStats('user-123')

      expect(result.totalBookings).toBe(0)
      expect(result.totalSpent).toBe(0)
      expect(result.lastBookingDate).toBeUndefined()
    })
  })

  describe('searchUsers', () => {
    it('should search users with query', async () => {
      mockPrisma.users.findMany.mockResolvedValue([mockUser] as any)
      mockPrisma.users.count.mockResolvedValue(1)

      const result = await service.searchUsers({ search: 'test' })

      expect(result.users).toHaveLength(1)
      expect(result.total).toBe(1)
    })

    it('should filter by status', async () => {
      mockPrisma.users.findMany.mockResolvedValue([])
      mockPrisma.users.count.mockResolvedValue(0)

      await service.searchUsers({ status: 'active' })

      expect(mockPrisma.users.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'active' }),
        })
      )
    })

    it('should use default pagination', async () => {
      mockPrisma.users.findMany.mockResolvedValue([])
      mockPrisma.users.count.mockResolvedValue(0)

      await service.searchUsers({})

      expect(mockPrisma.users.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 20,
          skip: 0,
        })
      )
    })

    it('should apply custom pagination', async () => {
      mockPrisma.users.findMany.mockResolvedValue([])
      mockPrisma.users.count.mockResolvedValue(0)

      await service.searchUsers({ limit: 50, offset: 10 })

      expect(mockPrisma.users.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 50,
          skip: 10,
        })
      )
    })
  })
})

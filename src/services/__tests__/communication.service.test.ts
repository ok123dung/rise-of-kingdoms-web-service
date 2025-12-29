/**
 * Communication Service Tests
 * Tests for messaging and notification functionality
 */

import { CommunicationService } from '../communication.service'
import { NotFoundError } from '@/lib/errors'
import { CommunicationStatus } from '@/types/enums'

// Mock dependencies
jest.mock('@/lib/db', () => ({
  prisma: {
    users: {
      findUnique: jest.fn(),
    },
    communications: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
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

import { prisma } from '@/lib/db'

const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('CommunicationService', () => {
  let service: CommunicationService

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    full_name: 'Test User',
  }

  const mockCommunication = {
    id: 'comm-123',
    user_id: 'user-123',
    booking_id: 'booking-123',
    type: 'notification',
    channel: 'web',
    subject: 'Test Subject',
    content: 'Test content message',
    template_id: null,
    template_data: null,
    status: CommunicationStatus.SENT,
    sent_at: new Date(),
    read_at: null,
    created_at: new Date(),
    updated_at: new Date(),
  }

  beforeEach(() => {
    service = new CommunicationService()
    jest.clearAllMocks()
  })

  describe('sendMessage', () => {
    it('should create a new communication successfully', async () => {
      mockPrisma.users.findUnique.mockResolvedValue(mockUser as any)
      mockPrisma.communications.create.mockResolvedValue(mockCommunication as any)

      const result = await service.sendMessage({
        user_id: 'user-123',
        type: 'notification' as any,
        content: 'Test message',
      })

      expect(result).toEqual(mockCommunication)
      expect(mockPrisma.communications.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          user_id: 'user-123',
          content: 'Test message',
          status: CommunicationStatus.SENT,
        }),
      })
    })

    it('should throw NotFoundError when user does not exist', async () => {
      mockPrisma.users.findUnique.mockResolvedValue(null)

      await expect(
        service.sendMessage({
          user_id: 'nonexistent',
          type: 'notification' as any,
          content: 'Test message',
        })
      ).rejects.toThrow(NotFoundError)
    })

    it('should include booking_id when provided', async () => {
      mockPrisma.users.findUnique.mockResolvedValue(mockUser as any)
      mockPrisma.communications.create.mockResolvedValue(mockCommunication as any)

      await service.sendMessage({
        user_id: 'user-123',
        booking_id: 'booking-123',
        type: 'notification' as any,
        content: 'Booking update',
      })

      expect(mockPrisma.communications.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          booking_id: 'booking-123',
        }),
      })
    })

    it('should use default channel when not specified', async () => {
      mockPrisma.users.findUnique.mockResolvedValue(mockUser as any)
      mockPrisma.communications.create.mockResolvedValue(mockCommunication as any)

      await service.sendMessage({
        user_id: 'user-123',
        type: 'notification' as any,
        content: 'Test message',
      })

      expect(mockPrisma.communications.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          channel: 'web',
        }),
      })
    })

    it('should include template data when provided', async () => {
      mockPrisma.users.findUnique.mockResolvedValue(mockUser as any)
      mockPrisma.communications.create.mockResolvedValue(mockCommunication as any)

      await service.sendMessage({
        user_id: 'user-123',
        type: 'notification' as any,
        content: 'Template message',
        template_id: 'template-123',
        template_data: { name: 'John', orderId: '12345' },
      })

      expect(mockPrisma.communications.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          template_id: 'template-123',
          template_data: { name: 'John', orderId: '12345' },
        }),
      })
    })

    it('should use custom status when provided', async () => {
      mockPrisma.users.findUnique.mockResolvedValue(mockUser as any)
      mockPrisma.communications.create.mockResolvedValue({
        ...mockCommunication,
        status: CommunicationStatus.PENDING,
      } as any)

      await service.sendMessage({
        user_id: 'user-123',
        type: 'notification' as any,
        content: 'Pending message',
        status: CommunicationStatus.PENDING,
      })

      expect(mockPrisma.communications.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: CommunicationStatus.PENDING,
        }),
      })
    })

    it('should rethrow database errors', async () => {
      mockPrisma.users.findUnique.mockResolvedValue(mockUser as any)
      mockPrisma.communications.create.mockRejectedValue(new Error('Database error'))

      await expect(
        service.sendMessage({
          user_id: 'user-123',
          type: 'notification' as any,
          content: 'Test message',
        })
      ).rejects.toThrow('Database error')
    })
  })

  describe('getHistory', () => {
    it('should return communication history for user', async () => {
      const communications = [mockCommunication]
      mockPrisma.communications.findMany.mockResolvedValue(communications as any)

      const result = await service.getHistory('user-123')

      expect(result).toEqual(communications)
      expect(mockPrisma.communications.findMany).toHaveBeenCalledWith({
        where: { user_id: 'user-123' },
        orderBy: { created_at: 'desc' },
        include: expect.any(Object),
      })
    })

    it('should filter by booking_id when provided', async () => {
      mockPrisma.communications.findMany.mockResolvedValue([mockCommunication] as any)

      await service.getHistory('user-123', 'booking-123')

      expect(mockPrisma.communications.findMany).toHaveBeenCalledWith({
        where: {
          user_id: 'user-123',
          booking_id: 'booking-123',
        },
        orderBy: { created_at: 'desc' },
        include: expect.any(Object),
      })
    })

    it('should return empty array when no communications found', async () => {
      mockPrisma.communications.findMany.mockResolvedValue([])

      const result = await service.getHistory('user-123')

      expect(result).toEqual([])
    })

    it('should include user details in response', async () => {
      mockPrisma.communications.findMany.mockResolvedValue([mockCommunication] as any)

      await service.getHistory('user-123')

      expect(mockPrisma.communications.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            users: {
              select: {
                full_name: true,
                email: true,
                image: true,
              },
            },
          },
        })
      )
    })
  })

  describe('markAsRead', () => {
    it('should mark communication as read', async () => {
      mockPrisma.communications.findUnique.mockResolvedValue(mockCommunication as any)
      mockPrisma.communications.update.mockResolvedValue({
        ...mockCommunication,
        status: CommunicationStatus.READ,
        read_at: new Date(),
      } as any)

      const result = await service.markAsRead('comm-123')

      expect(result.status).toBe(CommunicationStatus.READ)
      expect(mockPrisma.communications.update).toHaveBeenCalledWith({
        where: { id: 'comm-123' },
        data: {
          status: CommunicationStatus.READ,
          read_at: expect.any(Date),
        },
      })
    })

    it('should throw NotFoundError when communication does not exist', async () => {
      mockPrisma.communications.findUnique.mockResolvedValue(null)

      await expect(service.markAsRead('nonexistent')).rejects.toThrow(NotFoundError)
    })

    it('should rethrow database errors', async () => {
      mockPrisma.communications.findUnique.mockResolvedValue(mockCommunication as any)
      mockPrisma.communications.update.mockRejectedValue(new Error('Update failed'))

      await expect(service.markAsRead('comm-123')).rejects.toThrow('Update failed')
    })
  })

  describe('getUnreadCount', () => {
    it('should return count of unread communications', async () => {
      mockPrisma.communications.count.mockResolvedValue(5)

      const result = await service.getUnreadCount('user-123')

      expect(result).toBe(5)
      expect(mockPrisma.communications.count).toHaveBeenCalledWith({
        where: {
          user_id: 'user-123',
          status: {
            not: CommunicationStatus.READ,
          },
        },
      })
    })

    it('should return 0 when no unread communications', async () => {
      mockPrisma.communications.count.mockResolvedValue(0)

      const result = await service.getUnreadCount('user-123')

      expect(result).toBe(0)
    })
  })
})

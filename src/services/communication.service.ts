import { prisma } from '@/lib/db'
import { NotFoundError } from '@/lib/errors'
import { getLogger } from '@/lib/monitoring/logger'
import { type CommunicationType, CommunicationStatus } from '@/types/enums'

export interface CreateCommunicationDTO {
  userId: string
  bookingId?: string
  type: CommunicationType
  channel?: string
  subject?: string
  content: string
  templateId?: string
  templateData?: Record<string, unknown>
  status?: CommunicationStatus
}

export class CommunicationService {
  private logger = getLogger()

  async sendMessage(data: CreateCommunicationDTO) {
    try {
      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { id: data.userId }
      })

      if (!user) {
        throw new NotFoundError(`User with ID ${data.userId} not found`)
      }

      const communication = await prisma.communication.create({
        data: {
          userId: data.userId,
          bookingId: data.bookingId,
          type: data.type,
          channel: data.channel ?? 'web',
          subject: data.subject,
          content: data.content,
          templateId: data.templateId,
          templateData: data.templateData ? JSON.parse(JSON.stringify(data.templateData)) : undefined,
          status: data.status ?? CommunicationStatus.SENT,
          sentAt: new Date()
        }
      })

      this.logger.info(`Created communication ${communication.id} for user ${data.userId}`)
      return communication
    } catch (error) {
      this.logger.error('Failed to create communication', error as Error)
      throw error
    }
  }

  async getHistory(userId: string, bookingId?: string) {
    return prisma.communication.findMany({
      where: {
        userId,
        ...(bookingId ? { bookingId } : {})
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
            image: true
          }
        }
      }
    })
  }

  async markAsRead(id: string) {
    try {
      const communication = await prisma.communication.findUnique({
        where: { id }
      })

      if (!communication) {
        throw new NotFoundError(`Communication with ID ${id} not found`)
      }

      const updated = await prisma.communication.update({
        where: { id },
        data: {
          status: CommunicationStatus.READ,
          readAt: new Date()
        }
      })

      this.logger.info(`Marked communication ${id} as read`)
      return updated
    } catch (error) {
      this.logger.error(`Failed to mark communication ${id} as read`, error as Error)
      throw error
    }
  }

  async getUnreadCount(userId: string) {
    return prisma.communication.count({
      where: {
        userId,
        status: {
          not: CommunicationStatus.READ
        }
        // Assuming we only count incoming messages as unread for the user,
        // but the schema doesn't explicitly distinguish direction (inbound/outbound).
        // For now, let's assume all non-read messages are unread.
        // In a real app, we'd add a 'direction' field or infer from type.
      }
    })
  }
}

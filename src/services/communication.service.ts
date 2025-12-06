import { prisma } from '@/lib/db'
import { NotFoundError } from '@/lib/errors'
import { getLogger } from '@/lib/monitoring/logger'
import { type CommunicationType, CommunicationStatus } from '@/types/enums'

export interface CreateCommunicationDTO {
  user_id: string
  booking_id?: string
  type: CommunicationType
  channel?: string
  subject?: string
  content: string
  template_id?: string
  template_data?: Record<string, unknown>
  status?: CommunicationStatus
}

export class CommunicationService {
  private logger = getLogger()

  async sendMessage(data: CreateCommunicationDTO) {
    try {
      // Verify user exists
      const user = await prisma.users.findUnique({
        where: { id: data.user_id }
      })

      if (!user) {
        throw new NotFoundError(`User with ID ${data.user_id} not found`)
      }

      const communication = await prisma.communications.create({
        data: {
        id: crypto.randomUUID(),
        user_id: data.user_id,
          booking_id: data.booking_id,
          type: data.type,
          channel: data.channel ?? 'web',
          subject: data.subject,
          content: data.content,
          template_id: data.template_id,
          template_data: data.template_data ? JSON.parse(JSON.stringify(data.template_data)) : undefined,
          status: data.status ?? CommunicationStatus.SENT,
          sent_at: new Date()
        }
      })

      this.logger.info(`Created communication ${communication.id} for user ${data.user_id}`)
      return communication
    } catch (error) {
      this.logger.error('Failed to create communication', error as Error)
      throw error
    }
  }

  async getHistory(user_id: string, booking_id?: string) {
    return prisma.communications.findMany({
      where: {
        user_id,
        ...(booking_id ? { booking_id } : {})
      },
      orderBy: { created_at: 'desc' },
      include: { users: {
          select: {
            full_name: true,
            email: true,
            image: true
          }
        }
      }
    })
  }

  async markAsRead(id: string) {
    try {
      const communication = await prisma.communications.findUnique({
        where: { id }
      })

      if (!communication) {
        throw new NotFoundError(`Communication with ID ${id} not found`)
      }

      const updated = await prisma.communications.update({
        where: { id },
        data: {
          status: CommunicationStatus.READ,
          read_at: new Date()
        }
      })

      this.logger.info(`Marked communication ${id} as read`)
      return updated
    } catch (error) {
      this.logger.error(`Failed to mark communication ${id} as read`, error as Error)
      throw error
    }
  }

  async getUnreadCount(user_id: string) {
    return prisma.communications.count({
      where: {
        user_id,
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

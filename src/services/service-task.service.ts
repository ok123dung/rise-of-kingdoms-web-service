import { prisma } from '@/lib/db'
import { NotFoundError } from '@/lib/errors'
import { getLogger } from '@/lib/monitoring/logger'
import { ServiceTaskStatus, ServiceTaskPriority } from '@/types/enums'

export interface CreateTaskDTO {
  bookingId: string
  type: string
  title: string
  description?: string
  priority?: ServiceTaskPriority
  assignedTo?: string
  dueDate?: Date
  metadata?: Record<string, unknown>
}

export interface UpdateTaskDTO {
  title?: string
  description?: string
  priority?: ServiceTaskPriority
  status?: ServiceTaskStatus
  assignedTo?: string
  dueDate?: Date
  metadata?: Record<string, unknown>
}

export class ServiceTaskService {
  private logger = getLogger()

  async createTask(data: CreateTaskDTO) {
    try {
      // Verify booking exists
      const booking = await prisma.booking.findUnique({
        where: { id: data.bookingId }
      })

      if (!booking) {
        throw new NotFoundError(`Booking with ID ${data.bookingId} not found`)
      }

      const task = await prisma.serviceTask.create({
        data: {
          bookingId: data.bookingId,
          type: data.type,
          title: data.title,
          description: data.description,
          priority: data.priority ?? ServiceTaskPriority.MEDIUM,
          status: ServiceTaskStatus.PENDING,
          assignedTo: data.assignedTo,
          dueDate: data.dueDate,
          metadata: data.metadata as Parameters<
            typeof prisma.serviceTask.create
          >[0]['data']['metadata']
        }
      })

      this.logger.info(`Created task ${task.id} for booking ${data.bookingId}`)
      return task
    } catch (error) {
      this.logger.error('Failed to create service task', error as Error)
      throw error
    }
  }

  async updateTask(id: string, data: UpdateTaskDTO) {
    try {
      const task = await prisma.serviceTask.findUnique({
        where: { id }
      })

      if (!task) {
        throw new NotFoundError(`Task with ID ${id} not found`)
      }

      const updatedTask = await prisma.serviceTask.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          priority: data.priority,
          status: data.status,
          assignedTo: data.assignedTo,
          dueDate: data.dueDate,
          metadata: data.metadata as Parameters<
            typeof prisma.serviceTask.update
          >[0]['data']['metadata'],
          completedAt: data.status === ServiceTaskStatus.COMPLETED ? new Date() : undefined
        }
      })

      this.logger.info(`Updated task ${id}`)
      return updatedTask
    } catch (error) {
      this.logger.error(`Failed to update task ${id}`, error as Error)
      throw error
    }
  }

  async deleteTask(id: string) {
    try {
      await prisma.serviceTask.delete({
        where: { id }
      })
      this.logger.info(`Deleted task ${id}`)
    } catch (error) {
      this.logger.error(`Failed to delete task ${id}`, error as Error)
      throw error
    }
  }

  async getTaskById(id: string) {
    const task = await prisma.serviceTask.findUnique({
      where: { id },
      include: {
        assignedUser: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    })

    if (!task) {
      throw new NotFoundError(`Task with ID ${id} not found`)
    }

    return task
  }

  async getTasksByBooking(bookingId: string) {
    return prisma.serviceTask.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
      include: {
        assignedUser: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    })
  }

  async getTasksByAssignee(userId: string, status?: ServiceTaskStatus) {
    return prisma.serviceTask.findMany({
      where: {
        assignedTo: userId,
        ...(status ? { status } : {})
      },
      orderBy: { dueDate: 'asc' },
      include: {
        booking: {
          select: {
            bookingNumber: true,
            serviceTier: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })
  }
}

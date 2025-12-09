import { prisma } from '@/lib/db'
import { NotFoundError } from '@/lib/errors'
import { getLogger } from '@/lib/monitoring/logger'
import { ServiceTaskStatus, ServiceTaskPriority } from '@/types/enums'

export interface CreateTaskDTO {
  booking_id: string
  type: string
  title: string
  description?: string
  priority?: ServiceTaskPriority
  assigned_to?: string
  due_date?: Date
  metadata?: Record<string, unknown>
}

export interface UpdateTaskDTO {
  title?: string
  description?: string
  priority?: ServiceTaskPriority
  status?: ServiceTaskStatus
  assigned_to?: string
  due_date?: Date
  metadata?: Record<string, unknown>
}

export class ServiceTaskService {
  private logger = getLogger()

  async createTask(data: CreateTaskDTO) {
    try {
      // Verify booking exists
      const booking = await prisma.bookings.findUnique({
        where: { id: data.booking_id }
      })

      if (!booking) {
        throw new NotFoundError(`Booking with ID ${data.booking_id} not found`)
      }

      const task = await prisma.service_tasks.create({
        data: {
          id: crypto.randomUUID(),
          booking_id: data.booking_id,
          type: data.type,
          title: data.title,
          description: data.description,
          priority: data.priority ?? ServiceTaskPriority.MEDIUM,
          status: ServiceTaskStatus.PENDING,
          assigned_to: data.assigned_to,
          due_date: data.due_date,
          metadata: data.metadata as Parameters<
            typeof prisma.service_tasks.create
          >[0]['data']['metadata'],
          updated_at: new Date()
        }
      })

      this.logger.info(`Created task ${task.id} for booking ${data.booking_id}`)
      return task
    } catch (error) {
      this.logger.error('Failed to create service task', error as Error)
      throw error
    }
  }

  async updateTask(id: string, data: UpdateTaskDTO) {
    try {
      const task = await prisma.service_tasks.findUnique({
        where: { id }
      })

      if (!task) {
        throw new NotFoundError(`Task with ID ${id} not found`)
      }

      const updatedTask = await prisma.service_tasks.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          priority: data.priority,
          status: data.status,
          assigned_to: data.assigned_to,
          due_date: data.due_date,
          metadata: data.metadata as Parameters<
            typeof prisma.service_tasks.update
          >[0]['data']['metadata'],
          completed_at: data.status === ServiceTaskStatus.COMPLETED ? new Date() : undefined
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
      await prisma.service_tasks.delete({
        where: { id }
      })
      this.logger.info(`Deleted task ${id}`)
    } catch (error) {
      this.logger.error(`Failed to delete task ${id}`, error as Error)
      throw error
    }
  }

  async getTaskById(id: string) {
    const task = await prisma.service_tasks.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            full_name: true,
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

  async getTasksByBooking(booking_id: string) {
    return prisma.service_tasks.findMany({
      where: { booking_id },
      orderBy: { created_at: 'desc' },
      include: {
        users: {
          select: {
            id: true,
            full_name: true,
            email: true
          }
        }
      }
    })
  }

  async getTasksByAssignee(user_id: string, status?: ServiceTaskStatus) {
    return prisma.service_tasks.findMany({
      where: {
        assigned_to: user_id,
        ...(status ? { status } : {})
      },
      orderBy: { due_date: 'asc' },
      include: {
        bookings: {
          select: {
            booking_number: true,
            service_tiers: {
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

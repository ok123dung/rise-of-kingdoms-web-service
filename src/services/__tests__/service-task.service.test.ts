/**
 * ServiceTaskService Tests
 * Tests task CRUD operations for service bookings
 */

import { NotFoundError } from '@/lib/errors'
import { ServiceTaskStatus, ServiceTaskPriority } from '@/types/enums'

import { ServiceTaskService, CreateTaskDTO, UpdateTaskDTO } from '../service-task.service'

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    bookings: {
      findUnique: jest.fn()
    },
    service_tasks: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }
  }
}))

// Import mocked prisma after jest.mock
import { prisma } from '@/lib/db'

const mockBookingsFindUnique = prisma.bookings.findUnique as jest.MockedFunction<typeof prisma.bookings.findUnique>
const mockServiceTasksCreate = prisma.service_tasks.create as jest.MockedFunction<typeof prisma.service_tasks.create>
const mockServiceTasksFindUnique = prisma.service_tasks.findUnique as jest.MockedFunction<typeof prisma.service_tasks.findUnique>
const mockServiceTasksFindMany = prisma.service_tasks.findMany as jest.MockedFunction<typeof prisma.service_tasks.findMany>
const mockServiceTasksUpdate = prisma.service_tasks.update as jest.MockedFunction<typeof prisma.service_tasks.update>
const mockServiceTasksDelete = prisma.service_tasks.delete as jest.MockedFunction<typeof prisma.service_tasks.delete>

// Mock logger
jest.mock('@/lib/monitoring/logger', () => ({
  getLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  })
}))

describe('ServiceTaskService', () => {
  let service: ServiceTaskService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new ServiceTaskService()
  })

  describe('createTask', () => {
    const validTaskData: CreateTaskDTO = {
      booking_id: 'booking-123',
      type: 'strategy-planning',
      title: 'Plan KvK Strategy'
    }

    it('should create task when booking exists', async () => {
      const mockBooking = { id: 'booking-123', user_id: 'user-1' }
      const mockTask = {
        id: 'task-123',
        ...validTaskData,
        priority: ServiceTaskPriority.MEDIUM,
        status: ServiceTaskStatus.PENDING
      }

      mockBookingsFindUnique.mockResolvedValue(mockBooking)
      mockServiceTasksCreate.mockResolvedValue(mockTask)

      const result = await service.createTask(validTaskData)

      expect(mockBookingsFindUnique).toHaveBeenCalledWith({
        where: { id: 'booking-123' }
      })
      expect(mockServiceTasksCreate).toHaveBeenCalled()
      expect(result).toEqual(mockTask)
    })

    it('should throw NotFoundError when booking does not exist', async () => {
      mockBookingsFindUnique.mockResolvedValue(null)

      await expect(service.createTask(validTaskData))
        .rejects
        .toThrow(NotFoundError)

      expect(mockServiceTasksCreate).not.toHaveBeenCalled()
    })

    it('should use default priority when not specified', async () => {
      const mockBooking = { id: 'booking-123' }
      mockBookingsFindUnique.mockResolvedValue(mockBooking)
      mockServiceTasksCreate.mockResolvedValue({
        id: 'task-123',
        priority: ServiceTaskPriority.MEDIUM
      })

      await service.createTask(validTaskData)

      expect(mockServiceTasksCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            priority: ServiceTaskPriority.MEDIUM,
            status: ServiceTaskStatus.PENDING
          })
        })
      )
    })

    it('should use specified priority', async () => {
      const taskWithPriority: CreateTaskDTO = {
        ...validTaskData,
        priority: ServiceTaskPriority.HIGH
      }
      const mockBooking = { id: 'booking-123' }
      mockBookingsFindUnique.mockResolvedValue(mockBooking)
      mockServiceTasksCreate.mockResolvedValue({
        id: 'task-123',
        priority: ServiceTaskPriority.HIGH
      })

      await service.createTask(taskWithPriority)

      expect(mockServiceTasksCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            priority: ServiceTaskPriority.HIGH
          })
        })
      )
    })

    it('should include optional fields when provided', async () => {
      const fullTaskData: CreateTaskDTO = {
        ...validTaskData,
        description: 'Plan KvK strategy for next month',
        assigned_to: 'user-456',
        due_date: new Date('2024-12-31'),
        metadata: { notes: 'Important' }
      }
      mockBookingsFindUnique.mockResolvedValue({ id: 'booking-123' })
      mockServiceTasksCreate.mockResolvedValue({ id: 'task-123' })

      await service.createTask(fullTaskData)

      expect(mockServiceTasksCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            description: 'Plan KvK strategy for next month',
            assigned_to: 'user-456'
          })
        })
      )
    })

    it('should propagate errors', async () => {
      mockBookingsFindUnique.mockResolvedValue({ id: 'booking-123' })
      mockServiceTasksCreate.mockRejectedValue(new Error('DB error'))

      await expect(service.createTask(validTaskData))
        .rejects
        .toThrow('DB error')
    })
  })

  describe('updateTask', () => {
    const taskId = 'task-123'
    const updateData: UpdateTaskDTO = {
      title: 'Updated Task Title',
      status: ServiceTaskStatus.IN_PROGRESS
    }

    it('should update task when it exists', async () => {
      const existingTask = { id: taskId, title: 'Original' }
      const updatedTask = { id: taskId, ...updateData }

      mockServiceTasksFindUnique.mockResolvedValue(existingTask)
      mockServiceTasksUpdate.mockResolvedValue(updatedTask)

      const result = await service.updateTask(taskId, updateData)

      expect(mockServiceTasksFindUnique).toHaveBeenCalledWith({
        where: { id: taskId }
      })
      expect(mockServiceTasksUpdate).toHaveBeenCalled()
      expect(result).toEqual(updatedTask)
    })

    it('should throw NotFoundError when task does not exist', async () => {
      mockServiceTasksFindUnique.mockResolvedValue(null)

      await expect(service.updateTask(taskId, updateData))
        .rejects
        .toThrow(NotFoundError)

      expect(mockServiceTasksUpdate).not.toHaveBeenCalled()
    })

    it('should set completed_at when status is COMPLETED', async () => {
      const completedUpdate: UpdateTaskDTO = {
        status: ServiceTaskStatus.COMPLETED
      }
      mockServiceTasksFindUnique.mockResolvedValue({ id: taskId })
      mockServiceTasksUpdate.mockResolvedValue({ id: taskId })

      await service.updateTask(taskId, completedUpdate)

      expect(mockServiceTasksUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            completed_at: expect.any(Date)
          })
        })
      )
    })

    it('should not set completed_at for other statuses', async () => {
      const progressUpdate: UpdateTaskDTO = {
        status: ServiceTaskStatus.IN_PROGRESS
      }
      mockServiceTasksFindUnique.mockResolvedValue({ id: taskId })
      mockServiceTasksUpdate.mockResolvedValue({ id: taskId })

      await service.updateTask(taskId, progressUpdate)

      expect(mockServiceTasksUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            completed_at: undefined
          })
        })
      )
    })
  })

  describe('deleteTask', () => {
    it('should delete task', async () => {
      mockServiceTasksDelete.mockResolvedValue({ id: 'task-123' })

      await service.deleteTask('task-123')

      expect(mockServiceTasksDelete).toHaveBeenCalledWith({
        where: { id: 'task-123' }
      })
    })

    it('should propagate errors', async () => {
      mockServiceTasksDelete.mockRejectedValue(new Error('Delete failed'))

      await expect(service.deleteTask('task-123'))
        .rejects
        .toThrow('Delete failed')
    })
  })

  describe('getTaskById', () => {
    it('should return task with user details', async () => {
      const mockTask = {
        id: 'task-123',
        title: 'Test Task',
        users: {
          id: 'user-1',
          full_name: 'Test User',
          email: 'test@example.com'
        }
      }
      mockServiceTasksFindUnique.mockResolvedValue(mockTask)

      const result = await service.getTaskById('task-123')

      expect(mockServiceTasksFindUnique).toHaveBeenCalledWith({
        where: { id: 'task-123' },
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
      expect(result).toEqual(mockTask)
    })

    it('should throw NotFoundError when task not found', async () => {
      mockServiceTasksFindUnique.mockResolvedValue(null)

      await expect(service.getTaskById('nonexistent'))
        .rejects
        .toThrow(NotFoundError)
    })
  })

  describe('getTasksByBooking', () => {
    it('should return all tasks for a booking', async () => {
      const mockTasks = [
        { id: 'task-1', title: 'Task 1' },
        { id: 'task-2', title: 'Task 2' }
      ]
      mockServiceTasksFindMany.mockResolvedValue(mockTasks)

      const result = await service.getTasksByBooking('booking-123')

      expect(mockServiceTasksFindMany).toHaveBeenCalledWith({
        where: { booking_id: 'booking-123' },
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
      expect(result).toEqual(mockTasks)
    })

    it('should return empty array when no tasks exist', async () => {
      mockServiceTasksFindMany.mockResolvedValue([])

      const result = await service.getTasksByBooking('booking-no-tasks')

      expect(result).toEqual([])
    })
  })

  describe('getTasksByAssignee', () => {
    it('should return all tasks assigned to user', async () => {
      const mockTasks = [
        { id: 'task-1', assigned_to: 'user-1' },
        { id: 'task-2', assigned_to: 'user-1' }
      ]
      mockServiceTasksFindMany.mockResolvedValue(mockTasks)

      const result = await service.getTasksByAssignee('user-1')

      expect(mockServiceTasksFindMany).toHaveBeenCalledWith({
        where: { assigned_to: 'user-1' },
        orderBy: { due_date: 'asc' },
        include: expect.any(Object)
      })
      expect(result).toEqual(mockTasks)
    })

    it('should filter by status when provided', async () => {
      mockServiceTasksFindMany.mockResolvedValue([])

      await service.getTasksByAssignee('user-1', ServiceTaskStatus.PENDING)

      expect(mockServiceTasksFindMany).toHaveBeenCalledWith({
        where: {
          assigned_to: 'user-1',
          status: ServiceTaskStatus.PENDING
        },
        orderBy: { due_date: 'asc' },
        include: expect.any(Object)
      })
    })

    it('should include booking details', async () => {
      mockServiceTasksFindMany.mockResolvedValue([])

      await service.getTasksByAssignee('user-1')

      expect(mockServiceTasksFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
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
      )
    })
  })
})

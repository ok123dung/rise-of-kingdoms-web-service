import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'

import { authOptions } from '@/lib/auth'
import { getLogger } from '@/lib/monitoring/logger'
import { ServiceTaskService } from '@/services/service-task.service'
import { ServiceTaskPriority } from '@/types/enums'

const taskService = new ServiceTaskService()
const logger = getLogger()

const createTaskSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  type: z.string().min(1, 'Task type is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.nativeEnum(ServiceTaskPriority).optional(),
  assignedTo: z.string().optional(),
  dueDate: z
    .string()
    .optional()
    .transform(str => (str ? new Date(str) : undefined)),
  metadata: z.record(z.unknown()).optional()
})

interface CreateTaskRequest {
  bookingId: string
  type: string
  title: string
  description?: string
  priority?: ServiceTaskPriority
  assignedTo?: string
  dueDate?: string
  metadata?: Record<string, unknown>
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['admin', 'manager', 'staff'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await request.json()) as CreateTaskRequest
    const data = createTaskSchema.parse(body)

    const task = await taskService.createTask(data)

    return NextResponse.json({ success: true, task }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    logger.error('Failed to create task', error as Error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['admin', 'manager', 'staff'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('bookingId')
    const assignedTo = searchParams.get('assignedTo')

    let tasks
    if (bookingId) {
      tasks = await taskService.getTasksByBooking(bookingId)
    } else if (assignedTo) {
      tasks = await taskService.getTasksByAssignee(assignedTo)
    } else {
      // If no filter, maybe return empty or all (careful with all)
      // For now, let's require a filter or return 400
      return NextResponse.json(
        { error: 'Missing filter (bookingId or assignedTo)' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, tasks })
  } catch (error) {
    logger.error('Failed to fetch tasks', error as Error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

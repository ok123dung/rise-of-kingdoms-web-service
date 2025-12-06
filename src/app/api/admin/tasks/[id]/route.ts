import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'

import { authOptions } from '@/lib/auth'
import { NotFoundError } from '@/lib/errors'
import { getLogger } from '@/lib/monitoring/logger'
import { ServiceTaskService } from '@/services/service-task.service'
import { ServiceTaskPriority, ServiceTaskStatus } from '@/types/enums'

const taskService = new ServiceTaskService()
const logger = getLogger()

const updateTaskSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  priority: z.nativeEnum(ServiceTaskPriority).optional(),
  status: z.nativeEnum(ServiceTaskStatus).optional(),
  assigned_to: z.string().optional(),
  due_date: z
    .string()
    .optional()
    .transform(str => (str ? new Date(str) : undefined)),
  metadata: z.record(z.unknown()).optional()
})

interface UpdateTaskRequest {
  title?: string
  description?: string
  priority?: ServiceTaskPriority
  status?: ServiceTaskStatus
  assigned_to?: string
  due_date?: string
  metadata?: Record<string, unknown>
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['admin', 'manager', 'staff'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await request.json()) as UpdateTaskRequest
    const data = updateTaskSchema.parse(body)

    const task = await taskService.updateTask(params.id, data)

    return NextResponse.json({ success: true, task })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    logger.error(`Failed to update task ${params.id}`, error as Error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['admin', 'manager'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await taskService.deleteTask(params.id)

    return NextResponse.json({ success: true, message: 'Task deleted' })
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    logger.error(`Failed to delete task ${params.id}`, error as Error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

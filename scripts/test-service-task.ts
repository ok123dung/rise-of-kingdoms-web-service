import { PrismaClient } from '@prisma/client'
import { ServiceTaskService } from '../src/services/service-task.service'
import { ServiceTaskPriority, ServiceTaskStatus } from '../src/types/enums'

const prisma = new PrismaClient()
const taskService = new ServiceTaskService()

async function main() {
    console.log('Starting ServiceTask verification...')

    // 1. Setup: Get a user and a service tier to create a dummy booking
    const user = await prisma.user.findFirst()
    const serviceTier = await prisma.serviceTier.findFirst()

    if (!user || !serviceTier) {
        console.error('Prerequisites not met: Need at least 1 user and 1 service tier.')
        process.exit(1)
    }

    // Create dummy booking
    const booking = await prisma.booking.create({
        data: {
            bookingNumber: `TEST-TASK-${Date.now()}`,
            userId: user.id,
            serviceTierId: serviceTier.id,
            totalAmount: 100000,
            finalAmount: 100000,
            status: 'pending'
        }
    })
    console.log(`Created test booking: ${booking.id}`)

    try {
        // 2. Create Task
        const task = await taskService.createTask({
            bookingId: booking.id,
            type: 'daily_login',
            title: 'Test Daily Login',
            description: 'Login and collect VIP points',
            priority: ServiceTaskPriority.HIGH,
            assignedTo: user.id // Assign to self for test
        })
        console.log(`Created task: ${task.id} - ${task.title}`)

        // 3. Update Task
        const updatedTask = await taskService.updateTask(task.id, {
            status: ServiceTaskStatus.IN_PROGRESS,
            description: 'Updated description'
        })
        console.log(`Updated task status: ${updatedTask.status}`)

        // 4. List Tasks
        const tasks = await taskService.getTasksByBooking(booking.id)
        console.log(`Found ${tasks.length} tasks for booking.`)

        if (tasks.length !== 1) throw new Error('Task count mismatch')
        if (tasks[0].status !== ServiceTaskStatus.IN_PROGRESS) throw new Error('Task status mismatch')

        // 5. Delete Task
        await taskService.deleteTask(task.id)
        console.log('Deleted task.')

        // Verify deletion
        const tasksAfterDelete = await taskService.getTasksByBooking(booking.id)
        if (tasksAfterDelete.length !== 0) throw new Error('Task deletion failed')

        console.log('ServiceTask verification SUCCESSFUL!')

    } catch (error) {
        console.error('Verification FAILED:', error)
    } finally {
        // Cleanup booking
        await prisma.booking.delete({ where: { id: booking.id } })
        console.log('Cleanup complete.')
        await prisma.$disconnect()
    }
}

main()

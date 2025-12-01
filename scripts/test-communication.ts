import { PrismaClient } from '@prisma/client'
import { CommunicationService } from '../src/services/communication.service'
import { CommunicationType, CommunicationStatus } from '../src/types/enums'

const prisma = new PrismaClient()
const commService = new CommunicationService()

async function main() {
    console.log('Starting Communication verification...')

    // 1. Setup: Get a user
    const user = await prisma.user.findFirst()

    if (!user) {
        console.error('Prerequisites not met: Need at least 1 user.')
        process.exit(1)
    }

    try {
        // 2. Send Message
        const message = await commService.sendMessage({
            userId: user.id,
            type: CommunicationType.CHAT,
            content: 'Hello, I need support with my booking.',
            subject: 'Support Request'
        })
        console.log(`Sent message: ${message.id} - ${message.content}`)

        // 3. Get History
        const history = await commService.getHistory(user.id)
        console.log(`Found ${history.length} messages in history.`)

        if (history.length === 0) throw new Error('History should not be empty')

        const lastMsg = history[0]
        if (lastMsg.id !== message.id) throw new Error('History order mismatch')

        // 4. Mark as Read
        const readMsg = await commService.markAsRead(message.id)
        console.log(`Marked message as read. Status: ${readMsg.status}`)

        if (readMsg.status !== CommunicationStatus.READ) throw new Error('Status update failed')

        // 5. Cleanup
        await prisma.communication.delete({ where: { id: message.id } })
        console.log('Cleanup complete.')

        console.log('Communication verification SUCCESSFUL!')

    } catch (error) {
        console.error('Verification FAILED:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()

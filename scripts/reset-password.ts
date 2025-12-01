export { }
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    const email = 'test_booking_manual@example.com'
    const password = 'password123'
    const hashedPassword = await bcrypt.hash(password, 10)

    console.log(`Resetting password for ${email}...`)

    const user = await prisma.user.update({
        where: { email },
        data: {
            password: hashedPassword
        }
    })

    console.log(`Password reset for user: ${user.email}`)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

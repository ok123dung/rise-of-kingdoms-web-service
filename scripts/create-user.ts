export { }
const { PrismaClient } = require('@prisma/client')
const { hash } = require('bcryptjs')

const prisma = new PrismaClient()

async function createUser() {
  const email = 'testphase3@example.com'
  const password = 'Password123!'
  const hashedPassword = await hash(password, 12)

  console.log(`Creating user with email: ${email}`)

  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        fullName: 'Test User Phase3',
        password: hashedPassword,
        phone: '0987654321'
      }
    })
    console.log('User created/found:', user)
  } catch (error) {
    console.error('Error creating user:', error)
  }
}

createUser()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())

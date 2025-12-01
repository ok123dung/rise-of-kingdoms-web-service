export { }
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkUser() {
  const email = 'test_booking_manual@example.com'
  console.log(`Checking for user with email: ${email}`)

  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (user) {
    console.log('User found:', user)
  } else {
    console.log('User NOT found')
  }
}

checkUser()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())

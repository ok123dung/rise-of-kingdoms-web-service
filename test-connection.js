/* eslint-disable no-console, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */
const { PrismaClient } = require('@prisma/client')

async function testConnection() {
  const prisma = new PrismaClient()

  try {
    console.log('🔌 Testing database connection...')

    // Test raw query
    const result = await prisma.$queryRaw`SELECT version() as version`
    console.log('✅ Database connected:', result[0]?.version)

    // Test service count
    const count = await prisma.service.count()
    console.log('✅ Services in database:', count)

    // Test service list
    const services = await prisma.service.findMany({
      select: { id: true, name: true, slug: true }
    })
    console.log(
      '✅ Services:',
      services.map(s => s.name)
    )
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
    console.error('Full error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection().catch(console.error)

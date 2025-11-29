export { }
const { PrismaClient } = require('@prisma/client')

async function main() {
  console.log('Testing Prisma connection...')

  // Manually set the env var to what we think it is
  process.env.DATABASE_URL =
    'postgresql://postgres.inondhimzqiguvdhyjng:Dungvnn001*@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true'

  console.log('DATABASE_URL:', process.env.DATABASE_URL.replace(/:[^:]*@/, ':****@'))

  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
  })

  try {
    await prisma.$connect()
    console.log('✅ Successfully connected to database')
    const result = await prisma.$queryRaw`SELECT 1 as result`
    console.log('Query result:', result)
  } catch (e) {
    console.error('❌ Connection failed:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()

 
const { PrismaClient } = require('@prisma/client')

const connectionString =
  'postgresql://postgres:Dungvnn001*@db.inondhimzqiguvdhyjng.supabase.co:5432/postgres?sslmode=require'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: connectionString
    }
  }
})

async function main() {
  try {
    console.log('Connecting to database...')
    await prisma.$connect()
    console.log('Connected successfully.')
    const result = await prisma.$queryRaw`SELECT 1 as result`
    console.log('Query result:', result)
  } catch (e) {
    console.error('Connection failed:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(console.error)

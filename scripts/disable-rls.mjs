// Script to disable Row Level Security on users table
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL
    }
  }
})

async function main() {
  try {
    console.log('Connecting to database...')
    await prisma.$connect()
    console.log('Connected successfully!')

    console.log('Disabling RLS on users table...')
    await prisma.$executeRawUnsafe('ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;')
    console.log('RLS disabled on users table!')

    // Verify by trying to count users
    const count = await prisma.$queryRaw`SELECT COUNT(*) as count FROM public.users;`
    console.log('User count query result:', count)

  } catch (error) {
    console.error('Error:', error.message)
    if (error.code) console.error('Error code:', error.code)
  } finally {
    await prisma.$disconnect()
  }
}

main()

const { PrismaClient } = require('@prisma/client')

// Test connection với Railway database
async function testConnection() {
  console.log('🔄 Testing Railway database connection...\n')

  // Database URLs
  const publicUrl =
    'postgresql://postgres:qllvWulFKNbBHBGVLaevIRjjDMxDpUPy@yamabiko.proxy.rlwy.net:59019/railway'
  const vercelUrl = publicUrl + '?pgbouncer=true&connection_limit=1'

  console.log('📌 Public URL (for external connections):', publicUrl)
  console.log('📌 Vercel URL (with pooling):', vercelUrl)
  console.log('\n---\n')

  // Test với URL cho Vercel
  process.env.DATABASE_URL = vercelUrl

  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn']
  })

  try {
    // Test connection
    console.log('1️⃣ Connecting to database...')
    const start = Date.now()
    await prisma.$connect()
    console.log(`✅ Connected successfully (${Date.now() - start}ms)\n`)

    // Test query
    console.log('2️⃣ Testing query...')
    const queryStart = Date.now()
    const result = await prisma.$queryRaw`SELECT current_database(), current_user, version()`
    console.log(`✅ Query successful (${Date.now() - queryStart}ms)`)
    console.log('Database info:', result[0])
    console.log('\n')

    // Check tables
    console.log('3️⃣ Checking tables...')
    const tables = await prisma.$queryRaw`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `
    console.log(`✅ Found ${tables.length} tables:`)
    tables.forEach(t => console.log(`   - ${t.tablename}`))
    console.log('\n')

    // Test a real query
    console.log('4️⃣ Testing users table...')
    const userCount = await prisma.user.count()
    console.log(`✅ Users table accessible. Count: ${userCount}`)
    console.log('\n')

    console.log('🎉 All tests passed! Database is ready for Vercel.')
    console.log('\n📋 Next steps:')
    console.log('1. Copy this DATABASE_URL to Vercel:')
    console.log(`   ${vercelUrl}`)
    console.log('2. Add NEXTAUTH_URL and NEXTAUTH_SECRET')
    console.log('3. Redeploy your Vercel app')
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
    console.log('\n🔧 Troubleshooting:')
    console.log('1. Check if Railway database is running')
    console.log('2. Verify the connection string is correct')
    console.log('3. Make sure your IP is allowed (Railway allows all IPs by default)')
  } finally {
    await prisma.$disconnect()
  }
}

// Run test
testConnection().catch(console.error)

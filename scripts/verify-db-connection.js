const { Client } = require('pg')

/**
 * Comprehensive Database Connection Verification Script
 * Tests both pooled and direct connections with various SSL configurations
 */

async function testPooledConnection() {
  // Pooled connection via PgBouncer (port 6543)
  const pooledUrl =
    'postgresql://postgres.inondhimzqiguvdhyjng:Dungvnn001*@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1'

  console.log('\n🔵 Testing Pooled Connection (Port 6543 - PgBouncer)...')
  console.log('URL:', pooledUrl.replace(/:[^:]*@/, ':****@'))

  const client = new Client({
    connectionString: pooledUrl,
    ssl: {
      rejectUnauthorized: false
    }
  })

  try {
    await client.connect()
    console.log('✅ Pooled connection successful!')

    const res = await client.query('SELECT version(), current_database(), current_user')
    console.log('📊 Database info:', {
      version: res.rows[0].version.split(' ')[0] + ' ' + res.rows[0].version.split(' ')[1],
      database: res.rows[0].current_database,
      user: res.rows[0].current_user
    })

    await client.end()
    return true
  } catch (err) {
    console.error('❌ Pooled connection failed:', err.message)
    console.error('Error code:', err.code)
    return false
  }
}

async function testDirectConnection() {
  // Direct connection (port 5432)
  const directUrl =
    'postgresql://postgres:Dungvnn001*@db.inondhimzqiguvdhyjng.supabase.co:5432/postgres?sslmode=require'

  console.log('\n🟢 Testing Direct Connection (Port 5432)...')
  console.log('URL:', directUrl.replace(/:[^:]*@/, ':****@'))

  const client = new Client({
    connectionString: directUrl,
    ssl: {
      rejectUnauthorized: false // Required for Supabase
    }
  })

  try {
    await client.connect()
    console.log('✅ Direct connection successful!')

    const res = await client.query('SELECT NOW() as current_time, pg_backend_pid() as pid')
    console.log('📊 Connection info:', {
      currentTime: res.rows[0].current_time,
      pid: res.rows[0].pid
    })

    await client.end()
    return true
  } catch (err) {
    console.error('❌ Direct connection failed:', err.message)
    console.error('Error code:', err.code)
    if (err.message.includes('certificate')) {
      console.error(
        '💡 Hint: SSL certificate issue detected. Make sure ssl.rejectUnauthorized is set correctly.'
      )
    }
    return false
  }
}

async function testPrismaConnection() {
  console.log('\n🟣 Testing Prisma Connection...')

  try {
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient({
      log: ['error', 'warn']
    })

    await prisma.$connect()
    console.log('✅ Prisma connection successful!')

    const result = await prisma.$queryRaw`SELECT COUNT(*) as count FROM users`
    console.log('📊 Users in database:', result[0].count)

    await prisma.$disconnect()
    return true
  } catch (err) {
    console.error('❌ Prisma connection failed:', err.message)
    return false
  }
}

async function verifySchema() {
  console.log('\n🔍 Verifying Database Schema...')

  const pooledUrl =
    'postgresql://postgres.inondhimzqiguvdhyjng:Dungvnn001*@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1'

  const client = new Client({
    connectionString: pooledUrl,
    ssl: {
      rejectUnauthorized: false
    }
  })

  try {
    await client.connect()

    const tables = await client.query(`
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public'
            ORDER BY tablename
        `)

    const expectedTables = [
      'users',
      'services',
      'service_tiers',
      'bookings',
      'payments',
      'leads',
      'staff'
    ]
    const existingTables = tables.rows.map(r => r.tablename)
    const missingTables = expectedTables.filter(t => !existingTables.includes(t))

    console.log('📋 Total tables found:', tables.rows.length)
    console.log(
      '✅ Expected tables present:',
      expectedTables.filter(t => existingTables.includes(t)).length + '/' + expectedTables.length
    )

    if (missingTables.length > 0) {
      console.warn('⚠️  Missing tables:', missingTables.join(', '))
    } else {
      console.log('✅ All expected tables exist!')
    }

    await client.end()
    return missingTables.length === 0
  } catch (err) {
    console.error('❌ Schema verification failed:', err.message)
    return false
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════')
  console.log('   🔧 ROK Services - Database Connection Verification   ')
  console.log('═══════════════════════════════════════════════════════')

  const results = {
    pooled: false,
    direct: false,
    prisma: false,
    schema: false
  }

  // Run all tests
  results.pooled = await testPooledConnection()
  results.direct = await testDirectConnection()
  results.prisma = await testPrismaConnection()
  results.schema = await verifySchema()

  // Summary
  console.log('\n═══════════════════════════════════════════════════════')
  console.log('                    📊 SUMMARY                          ')
  console.log('═══════════════════════════════════════════════════════')
  console.log('Pooled Connection (6543):  ', results.pooled ? '✅ PASS' : '❌ FAIL')
  console.log('Direct Connection (5432):  ', results.direct ? '✅ PASS' : '❌ FAIL')
  console.log('Prisma Connection:         ', results.prisma ? '✅ PASS' : '❌ FAIL')
  console.log('Schema Verification:       ', results.schema ? '✅ PASS' : '❌ FAIL')
  console.log('═══════════════════════════════════════════════════════')

  const allPassed = Object.values(results).every(r => r)

  if (allPassed) {
    console.log('\n🎉 ALL TESTS PASSED! Database is ready for production.')
    process.exit(0)
  } else {
    console.log('\n⚠️  SOME TESTS FAILED. Please check the errors above.')
    process.exit(1)
  }
}

main().catch(err => {
  console.error('\n💥 Unexpected error:', err)
  process.exit(1)
})

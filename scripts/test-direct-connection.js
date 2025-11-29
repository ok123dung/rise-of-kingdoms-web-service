const { Client } = require('pg')

async function testConnection() {
  // Test Direct Connection with proper SSL config
  const directUrl =
    'postgresql://postgres:Dungvnn001*@db.inondhimzqiguvdhyjng.supabase.co:5432/postgres'

  console.log('Testing Direct Connection (port 5432) with SSL...')
  console.log('URL:', directUrl.replace(/:[^:]*@/, ':****@'))

  const client = new Client({
    connectionString: directUrl,
    ssl: {
      rejectUnauthorized: false, // Accept self-signed certificates
      checkServerIdentity: () => undefined // Skip hostname verification
    }
  })

  try {
    console.log('Attempting to connect...')
    await client.connect()
    console.log('✅ Connection successful!')

    const res = await client.query('SELECT version(), current_database(), current_user')
    console.log('📊 Database info:', {
      version: res.rows[0].version.substring(0, 50),
      database: res.rows[0].current_database,
      user: res.rows[0].current_user
    })

    await client.end()
    console.log('✅ Connection closed properly')
    return true
  } catch (err) {
    console.error('❌ Connection failed:', err.message)
    console.error('Error code:', err.code)

    if (err.message.includes('certificate')) {
      console.error('\n💡 SSL Certificate Issue Detected')
      console.error('This is expected for Supabase direct connections.')
      console.error('For production, use the pooled connection (port 6543) instead.')
    }

    return false
  }
}

testConnection()

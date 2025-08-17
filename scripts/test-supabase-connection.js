const { Client } = require('pg');

// Test Supabase connection
async function testConnection() {
  // Get connection string from environment or use default
  const connectionString = process.env.DATABASE_URL || 
    "postgresql://postgres:[YOUR-PASSWORD]@db.inondhimzqiguvdhyjng.supabase.co:5432/postgres";
  
  if (connectionString.includes('[YOUR-PASSWORD]')) {
    console.error('❌ Please replace [YOUR-PASSWORD] with your actual Supabase password');
    console.log('\nTo set up the database connection:');
    console.log('1. Get your database password from Supabase dashboard');
    console.log('2. Update DATABASE_URL in .env and .env.local files');
    console.log('3. Run this script again: node scripts/test-supabase-connection.js');
    return;
  }
  
  console.log('🔄 Testing Supabase connection...');
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('✅ Successfully connected to Supabase!');
    
    // Test query
    const result = await client.query('SELECT NOW()');
    console.log('📅 Current database time:', result.rows[0].now);
    
    // Check if any tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    if (tablesResult.rows.length > 0) {
      console.log('\n📊 Existing tables:');
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    } else {
      console.log('\n📭 No tables found. Run migrations to create the schema.');
    }
    
    await client.end();
    
    console.log('\n✨ Next steps:');
    console.log('1. Run: npx prisma generate');
    console.log('2. Run: npx prisma db push');
    console.log('3. Verify tables in Supabase dashboard');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n🔍 Troubleshooting tips:');
    console.log('- Check if the password is correct');
    console.log('- Verify the project reference ID (inondhimzqiguvdhyjng)');
    console.log('- Ensure your IP is allowed in Supabase dashboard');
  }
}

// Load environment variables
require('dotenv').config();

testConnection();
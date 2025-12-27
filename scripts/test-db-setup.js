#!/usr/bin/env node
/**
 * Test database setup script
 * Sets up the test PostgreSQL database with the Prisma schema
 */
const { execSync } = require('child_process')

const TEST_DATABASE_URL = 'postgresql://postgres:postgres@localhost:5433/rok_test'

console.log('Setting up test database...')
console.log(`Database URL: ${TEST_DATABASE_URL}`)

// Override DATABASE_URL at the OS level before Prisma loads
process.env.DATABASE_URL = TEST_DATABASE_URL
delete process.env.DIRECT_URL // Remove direct URL if set

try {
  // Use cross-env to ensure env var is set before Prisma loads .env
  execSync('npx cross-env DATABASE_URL=' + TEST_DATABASE_URL + ' npx prisma db push --skip-generate --accept-data-loss', {
    stdio: 'inherit',
    // Start with minimal env to prevent .env loading side effects
    env: {
      PATH: process.env.PATH,
      DATABASE_URL: TEST_DATABASE_URL,
      SystemRoot: process.env.SystemRoot,
      APPDATA: process.env.APPDATA,
      USERPROFILE: process.env.USERPROFILE
    }
  })
  console.log('✅ Test database setup complete!')
} catch (error) {
  console.error('❌ Failed to setup test database:', error.message)
  process.exit(1)
}

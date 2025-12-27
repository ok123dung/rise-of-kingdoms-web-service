#!/usr/bin/env node
/**
 * Run integration tests with the local test database
 */
const { execSync } = require('child_process')

const TEST_DATABASE_URL = 'postgresql://postgres:postgres@localhost:5433/rok_test'

console.log('🧪 Running integration tests...')
console.log(`📦 Database: ${TEST_DATABASE_URL}`)

try {
  execSync('npx jest --testPathPatterns payment-flows --no-coverage', {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: TEST_DATABASE_URL,
      RUN_INTEGRATION_TESTS: 'true'
    }
  })
  console.log('✅ Integration tests completed!')
} catch (error) {
  console.error('❌ Integration tests failed')
  process.exit(1)
}

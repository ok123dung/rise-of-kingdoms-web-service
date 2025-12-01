/* eslint-disable no-console */
function globalTeardown() {
  console.log('🧹 Starting global test teardown...')

  // Cleanup test database or other global resources
  try {
    // Add any cleanup logic here
    console.log('✅ Global teardown completed')
  } catch (error) {
    console.error('❌ Error during global teardown:', error)
  }
}

export default globalTeardown

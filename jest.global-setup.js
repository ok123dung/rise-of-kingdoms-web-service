// Jest global setup
module.exports = async () => {
  // Set environment variables for testing
  process.env.NODE_ENV = 'test'
  process.env.NEXTAUTH_URL = 'http://localhost:3000'
  process.env.NEXTAUTH_SECRET = 'test-secret'

  // Mock external services
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db'
  process.env.REDIS_URL = 'redis://localhost:6379'

  // Disable analytics in tests
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = ''

  // Mock API keys
  process.env.RESEND_API_KEY = 'test-key'
  process.env.DISCORD_BOT_TOKEN = 'test-token'

  console.log('🧪 Jest global setup completed')
}

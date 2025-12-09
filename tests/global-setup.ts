/* eslint-disable no-console */
import { chromium, type FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global test setup...')

  // Setup test database or other global resources
  if (process.env.NODE_ENV !== 'test') {
    console.warn('⚠️  Tests should run with NODE_ENV=test')
  }

  // Verify that the test server is running
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    console.log('🔍 Checking if server is available...')
    await page.goto(config.webServer?.url ?? 'http://localhost:3000', {
      waitUntil: 'networkidle',
      timeout: 30000
    })
    console.log('✅ Server is running and accessible')
  } catch (error) {
    console.error('❌ Server is not accessible:', error)
    throw error
  } finally {
    await context.close()
    await browser.close()
  }

  console.log('✅ Global setup completed')
}

export default globalSetup

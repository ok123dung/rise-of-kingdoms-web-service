import { test, expect } from '@playwright/test'
import { TestHelpers, TestData } from '../utils/test-helpers'

test.describe('Booking Flow Tests', () => {
  let helpers: TestHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page)
    await helpers.login() // Login before each test
  })

  test('should complete full booking flow', async ({ page }) => {
    // Navigate to services
    await page.goto('/services')
    await helpers.waitForPageLoad()

    // Select a service
    await page.click('[data-testid="service-card"]:first-child .book-now-btn, text=Đặt ngay')
    await helpers.waitForPageLoad()

    // Fill booking form
    await page.fill('[name="gameId"]', TestData.booking.gameId)
    await page.fill('[name="server"]', TestData.booking.server)
    await page.fill('[name="requirements"]', TestData.booking.requirements)
    await page.selectOption('[name="urgency"]', 'normal')
    await page.fill('[name="notes"]', TestData.booking.notes)

    // Submit booking form
    await page.click('button[type="submit"]')
    await helpers.waitForPageLoad()

    // Should redirect to payment page
    await expect(page).toHaveURL(/\/payment/)

    // Verify booking details are displayed
    await expect(page.locator(`text=${TestData.booking.gameId}`)).toBeVisible()
    await expect(page.locator(`text=${TestData.booking.server}`)).toBeVisible()
  })

  test('should validate required booking fields', async ({ page }) => {
    await page.goto('/services')
    await page.click('[data-testid="service-card"]:first-child .book-now-btn')
    
    // Submit empty form
    await page.click('button[type="submit"]')
    
    // Should show validation errors
    await expect(page.locator('.error-message, .text-red-500')).toHaveCount({ min: 2 })
    
    // Check specific field errors
    await expect(page.locator('text=/Game ID is required|Game ID là bắt buộc/i')).toBeVisible()
    await expect(page.locator('text=/Server is required|Server là bắt buộc/i')).toBeVisible()
  })

  test('should calculate pricing correctly', async ({ page }) => {
    await page.goto('/services')
    await page.click('[data-testid="service-card"]:first-child')
    
    // Select service tier
    await page.click('[data-testid="tier-premium"]')
    
    // Check price update
    const priceElement = page.locator('[data-testid="total-price"]')
    await expect(priceElement).toBeVisible()
    
    const priceText = await priceElement.textContent()
    expect(priceText).toMatch(/\d+[,.]?\d*/) // Should contain numbers
  })

  test('should support urgency options', async ({ page }) => {
    await page.goto('/services')
    await page.click('[data-testid="service-card"]:first-child .book-now-btn')
    
    // Check urgency dropdown
    const urgencySelect = page.locator('[name="urgency"]')
    await expect(urgencySelect).toBeVisible()
    
    // Should have multiple options
    const options = urgencySelect.locator('option')
    await expect(options).toHaveCount({ min: 2 })
    
    // Select urgent option (should increase price)
    await urgencySelect.selectOption('urgent')
    
    // Price should update
    await expect(page.locator('[data-testid="urgency-fee"]')).toBeVisible()
  })

  test('should show service tier comparison', async ({ page }) => {
    await page.goto('/services')
    await page.click('[data-testid="service-card"]:first-child')
    
    // Should show tier options
    await expect(page.locator('[data-testid="tier-basic"]')).toBeVisible()
    await expect(page.locator('[data-testid="tier-premium"]')).toBeVisible()
    
    // Each tier should show features
    await expect(page.locator('[data-testid="tier-features"]')).toHaveCount({ min: 2 })
  })

  test('should allow editing booking before payment', async ({ page }) => {
    // Complete booking form
    await page.goto('/services')
    await page.click('[data-testid="service-card"]:first-child .book-now-btn')
    await helpers.fillVietnameseForm({
      gameId: TestData.booking.gameId,
      server: TestData.booking.server,
      requirements: TestData.booking.requirements
    })
    await page.click('button[type="submit"]')
    
    // On payment page, click edit booking
    await page.click('[data-testid="edit-booking-btn"], text=/Edit|Chỉnh sửa/i')
    
    // Should return to booking form with pre-filled data
    await expect(page.locator('[name="gameId"]')).toHaveValue(TestData.booking.gameId)
    await expect(page.locator('[name="server"]')).toHaveValue(TestData.booking.server)
  })

  test('should handle service selection properly', async ({ page }) => {
    await page.goto('/services')
    
    // Should show multiple services
    const serviceCards = page.locator('[data-testid="service-card"]')
    await expect(serviceCards).toHaveCount({ min: 1 })
    
    // Each service should have required information
    const firstService = serviceCards.first()
    await expect(firstService.locator('h3, .service-title')).toBeVisible()
    await expect(firstService.locator('.price, .service-price')).toBeVisible()
    await expect(firstService.locator('.description, .service-description')).toBeVisible()
    
    // Should show estimated completion time
    await expect(firstService.locator('text=/days|ngày/i')).toBeVisible()
  })

  test('should support custom requirements input', async ({ page }) => {
    await page.goto('/services')
    await page.click('[data-testid="service-card"]:first-child .book-now-btn')
    
    const requirementsField = page.locator('[name="requirements"]')
    await expect(requirementsField).toBeVisible()
    
    // Should accept Vietnamese text
    const vietnameseText = 'Yêu cầu tăng power từ 10 triệu lên 50 triệu trong 3 ngày'
    await requirementsField.fill(vietnameseText)
    await expect(requirementsField).toHaveValue(vietnameseText)
  })

  test('should show booking confirmation details', async ({ page }) => {
    // Complete booking
    await page.goto('/services')
    await page.click('[data-testid="service-card"]:first-child .book-now-btn')
    await helpers.fillVietnameseForm({
      gameId: TestData.booking.gameId,
      server: TestData.booking.server,
      requirements: TestData.booking.requirements
    })
    await page.click('button[type="submit"]')
    
    // On confirmation/payment page
    await expect(page.locator('[data-testid="booking-summary"]')).toBeVisible()
    
    // Should show all booking details
    await expect(page.locator(`text=${TestData.booking.gameId}`)).toBeVisible()
    await expect(page.locator(`text=${TestData.booking.server}`)).toBeVisible()
    await expect(page.locator('[data-testid="service-name"]')).toBeVisible()
    await expect(page.locator('[data-testid="total-amount"]')).toBeVisible()
  })

  test('should handle booking for different game servers', async ({ page }) => {
    await page.goto('/services')
    await page.click('[data-testid="service-card"]:first-child .book-now-btn')
    
    const serverField = page.locator('[name="server"]')
    await expect(serverField).toBeVisible()
    
    // Test various server formats
    const servers = ['Server 1234', 'S1234', '1234', 'KvK Season 5']
    
    for (const server of servers) {
      await serverField.clear()
      await serverField.fill(server)
      await expect(serverField).toHaveValue(server)
    }
  })

  test('should validate Game ID format', async ({ page }) => {
    await page.goto('/services')
    await page.click('[data-testid="service-card"]:first-child .book-now-btn')
    
    // Try invalid Game ID
    await page.fill('[name="gameId"]', '123') // Too short
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=/Invalid Game ID|Game ID không hợp lệ/i')).toBeVisible()
    
    // Try valid Game ID
    await page.fill('[name="gameId"]', 'Player123456')
    await page.fill('[name="server"]', 'Server 1234')
    await page.click('button[type="submit"]')
    
    // Should proceed to payment
    await expect(page).toHaveURL(/\/payment/)
  })

  test('should show estimated completion time', async ({ page }) => {
    await page.goto('/services')
    await page.click('[data-testid="service-card"]:first-child')
    
    // Should display estimated days
    await expect(page.locator('[data-testid="estimated-days"]')).toBeVisible()
    
    // Urgent option should reduce time
    await page.click('[data-testid="urgency-urgent"]')
    
    const estimatedTime = page.locator('[data-testid="estimated-completion"]')
    await expect(estimatedTime).toContainText(/faster|nhanh hơn|24/i)
  })

  test('should handle mobile booking flow', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/services')
    await helpers.waitForPageLoad()
    
    // Mobile service selection
    await page.click('[data-testid="service-card"]:first-child .book-now-btn')
    
    // Form should be mobile-friendly
    await helpers.checkResponsiveness()
    
    // Fill and submit form
    await helpers.fillVietnameseForm({
      gameId: 'Mobile123456',
      server: 'Mobile Server'
    })
    
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/payment/)
  })
})
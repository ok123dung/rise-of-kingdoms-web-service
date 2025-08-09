import { test, expect } from '@playwright/test'

import { TestHelpers, TestData } from '../utils/test-helpers'

test.describe('Payment Flow Tests', () => {
  let helpers: TestHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page)
    await helpers.login()

    // Create a booking first
    await page.goto('/services')
    await page.click('[data-testid="service-card"]:first-child .book-now-btn')
    await helpers.fillVietnameseForm({
      gameId: TestData.booking.gameId,
      server: TestData.booking.server,
      requirements: TestData.booking.requirements
    })
    await page.click('button[type="submit"]')
    await helpers.waitForPageLoad()
  })

  test('should display payment options', async ({ page }) => {
    // Should be on payment page
    await expect(page).toHaveURL(/\/payment/)

    // Should show payment methods
    await expect(page.locator('[data-testid="payment-momo"]')).toBeVisible()
    await expect(page.locator('[data-testid="payment-vnpay"]')).toBeVisible()
    await expect(page.locator('[data-testid="payment-zalopay"]')).toBeVisible()

    // Should show booking summary
    await expect(page.locator('[data-testid="booking-summary"]')).toBeVisible()
    await expect(page.locator('[data-testid="total-amount"]')).toBeVisible()
  })

  test('should select MoMo payment method', async ({ page }) => {
    // Click MoMo payment option
    await page.click('[data-testid="payment-momo"]')

    // Should show MoMo selected state
    await expect(page.locator('[data-testid="payment-momo"]')).toHaveClass(/selected|active/)

    // Should show MoMo logo and info
    await expect(page.locator('img[alt*="MoMo"], .momo-logo')).toBeVisible()

    // Proceed to payment
    await page.click('[data-testid="proceed-payment"]')

    // Should redirect to MoMo or show QR code
    await page.waitForTimeout(2000) // Wait for redirect or QR generation

    // Check if we're redirected to MoMo gateway or QR is shown
    const currentUrl = page.url()
    const hasQRCode = await page.locator('[data-testid="qr-code"], .qr-code').isVisible()

    expect(currentUrl.includes('momo') || hasQRCode).toBeTruthy()
  })

  test('should select VNPay payment method', async ({ page }) => {
    await page.click('[data-testid="payment-vnpay"]')

    await expect(page.locator('[data-testid="payment-vnpay"]')).toHaveClass(/selected|active/)
    await expect(page.locator('img[alt*="VNPay"], .vnpay-logo')).toBeVisible()

    await page.click('[data-testid="proceed-payment"]')

    // Should redirect to VNPay gateway
    await page.waitForTimeout(2000)

    const currentUrl = page.url()
    expect(currentUrl.includes('vnpay') || currentUrl.includes('sandbox')).toBeTruthy()
  })

  test('should select ZaloPay payment method', async ({ page }) => {
    await page.click('[data-testid="payment-zalopay"]')

    await expect(page.locator('[data-testid="payment-zalopay"]')).toHaveClass(/selected|active/)
    await expect(page.locator('img[alt*="ZaloPay"], .zalopay-logo')).toBeVisible()

    await page.click('[data-testid="proceed-payment"]')

    await page.waitForTimeout(2000)

    const currentUrl = page.url()
    const hasAppLink = await page
      .locator('text=/Open ZaloPay App|Mở ứng dụng ZaloPay/i')
      .isVisible()

    expect(currentUrl.includes('zalopay') || hasAppLink).toBeTruthy()
  })

  test('should display correct payment amount', async ({ page }) => {
    const totalAmount = page.locator('[data-testid="total-amount"]')
    await expect(totalAmount).toBeVisible()

    const amountText = await totalAmount.textContent()

    // Should contain Vietnamese currency format
    expect(amountText).toMatch(/\d+[,.]?\d*\s*(VND|₫)/)

    // Amount should be reasonable (between 100,000 and 10,000,000 VND)
    const numericAmount = amountText?.replace(/[^\d]/g, '')
    const amount = parseInt(numericAmount || '0')
    expect(amount).toBeGreaterThan(100000)
    expect(amount).toBeLessThan(10000000)
  })

  test('should show payment security information', async ({ page }) => {
    // Should show security badges or information
    await expect(page.locator('[data-testid="security-info"], .security-badge')).toBeVisible()

    // Should show SSL/encryption info
    await expect(page.locator('text=/secure|bảo mật|encrypted|mã hóa/i')).toBeVisible()

    // Should show payment terms or policy link
    await expect(page.locator('text=/terms|điều khoản|policy|chính sách/i')).toBeVisible()
  })

  test('should handle payment timeout', async ({ page }) => {
    await page.click('[data-testid="payment-momo"]')
    await page.click('[data-testid="proceed-payment"]')

    // Wait for payment timeout (simulate)
    await page.waitForTimeout(5000)

    // Should show timeout message or retry option
    const timeoutMsg = page.locator('text=/timeout|hết hạn|expired|try again|thử lại/i')
    const retryBtn = page.locator('[data-testid="retry-payment"], text=/retry|thử lại/i')

    // At least one should be visible
    const hasTimeout = await timeoutMsg.isVisible()
    const hasRetry = await retryBtn.isVisible()

    expect(hasTimeout || hasRetry).toBeTruthy()
  })

  test('should validate payment before proceeding', async ({ page }) => {
    // Try to proceed without selecting payment method
    await page.click('[data-testid="proceed-payment"]')

    // Should show validation error
    await expect(
      page.locator('text=/select payment method|chọn phương thức thanh toán/i')
    ).toBeVisible()
  })

  test('should show payment instructions', async ({ page }) => {
    await page.click('[data-testid="payment-momo"]')

    // Should show MoMo payment instructions
    await expect(page.locator('[data-testid="payment-instructions"]')).toBeVisible()

    // Instructions should be in Vietnamese
    await expect(page.locator('text=/Bước|Hướng dẫn|Thanh toán/i')).toBeVisible()
  })

  test('should handle mobile payment flow', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Mobile-optimized payment selection
    await page.click('[data-testid="payment-momo"]')

    // Should show mobile-friendly layout
    await helpers.checkResponsiveness()

    // Payment buttons should be touch-friendly
    const paymentBtn = page.locator('[data-testid="proceed-payment"]')
    const btnSize = await paymentBtn.boundingBox()
    expect(btnSize?.height).toBeGreaterThan(44) // Minimum touch target
  })

  test('should support payment cancellation', async ({ page }) => {
    await page.click('[data-testid="payment-momo"]')
    await page.click('[data-testid="proceed-payment"]')

    // Look for cancel button or back link
    const cancelBtn = page.locator(
      '[data-testid="cancel-payment"], text=/cancel|hủy|back|quay lại/i'
    )

    if (await cancelBtn.isVisible()) {
      await cancelBtn.click()

      // Should return to booking or payment selection
      await expect(page).toHaveURL(/\/(payment|booking)/)
    }
  })

  test('should handle payment success callback', async ({ page }) => {
    // Mock successful payment callback
    await page.route('**/api/payments/*/callback', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          transactionId: 'TEST_' + Date.now(),
          amount: TestData.payment.momo.amount
        })
      })
    })

    await page.click('[data-testid="payment-momo"]')
    await helpers.simulatePayment('momo')

    // Should redirect to success page
    await expect(page).toHaveURL(/\/payment\/success/)

    // Should show success message
    await expect(page.locator('text=/success|thành công|completed/i')).toBeVisible()

    // Should show transaction details
    await expect(page.locator('[data-testid="transaction-id"]')).toBeVisible()
  })

  test('should handle payment failure', async ({ page }) => {
    // Mock failed payment callback
    await page.route('**/api/payments/*/callback', async route => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Payment failed',
          code: 'INSUFFICIENT_FUNDS'
        })
      })
    })

    await page.click('[data-testid="payment-momo"]')
    await page.click('[data-testid="proceed-payment"]')

    // Simulate payment failure
    await page.evaluate(() => {
      window.postMessage({ type: 'PAYMENT_FAILED', reason: 'Insufficient funds' }, '*')
    })

    await page.waitForTimeout(2000)

    // Should show error message
    await expect(page.locator('text=/failed|thất bại|error|lỗi/i')).toBeVisible()

    // Should show retry option
    await expect(page.locator('text=/try again|thử lại/i')).toBeVisible()
  })

  test('should store payment history', async ({ page }) => {
    // Complete a mock payment
    await page.click('[data-testid="payment-momo"]')
    await helpers.simulatePayment('momo')

    // Navigate to user dashboard/history
    await page.goto('/dashboard/payments')

    // Should show payment history
    await expect(page.locator('[data-testid="payment-history"]')).toBeVisible()

    // Should show recent payment
    await expect(page.locator('[data-testid="payment-item"]')).toHaveCount({ min: 1 })
  })

  test('should show Vietnamese payment terms', async ({ page }) => {
    // Check for Vietnamese terms and conditions
    await expect(page.locator('text=/điều khoản|chính sách|quy định/i')).toBeVisible()

    // Click terms link
    const termsLink = page.locator('text=/điều khoản|terms/i')
    if (await termsLink.isVisible()) {
      await termsLink.click()

      // Should show terms content in Vietnamese
      await helpers.checkVietnameseContent()
    }
  })

  test('should handle concurrent payment attempts', async ({ page }) => {
    // Open multiple tabs (simulate concurrent attempts)
    const context = page.context()
    const page2 = await context.newPage()

    // Both pages try to pay for same booking
    await page.click('[data-testid="payment-momo"]')
    await page2.goto(page.url())
    await page2.click('[data-testid="payment-vnpay"]')

    // First payment should proceed
    await page.click('[data-testid="proceed-payment"]')

    // Second payment should be blocked or show error
    await page2.click('[data-testid="proceed-payment"]')

    const errorMsg = page2.locator('text=/already processing|đang xử lý|duplicate/i')
    expect(await errorMsg.isVisible()).toBeTruthy()

    await page2.close()
  })
})

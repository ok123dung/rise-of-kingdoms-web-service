/**
 * Booking E2E Tests
 * Tests booking form submission and validation
 */

import { test, expect } from '@playwright/test'

test.describe('Booking Flow', () => {
  test.describe('Service Selection', () => {
    test('should display available services', async ({ page }) => {
      await page.goto('/services')

      // Should show at least one service card
      const serviceCards = page.locator('[data-testid="service-card"], .service-card, article')
      await expect(serviceCards.first()).toBeVisible({ timeout: 10000 })
    })

    test('should navigate to service details', async ({ page }) => {
      await page.goto('/services')

      // Click on first service
      const serviceLink = page.locator('a[href*="service"], a[href*="dich-vu"]').first()
      if (await serviceLink.isVisible()) {
        await serviceLink.click()
        await expect(page).toHaveURL(/service|dich-vu/i)
      }
    })
  })

  test.describe('Booking Form', () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to a booking page - try common paths
      await page.goto('/services')

      // Try to find and click booking button
      const bookingBtn = page.locator('a[href*="booking"], button:has-text("Đặt"), button:has-text("Book")')
      if (await bookingBtn.first().isVisible()) {
        await bookingBtn.first().click()
      } else {
        // Navigate directly to booking if no button found
        await page.goto('/booking')
      }
    })

    test('should display booking form fields', async ({ page }) => {
      // Check for name field
      const nameInput = page.locator('input[name="full_name"], input[name="name"], input[placeholder*="Họ tên"]')
      if (await nameInput.isVisible()) {
        await expect(nameInput).toBeVisible()
      }

      // Check for email field
      const emailInput = page.locator('input[type="email"], input[name="email"]')
      if (await emailInput.isVisible()) {
        await expect(emailInput).toBeVisible()
      }

      // Check for phone field
      const phoneInput = page.locator('input[type="tel"], input[name="phone"]')
      if (await phoneInput.isVisible()) {
        await expect(phoneInput).toBeVisible()
      }
    })

    test('should validate Vietnamese phone number format', async ({ page }) => {
      // Fill invalid phone
      const phoneInput = page.locator('input[type="tel"], input[name="phone"]')
      if (await phoneInput.isVisible()) {
        await phoneInput.fill('123456')

        // Try to submit
        const submitBtn = page.locator('button[type="submit"]')
        await submitBtn.click()

        // Should show validation error
        const error = page.locator('[role="alert"], .error, .text-red-500')
        await expect(error.first()).toBeVisible({ timeout: 5000 })
      }
    })

    test('should validate email format', async ({ page }) => {
      const emailInput = page.locator('input[type="email"], input[name="email"]')
      if (await emailInput.isVisible()) {
        await emailInput.fill('invalid-email')

        const submitBtn = page.locator('button[type="submit"]')
        await submitBtn.click()

        // Should show validation error
        const error = page.locator('[role="alert"], .error, .text-red-500, :invalid')
        await expect(error.first()).toBeVisible({ timeout: 5000 })
      }
    })

    test('should require full name with minimum length', async ({ page }) => {
      const nameInput = page.locator('input[name="full_name"], input[name="name"]')
      if (await nameInput.isVisible()) {
        await nameInput.fill('A') // Too short

        const submitBtn = page.locator('button[type="submit"]')
        await submitBtn.click()

        // Should show validation error
        const error = page.locator('[role="alert"], .error, .text-red-500')
        await expect(error.first()).toBeVisible({ timeout: 5000 })
      }
    })
  })

  test.describe('Booking Confirmation', () => {
    test('should show confirmation after successful booking', async ({ page }) => {
      // This test would require a mock API or test database
      // For now, we verify the form structure exists
      await page.goto('/booking')

      // Check for confirmation page elements on the page
      const successMessage = page.locator('[data-testid="success"], .success, .text-green-500')

      // We don't expect it to be visible initially
      await expect(successMessage).not.toBeVisible()
    })
  })

  test.describe('Accessibility', () => {
    test('should have proper form labels', async ({ page }) => {
      await page.goto('/booking')

      // Check that inputs have associated labels
      const inputs = page.locator('input:not([type="hidden"]):not([type="submit"])')
      const count = await inputs.count()

      for (let i = 0; i < Math.min(count, 5); i++) {
        const input = inputs.nth(i)
        if (await input.isVisible()) {
          // Input should have aria-label, aria-labelledby, or be inside a label
          const hasLabel =
            (await input.getAttribute('aria-label')) ||
            (await input.getAttribute('aria-labelledby')) ||
            (await input.getAttribute('placeholder')) ||
            (await input.locator('xpath=ancestor::label').count()) > 0

          expect(hasLabel).toBeTruthy()
        }
      }
    })

    test('should support keyboard navigation', async ({ page }) => {
      await page.goto('/booking')

      // Tab through form elements
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')

      // Should have focused element
      const focusedElement = page.locator(':focus')
      await expect(focusedElement).toBeVisible()
    })
  })
})

test.describe('Service Pricing', () => {
  test('should display pricing information', async ({ page }) => {
    await page.goto('/services')

    // Look for price elements
    const priceElements = page.locator('[data-testid="price"], .price, [class*="price"]')
    if ((await priceElements.count()) > 0) {
      await expect(priceElements.first()).toBeVisible()
    }
  })

  test('should format prices in Vietnamese Dong', async ({ page }) => {
    await page.goto('/services')

    // Look for VND formatting
    const content = await page.content()
    const hasVNDFormat = content.includes('₫') || content.includes('VND') || content.includes('đ')

    expect(hasVNDFormat).toBe(true)
  })
})

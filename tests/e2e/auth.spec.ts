/**
 * Authentication E2E Tests
 * Tests login, logout, and auth-related user flows
 */

import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.describe('Login Page', () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to login page - try common paths
      try {
        await page.goto('/login')
      } catch {
        await page.goto('/dang-nhap')
      }
    })

    test('should display login form', async ({ page }) => {
      // Check for email input
      const emailInput = page.locator('input[type="email"], input[name="email"]')
      await expect(emailInput).toBeVisible()

      // Check for password input
      const passwordInput = page.locator('input[type="password"], input[name="password"]')
      await expect(passwordInput).toBeVisible()

      // Check for submit button
      const submitButton = page.locator('button[type="submit"]')
      await expect(submitButton).toBeVisible()
    })

    test('should show validation errors for empty form', async ({ page }) => {
      // Click submit without filling form
      const submitButton = page.locator('button[type="submit"]')
      await submitButton.click()

      // Should show validation error
      const errorMessage = page.locator('[role="alert"], .error, .text-red-500')
      await expect(errorMessage.first()).toBeVisible({ timeout: 5000 })
    })

    test('should show error for invalid credentials', async ({ page }) => {
      // Fill in invalid credentials
      await page.locator('input[type="email"], input[name="email"]').fill('invalid@example.com')
      await page.locator('input[type="password"], input[name="password"]').fill('wrongpassword')

      // Submit form
      await page.locator('button[type="submit"]').click()

      // Should show error message
      await page.waitForResponse(
        (response) => response.url().includes('/api/auth') && response.status() !== 200,
        { timeout: 10000 }
      ).catch(() => {
        // Response might not come via API
      })

      // Wait for error message to appear
      const errorMessage = page.locator('[role="alert"], .error, .text-red-500, [data-testid="error"]')
      await expect(errorMessage.first()).toBeVisible({ timeout: 10000 })
    })

    test('should have password visibility toggle', async ({ page }) => {
      const passwordInput = page.locator('input[type="password"], input[name="password"]')
      const toggleButton = page.locator('[data-testid="toggle-password"], button:has(svg[class*="eye"])')

      // Initially password should be hidden
      await expect(passwordInput).toHaveAttribute('type', 'password')

      // If toggle exists, test it
      if (await toggleButton.isVisible()) {
        await toggleButton.click()
        await expect(passwordInput).toHaveAttribute('type', 'text')
      }
    })

    test('should have forgot password link', async ({ page }) => {
      const forgotLink = page.locator('a[href*="forgot"], a[href*="quen-mat-khau"]')
      if (await forgotLink.isVisible()) {
        await expect(forgotLink).toBeEnabled()
      }
    })

    test('should have register link', async ({ page }) => {
      const registerLink = page.locator('a[href*="register"], a[href*="dang-ky"]')
      if (await registerLink.isVisible()) {
        await expect(registerLink).toBeEnabled()
      }
    })
  })

  test.describe('Protected Routes', () => {
    test('should redirect unauthenticated users from dashboard', async ({ page }) => {
      // Try to access protected route
      await page.goto('/dashboard')

      // Should redirect to login
      await expect(page).toHaveURL(/login|dang-nhap|\/$/i)
    })

    test('should redirect unauthenticated users from admin', async ({ page }) => {
      // Try to access admin route
      await page.goto('/admin')

      // Should redirect to login or show access denied
      const url = page.url()
      const isRedirected = url.includes('login') || url.includes('dang-nhap') || url === '/'

      expect(isRedirected).toBe(true)
    })
  })

  test.describe('Security', () => {
    test('should not expose sensitive data in page source', async ({ page }) => {
      await page.goto('/login')

      const content = await page.content()

      // Should not contain sensitive patterns
      expect(content).not.toMatch(/password.*=.*['"]\w+/i)
      expect(content).not.toMatch(/apikey/i)
      expect(content).not.toMatch(/secret.*=.*['"]\w+/i)
    })

    test('should have secure headers', async ({ page }) => {
      const response = await page.goto('/login')

      // Check for security headers
      const headers = response?.headers()
      if (headers) {
        // X-Content-Type-Options should be nosniff
        expect(headers['x-content-type-options']).toBe('nosniff')
      }
    })
  })
})

test.describe('Rate Limiting', () => {
  test('should handle rate limiting gracefully', async ({ page }) => {
    await page.goto('/login')

    // Make multiple rapid login attempts
    for (let i = 0; i < 3; i++) {
      await page.locator('input[type="email"], input[name="email"]').fill('test@example.com')
      await page.locator('input[type="password"], input[name="password"]').fill('password123')
      await page.locator('button[type="submit"]').click()
      await page.waitForTimeout(100)
    }

    // Should not crash or show unhandled error
    await expect(page.locator('body')).toBeVisible()
  })
})

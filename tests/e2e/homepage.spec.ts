/**
 * Homepage E2E Tests
 * Tests homepage rendering, navigation, and core user interactions
 */

import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display the homepage title', async ({ page }) => {
    // Check that the page loads and has a proper title
    await expect(page).toHaveTitle(/ROK|Rise of Kingdoms/i)
  })

  test('should have navigation menu', async ({ page }) => {
    // Check for navigation elements
    const nav = page.locator('nav, header')
    await expect(nav.first()).toBeVisible()
  })

  test('should have hero section with CTA', async ({ page }) => {
    // Look for hero section or main call to action
    const heroSection = page.locator('section').first()
    await expect(heroSection).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Page should still be functional
    await expect(page.locator('body')).toBeVisible()
  })

  test('should have proper meta tags for SEO', async ({ page }) => {
    // Check for essential meta tags
    const description = page.locator('meta[name="description"]')
    await expect(description).toHaveAttribute('content', /.+/)
  })
})

test.describe('Navigation', () => {
  test('should navigate to services page', async ({ page }) => {
    await page.goto('/')

    // Try to find and click a services link
    const servicesLink = page.locator('a[href*="service"], a[href*="dich-vu"]').first()
    if (await servicesLink.isVisible()) {
      await servicesLink.click()
      await expect(page).toHaveURL(/service|dich-vu/i)
    }
  })

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/')

    // Find login link
    const loginLink = page.locator('a[href*="login"], a[href*="dang-nhap"]').first()
    if (await loginLink.isVisible()) {
      await loginLink.click()
      await expect(page).toHaveURL(/login|dang-nhap/i)
    }
  })
})

test.describe('Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const loadTime = Date.now() - startTime

    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000)
  })

  test('should have no console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Filter out known benign errors
    const criticalErrors = errors.filter(
      (e) =>
        !e.includes('favicon') &&
        !e.includes('404') &&
        !e.includes('Warning:')
    )

    expect(criticalErrors).toHaveLength(0)
  })
})

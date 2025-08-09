import { test, expect } from '@playwright/test'

import { TestHelpers, HomePage } from '../utils/test-helpers'

test.describe('Homepage Tests', () => {
  test.beforeEach(async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
  })

  test('should load homepage successfully', async ({ page }) => {
    const helpers = new TestHelpers(page)

    // Check page title
    await expect(page).toHaveTitle(/Rise of Kingdoms/)

    // Check main heading
    await expect(page.locator('h1')).toBeVisible()

    // Check navigation menu
    await expect(page.locator('nav')).toBeVisible()

    // Check hero section
    await expect(page.locator('[data-testid="hero-section"]')).toBeVisible()

    // Check Vietnamese content
    await helpers.checkVietnameseContent()
  })

  test('should be responsive on mobile', async ({ page }) => {
    const helpers = new TestHelpers(page)
    await helpers.checkResponsiveness()
  })

  test('should have working navigation links', async ({ page }) => {
    const homePage = new HomePage(page)

    // Test services link
    await homePage.clickServicesLink()
    await expect(page).toHaveURL(/\/services/)

    // Go back to home
    await page.goBack()

    // Test contact link
    await homePage.clickContactLink()
    await expect(page).toHaveURL(/\/contact/)
  })

  test('should load within performance thresholds', async ({ page }) => {
    const helpers = new TestHelpers(page)
    await helpers.checkPerformance()
  })

  test('should have proper SEO meta tags', async ({ page }) => {
    // Check meta description
    const metaDescription = page.locator('meta[name="description"]')
    await expect(metaDescription).toHaveAttribute('content', /.+/)

    // Check Open Graph tags
    const ogTitle = page.locator('meta[property="og:title"]')
    await expect(ogTitle).toHaveAttribute('content', /.+/)

    // Check structured data
    const jsonLd = page.locator('script[type="application/ld+json"]')
    await expect(jsonLd).toBeAttached()
  })

  test('should have accessible elements', async ({ page }) => {
    const helpers = new TestHelpers(page)
    await helpers.checkAccessibility()
  })

  test('should not have console errors', async ({ page }) => {
    const helpers = new TestHelpers(page)
    await helpers.checkConsoleErrors()
  })

  test('should display services section', async ({ page }) => {
    // Check if services section exists
    await expect(page.locator('[data-testid="services-section"]')).toBeVisible()

    // Check service cards
    const serviceCards = page.locator('[data-testid="service-card"]')
    await expect(serviceCards).toHaveCount({ min: 1 })

    // Check each service card has required elements
    const firstCard = serviceCards.first()
    await expect(firstCard.locator('h3')).toBeVisible()
    await expect(firstCard.locator('.price')).toBeVisible()
  })

  test('should display features section', async ({ page }) => {
    await expect(page.locator('[data-testid="features-section"]')).toBeVisible()

    // Check feature items
    const features = page.locator('[data-testid="feature-item"]')
    await expect(features).toHaveCount({ min: 3 })
  })

  test('should have working CTA buttons', async ({ page }) => {
    // Find and click primary CTA
    const ctaButton = page.locator('[data-testid="primary-cta"]').first()
    await expect(ctaButton).toBeVisible()
    await ctaButton.click()

    // Should navigate to services or booking page
    await expect(page).toHaveURL(/\/(services|booking)/)
  })

  test('should load images properly', async ({ page }) => {
    // Wait for images to load
    await page.waitForLoadState('networkidle')

    // Check that images are loaded
    const images = page.locator('img')
    const imageCount = await images.count()

    if (imageCount > 0) {
      for (let i = 0; i < Math.min(imageCount, 5); i++) {
        // Check first 5 images
        const img = images.nth(i)
        const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth)
        expect(naturalWidth).toBeGreaterThan(0)
      }
    }
  })

  test('should have contact information', async ({ page }) => {
    // Check footer or contact section
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()

    // Check for contact information
    await expect(footer.locator('text=/support@rokdbot.com/')).toBeVisible()
  })
})

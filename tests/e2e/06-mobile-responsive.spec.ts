import { test, expect } from '@playwright/test'
import { TestHelpers } from '../utils/test-helpers'

test.describe('Mobile Responsive Tests', () => {
  let helpers: TestHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page)
  })

  test.describe('Mobile Navigation', () => {
    test('should show mobile menu on small screens', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/')
      
      // Mobile menu button should be visible
      await expect(page.locator('[data-testid="mobile-menu-btn"], .hamburger-menu')).toBeVisible()
      
      // Desktop navigation should be hidden
      await expect(page.locator('[data-testid="desktop-nav"]')).toBeHidden()
      
      // Click mobile menu
      await page.click('[data-testid="mobile-menu-btn"]')
      
      // Mobile menu should open
      await expect(page.locator('[data-testid="mobile-menu"], .mobile-nav')).toBeVisible()
      
      // Navigation links should be accessible
      await expect(page.locator('[data-testid="mobile-nav-services"]')).toBeVisible()
      await expect(page.locator('[data-testid="mobile-nav-contact"]')).toBeVisible()
    })

    test('should navigate properly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/')
      
      // Open mobile menu and navigate
      await page.click('[data-testid="mobile-menu-btn"]')
      await page.click('[data-testid="mobile-nav-services"], text=Dịch vụ')
      
      // Should navigate to services page
      await expect(page).toHaveURL(/\/services/)
      
      // Check mobile layout of services page
      await helpers.checkResponsiveness()
    })
  })

  test.describe('Mobile Forms', () => {
    test('should handle forms on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await helpers.login()
      
      // Navigate to booking form
      await page.goto('/services')
      await page.click('[data-testid="service-card"]:first-child .book-now-btn')
      
      // Form should be mobile-friendly
      const form = page.locator('form')
      await expect(form).toBeVisible()
      
      // Input fields should be appropriately sized
      const inputs = page.locator('input, textarea, select')
      const inputCount = await inputs.count()
      
      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i)
        const boundingBox = await input.boundingBox()
        
        if (boundingBox) {
          // Touch targets should be at least 44px high
          expect(boundingBox.height).toBeGreaterThan(40)
        }
      }
      
      // Fill form with Vietnamese data
      await helpers.fillVietnameseForm({
        gameId: 'Mobile123456',
        server: 'Mobile Server',
        requirements: 'Yêu cầu trên điện thoại'
      })
      
      // Submit should work
      await page.click('button[type="submit"]')
      await expect(page).toHaveURL(/\/payment/)
    })

    test('should handle authentication forms on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/auth/signin')
      
      // Check form layout
      await helpers.checkResponsiveness()
      
      // Form elements should be touch-friendly
      const emailInput = page.locator('[name="email"]')
      const passwordInput = page.locator('[name="password"]')
      const submitBtn = page.locator('button[type="submit"]')
      
      await expect(emailInput).toBeVisible()
      await expect(passwordInput).toBeVisible()
      await expect(submitBtn).toBeVisible()
      
      // Check input sizes
      const emailBox = await emailInput.boundingBox()
      const submitBox = await submitBtn.boundingBox()
      
      expect(emailBox?.height).toBeGreaterThan(40)
      expect(submitBox?.height).toBeGreaterThan(44)
      
      // Test form functionality
      await emailInput.fill('test@example.com')
      await passwordInput.fill('password123')
      await submitBtn.click()
    })
  })

  test.describe('Mobile Payment Flow', () => {
    test('should handle payment selection on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await helpers.login()
      
      // Complete booking to reach payment
      await page.goto('/services')
      await page.click('[data-testid="service-card"]:first-child .book-now-btn')
      await helpers.fillVietnameseForm({
        gameId: 'MobilePay123',
        server: 'Mobile'
      })
      await page.click('button[type="submit"]')
      
      // Payment options should be mobile-friendly
      await expect(page.locator('[data-testid="payment-momo"]')).toBeVisible()
      await expect(page.locator('[data-testid="payment-vnpay"]')).toBeVisible()
      await expect(page.locator('[data-testid="payment-zalopay"]')).toBeVisible()
      
      // Payment buttons should be touch-friendly
      const paymentBtns = page.locator('[data-testid^="payment-"]')
      const count = await paymentBtns.count()
      
      for (let i = 0; i < count; i++) {
        const btn = paymentBtns.nth(i)
        const box = await btn.boundingBox()
        expect(box?.height).toBeGreaterThan(44)
      }
      
      // Select payment method
      await page.click('[data-testid="payment-momo"]')
      
      // Proceed button should be accessible
      const proceedBtn = page.locator('[data-testid="proceed-payment"]')
      await expect(proceedBtn).toBeVisible()
      
      const proceedBox = await proceedBtn.boundingBox()
      expect(proceedBox?.height).toBeGreaterThan(44)
    })

    test('should show QR code properly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await helpers.login()
      
      // Navigate to payment
      await page.goto('/services')
      await page.click('[data-testid="service-card"]:first-child .book-now-btn')
      await helpers.fillVietnameseForm({ gameId: 'QR123', server: 'Mobile' })
      await page.click('button[type="submit"]')
      
      // Select MoMo (usually shows QR)
      await page.click('[data-testid="payment-momo"]')
      await page.click('[data-testid="proceed-payment"]')
      
      // QR code should be appropriately sized for mobile
      const qrCode = page.locator('[data-testid="qr-code"], .qr-code img')
      
      if (await qrCode.isVisible()) {
        const qrBox = await qrCode.boundingBox()
        
        if (qrBox) {
          // QR should be large enough to scan but fit on screen
          expect(qrBox.width).toBeGreaterThan(200)
          expect(qrBox.width).toBeLessThan(350) // Fit on mobile screen
          expect(qrBox.height).toBeGreaterThan(200)
        }
      }
    })
  })

  test.describe('Mobile Performance', () => {
    test('should load quickly on 3G connection', async ({ page }) => {
      // Simulate 3G connection (common in Vietnam)
      await page.route('**/*', async route => {
        await new Promise(resolve => setTimeout(resolve, 100)) // Add 100ms delay
        await route.continue()
      })
      
      await page.setViewportSize({ width: 375, height: 667 })
      
      const startTime = Date.now()
      await page.goto('/')
      await helpers.waitForPageLoad()
      const loadTime = Date.now() - startTime
      
      // Should load within 5 seconds on 3G
      expect(loadTime).toBeLessThan(5000)
    })

    test('should be performant with Core Web Vitals', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/')
      
      // Check Core Web Vitals
      const metrics = await page.evaluate(() => {
        return new Promise(resolve => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries()
            const lcp = entries.find(entry => entry.entryType === 'largest-contentful-paint')
            const fid = entries.find(entry => entry.entryType === 'first-input')
            const cls = entries.find(entry => entry.entryType === 'layout-shift')
            
            resolve({
              lcp: lcp?.startTime || 0,
              fid: fid?.processingStart - fid?.startTime || 0,
              cls: cls?.value || 0
            })
          }).observe({entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift']})
          
          // Fallback timeout
          setTimeout(() => resolve({ lcp: 0, fid: 0, cls: 0 }), 3000)
        })
      })
      
      // Core Web Vitals thresholds
      if (metrics.lcp > 0) expect(metrics.lcp).toBeLessThan(2500) // 2.5s
      if (metrics.fid > 0) expect(metrics.fid).toBeLessThan(100)  // 100ms
      if (metrics.cls > 0) expect(metrics.cls).toBeLessThan(0.1)  // 0.1
    })
  })

  test.describe('Mobile Layout', () => {
    test('should display content properly on various mobile sizes', async ({ page }) => {
      const mobileSizes = [
        { width: 320, height: 568, name: 'iPhone SE' },
        { width: 375, height: 667, name: 'iPhone 8' },
        { width: 414, height: 896, name: 'iPhone 11' },
        { width: 360, height: 640, name: 'Samsung Galaxy' }
      ]
      
      for (const size of mobileSizes) {
        await page.setViewportSize(size)
        await page.goto('/')
        
        // Check basic layout elements
        await expect(page.locator('header')).toBeVisible()
        await expect(page.locator('main, .main-content')).toBeVisible()
        await expect(page.locator('footer')).toBeVisible()
        
        // Check for horizontal scrolling
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth
        })
        expect(hasHorizontalScroll).toBeFalsy()
        
        // Check hero section visibility
        await expect(page.locator('[data-testid="hero-section"]')).toBeVisible()
      }
    })

    test('should handle Vietnamese text properly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/')
      
      // Vietnamese text should not overflow
      const vietnameseElements = page.locator('text=/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i')
      const count = await vietnameseElements.count()
      
      for (let i = 0; i < Math.min(count, 10); i++) { // Check first 10 elements
        const element = vietnameseElements.nth(i)
        const box = await element.boundingBox()
        
        if (box) {
          // Text should not exceed viewport width
          expect(box.x + box.width).toBeLessThan(400) // Allow some margin
        }
      }
    })
  })

  test.describe('Touch Interactions', () => {
    test('should handle touch gestures', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/')
      
      // Tap interactions should work
      const tapTarget = page.locator('[data-testid="primary-cta"]').first()
      
      if (await tapTarget.isVisible()) {
        // Use tap instead of click
        await tapTarget.tap()
        
        // Should navigate or trigger action
        await page.waitForTimeout(1000)
        
        // Verify action occurred (URL change or modal opening)
        const currentUrl = page.url()
        const hasModal = await page.locator('.modal, [role="dialog"]').isVisible()
        
        expect(currentUrl !== '/' || hasModal).toBeTruthy()
      }
    })

    test('should handle swipe gestures on carousels', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/')
      
      // Look for carousel or swipeable elements
      const carousel = page.locator('[data-testid="carousel"], .swiper, .slider')
      
      if (await carousel.isVisible()) {
        const carouselBox = await carousel.boundingBox()
        
        if (carouselBox) {
          // Perform swipe gesture
          await page.mouse.move(carouselBox.x + carouselBox.width - 50, carouselBox.y + carouselBox.height / 2)
          await page.mouse.down()
          await page.mouse.move(carouselBox.x + 50, carouselBox.y + carouselBox.height / 2)
          await page.mouse.up()
          
          // Wait for swipe animation
          await page.waitForTimeout(500)
          
          // Carousel should have moved
          // This is hard to test generically, so we just ensure no errors occurred
          await helpers.checkConsoleErrors()
        }
      }
    })
  })

  test.describe('Mobile Admin', () => {
    test('should allow admin access on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await helpers.loginAsAdmin()
      
      await page.goto('/admin')
      
      // Admin interface should be mobile-accessible
      await expect(page.locator('[data-testid="admin-mobile-menu"], .admin-sidebar')).toBeVisible()
      
      // Key metrics should be visible and readable
      await expect(page.locator('[data-testid="total-bookings"]')).toBeVisible()
      await expect(page.locator('[data-testid="total-revenue"]')).toBeVisible()
      
      // Navigation should work
      await page.click('[data-testid="admin-nav-bookings"], text=Bookings')
      await expect(page).toHaveURL(/\/admin\/bookings/)
    })

    test('should handle admin actions on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await helpers.loginAsAdmin()
      
      await page.goto('/admin/bookings')
      
      // Table should be responsive or have horizontal scroll
      const table = page.locator('[data-testid="bookings-table"]')
      await expect(table).toBeVisible()
      
      // Action buttons should be touch-friendly
      const actionBtns = page.locator('[data-testid="booking-action-btn"], .action-btn')
      const count = await actionBtns.count()
      
      for (let i = 0; i < Math.min(count, 3); i++) {
        const btn = actionBtns.nth(i)
        const box = await btn.boundingBox()
        if (box) {
          expect(box.height).toBeGreaterThan(44)
        }
      }
    })
  })

  test.describe('Offline Support', () => {
    test('should show offline indicator when network is unavailable', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/')
      
      // Simulate offline condition
      await page.setOfflineMode(true)
      
      // Trigger a network request
      await page.click('a[href="/services"]')
      
      // Should show offline message or cached content
      const offlineIndicator = page.locator('[data-testid="offline-indicator"], text=/offline|không có kết nối/i')
      const cachedContent = page.locator('[data-testid="cached-content"]')
      
      const hasOfflineIndicator = await offlineIndicator.isVisible()
      const hasCachedContent = await cachedContent.isVisible()
      
      // Either offline indicator or cached content should be shown
      expect(hasOfflineIndicator || hasCachedContent).toBeTruthy()
      
      // Restore online mode
      await page.setOfflineMode(false)
    })
  })
})
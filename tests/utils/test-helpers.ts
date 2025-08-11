import { type Page, expect } from '@playwright/test'

export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Wait for page to be fully loaded including network requests
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle')
    await this.page.waitForLoadState('domcontentloaded')
  }

  /**
   * Take a screenshot with timestamp
   */
  async screenshot(name: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    await this.page.screenshot({ path: `test-results/screenshots/${name}-${timestamp}.png` })
  }

  /**
   * Check if page is responsive (mobile-friendly)
   */
  async checkResponsiveness() {
    // Check mobile viewport
    await this.page.setViewportSize({ width: 375, height: 667 })
    await this.waitForPageLoad()

    // Ensure no horizontal scroll
    const hasHorizontalScroll = await this.page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
    })
    expect(hasHorizontalScroll).toBeFalsy()

    // Check touch targets are at least 44px
    const smallTouchTargets = await this.page.evaluate(() => {
      const buttons = Array.from(
        document.querySelectorAll('button, a, input[type="submit"], input[type="button"]')
      )
      return buttons.filter(el => {
        const rect = el.getBoundingClientRect()
        return rect.width < 44 || rect.height < 44
      }).length
    })
    expect(smallTouchTargets).toBeLessThan(3) // Allow some tolerance
  }

  /**
   * Check page accessibility
   */
  async checkAccessibility() {
    // Check for basic accessibility requirements
    const missingAltImages = await this.page.$$('img:not([alt])')
    expect(missingAltImages.length).toBe(0)

    // Check for form labels
    const unlabeledInputs = await this.page.$$('input:not([aria-label]):not([id])')
    expect(unlabeledInputs.length).toBe(0)

    // Check for heading hierarchy
    const headings = await this.page.$$eval('h1, h2, h3, h4, h5, h6', headings =>
      headings.map(h => parseInt(h.tagName.substring(1)))
    )
    if (headings.length > 0) {
      expect(headings[0]).toBe(1) // First heading should be h1
    }
  }

  /**
   * Check page performance metrics
   */
  async checkPerformance() {
    const metrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming
      return {
        domContentLoaded:
          navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        totalLoadTime: navigation.loadEventEnd - navigation.fetchStart
      }
    })

    // Performance expectations for Vietnamese users on 3G
    expect(metrics.totalLoadTime).toBeLessThan(5000) // 5 seconds max
    expect(metrics.domContentLoaded).toBeLessThan(2000) // 2 seconds max
  }

  /**
   * Fill form with Vietnamese test data
   */
  async fillVietnameseForm(formData: Record<string, string>) {
    for (const [field, value] of Object.entries(formData)) {
      await this.page.fill(`[name="${field}"], [data-testid="${field}"], #${field}`, value)
    }
  }

  /**
   * Login with test credentials
   */
  async login(email = 'test@rokdbot.com', password = 'TestPassword123!') {
    await this.page.goto('/auth/signin')
    await this.page.fill('[name="email"]', email)
    await this.page.fill('[name="password"]', password)
    await this.page.click('button[type="submit"]')
    await this.waitForPageLoad()
  }

  /**
   * Login as admin
   */
  async loginAsAdmin() {
    await this.login('admin@rokdbot.com', 'AdminPassword123!')
  }

  /**
   * Simulate payment flow (mock)
   */
  async simulatePayment(paymentMethod: 'momo' | 'vnpay' | 'zalopay' = 'momo') {
    // This would simulate a payment flow in test environment
    await this.page.click(`[data-testid="payment-${paymentMethod}"]`)
    await this.waitForPageLoad()

    // In real tests, you'd interact with payment gateway test environment
    // For now, we'll simulate success
    if (this.page.url().includes('payment')) {
      await this.page.evaluate(() => {
        // Mock payment success callback
        window.postMessage({ type: 'PAYMENT_SUCCESS', method: 'momo' }, '*')
      })
    }
  }

  /**
   * Check for Vietnamese content
   */
  async checkVietnameseContent() {
    const pageText = await this.page.textContent('body')
    const hasVietnamese =
      /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(pageText || '')
    expect(hasVietnamese).toBeTruthy()
  }

  /**
   * Wait for element to be visible and stable
   */
  async waitForStableElement(selector: string, timeout = 5000) {
    await this.page.waitForSelector(selector, { state: 'visible', timeout })

    // Wait for element to stop moving (animations to complete)
    await this.page.waitForFunction(
      sel => {
        const element = document.querySelector(sel)
        if (!element) return false

        const rect1 = element.getBoundingClientRect()
        return new Promise(resolve => {
          setTimeout(() => {
            const rect2 = element.getBoundingClientRect()
            resolve(rect1.top === rect2.top && rect1.left === rect2.left)
          }, 100)
        })
      },
      selector,
      { timeout }
    )
  }

  /**
   * Check for console errors
   */
  async checkConsoleErrors() {
    const errors: string[] = []

    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    // Give some time for errors to appear
    await this.page.waitForTimeout(1000)

    // Filter out known non-critical errors
    const criticalErrors = errors.filter(
      error =>
        !error.includes('favicon.ico') && !error.includes('404') && !error.includes('DevTools')
    )

    expect(criticalErrors.length).toBe(0)
  }
}

/**
 * Test data generators for Vietnamese context
 */
export const TestData = {
  user: {
    email: 'nguyenvana@example.com',
    name: 'Nguyễn Văn A',
    phone: '0123456789',
    password: 'MatKhau123!'
  },

  admin: {
    email: 'admin@rokdbot.com',
    name: 'Admin User',
    password: 'AdminPass123!'
  },

  booking: {
    serviceName: 'Tăng Power Rise of Kingdoms',
    gameId: 'Player123456',
    server: 'Server 1234',
    requirements: 'Tăng power lên 100M',
    notes: 'Yêu cầu tăng power trong 24h'
  },

  payment: {
    amount: 500000, // 500,000 VND
    method: 'momo',
    momo: {
      phoneNumber: '0912345678'
    }
  }
}

/**
 * Page Object Models
 */
export class HomePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/')
    await new TestHelpers(this.page).waitForPageLoad()
  }

  async clickServicesLink() {
    await this.page.click('a[href="/services"]')
  }

  async clickContactLink() {
    await this.page.click('a[href="/contact"]')
  }
}

export class AuthPage {
  constructor(private page: Page) {}

  async gotoSignIn() {
    await this.page.goto('/auth/signin')
  }

  async gotoSignUp() {
    await this.page.goto('/auth/signup')
  }

  async signIn(email: string, password: string) {
    await this.page.fill('[name="email"]', email)
    await this.page.fill('[name="password"]', password)
    await this.page.click('button[type="submit"]')
    await new TestHelpers(this.page).waitForPageLoad()
  }

  async signUp(userData: { email: string; name: string; password: string }) {
    await this.page.fill('[name="email"]', userData.email)
    await this.page.fill('[name="name"]', userData.name)
    await this.page.fill('[name="password"]', userData.password)
    await this.page.click('button[type="submit"]')
    await new TestHelpers(this.page).waitForPageLoad()
  }
}

export class ServicesPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/services')
    await new TestHelpers(this.page).waitForPageLoad()
  }

  async selectService(serviceName: string) {
    await this.page.click(`text=${serviceName}`)
  }

  async clickBookNow() {
    await this.page.click('text=Đặt ngay')
  }
}

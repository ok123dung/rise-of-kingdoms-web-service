import { test, expect } from '@playwright/test'

import { TestHelpers, AuthPage, TestData } from '../utils/test-helpers'

test.describe('Authentication Tests', () => {
  let authPage: AuthPage
  let helpers: TestHelpers

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page)
    helpers = new TestHelpers(page)
  })

  test.describe('Sign In', () => {
    test('should display sign in form', async ({ page }) => {
      await authPage.gotoSignIn()

      // Check form elements
      await expect(page.locator('[name="email"]')).toBeVisible()
      await expect(page.locator('[name="password"]')).toBeVisible()
      await expect(page.locator('button[type="submit"]')).toBeVisible()

      // Check Vietnamese labels
      await helpers.checkVietnameseContent()
    })

    test('should show validation errors for empty form', async ({ page }) => {
      await authPage.gotoSignIn()

      // Submit empty form
      await page.click('button[type="submit"]')

      // Check for validation errors
      await expect(
        page.locator('.error-message, .text-red-500, .text-red-600').count()
      ).resolves.toBeGreaterThanOrEqual(1)
    })

    test('should show error for invalid credentials', async ({ page }) => {
      await authPage.gotoSignIn()

      await authPage.signIn('invalid@email.com', 'wrongpassword')

      // Should show error message
      await expect(page.locator('text=/Invalid credentials|Sai thông tin|không đúng|mật khẩu/i')).toBeVisible()
    })

    test('should successfully login with valid credentials', async ({ page }) => {
      await authPage.gotoSignIn()

      // Use test credentials
      await authPage.signIn(TestData.user.email, TestData.user.password)

      // Should redirect to dashboard
      await expect(page).toHaveURL(/\/(dashboard|profile)/)

      // Should show user menu or name
      await expect(page.locator('[data-testid="user-menu"], .user-name')).toBeVisible()
    })

    test('should support Discord login', async ({ page }) => {
      await authPage.gotoSignIn()

      // Check Discord login button
      const discordBtn = page.locator('text=/Discord|Đăng nhập với Discord/i')
      await expect(discordBtn).toBeVisible()

      // Note: We don't test actual Discord OAuth flow in E2E tests
      // That would require complex OAuth mocking
    })

    test('should have forgot password link', async ({ page }) => {
      await authPage.gotoSignIn()

      const forgotLink = page.locator('text=/Forgot password|Quên mật khẩu/i')
      await expect(forgotLink).toBeVisible()

      await forgotLink.click()
      await expect(page).toHaveURL(/\/auth\/forgot-password/)
    })

    test('should prevent brute force attacks', async ({ page }) => {
      await authPage.gotoSignIn()

      // Try multiple failed logins
      for (let i = 0; i < 6; i++) {
        await authPage.signIn('test@example.com', 'wrongpassword')
        await page.waitForTimeout(100)
      }

      // Should show rate limit message
      await expect(page.locator('text=/too many attempts|quá nhiều lần thử/i')).toBeVisible()
    })
  })

  test.describe('Sign Up', () => {
    test('should display sign up form', async ({ page }) => {
      await authPage.gotoSignUp()

      // Check form elements
      await expect(page.locator('[name="email"]')).toBeVisible()
      await expect(page.locator('[name="fullName"]')).toBeVisible()
      await expect(page.locator('[name="password"]')).toBeVisible()
      await expect(page.locator('button[type="submit"]')).toBeVisible()
    })

    test('should validate password strength', async ({ page }) => {
      await authPage.gotoSignUp()

      // Enter weak password
      await page.fill('[name="password"]', '123')

      // Should show password strength indicator
      await expect(page.locator('.password-strength, .password-requirements')).toBeVisible()
    })

    test('should successfully register new user', async ({ page }) => {
      await authPage.gotoSignUp()

      const newUser = {
        email: `test-${Date.now()}@example.com`,
        name: 'Người Dùng Mới',
        password: 'NewPassword123!'
      }

      await authPage.signUp({
        ...newUser,
        name: newUser.name // Map name to fullName in helper if needed, or update helper
      })

      // Should redirect to dashboard or show success message
      await expect(page.locator('text=/welcome|chào mừng|success|thành công/i')).toBeVisible()
    })

    test('should prevent duplicate email registration', async ({ page }) => {
      await authPage.gotoSignUp()

      // Try to register with existing email
      await authPage.signUp({
        email: TestData.user.email,
        name: 'Test User',
        password: 'Password123!'
      })

      // Should show error message
      await expect(page.locator('text=/already exists|đã tồn tại/i')).toBeVisible()
    })
  })

  test.describe('Logout', () => {
    test('should successfully logout user', async ({ page }) => {
      // Login first
      await helpers.login()

      // Find and click logout button
      const logoutBtn = page.locator('[data-testid="logout-btn"]')
      await expect(logoutBtn).toBeVisible()
      await logoutBtn.click()

      // Should redirect to home page
      await expect(page).toHaveURL('/')

      // Should show login button again
      await expect(page.locator('text=/Sign in|Đăng nhập/i')).toBeVisible()
    })
  })

  test.describe('Protected Routes', () => {
    test('should redirect to login when accessing protected route', async ({ page }) => {
      // Try to access dashboard without login
      await page.goto('/dashboard')

      // Should redirect to login
      await expect(page).toHaveURL(/\/auth\/signin/)
    })

    test('should allow access to protected route after login', async ({ page }) => {
      await helpers.login()

      // Should be able to access dashboard
      await page.goto('/dashboard')
      await expect(page).toHaveURL(/\/dashboard/)
    })
  })

  test.describe('Admin Authentication', () => {
    test('should allow admin login', async ({ page }) => {
      await helpers.loginAsAdmin()

      // Should redirect to admin dashboard
      await expect(page).toHaveURL(/\/admin/)
    })

    test('should prevent non-admin access to admin routes', async ({ page }) => {
      // Login as regular user
      await helpers.login()

      // Try to access admin route
      await page.goto('/admin')

      // Should show access denied or redirect
      await expect(page.locator('text=/access denied|không có quyền/i')).toBeVisible()
    })
  })

  test.describe('Session Management', () => {
    test('should maintain session across page reloads', async ({ page }) => {
      await helpers.login()

      // Reload page
      await page.reload()

      // Should still be logged in
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
    })

    test('should handle session expiry', async ({ page }) => {
      await helpers.login()

      // Simulate session expiry by manipulating local storage
      await page.evaluate(() => {
        localStorage.removeItem('next-auth.session-token')
        sessionStorage.clear()
      })

      // Navigate to protected route
      await page.goto('/dashboard')

      // Should redirect to login
      await expect(page).toHaveURL(/\/auth\/signin/)
    })
  })
})

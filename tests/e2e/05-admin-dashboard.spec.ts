import { test, expect } from '@playwright/test'
import { TestHelpers } from '../utils/test-helpers'

test.describe('Admin Dashboard Tests', () => {
  let helpers: TestHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page)
    await helpers.loginAsAdmin()
  })

  test('should display admin dashboard', async ({ page }) => {
    await page.goto('/admin')
    
    // Should show admin dashboard
    await expect(page).toHaveURL(/\/admin/)
    await expect(page.locator('h1, .dashboard-title')).toContainText(/admin|dashboard|quản trị/i)
    
    // Should show key metrics
    await expect(page.locator('[data-testid="total-bookings"]')).toBeVisible()
    await expect(page.locator('[data-testid="total-revenue"]')).toBeVisible()
    await expect(page.locator('[data-testid="active-users"]')).toBeVisible()
    await expect(page.locator('[data-testid="pending-payments"]')).toBeVisible()
  })

  test('should show recent bookings', async ({ page }) => {
    await page.goto('/admin')
    
    // Should show recent bookings section
    await expect(page.locator('[data-testid="recent-bookings"]')).toBeVisible()
    
    // Should show booking items
    const bookingItems = page.locator('[data-testid="booking-item"]')
    await expect(bookingItems).toHaveCount({ min: 0 }) // May be empty in test env
    
    // If bookings exist, check their structure
    const firstBooking = bookingItems.first()
    if (await firstBooking.isVisible()) {
      await expect(firstBooking.locator('.booking-id')).toBeVisible()
      await expect(firstBooking.locator('.customer-name')).toBeVisible()
      await expect(firstBooking.locator('.booking-status')).toBeVisible()
      await expect(firstBooking.locator('.booking-amount')).toBeVisible()
    }
  })

  test('should navigate to bookings management', async ({ page }) => {
    await page.goto('/admin')
    
    // Click bookings management link
    await page.click('text=/Bookings|Đơn hàng|Quản lý booking/i')
    
    // Should navigate to bookings page
    await expect(page).toHaveURL(/\/admin\/bookings/)
    
    // Should show bookings table
    await expect(page.locator('[data-testid="bookings-table"]')).toBeVisible()
    
    // Should show filter options
    await expect(page.locator('[data-testid="status-filter"]')).toBeVisible()
    await expect(page.locator('[data-testid="date-filter"]')).toBeVisible()
  })

  test('should filter bookings by status', async ({ page }) => {
    await page.goto('/admin/bookings')
    
    // Filter by pending status
    await page.selectOption('[data-testid="status-filter"]', 'pending')
    await helpers.waitForPageLoad()
    
    // All visible bookings should be pending
    const statusElements = page.locator('[data-testid="booking-status"]')
    const count = await statusElements.count()
    
    for (let i = 0; i < count; i++) {
      const status = await statusElements.nth(i).textContent()
      expect(status?.toLowerCase()).toContain('pending')
    }
  })

  test('should update booking status', async ({ page }) => {
    await page.goto('/admin/bookings')
    
    // Find first booking and click edit
    const firstBooking = page.locator('[data-testid="booking-item"]').first()
    
    if (await firstBooking.isVisible()) {
      await firstBooking.locator('[data-testid="edit-booking"]').click()
      
      // Should show edit modal or navigate to edit page
      await expect(page.locator('[data-testid="edit-booking-modal"], .edit-booking-form')).toBeVisible()
      
      // Update status
      await page.selectOption('[name="status"]', 'in_progress')
      
      // Save changes
      await page.click('[data-testid="save-booking"]')
      
      // Should show success message
      await expect(page.locator('text=/updated|cập nhật|success|thành công/i')).toBeVisible()
    }
  })

  test('should show revenue analytics', async ({ page }) => {
    await page.goto('/admin')
    
    // Should show revenue chart
    await expect(page.locator('[data-testid="revenue-chart"]')).toBeVisible()
    
    // Should show time period selector
    await expect(page.locator('[data-testid="time-period-selector"]')).toBeVisible()
    
    // Change time period
    await page.selectOption('[data-testid="time-period-selector"]', '30days')
    await helpers.waitForPageLoad()
    
    // Chart should update
    await expect(page.locator('[data-testid="revenue-chart"]')).toBeVisible()
  })

  test('should manage users', async ({ page }) => {
    await page.goto('/admin/users')
    
    // Should show users table
    await expect(page.locator('[data-testid="users-table"]')).toBeVisible()
    
    // Should show user search
    await expect(page.locator('[data-testid="user-search"]')).toBeVisible()
    
    // Search for user
    await page.fill('[data-testid="user-search"]', 'test@')
    await page.press('[data-testid="user-search"]', 'Enter')
    
    await helpers.waitForPageLoad()
    
    // Should show filtered results
    const userRows = page.locator('[data-testid="user-row"]')
    const count = await userRows.count()
    
    if (count > 0) {
      const firstUser = userRows.first()
      await expect(firstUser.locator('.user-email')).toContainText('test@')
    }
  })

  test('should handle payments management', async ({ page }) => {
    await page.goto('/admin/payments')
    
    // Should show payments table
    await expect(page.locator('[data-testid="payments-table"]')).toBeVisible()
    
    // Should show payment status filters
    await expect(page.locator('[data-testid="payment-status-filter"]')).toBeVisible()
    
    // Filter by completed payments
    await page.selectOption('[data-testid="payment-status-filter"]', 'completed')
    await helpers.waitForPageLoad()
    
    // Should show only completed payments
    const paymentStatuses = page.locator('[data-testid="payment-status"]')
    const count = await paymentStatuses.count()
    
    for (let i = 0; i < count; i++) {
      const status = await paymentStatuses.nth(i).textContent()
      expect(status?.toLowerCase()).toContain('completed')
    }
  })

  test('should process refunds', async ({ page }) => {
    await page.goto('/admin/payments')
    
    // Find completed payment and process refund
    const completedPayment = page.locator('[data-testid="payment-row"]').first()
    
    if (await completedPayment.isVisible()) {
      await completedPayment.locator('[data-testid="refund-btn"]').click()
      
      // Should show refund modal
      await expect(page.locator('[data-testid="refund-modal"]')).toBeVisible()
      
      // Fill refund details
      await page.fill('[name="refundAmount"]', '100000')
      await page.fill('[name="refundReason"]', 'Customer request')
      
      // Process refund
      await page.click('[data-testid="process-refund"]')
      
      // Should show confirmation
      await expect(page.locator('text=/refund processed|hoàn tiền thành công/i')).toBeVisible()
    }
  })

  test('should show system statistics', async ({ page }) => {
    await page.goto('/admin/stats')
    
    // Should show various statistics
    await expect(page.locator('[data-testid="total-users"]')).toBeVisible()
    await expect(page.locator('[data-testid="conversion-rate"]')).toBeVisible()
    await expect(page.locator('[data-testid="avg-order-value"]')).toBeVisible()
    await expect(page.locator('[data-testid="popular-services"]')).toBeVisible()
    
    // Statistics should contain numbers
    const totalUsers = await page.locator('[data-testid="total-users"]').textContent()
    expect(totalUsers).toMatch(/\d+/)
  })

  test('should export data', async ({ page }) => {
    await page.goto('/admin/bookings')
    
    // Should have export button
    const exportBtn = page.locator('[data-testid="export-btn"], text=/export|xuất dữ liệu/i')
    await expect(exportBtn).toBeVisible()
    
    // Click export
    const downloadPromise = page.waitForEvent('download')
    await exportBtn.click()
    
    // Should trigger download
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/\.(csv|xlsx)$/)
  })

  test('should handle admin notifications', async ({ page }) => {
    await page.goto('/admin')
    
    // Should show notifications bell or indicator
    await expect(page.locator('[data-testid="notifications"], .notification-bell')).toBeVisible()
    
    // Click notifications
    await page.click('[data-testid="notifications"]')
    
    // Should show notifications dropdown or panel
    await expect(page.locator('[data-testid="notifications-panel"]')).toBeVisible()
    
    // Should show notification items
    const notifications = page.locator('[data-testid="notification-item"]')
    const count = await notifications.count()
    
    if (count > 0) {
      const firstNotification = notifications.first()
      await expect(firstNotification.locator('.notification-message')).toBeVisible()
      await expect(firstNotification.locator('.notification-time')).toBeVisible()
    }
  })

  test('should manage service configurations', async ({ page }) => {
    await page.goto('/admin/services')
    
    // Should show services management
    await expect(page.locator('[data-testid="services-config"]')).toBeVisible()
    
    // Should show add service button
    await expect(page.locator('[data-testid="add-service-btn"]')).toBeVisible()
    
    // Edit existing service
    const editBtn = page.locator('[data-testid="edit-service"]').first()
    
    if (await editBtn.isVisible()) {
      await editBtn.click()
      
      // Should show service edit form
      await expect(page.locator('[data-testid="service-form"]')).toBeVisible()
      
      // Update service price
      await page.fill('[name="basePrice"]', '600000')
      
      // Save changes
      await page.click('[data-testid="save-service"]')
      
      // Should show success message
      await expect(page.locator('text=/updated|cập nhật thành công/i')).toBeVisible()
    }
  })

  test('should prevent non-admin access', async ({ page }) => {
    // Logout admin
    await page.click('[data-testid="logout-btn"]')
    
    // Login as regular user
    await helpers.login()
    
    // Try to access admin area
    await page.goto('/admin')
    
    // Should be redirected or show access denied
    await expect(page).not.toHaveURL(/\/admin$/)
    await expect(page.locator('text=/access denied|không có quyền|forbidden/i')).toBeVisible()
  })

  test('should show admin activity logs', async ({ page }) => {
    await page.goto('/admin/logs')
    
    // Should show activity logs
    await expect(page.locator('[data-testid="activity-logs"]')).toBeVisible()
    
    // Should show log entries
    const logEntries = page.locator('[data-testid="log-entry"]')
    const count = await logEntries.count()
    
    if (count > 0) {
      const firstLog = logEntries.first()
      await expect(firstLog.locator('.log-timestamp')).toBeVisible()
      await expect(firstLog.locator('.log-action')).toBeVisible()
      await expect(firstLog.locator('.log-user')).toBeVisible()
    }
  })

  test('should handle bulk operations', async ({ page }) => {
    await page.goto('/admin/bookings')
    
    // Select multiple bookings
    const checkboxes = page.locator('[data-testid="booking-checkbox"]')
    const count = await checkboxes.count()
    
    if (count > 0) {
      // Select first two bookings
      await checkboxes.first().check()
      if (count > 1) {
        await checkboxes.nth(1).check()
      }
      
      // Should show bulk actions
      await expect(page.locator('[data-testid="bulk-actions"]')).toBeVisible()
      
      // Perform bulk status update
      await page.selectOption('[data-testid="bulk-action-select"]', 'update_status')
      await page.selectOption('[data-testid="bulk-status-select"]', 'confirmed')
      await page.click('[data-testid="apply-bulk-action"]')
      
      // Should show confirmation
      await expect(page.locator('text=/updated|cập nhật thành công/i')).toBeVisible()
    }
  })
})
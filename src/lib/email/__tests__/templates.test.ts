/**
 * Email Templates Tests
 * Tests for email template generators
 */

import {
  getWelcomeEmailTemplate,
  getBookingConfirmationTemplate,
  getPaymentConfirmationTemplate,
  getLeadNotificationTemplate
} from '../templates'

describe('Email Templates', () => {
  describe('getWelcomeEmailTemplate', () => {
    it('should generate welcome email with user name', () => {
      const template = getWelcomeEmailTemplate('John Doe', 'john@example.com')

      expect(template.subject).toBeDefined()
      expect(template.html).toContain('John Doe')
      expect(template.text).toContain('John Doe')
    })

    it('should include user email in template', () => {
      const template = getWelcomeEmailTemplate('Test User', 'user@test.com')

      expect(template.html).toContain('user@test.com')
    })

    it('should include company branding', () => {
      const template = getWelcomeEmailTemplate('Test User', 'test@test.com')

      expect(template.html).toContain('RoK')
    })

    it('should have both HTML and text versions', () => {
      const template = getWelcomeEmailTemplate('User', 'user@test.com')

      expect(template.html).toBeDefined()
      expect(template.text).toBeDefined()
      expect(template.html.length).toBeGreaterThan(0)
      expect(template.text.length).toBeGreaterThan(0)
    })

    it('should have valid HTML structure', () => {
      const template = getWelcomeEmailTemplate('Test', 'test@test.com')

      expect(template.html).toContain('<!DOCTYPE html>')
      expect(template.html).toContain('<html')
      expect(template.html).toContain('</html>')
    })

    it('should have welcome subject in Vietnamese', () => {
      const template = getWelcomeEmailTemplate('User', 'user@test.com')

      expect(template.subject.toLowerCase()).toMatch(/chào mừng|welcome/)
    })
  })

  describe('getBookingConfirmationTemplate', () => {
    it('should generate booking confirmation with all details', () => {
      const template = getBookingConfirmationTemplate(
        'Customer Name',
        'BK12345',
        'Premium Service',
        500000,
        new Date('2024-12-30T10:00:00')
      )

      expect(template.subject).toContain('BK12345')
      expect(template.html).toContain('BK12345')
      expect(template.html).toContain('Premium Service')
    })

    it('should format currency correctly', () => {
      const template = getBookingConfirmationTemplate(
        'Test Customer',
        'BK001',
        'Test Service',
        500000,
        new Date()
      )

      // Should contain formatted amount (Vietnamese dong)
      expect(template.html).toMatch(/500[,.]?000/)
    })

    it('should include customer name', () => {
      const template = getBookingConfirmationTemplate(
        'John Smith',
        'BK001',
        'Service',
        100000,
        new Date()
      )

      expect(template.html).toContain('John Smith')
    })

    it('should have text version with booking number', () => {
      const template = getBookingConfirmationTemplate(
        'Customer',
        'BK99999',
        'Service',
        100000,
        new Date()
      )

      expect(template.text).toContain('BK99999')
    })

    it('should include confirmation status', () => {
      const template = getBookingConfirmationTemplate(
        'Customer',
        'BK001',
        'Service',
        100000,
        new Date()
      )

      // Should contain "confirmed" or Vietnamese equivalent
      expect(template.html.toLowerCase()).toMatch(/xác nhận|confirmed/i)
    })
  })

  describe('getPaymentConfirmationTemplate', () => {
    it('should generate payment confirmation', () => {
      const template = getPaymentConfirmationTemplate(
        'Customer Name',
        'BK001',
        'Test Service',
        500000,
        'momo',
        new Date('2024-12-30T14:30:00')
      )

      expect(template.subject).toBeDefined()
      expect(template.html).toContain('BK001')
    })

    it('should include payment method', () => {
      const template = getPaymentConfirmationTemplate(
        'Customer',
        'BK001',
        'Service',
        500000,
        'momo',
        new Date()
      )

      // Should contain MoMo or Ví MoMo
      expect(template.html.toLowerCase()).toMatch(/momo|ví momo/i)
    })

    it('should include amount', () => {
      const template = getPaymentConfirmationTemplate(
        'Customer',
        'BK001',
        'Service',
        500000,
        'vnpay',
        new Date()
      )

      expect(template.html).toMatch(/500[,.]?000/)
    })

    it('should include booking reference', () => {
      const template = getPaymentConfirmationTemplate(
        'Customer',
        'BKREF123',
        'Service',
        100000,
        'banking',
        new Date()
      )

      expect(template.html).toContain('BKREF123')
    })

    it('should handle different payment methods', () => {
      const methods = ['momo', 'vnpay', 'zalopay', 'banking']

      methods.forEach(method => {
        const template = getPaymentConfirmationTemplate(
          'Customer',
          'BK001',
          'Service',
          100000,
          method,
          new Date()
        )

        expect(template.html).toBeDefined()
        expect(template.subject).toBeDefined()
      })
    })

    it('should have text version', () => {
      const template = getPaymentConfirmationTemplate(
        'Customer',
        'BK001',
        'Service',
        100000,
        'momo',
        new Date()
      )

      expect(template.text).toBeDefined()
      expect(template.text.length).toBeGreaterThan(0)
    })

    it('should contain success status', () => {
      const template = getPaymentConfirmationTemplate(
        'Customer',
        'BK001',
        'Service',
        100000,
        'momo',
        new Date()
      )

      expect(template.html.toLowerCase()).toMatch(/thành công|success/i)
    })
  })

  describe('getLeadNotificationTemplate', () => {
    it('should generate lead notification', () => {
      const template = getLeadNotificationTemplate(
        'Potential Customer',
        'lead@example.com',
        '0901234567',
        'strategy',
        'website',
        'Interested in services'
      )

      expect(template.subject).toBeDefined()
      expect(template.html).toContain('Potential Customer')
    })

    it('should include contact info', () => {
      const template = getLeadNotificationTemplate(
        'Lead Name',
        'contact@example.com',
        '0909090909',
        'farming',
        'discord',
        null
      )

      expect(template.html).toContain('contact@example.com')
      expect(template.html).toContain('0909090909')
    })

    it('should include service interest', () => {
      const template = getLeadNotificationTemplate(
        'Lead',
        'lead@test.com',
        null,
        'kvk',
        'referral',
        null
      )

      // Should contain the service interest or its Vietnamese name
      expect(template.html.toLowerCase()).toMatch(/kvk|support/i)
    })

    it('should handle missing optional fields', () => {
      const template = getLeadNotificationTemplate(
        'Basic Lead',
        'basic@example.com',
        null, // no phone
        'strategy',
        'website',
        null // no notes
      )

      expect(template.html).toContain('Basic Lead')
      expect(template.html).toContain('basic@example.com')
    })

    it('should have urgent notification style', () => {
      const template = getLeadNotificationTemplate(
        'Lead',
        'lead@test.com',
        '0900000000',
        'premium',
        'ads',
        'Very interested'
      )

      // Should indicate urgency
      expect(template.html.toLowerCase()).toMatch(/urgent|nhanh|phản hồi/i)
    })

    it('should have lead-related subject', () => {
      const template = getLeadNotificationTemplate(
        'New Customer',
        'new@test.com',
        null,
        'coaching',
        'social',
        null
      )

      expect(template.subject.toLowerCase()).toMatch(/lead|khách/i)
    })
  })

  describe('Template Consistency', () => {
    it('all templates should have required properties', () => {
      const templates = [
        getWelcomeEmailTemplate('Test', 'test@test.com'),
        getBookingConfirmationTemplate('Customer', 'BK001', 'Service', 100000, new Date()),
        getPaymentConfirmationTemplate('Customer', 'BK001', 'Service', 100000, 'momo', new Date()),
        getLeadNotificationTemplate('Lead', 'lead@test.com', null, 'strategy', 'web', null)
      ]

      templates.forEach(template => {
        expect(template).toHaveProperty('subject')
        expect(template).toHaveProperty('html')
        expect(template).toHaveProperty('text')
        expect(typeof template.subject).toBe('string')
        expect(typeof template.html).toBe('string')
        expect(typeof template.text).toBe('string')
      })
    })

    it('all templates should have HTML doctype', () => {
      const templates = [
        getWelcomeEmailTemplate('Test', 'test@test.com'),
        getBookingConfirmationTemplate('Customer', 'BK001', 'Service', 100000, new Date()),
        getPaymentConfirmationTemplate('Customer', 'BK001', 'Service', 100000, 'momo', new Date()),
        getLeadNotificationTemplate('Lead', 'lead@test.com', null, 'strategy', 'web', null)
      ]

      templates.forEach(template => {
        expect(template.html).toContain('<!DOCTYPE html>')
      })
    })
  })
})

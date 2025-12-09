/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { POST } from '@/app/api/auth/signup/route'
import { prisma } from '@/lib/db'
import { hash } from 'bcryptjs'

// Mock dependencies
jest.mock('bcryptjs')
jest.mock('@/lib/email')
jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn()
    }
  }
}))

const mockedHash = hash as jest.MockedFunction<typeof hash>

describe('/api/auth/signup', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedHash.mockResolvedValue('hashed-password')
  })

  describe('POST', () => {
    it('should create a new user successfully', async () => {
      // Mock Prisma responses
      ;(prisma.users.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.users.findFirst as jest.Mock).mockResolvedValue(null)
      ;(prisma.users.create as jest.Mock).mockResolvedValue({
        id: '1',
        full_name: 'Test User',
        email: 'test@example.com',
        phone: '+84987654321',
        created_at: new Date()
      })

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          full_name: 'Test User',
          email: 'test@example.com',
          phone: '0987654321',
          password: 'password123'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Tài khoản đã được tạo thành công')
      expect(data.user).toEqual({
        id: '1',
        full_name: 'Test User',
        email: 'test@example.com',
        role: 'customer'
      })

      // Verify database calls
      expect(prisma.users.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      })
      expect(prisma.users.create).toHaveBeenCalledWith({
        data: {
          full_name: 'Test User',
          email: 'test@example.com',
          phone: '+84987654321',
          password: 'hashed-password',
          email_verified: null
        },
        select: {
          id: true,
          full_name: true,
          email: true,
          phone: true,
          created_at: true
        }
      })
    })

    it('should return 409 if email already exists', async () => {
      ;(prisma.users.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'existing@example.com'
      })

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          full_name: 'Test User',
          email: 'existing@example.com',
          password: 'password123'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.success).toBe(false)
      expect(data.error.message).toBe('Email đã được sử dụng')
    })

    it('should return 409 if phone number already exists', async () => {
      ;(prisma.users.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.users.findFirst as jest.Mock).mockResolvedValue({
        id: '1',
        phone: '+84987654321'
      })

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          full_name: 'Test User',
          email: 'test@example.com',
          phone: '0987654321',
          password: 'password123'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.success).toBe(false)
      expect(data.error.message).toBe('Số điện thoại đã được sử dụng')
    })

    it('should return 400 for invalid input data', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          full_name: 'A', // Too short
          email: 'invalid-email',
          password: '123' // Too short
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error.message).toBe('Thông tin không hợp lệ')
    })

    it('should sanitize input data', async () => {
      ;(prisma.users.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.users.findFirst as jest.Mock).mockResolvedValue(null)
      ;(prisma.users.create as jest.Mock).mockResolvedValue({
        id: '1',
        full_name: 'Clean Name',
        email: 'clean@example.com',
        created_at: new Date()
      })

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          full_name: '<script>alert("xss")</script>Clean Name',
          email: '  CLEAN@EXAMPLE.COM  ',
          password: 'password123'
        })
      })

      await POST(request)

      expect(prisma.users.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          full_name: 'Clean Name',
          email: 'clean@example.com'
        }),
        select: expect.any(Object)
      })
    })

    it('should handle database errors gracefully', async () => {
      ;(prisma.users.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      )

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          full_name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error.message).toBe('An unexpected error occurred')
    })

    it('should continue signup even if welcome email fails', async () => {
      ;(prisma.users.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.users.findFirst as jest.Mock).mockResolvedValue(null)
      ;(prisma.users.create as jest.Mock).mockResolvedValue({
        id: '1',
        full_name: 'Test User',
        email: 'test@example.com',
        created_at: new Date()
      })

      // Mock email failure
      const { sendWelcomeEmail } = require('@/lib/email')
      sendWelcomeEmail.mockRejectedValue(new Error('Email service down'))

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          full_name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Tài khoản đã được tạo thành công')
    })

    it('should validate Vietnamese phone number format', async () => {
      ;(prisma.users.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.users.findFirst as jest.Mock).mockResolvedValue(null)
      ;(prisma.users.create as jest.Mock).mockResolvedValue({
        id: '1',
        full_name: 'Test User',
        email: 'test@example.com',
        phone: '+84356789012',
        created_at: new Date()
      })

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          full_name: 'Test User',
          email: 'test@example.com',
          phone: '0356789012', // Valid Vietnamese mobile number
          password: 'password123'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(prisma.users.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          phone: '+84356789012' // Should be normalized
        }),
        select: expect.any(Object)
      })
    })
  })
})

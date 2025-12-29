/**
 * @jest-environment node
 */

/**
 * Communications API Route Tests
 * Tests for /api/communications endpoint
 *
 * Note: Some tests are limited because CommunicationService is instantiated
 * at module load time, making mock control difficult.
 */

import { createMockRequest, getJson } from './test-helpers'

// Mock dependencies
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

jest.mock('@/lib/auth', () => ({
  authOptions: {},
}))

jest.mock('@/lib/monitoring/logger', () => ({
  getLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}))

// Mock CommunicationService with default successful behavior
jest.mock('@/services/communication.service', () => ({
  CommunicationService: jest.fn(() => ({
    sendMessage: jest.fn().mockResolvedValue({
      id: 'msg-123',
      user_id: 'user-123',
      type: 'IN_APP',
      content: 'Test message',
    }),
    getHistory: jest.fn().mockResolvedValue([
      { id: 'msg-1', type: 'IN_APP', content: 'First message' },
      { id: 'msg-2', type: 'EMAIL', content: 'Second message' },
    ]),
  })),
}))

jest.mock('@/types/enums', () => ({
  CommunicationType: {
    EMAIL: 'EMAIL',
    SMS: 'SMS',
    PUSH: 'PUSH',
    IN_APP: 'IN_APP',
  },
}))

import { getServerSession } from 'next-auth'
import { GET, POST } from '../communications/route'

const mockGetSession = getServerSession as jest.MockedFunction<typeof getServerSession>

describe('Communications API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/communications', () => {
    it('should return 401 for unauthenticated requests', async () => {
      mockGetSession.mockResolvedValue(null)

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/communications',
        body: {
          type: 'IN_APP',
          content: 'Test message',
        },
      })

      const response = await POST(req)
      const data = await getJson(response)

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should send message successfully for authenticated user', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: 'user-123', email: 'user@example.com', role: 'customer' },
      } as any)

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/communications',
        body: {
          type: 'IN_APP',
          content: 'Test message content',
          subject: 'Test Subject',
        },
      })

      const response = await POST(req)
      const data = await getJson(response)

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
    })

    it('should allow admin to send message to another user', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: 'admin-123', email: 'admin@example.com', role: 'admin' },
      } as any)

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/communications',
        body: {
          user_id: 'target-user-456',
          type: 'IN_APP',
          content: 'Admin message to user',
        },
      })

      const response = await POST(req)

      expect(response.status).toBe(201)
    })

    it('should return 400 for invalid type', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: 'user-123', email: 'user@example.com', role: 'customer' },
      } as any)

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/communications',
        body: {
          type: 'INVALID_TYPE',
          content: '',
        },
      })

      const response = await POST(req)

      expect(response.status).toBe(400)
    })

    it('should return 400 for empty content', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: 'user-123', email: 'user@example.com', role: 'customer' },
      } as any)

      const req = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/communications',
        body: {
          type: 'IN_APP',
          content: '',
        },
      })

      const response = await POST(req)

      expect(response.status).toBe(400)
    })
  })

  describe('GET /api/communications', () => {
    it('should return 401 for unauthenticated requests', async () => {
      mockGetSession.mockResolvedValue(null)

      const req = createMockRequest({
        url: 'http://localhost:3000/api/communications',
      })

      const response = await GET(req)
      const data = await getJson(response)

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return communication history for authenticated user', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: 'user-123', email: 'user@example.com', role: 'customer' },
      } as any)

      const req = createMockRequest({
        url: 'http://localhost:3000/api/communications',
      })

      const response = await GET(req)
      const data = await getJson(response)

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(Array.isArray(data.history)).toBe(true)
    })

    it('should accept booking_id parameter', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: 'user-123', email: 'user@example.com', role: 'customer' },
      } as any)

      const req = createMockRequest({
        url: 'http://localhost:3000/api/communications',
        searchParams: { booking_id: 'booking-123' },
      })

      const response = await GET(req)

      expect(response.status).toBe(200)
    })

    it('should allow admin to view user history with user_id param', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: 'admin-123', email: 'admin@example.com', role: 'admin' },
      } as any)

      const req = createMockRequest({
        url: 'http://localhost:3000/api/communications',
        searchParams: { user_id: 'target-user-456' },
      })

      const response = await GET(req)

      expect(response.status).toBe(200)
    })
  })
})

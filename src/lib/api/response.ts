/**
 * Standardized API Response Helpers
 * Provides consistent response format across all API routes
 */

import { NextResponse } from 'next/server'

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
  meta?: {
    page?: number
    limit?: number
    total?: number
    hasMore?: boolean
  }
}

export interface PaginatedData<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

/**
 * Success response helper
 */
export function successResponse<T>(
  data: T,
  status: number = 200,
  meta?: ApiResponse['meta']
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data, meta }, { status })
}

/**
 * Paginated success response
 */
export function paginatedResponse<T>(
  items: T[],
  pagination: { page: number; limit: number; total: number },
  status: number = 200
): NextResponse<ApiResponse<PaginatedData<T>>> {
  const totalPages = Math.ceil(pagination.total / pagination.limit)

  return NextResponse.json(
    {
      success: true,
      data: {
        items,
        pagination: {
          ...pagination,
          totalPages,
          hasMore: pagination.page < totalPages
        }
      }
    },
    { status }
  )
}

/**
 * Error response helper
 */
export function errorResponse(
  code: string,
  message: string,
  status: number = 400,
  details?: unknown
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: { code, message, details }
    },
    { status }
  )
}

/**
 * Common error responses factory
 */
export const errors = {
  unauthorized: (message = 'Yêu cầu đăng nhập') =>
    errorResponse('UNAUTHORIZED', message, 401),

  forbidden: (message = 'Không có quyền truy cập') =>
    errorResponse('FORBIDDEN', message, 403),

  notFound: (resource: string) =>
    errorResponse('NOT_FOUND', `${resource} không tìm thấy`, 404),

  validation: (details: unknown) =>
    errorResponse('VALIDATION_ERROR', 'Dữ liệu không hợp lệ', 400, details),

  conflict: (message: string) => errorResponse('CONFLICT', message, 409),

  internal: (message = 'Có lỗi xảy ra, vui lòng thử lại sau') =>
    errorResponse('INTERNAL_ERROR', message, 500),

  rateLimited: (minutes?: number) =>
    errorResponse(
      'RATE_LIMITED',
      minutes
        ? `Quá nhiều yêu cầu. Thử lại sau ${minutes} phút`
        : 'Quá nhiều yêu cầu',
      429
    ),

  locked: (minutes: number) =>
    errorResponse(
      'ACCOUNT_LOCKED',
      `Tài khoản bị khóa. Thử lại sau ${minutes} phút`,
      423
    ),

  paymentFailed: (message = 'Thanh toán thất bại') =>
    errorResponse('PAYMENT_FAILED', message, 402),

  serviceUnavailable: (service?: string) =>
    errorResponse(
      'SERVICE_UNAVAILABLE',
      service ? `Dịch vụ ${service} không khả dụng` : 'Dịch vụ không khả dụng',
      503
    )
} as const

/**
 * Empty response (204 No Content)
 */
export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 })
}

/**
 * Created response (201)
 */
export function createdResponse<T>(data: T): NextResponse<ApiResponse<T>> {
  return successResponse(data, 201)
}

/**
 * Accepted response (202) - for async operations
 */
export function acceptedResponse<T>(data: T): NextResponse<ApiResponse<T>> {
  return successResponse(data, 202)
}

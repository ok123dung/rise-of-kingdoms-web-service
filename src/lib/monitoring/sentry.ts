import * as Sentry from '@sentry/nextjs'
import { getLogger } from './logger'

// User identification
export function identifyUser(user: {
  id: string
  email?: string
  username?: string
  role?: string
}) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
  })
}

// Clear user context
export function clearUser() {
  Sentry.setUser(null)
}

// Set custom context
export function setContext(key: string, context: Record<string, any>) {
  Sentry.setContext(key, context)
}

// Add breadcrumb
export function addBreadcrumb(message: string, data?: any, level: Sentry.SeverityLevel = 'info') {
  Sentry.addBreadcrumb({
    message,
    level,
    data,
    timestamp: Date.now() / 1000,
  })
}

// Track custom events
export function trackEvent(eventName: string, data?: Record<string, any>) {
  addBreadcrumb(`Event: ${eventName}`, data, 'info')
  
  // Also log to our system
  getLogger().info(`Event tracked: ${eventName}`, data)
}

// Performance monitoring
export function startTransaction(name: string, op: string = 'custom') {
  return Sentry.startTransaction({
    name,
    op,
  })
}

// Measure performance
export function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>
): T | Promise<T> {
  const transaction = startTransaction(name, 'function')
  
  try {
    const result = fn()
    
    if (result instanceof Promise) {
      return result
        .then(value => {
          transaction.setStatus('ok')
          return value
        })
        .catch(error => {
          transaction.setStatus('internal_error')
          throw error
        })
        .finally(() => {
          transaction.finish()
        })
    }
    
    transaction.setStatus('ok')
    transaction.finish()
    return result
  } catch (error) {
    transaction.setStatus('internal_error')
    transaction.finish()
    throw error
  }
}

// Capture message with context
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: Record<string, any>
) {
  Sentry.withScope(scope => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setContext(key, value)
      })
    }
    Sentry.captureMessage(message, level)
  })
}

// Capture exception with enhanced context
export function captureException(
  error: Error,
  context?: {
    user?: { id: string; email?: string }
    tags?: Record<string, string>
    extra?: Record<string, any>
    level?: Sentry.SeverityLevel
  }
) {
  Sentry.withScope(scope => {
    if (context?.user) {
      scope.setUser(context.user)
    }
    
    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value)
      })
    }
    
    if (context?.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value)
      })
    }
    
    if (context?.level) {
      scope.setLevel(context.level)
    }
    
    Sentry.captureException(error)
  })
}

// Monitor API response times
export function monitorApiCall(
  endpoint: string,
  method: string,
  responseTime: number,
  statusCode: number
) {
  const transaction = Sentry.getCurrentHub().getScope()?.getTransaction()
  
  if (transaction) {
    const span = transaction.startChild({
      op: 'http.client',
      description: `${method} ${endpoint}`,
    })
    
    span.setHttpStatus(statusCode)
    span.setData('response_time', responseTime)
    span.finish()
  }
  
  // Track slow API calls
  if (responseTime > 3000) {
    captureMessage(
      `Slow API call: ${method} ${endpoint} took ${responseTime}ms`,
      'warning',
      {
        api: {
          endpoint,
          method,
          responseTime,
          statusCode,
        },
      }
    )
  }
}

// Monitor database queries
export function monitorDatabaseQuery(
  operation: string,
  table: string,
  duration: number,
  success: boolean
) {
  const transaction = Sentry.getCurrentHub().getScope()?.getTransaction()
  
  if (transaction) {
    const span = transaction.startChild({
      op: 'db.query',
      description: `${operation} ${table}`,
    })
    
    span.setData('duration', duration)
    span.setStatus(success ? 'ok' : 'internal_error')
    span.finish()
  }
  
  // Track slow queries
  if (duration > 1000) {
    captureMessage(
      `Slow database query: ${operation} on ${table} took ${duration}ms`,
      'warning',
      {
        database: {
          operation,
          table,
          duration,
          success,
        },
      }
    )
  }
}

// Feature flag tracking
export function trackFeatureFlag(flag: string, enabled: boolean, user?: string) {
  addBreadcrumb('Feature flag evaluated', {
    flag,
    enabled,
    user,
  })
}

// Session replay helper
export function maskSensitiveData() {
  Sentry.configureScope(scope => {
    scope.setContext('replay', {
      mask_all_text: true,
      mask_all_inputs: true,
      block_all_media: true,
    })
  })
}

// Create feedback widget
export function showFeedbackDialog(options?: {
  name?: string
  email?: string
  title?: string
}) {
  const user = Sentry.getCurrentHub().getScope()?.getUser()
  
  // @ts-ignore - Sentry feedback API
  if (window.Sentry?.showReportDialog) {
    // @ts-ignore
    window.Sentry.showReportDialog({
      user: {
        name: options?.name || user?.username,
        email: options?.email || user?.email,
      },
      title: options?.title || 'Báo cáo lỗi',
      subtitle: 'Hãy cho chúng tôi biết lỗi bạn gặp phải',
      subtitle2: 'Chúng tôi sẽ khắc phục sớm nhất có thể',
      labelName: 'Tên',
      labelEmail: 'Email',
      labelComments: 'Mô tả lỗi',
      labelClose: 'Đóng',
      labelSubmit: 'Gửi báo cáo',
      errorGeneric: 'Có lỗi xảy ra khi gửi báo cáo. Vui lòng thử lại.',
      errorFormEntry: 'Vui lòng điền đầy đủ thông tin.',
      successMessage: 'Cảm ơn bạn đã gửi báo cáo!',
    })
  }
}
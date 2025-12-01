/**
 * Format utilities for the application
 */

/**
 * Format currency to Vietnamese dong
 */
export function formatCurrency(
  amount: number,
  options: {
    showSymbol?: boolean
    compact?: boolean
  } = {}
): string {
  const { showSymbol = true, compact = false } = options

  if (compact) {
    if (amount >= 1_000_000) {
      return `${(amount / 1_000_000).toFixed(1)}M${showSymbol ? ' VNĐ' : ''}`
    }
    if (amount >= 1_000) {
      return `${(amount / 1_000).toFixed(1)}K${showSymbol ? ' VNĐ' : ''}`
    }
  }

  const formatted = new Intl.NumberFormat('vi-VN').format(amount)
  return showSymbol ? `${formatted} VNĐ` : formatted
}

/**
 * Format phone number for Vietnamese format
 */
export function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '')

  if (digits.length === 10 && digits.startsWith('0')) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`
  }

  if (digits.length === 11 && digits.startsWith('84')) {
    return `+84 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`
  }

  return phone
}

/**
 * Format date to Vietnamese locale
 */
export function formatDate(
  date: Date | string,
  options: {
    style?: 'short' | 'medium' | 'long' | 'relative'
    includeTime?: boolean
  } = {}
): string {
  const { style = 'medium', includeTime = false } = options
  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (style === 'relative') {
    return formatRelativeTime(dateObj)
  }

  const formatOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: style === 'short' ? 'numeric' : style === 'long' ? 'long' : 'short',
    day: 'numeric'
  }

  if (includeTime) {
    formatOptions.hour = '2-digit'
    formatOptions.minute = '2-digit'
  }

  return new Intl.DateTimeFormat('vi-VN', formatOptions).format(dateObj)
}

/**
 * Format relative time (e.g., "2 giờ trước")
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  }

  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / seconds)
    if (interval >= 1) {
      const unitLabel = {
        year: interval === 1 ? 'năm' : 'năm',
        month: interval === 1 ? 'tháng' : 'tháng',
        week: interval === 1 ? 'tuần' : 'tuần',
        day: interval === 1 ? 'ngày' : 'ngày',
        hour: interval === 1 ? 'giờ' : 'giờ',
        minute: interval === 1 ? 'phút' : 'phút'
      }[unit]

      return `${interval} ${unitLabel} trước`
    }
  }

  return 'Vừa xong'
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return '0 Bytes'

  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const formattedSize = (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 2)

  return `${formattedSize} ${sizes[i]}`
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length).trim() + '...'
}

/**
 * Format booking status to Vietnamese
 */
export function formatBookingStatus(status: string): string {
  const statusMap: Record<string, string> = {
    pending: 'Đang chờ',
    confirmed: 'Đã xác nhận',
    in_progress: 'Đang thực hiện',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
    refunded: 'Đã hoàn tiền'
  }

  return statusMap[status] || status
}

/**
 * Format payment status to Vietnamese
 */
export function formatPaymentStatus(status: string): string {
  const statusMap: Record<string, string> = {
    pending: 'Đang chờ thanh toán',
    processing: 'Đang xử lý',
    paid: 'Đã thanh toán',
    failed: 'Thanh toán thất bại',
    refunded: 'Đã hoàn tiền',
    cancelled: 'Đã hủy'
  }

  return statusMap[status] || status
}

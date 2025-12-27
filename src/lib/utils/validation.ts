/**
 * Validation utilities for the application
 */

/**
 * Validate Vietnamese phone number
 */
export function isValidVietnamesePhone(phone: string): boolean {
  const phoneRegex = /^(\+84|84|0)(3|5|7|8|9)[0-9]{8}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  isValid: boolean
  score: number
  suggestions: string[]
} {
  const suggestions: string[] = []
  let score = 0

  // Length check
  if (password.length >= 8) {
    score += 1
  } else {
    suggestions.push('Mật khẩu phải có ít nhất 8 ký tự')
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    suggestions.push('Thêm ít nhất 1 chữ hoa')
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    suggestions.push('Thêm ít nhất 1 chữ thường')
  }

  // Number check
  if (/\d/.test(password)) {
    score += 1
  } else {
    suggestions.push('Thêm ít nhất 1 số')
  }

  // Special character check
  // eslint-disable-next-line no-useless-escape
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 1
  } else {
    suggestions.push('Thêm ít nhất 1 ký tự đặc biệt')
  }

  // Length bonus
  if (password.length >= 12) {
    score += 1
  }

  return {
    isValid: score >= 4,
    score: Math.min(score, 5),
    suggestions
  }
}

/**
 * Validate Vietnamese full name
 */
export function isValidVietnameseName(name: string): boolean {
  // Vietnamese name pattern: letters, spaces, and Vietnamese diacritics
  const nameRegex =
    /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵýỷỹ\s]{2,50}$/
  return nameRegex.test(name.trim())
}

/**
 * HTML-encode special characters to prevent XSS
 */
function htmlEncode(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

/**
 * Sanitize input to prevent XSS - uses HTML encoding
 * This is safer than trying to strip dangerous patterns
 */
export function sanitizeInput(input: string): string {
  return htmlEncode(input.trim())
}

/**
 * Validate file upload
 */
export function validateFileUpload(
  file: File,
  options: {
    maxSize?: number // in bytes
    allowedTypes?: string[]
    allowedExtensions?: string[]
  } = {}
): {
  isValid: boolean
  errors: string[]
} {
  const { maxSize = 5 * 1024 * 1024, allowedTypes = [], allowedExtensions = [] } = options
  const errors: string[] = []

  // Size check
  if (file.size > maxSize) {
    errors.push(`Kích thước file không được vượt quá ${Math.round(maxSize / 1024 / 1024)}MB`)
  }

  // Type check
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    errors.push(`Loại file không được hỗ trợ. Chỉ chấp nhận: ${allowedTypes.join(', ')}`)
  }

  // Extension check
  if (allowedExtensions.length > 0) {
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!extension || !allowedExtensions.includes(extension)) {
      errors.push(`Đuôi file không được hỗ trợ. Chỉ chấp nhận: ${allowedExtensions.join(', ')}`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validate Discord username format
 */
export function isValidDiscordUsername(username: string): boolean {
  // Discord username: 2-32 characters, alphanumeric, underscore, period
  const discordRegex = /^[a-zA-Z0-9_.]{2,32}$/
  return discordRegex.test(username)
}

/**
 * Check if string contains only Vietnamese characters
 */
export function isVietnameseText(text: string): boolean {
  const vietnameseRegex =
    /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵýỷỹ\s.,!?-]+$/
  return vietnameseRegex.test(text)
}

/**
 * Validate price format (Vietnamese dong)
 */
export function isValidPrice(price: string): boolean {
  // Accepts formats like: 1000000, 1.000.000, 1,000,000
  const priceRegex = /^[\d,.\s]+$/
  return priceRegex.test(price.replace(/VNĐ|vnđ|VND|vnd/gi, '').trim())
}

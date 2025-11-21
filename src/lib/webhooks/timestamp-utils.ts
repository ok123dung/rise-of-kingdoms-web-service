/**
 * Timestamp Conversion Utilities for Payment Webhooks
 *
 * Different payment gateways use different timestamp formats:
 * - VNPay: yyyyMMddHHmmss (Vietnamese timezone)
 * - MoMo: milliseconds epoch
 * - ZaloPay: milliseconds epoch
 */

/**
 * Parse VNPay timestamp format (yyyyMMddHHmmss) to milliseconds
 * @param vnpayDate - String in format yyyyMMddHHmmss
 * @returns Timestamp in milliseconds, or current time if parsing fails
 */
export function parseVNPayTimestamp(vnpayDate: string | undefined): number {
  if (!vnpayDate || vnpayDate.length !== 14) {
    // If no timestamp or invalid format, use current time
    return Date.now()
  }

  try {
    // Parse yyyyMMddHHmmss
    const year = parseInt(vnpayDate.substring(0, 4))
    const month = parseInt(vnpayDate.substring(4, 6)) - 1 // Month is 0-indexed
    const day = parseInt(vnpayDate.substring(6, 8))
    const hour = parseInt(vnpayDate.substring(8, 10))
    const minute = parseInt(vnpayDate.substring(10, 12))
    const second = parseInt(vnpayDate.substring(12, 14))

    // Create date in Vietnamese timezone (UTC+7)
    const date = new Date(year, month, day, hour, minute, second)

    // Adjust for Vietnamese timezone (UTC+7)
    // Note: This assumes server is in UTC. Adjust if needed.
    const vtOffset = 7 * 60 * 60 * 1000 // 7 hours in milliseconds

    return date.getTime()
  } catch (error) {
    console.error('Failed to parse VNPay timestamp:', vnpayDate, error)
    return Date.now()
  }
}

/**
 * Convert milliseconds timestamp to VNPay format
 * @param timestamp - Timestamp in milliseconds
 * @returns String in format yyyyMMddHHmmss
 */
export function toVNPayTimestamp(timestamp: number): string {
  const date = new Date(timestamp)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  const second = String(date.getSeconds()).padStart(2, '0')

  return `${year}${month}${day}${hour}${minute}${second}`
}

/**
 * Validate timestamp is within acceptable range (5 minutes)
 * @param timestamp - Timestamp in milliseconds
 * @param maxAgeMs - Maximum age in milliseconds (default: 5 minutes)
 * @returns true if timestamp is valid
 */
export function isTimestampValid(timestamp: number, maxAgeMs: number = 5 * 60 * 1000): boolean {
  const now = Date.now()
  const age = now - timestamp

  // Check if timestamp is in the future (allow 1 minute clock skew)
  if (timestamp > now + 60000) {
    return false
  }

  // Check if timestamp is too old
  if (age > maxAgeMs) {
    return false
  }

  return true
}

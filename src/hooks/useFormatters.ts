import { useCallback } from 'react'

/**
 * Custom hook for commonly used formatting functions
 * Memoized to prevent recreation on every render
 */
export function useFormatters() {
  const formatVND = useCallback((amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }, [])

  const formatDate = useCallback((dateString: string) => {
    return new Intl.DateTimeFormat('vi-VN').format(new Date(dateString))
  }, [])

  const formatDateTime = useCallback((dateString: string) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString))
  }, [])

  const formatRelativeTime = useCallback((dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Vừa xong'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`
    
    return formatDate(dateString)
  }, [formatDate])

  const formatNumber = useCallback((num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num)
  }, [])

  const formatPercentage = useCallback((num: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1
    }).format(num / 100)
  }, [])

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }, [])

  return {
    formatVND,
    formatDate,
    formatDateTime,
    formatRelativeTime,
    formatNumber,
    formatPercentage,
    formatFileSize
  }
}
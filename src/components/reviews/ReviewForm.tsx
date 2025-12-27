'use client'

import { useState } from 'react'
import { Star, Send, CheckCircle } from 'lucide-react'

interface ReviewFormProps {
  bookingId: string
  serviceName: string
  onSuccess?: () => void
}

export function ReviewForm({ bookingId, serviceName, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Vui lòng chọn số sao')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/bookings/${bookingId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, feedback: feedback.trim() || undefined })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review')
      }

      setIsSubmitted(true)
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
        <h3 className="mt-4 text-lg font-semibold text-green-800">Cảm ơn bạn đã đánh giá!</h3>
        <p className="mt-2 text-green-600">
          Đánh giá của bạn giúp chúng tôi cải thiện dịch vụ.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">Đánh giá dịch vụ</h3>
      <p className="mt-1 text-sm text-gray-600">{serviceName}</p>

      {/* Star Rating */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">Chất lượng dịch vụ</label>
        <div className="mt-2 flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={`h-8 w-8 ${
                  star <= (hoveredRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="mt-1 text-sm text-gray-600">
            {rating === 5 && 'Xuất sắc!'}
            {rating === 4 && 'Rất tốt'}
            {rating === 3 && 'Bình thường'}
            {rating === 2 && 'Chưa tốt'}
            {rating === 1 && 'Rất tệ'}
          </p>
        )}
      </div>

      {/* Feedback */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">
          Nhận xét (không bắt buộc)
        </label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Chia sẻ trải nghiệm của bạn..."
          rows={3}
          className="mt-2 w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          maxLength={500}
        />
        <p className="mt-1 text-right text-xs text-gray-500">{feedback.length}/500</p>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={isSubmitting || rating === 0}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Đang gửi...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Gửi đánh giá
          </>
        )}
      </button>
    </div>
  )
}

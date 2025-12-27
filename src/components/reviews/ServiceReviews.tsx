'use client'

import { useState, useEffect } from 'react'
import { Star, User, ChevronDown } from 'lucide-react'

interface Review {
  id: string
  rating: number
  feedback: string | null
  date: string
  customerName: string
  tierName: string
}

interface ReviewStats {
  averageRating: number
  totalReviews: number
  distribution: Record<number, number>
}

interface ServiceReviewsProps {
  serviceSlug: string
  initialLimit?: number
}

export function ServiceReviews({ serviceSlug, initialLimit = 5 }: ServiceReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)

  const fetchReviews = async (append = false) => {
    try {
      const response = await fetch(
        `/api/services/${serviceSlug}/reviews?limit=${initialLimit}&offset=${append ? offset : 0}`
      )
      const data = await response.json()

      if (data.success) {
        setReviews(prev => append ? [...prev, ...data.reviews] : data.reviews)
        setStats(data.stats)
        setHasMore(data.pagination.hasMore)
        setOffset(prev => append ? prev + data.reviews.length : data.reviews.length)
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [serviceSlug])

  const loadMore = () => {
    fetchReviews(true)
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-24 rounded-lg bg-gray-200" />
        <div className="h-32 rounded-lg bg-gray-200" />
      </div>
    )
  }

  if (!stats || stats.totalReviews === 0) {
    return (
      <div className="rounded-lg border bg-gray-50 p-6 text-center">
        <p className="text-gray-600">Chưa có đánh giá nào cho dịch vụ này.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-6">
          {/* Average Rating */}
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900">
              {stats.averageRating.toFixed(1)}
            </div>
            <div className="mt-1 flex justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= Math.round(stats.averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="mt-1 text-sm text-gray-600">
              {stats.totalReviews} đánh giá
            </p>
          </div>

          {/* Distribution */}
          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.distribution[rating] || 0
              const percentage = stats.totalReviews > 0
                ? (count / stats.totalReviews) * 100
                : 0

              return (
                <div key={rating} className="flex items-center gap-2 text-sm">
                  <span className="w-3">{rating}</span>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-yellow-400"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-gray-600">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{review.customerName}</p>
                  <p className="text-sm text-gray-500">{review.tierName}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= review.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            {review.feedback && (
              <p className="mt-3 text-gray-700">{review.feedback}</p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              {new Date(review.date).toLocaleDateString('vi-VN')}
            </p>
          </div>
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <button
          onClick={loadMore}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          <ChevronDown className="h-4 w-4" />
          Xem thêm đánh giá
        </button>
      )}
    </div>
  )
}

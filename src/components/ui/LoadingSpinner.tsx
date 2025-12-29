import { cn } from '@/lib/utils'

/**
 * LoadingSpinner Component
 * Accessible loading indicator with screen reader support
 * WCAG 2.1 AA: 4.1.3 Status Messages
 */

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  /** Loading text displayed visually and announced to screen readers */
  text?: string
  /** Screen reader announcement (defaults to text or 'Đang tải') */
  ariaLabel?: string
}

export default function LoadingSpinner({
  size = 'md',
  className,
  text,
  ariaLabel
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  const label = ariaLabel ?? text ?? 'Đang tải'

  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={cn('flex flex-col items-center justify-center gap-2', className)}
      role="status"
    >
      <div
        aria-hidden="true"
        className={cn(
          'animate-spin rounded-full border-2 border-gray-200 border-t-blue-600',
          sizeClasses[size]
        )}
      />
      {/* Visual text */}
      {text && (
        <p aria-hidden="true" className={cn('font-medium text-gray-600', textSizes[size])}>
          {text}
        </p>
      )}
      {/* Screen reader announcement */}
      <span className="sr-only">{label}</span>
    </div>
  )
}

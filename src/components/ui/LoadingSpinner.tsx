import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

export default function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
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

  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <div
        aria-label={text || 'Loading'}
        role="status"
        className={cn(
          'animate-spin rounded-full border-2 border-gray-200 border-t-blue-600',
          sizeClasses[size]
        )}
      />
      {text && <p className={cn('font-medium text-gray-600', textSizes[size])}>{text}</p>}
    </div>
  )
}

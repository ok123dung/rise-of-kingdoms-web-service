import React from 'react'

import { clsx } from 'clsx'
import { type LucideIcon } from 'lucide-react'
import Link from 'next/link'

export interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'premium'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  disabled?: boolean
  loading?: boolean
  loadingText?: string
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  href?: string
  ariaLabel?: string
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

const ButtonVariants = {
  primary:
    'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:scale-105 hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-500/25',
  secondary:
    'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg hover:scale-105 hover:from-gray-600 hover:to-gray-700',
  outline:
    'border-2 border-blue-500 text-blue-600 bg-transparent hover:bg-blue-500 hover:text-white',
  ghost: 'bg-transparent text-blue-600 hover:bg-blue-50',
  premium:
    'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg hover:scale-105 hover:from-amber-600 hover:to-amber-700 hover:shadow-amber-500/25'
}

const ButtonSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
  xl: 'px-8 py-4 text-xl'
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  loadingText,
  icon: Icon,
  iconPosition = 'left',
  href,
  ariaLabel,
  onClick,
  ...props
}: ButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const variantClasses = ButtonVariants[variant]
  const sizeClasses = ButtonSizes[size]

  const buttonClasses = clsx(
    baseClasses,
    variantClasses,
    sizeClasses,
    className,
    disabled && 'opacity-50 cursor-not-allowed hover:scale-100',
    loading && 'cursor-wait'
  )

  const iconClasses = clsx('h-5 w-5', iconPosition === 'left' ? 'mr-2' : 'ml-2')

  // Loading spinner component
  const LoadingSpinner = () => (
    <svg aria-hidden="true" className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        fill="currentColor"
      />
    </svg>
  )

  const content = (
    <>
      {loading ? (
        <span className="flex items-center gap-2" role="status">
          <LoadingSpinner />
          <span>{loadingText ?? 'Đang xử lý...'}</span>
          <span className="sr-only">Vui lòng chờ</span>
        </span>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon aria-hidden="true" className={iconClasses} />}
          {children}
          {Icon && iconPosition === 'right' && <Icon aria-hidden="true" className={iconClasses} />}
        </>
      )}
    </>
  )

  if (href) {
    return (
      <Link aria-label={ariaLabel} className={buttonClasses} href={href} {...props}>
        {content}
      </Link>
    )
  }

  return (
    <button
      aria-label={ariaLabel}
      className={buttonClasses}
      disabled={disabled || loading}
      type="button"
      onClick={onClick}
      {...props}
    >
      {content}
    </button>
  )
}

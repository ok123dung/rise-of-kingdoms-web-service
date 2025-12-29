'use client'

import { forwardRef, useId } from 'react'
import { cn } from '@/lib/utils'

/**
 * Accessible Input Component
 * WCAG 2.1 AA: 1.3.1 Info and Relationships, 3.3.2 Labels or Instructions
 */

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label text for the input */
  label: string
  /** Error message to display */
  error?: string
  /** Helper text for additional context */
  helperText?: string
  /** Whether to visually hide the label (still accessible to screen readers) */
  hideLabel?: boolean
  /** Icon to display at the start of the input */
  startIcon?: React.ReactNode
  /** Icon to display at the end of the input */
  endIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      hideLabel = false,
      startIcon,
      endIcon,
      className,
      id: providedId,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const generatedId = useId()
    const id = providedId ?? generatedId
    const errorId = `${id}-error`
    const helperId = `${id}-helper`

    // Build aria-describedby from error, helper text, and custom
    const describedByParts = [
      error ? errorId : null,
      helperText && !error ? helperId : null,
      ariaDescribedBy,
    ].filter(Boolean)

    const describedBy = describedByParts.length > 0 ? describedByParts.join(' ') : undefined

    return (
      <div className="w-full">
        <label
          className={cn(
            'mb-2 block text-sm font-medium text-gray-700',
            hideLabel && 'sr-only'
          )}
          htmlFor={id}
        >
          {label}
          {props.required && (
            <span aria-hidden="true" className="ml-1 text-red-500">
              *
            </span>
          )}
        </label>

        <div className="relative">
          {startIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-400">{startIcon}</span>
            </div>
          )}

          <input
            ref={ref}
            aria-describedby={describedBy}
            aria-invalid={error ? 'true' : undefined}
            className={cn(
              'w-full rounded-lg border px-3 py-2 text-gray-900 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              'disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500',
              error
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
              startIcon && 'pl-10',
              endIcon && 'pr-10',
              className
            )}
            id={id}
            {...props}
          />

          {endIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-gray-400">{endIcon}</span>
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1 text-sm text-red-600" id={errorId} role="alert">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500" id={helperId}>
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

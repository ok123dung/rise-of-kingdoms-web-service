'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

import { AlertCircle, X } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  requirePassword?: boolean
  passwordPlaceholder?: string
  onConfirm: (password?: string) => void
  onCancel: () => void
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
  requirePassword = false,
  passwordPlaceholder = 'Enter your password',
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  const [password, setPassword] = useState('')
  const modalRef = useRef<HTMLDivElement>(null)
  const passwordInputRef = useRef<HTMLInputElement>(null)

  // Reset password when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPassword('')
    }
  }, [isOpen])

  // Focus management - focus password input when modal opens
  useEffect(() => {
    if (isOpen && requirePassword && passwordInputRef.current) {
      // Use setTimeout to ensure DOM is ready
      const timeoutId = setTimeout(() => {
        passwordInputRef.current?.focus()
      }, 0)
      return () => clearTimeout(timeoutId)
    }
  }, [isOpen, requirePassword])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isOpen])

  // Handle ESC key and Tab key for focus trap
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel()
      }

      // Focus trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    },
    [onCancel]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onCancel()
    }
  }

  if (!isOpen) return null

  const variantStyles = {
    danger: {
      icon: 'text-red-500',
      button: 'bg-red-600 hover:bg-red-700 text-white'
    },
    warning: {
      icon: 'text-amber-500',
      button: 'bg-amber-600 hover:bg-amber-700 text-white'
    },
    info: {
      icon: 'text-blue-500',
      button: 'bg-blue-600 hover:bg-blue-700 text-white'
    }
  }

  const styles = variantStyles[variant]

  const handleConfirm = () => {
    if (requirePassword && !password) return
    onConfirm(requirePassword ? password : undefined)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="presentation"
      onClick={handleBackdropClick}
      onKeyDown={e => {
        if (e.key === 'Escape') onCancel()
      }}
    >
      <div
        ref={modalRef}
        aria-describedby="modal-description"
        aria-labelledby="modal-title"
        aria-modal="true"
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"
        role="dialog"
      >
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className={`h-6 w-6 ${styles.icon}`} />
            <h3 className="text-lg font-semibold text-gray-900" id="modal-title">
              {title}
            </h3>
          </div>
          <button
            aria-label="Close"
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            type="button"
            onClick={onCancel}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-4 text-sm text-gray-600" id="modal-description">
          {message}
        </p>

        {requirePassword && (
          <input
            ref={passwordInputRef}
            aria-describedby="modal-description"
            className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder={passwordPlaceholder}
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        )}

        <div className="flex gap-3">
          <button
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
            type="button"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className={`flex-1 rounded-lg px-4 py-2 font-medium transition-colors disabled:opacity-50 ${styles.button}`}
            disabled={requirePassword && !password}
            type="button"
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

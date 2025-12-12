/**
 * Simple toast notification utility
 * Lightweight alternative to full toast libraries
 */

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastOptions {
  duration?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

const DEFAULT_DURATION = 4000

// Create toast container if it doesn't exist
function getOrCreateContainer(position: string): HTMLElement {
  const containerId = `toast-container-${position}`
  let container = document.getElementById(containerId)

  if (!container) {
    container = document.createElement('div')
    container.id = containerId
    container.className = getContainerClasses(position)
    document.body.appendChild(container)
  }

  return container
}

function getContainerClasses(position: string): string {
  const base = 'fixed z-50 flex flex-col gap-2 pointer-events-none'
  const positions: Record<string, string> = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  }
  return `${base} ${positions[position] || positions['bottom-right']}`
}

function getToastClasses(type: ToastType): string {
  const base =
    'pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border animate-slide-in max-w-sm'
  const types: Record<ToastType, string> = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  }
  return `${base} ${types[type]}`
}

function getIcon(type: ToastType): string {
  const icons: Record<ToastType, string> = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  }
  return icons[type]
}

function createToastElement(message: string, type: ToastType): HTMLElement {
  const toast = document.createElement('div')
  toast.className = getToastClasses(type)
  toast.innerHTML = `
    <span class="text-lg font-bold">${getIcon(type)}</span>
    <span class="text-sm font-medium">${escapeHtml(message)}</span>
  `
  return toast
}

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function showToast(message: string, type: ToastType, options: ToastOptions = {}): void {
  if (typeof window === 'undefined') return

  const { duration = DEFAULT_DURATION, position = 'bottom-right' } = options
  const container = getOrCreateContainer(position)
  const toast = createToastElement(message, type)

  container.appendChild(toast)

  // Add slide-in animation styles if not already added
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style')
    style.id = 'toast-styles'
    style.textContent = `
      @keyframes toast-slide-in {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes toast-slide-out {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
      .animate-slide-in { animation: toast-slide-in 0.3s ease-out; }
      .animate-slide-out { animation: toast-slide-out 0.3s ease-in forwards; }
    `
    document.head.appendChild(style)
  }

  // Remove toast after duration
  setTimeout(() => {
    toast.classList.remove('animate-slide-in')
    toast.classList.add('animate-slide-out')
    setTimeout(() => toast.remove(), 300)
  }, duration)
}

// Public API
export const toast = {
  success: (message: string, options?: ToastOptions) => showToast(message, 'success', options),
  error: (message: string, options?: ToastOptions) => showToast(message, 'error', options),
  warning: (message: string, options?: ToastOptions) => showToast(message, 'warning', options),
  info: (message: string, options?: ToastOptions) => showToast(message, 'info', options)
}

export default toast

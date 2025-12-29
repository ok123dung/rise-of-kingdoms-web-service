'use client'

/**
 * SkipLink Component
 * Provides keyboard users a way to skip navigation and jump to main content
 * WCAG 2.1 AA: 2.4.1 Bypass Blocks
 */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
                 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2
                 focus:rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2
                 focus:ring-blue-500 focus:shadow-lg"
    >
      Bỏ qua đến nội dung chính
    </a>
  )
}

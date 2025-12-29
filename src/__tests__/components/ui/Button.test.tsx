/**
 * Button Component Tests
 * Tests Button component variants, states, and accessibility
 */

import React from 'react'

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, jest } from '@jest/globals'

import { Button } from '@/components/ui/Button'

// Mock Next.js Link
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: { children: React.ReactNode; href: string }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  }
})

describe('Button Component', () => {
  describe('Rendering', () => {
    it('renders children correctly', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByText('Click me')).toBeInTheDocument()
    })

    it('renders as a link when href is provided', () => {
      render(<Button href="/test">Link Button</Button>)
      const link = screen.getByRole('link', { name: /link button/i })
      expect(link).toHaveAttribute('href', '/test')
    })

    it('renders as a button when no href is provided', () => {
      render(<Button>Regular Button</Button>)
      expect(screen.getByRole('button', { name: /regular button/i })).toBeInTheDocument()
    })
  })

  describe('Variants', () => {
    it('applies primary variant classes by default', () => {
      render(<Button>Primary</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('from-blue-500')
    })

    it('applies secondary variant classes', () => {
      render(<Button variant="secondary">Secondary</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('from-gray-500')
    })

    it('applies outline variant classes', () => {
      render(<Button variant="outline">Outline</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('border-blue-500')
    })

    it('applies ghost variant classes', () => {
      render(<Button variant="ghost">Ghost</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('bg-transparent')
    })

    it('applies premium variant classes', () => {
      render(<Button variant="premium">Premium</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('from-amber-500')
    })
  })

  describe('Sizes', () => {
    it('applies sm size classes', () => {
      render(<Button size="sm">Small</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('px-3')
      expect(button.className).toContain('py-1.5')
    })

    it('applies md size classes by default', () => {
      render(<Button>Medium</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('px-4')
      expect(button.className).toContain('py-2')
    })

    it('applies lg size classes', () => {
      render(<Button size="lg">Large</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('px-6')
      expect(button.className).toContain('py-3')
    })

    it('applies xl size classes', () => {
      render(<Button size="xl">Extra Large</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('px-8')
      expect(button.className).toContain('py-4')
    })
  })

  describe('States', () => {
    it('handles disabled state', () => {
      render(<Button disabled>Disabled</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button.className).toContain('opacity-50')
    })

    it('shows loading spinner when loading', () => {
      render(<Button loading>Loading</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('shows custom loading text when provided', () => {
      render(
        <Button loading loadingText="Please wait...">
          Submit
        </Button>
      )
      expect(screen.getByText('Please wait...')).toBeInTheDocument()
    })

    it('shows default loading text in Vietnamese', () => {
      render(<Button loading>Submit</Button>)
      expect(screen.getByText('Đang xử lý...')).toBeInTheDocument()
    })
  })

  describe('Click Handling', () => {
    it('calls onClick when clicked', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Click me</Button>)

      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('does not call onClick when disabled', () => {
      const handleClick = jest.fn()
      render(
        <Button disabled onClick={handleClick}>
          Click me
        </Button>
      )

      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('does not call onClick when loading', () => {
      const handleClick = jest.fn()
      render(
        <Button loading onClick={handleClick}>
          Click me
        </Button>
      )

      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('applies aria-label when provided', () => {
      render(<Button ariaLabel="Submit form">Submit</Button>)
      const button = screen.getByRole('button', { name: 'Submit form' })
      expect(button).toBeInTheDocument()
    })

    it('has focus ring styles for keyboard navigation', () => {
      render(<Button>Focus me</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('focus:ring-2')
      expect(button.className).toContain('focus:ring-blue-500')
    })

    it('loading spinner is hidden from screen readers', () => {
      render(<Button loading>Loading</Button>)
      const svg = document.querySelector('svg')
      expect(svg).toHaveAttribute('aria-hidden', 'true')
    })

    it('has sr-only loading message for screen readers', () => {
      render(<Button loading>Submit</Button>)
      expect(screen.getByText('Vui lòng chờ')).toHaveClass('sr-only')
    })
  })

  describe('Custom Styling', () => {
    it('merges custom className', () => {
      render(<Button className="my-custom-class">Custom</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('my-custom-class')
    })
  })
})

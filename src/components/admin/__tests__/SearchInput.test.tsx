/**
 * SearchInput Component Tests
 * Tests debounced search with URL updates
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { useRouter, useSearchParams } from 'next/navigation'

import SearchInput from '../SearchInput'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn()
}))

// Mock use-debounce
jest.mock('use-debounce', () => ({
  useDebouncedCallback: (callback: Function, delay: number) => {
    // Return callback directly for immediate execution in tests
    return callback
  }
}))

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn()
}

describe('SearchInput Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams())
  })

  describe('Rendering', () => {
    it('should render search input', () => {
      render(<SearchInput />)

      expect(screen.getByPlaceholderText('Tìm kiếm...')).toBeInTheDocument()
    })

    it('should render search icon', () => {
      render(<SearchInput />)

      // Search icon from lucide-react
      const container = screen.getByPlaceholderText('Tìm kiếm...').parentElement
      expect(container?.querySelector('svg')).toBeInTheDocument()
    })

    it('should have correct input type', () => {
      render(<SearchInput />)

      const input = screen.getByPlaceholderText('Tìm kiếm...')
      expect(input).toHaveAttribute('type', 'text')
    })
  })

  describe('Initial value', () => {
    it('should show existing query from URL', () => {
      ;(useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('query=test'))

      render(<SearchInput />)

      const input = screen.getByPlaceholderText('Tìm kiếm...') as HTMLInputElement
      expect(input.defaultValue).toBe('test')
    })

    it('should be empty when no query in URL', () => {
      ;(useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams())

      render(<SearchInput />)

      const input = screen.getByPlaceholderText('Tìm kiếm...') as HTMLInputElement
      expect(input.defaultValue).toBe('')
    })
  })

  describe('Search functionality', () => {
    it('should update URL when search term entered', async () => {
      render(<SearchInput />)

      const input = screen.getByPlaceholderText('Tìm kiếm...')
      fireEvent.change(input, { target: { value: 'booking' } })

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/admin/bookings?query=booking&page=1')
      })
    })

    it('should reset to page 1 on new search', async () => {
      ;(useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('page=5'))

      render(<SearchInput />)

      const input = screen.getByPlaceholderText('Tìm kiếm...')
      fireEvent.change(input, { target: { value: 'test' } })

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith(expect.stringContaining('page=1'))
      })
    })

    it('should remove query param when search is cleared', async () => {
      ;(useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('query=old'))

      render(<SearchInput />)

      const input = screen.getByPlaceholderText('Tìm kiếm...')
      fireEvent.change(input, { target: { value: '' } })

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalled()
        const callArg = mockRouter.replace.mock.calls[0][0]
        expect(callArg).not.toContain('query=')
      })
    })

    it('should preserve other params when searching', async () => {
      ;(useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('status=active'))

      render(<SearchInput />)

      const input = screen.getByPlaceholderText('Tìm kiếm...')
      fireEvent.change(input, { target: { value: 'search' } })

      await waitFor(() => {
        const callArg = mockRouter.replace.mock.calls[0][0]
        expect(callArg).toContain('status=active')
        expect(callArg).toContain('query=search')
      })
    })
  })

  describe('Styling', () => {
    it('should have proper input styling', () => {
      render(<SearchInput />)

      const input = screen.getByPlaceholderText('Tìm kiếm...')
      expect(input).toHaveClass('rounded-lg')
      expect(input).toHaveClass('border')
      expect(input).toHaveClass('border-gray-300')
    })

    it('should have focus styles', () => {
      render(<SearchInput />)

      const input = screen.getByPlaceholderText('Tìm kiếm...')
      expect(input).toHaveClass('focus:border-blue-500')
      expect(input).toHaveClass('focus:outline-none')
    })

    it('should have padding for icon', () => {
      render(<SearchInput />)

      const input = screen.getByPlaceholderText('Tìm kiếm...')
      expect(input).toHaveClass('pl-10')
    })
  })
})

/**
 * LanguageToggle Component Tests
 * Tests language switching functionality
 */

import { render, screen, fireEvent } from '@testing-library/react'

import { LanguageToggle } from '../LanguageToggle'
import { LanguageProvider } from '@/contexts/LanguageContext'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Wrapper with LanguageProvider
const renderWithProvider = (ui: React.ReactElement) => {
  return render(<LanguageProvider>{ui}</LanguageProvider>)
}

describe('LanguageToggle Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  describe('Rendering', () => {
    it('should render language toggle button', () => {
      renderWithProvider(<LanguageToggle />)

      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should show Vietnamese flag by default', () => {
      renderWithProvider(<LanguageToggle />)

      expect(screen.getByText(/🇻🇳 VI/)).toBeInTheDocument()
    })

    it('should have correct button type', () => {
      renderWithProvider(<LanguageToggle />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'button')
    })
  })

  describe('Language switching', () => {
    it('should toggle to English when clicked (from Vietnamese)', () => {
      renderWithProvider(<LanguageToggle />)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(screen.getByText(/🇺🇸 EN/)).toBeInTheDocument()
    })

    it('should toggle back to Vietnamese when clicked twice', () => {
      renderWithProvider(<LanguageToggle />)

      const button = screen.getByRole('button')
      fireEvent.click(button) // VI -> EN
      fireEvent.click(button) // EN -> VI

      expect(screen.getByText(/🇻🇳 VI/)).toBeInTheDocument()
    })

    it('should save language preference to localStorage', () => {
      renderWithProvider(<LanguageToggle />)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(localStorageMock.setItem).toHaveBeenCalledWith('language', 'en')
    })
  })

  describe('Event handling', () => {
    it('should prevent default on click', () => {
      renderWithProvider(<LanguageToggle />)

      const button = screen.getByRole('button')
      const clickEvent = new MouseEvent('click', { bubbles: true })
      Object.defineProperty(clickEvent, 'preventDefault', { value: jest.fn() })

      fireEvent(button, clickEvent)

      expect(clickEvent.preventDefault).toHaveBeenCalled()
    })

    it('should stop propagation on click', () => {
      renderWithProvider(<LanguageToggle />)

      const button = screen.getByRole('button')
      const clickEvent = new MouseEvent('click', { bubbles: true })
      Object.defineProperty(clickEvent, 'stopPropagation', { value: jest.fn() })

      fireEvent(button, clickEvent)

      expect(clickEvent.stopPropagation).toHaveBeenCalled()
    })
  })

  describe('Styling', () => {
    it('should have proper styling classes', () => {
      renderWithProvider(<LanguageToggle />)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('rounded-xl')
      expect(button).toHaveClass('px-3')
      expect(button).toHaveClass('py-2')
    })

    it('should have z-index for proper stacking', () => {
      renderWithProvider(<LanguageToggle />)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('z-50')
    })
  })
})

describe('LanguageToggle with saved preference', () => {
  it('should start with English if saved in localStorage', async () => {
    localStorageMock.getItem.mockReturnValue('en')

    renderWithProvider(<LanguageToggle />)

    // Wait for hydration
    await screen.findByText(/🇺🇸 EN/)
    expect(screen.getByText(/🇺🇸 EN/)).toBeInTheDocument()
  })
})

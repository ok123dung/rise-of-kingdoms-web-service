/**
 * SkipLink Component Tests
 * Tests WCAG 2.1 AA bypass blocks functionality
 */

import { render, screen } from '@testing-library/react'

import { SkipLink } from '../SkipLink'

describe('SkipLink Component', () => {
  describe('Accessibility', () => {
    it('should render skip link with correct href', () => {
      render(<SkipLink />)

      const skipLink = screen.getByRole('link')
      expect(skipLink).toHaveAttribute('href', '#main-content')
    })

    it('should have sr-only class for screen reader accessibility', () => {
      render(<SkipLink />)

      const skipLink = screen.getByRole('link')
      expect(skipLink).toHaveClass('sr-only')
    })

    it('should have focus styles for visibility when focused', () => {
      render(<SkipLink />)

      const skipLink = screen.getByRole('link')
      expect(skipLink).toHaveClass('focus:not-sr-only')
      expect(skipLink).toHaveClass('focus:absolute')
    })

    it('should have Vietnamese text for skip navigation', () => {
      render(<SkipLink />)

      const skipLink = screen.getByRole('link')
      expect(skipLink).toHaveTextContent('Bỏ qua đến nội dung chính')
    })
  })

  describe('Visual styling', () => {
    it('should have focus ring for visibility', () => {
      render(<SkipLink />)

      const skipLink = screen.getByRole('link')
      expect(skipLink).toHaveClass('focus:ring-2')
      expect(skipLink).toHaveClass('focus:ring-blue-500')
    })

    it('should have appropriate z-index when focused', () => {
      render(<SkipLink />)

      const skipLink = screen.getByRole('link')
      expect(skipLink).toHaveClass('focus:z-50')
    })

    it('should have background color when focused', () => {
      render(<SkipLink />)

      const skipLink = screen.getByRole('link')
      expect(skipLink).toHaveClass('focus:bg-blue-600')
      expect(skipLink).toHaveClass('focus:text-white')
    })
  })
})

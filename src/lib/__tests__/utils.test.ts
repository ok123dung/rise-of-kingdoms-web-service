/**
 * Utils Tests
 * Tests cn() utility function for Tailwind class merging
 */

import { cn } from '../utils'

describe('cn utility function', () => {
  describe('Basic functionality', () => {
    it('should merge simple class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar')
    })

    it('should handle single class name', () => {
      expect(cn('foo')).toBe('foo')
    })

    it('should handle empty inputs', () => {
      expect(cn()).toBe('')
      expect(cn('')).toBe('')
    })
  })

  describe('Conditional classes (clsx)', () => {
    it('should filter out falsy values', () => {
      expect(cn('foo', false, 'bar')).toBe('foo bar')
      expect(cn('foo', null, 'bar')).toBe('foo bar')
      expect(cn('foo', undefined, 'bar')).toBe('foo bar')
      expect(cn('foo', 0, 'bar')).toBe('foo bar')
    })

    it('should handle conditional object syntax', () => {
      expect(cn({ foo: true, bar: false })).toBe('foo')
      expect(cn({ foo: true, bar: true })).toBe('foo bar')
    })

    it('should handle array syntax', () => {
      expect(cn(['foo', 'bar'])).toBe('foo bar')
      expect(cn(['foo', ['bar', 'baz']])).toBe('foo bar baz')
    })

    it('should handle mixed syntax', () => {
      expect(cn('foo', { bar: true, baz: false }, ['qux'])).toBe('foo bar qux')
    })
  })

  describe('Tailwind class merging (twMerge)', () => {
    it('should merge conflicting Tailwind classes', () => {
      expect(cn('px-2', 'px-4')).toBe('px-4')
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    })

    it('should handle padding/margin conflicts', () => {
      expect(cn('p-4', 'p-2')).toBe('p-2')
      expect(cn('m-4', 'mx-2')).toBe('m-4 mx-2') // mx-2 is more specific
      expect(cn('px-4', 'px-8')).toBe('px-8')
    })

    it('should handle font size conflicts', () => {
      expect(cn('text-sm', 'text-lg')).toBe('text-lg')
    })

    it('should handle background conflicts', () => {
      expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500')
    })

    it('should handle responsive prefixes', () => {
      expect(cn('md:p-4', 'md:p-8')).toBe('md:p-8')
      expect(cn('p-2', 'md:p-4')).toBe('p-2 md:p-4')
    })

    it('should handle hover states', () => {
      expect(cn('hover:bg-red-500', 'hover:bg-blue-500')).toBe('hover:bg-blue-500')
    })

    it('should handle flex direction', () => {
      expect(cn('flex-row', 'flex-col')).toBe('flex-col')
    })

    it('should handle border radius', () => {
      expect(cn('rounded-sm', 'rounded-lg')).toBe('rounded-lg')
    })

    it('should not merge non-conflicting classes', () => {
      expect(cn('p-4', 'bg-blue-500', 'text-white')).toBe('p-4 bg-blue-500 text-white')
    })
  })

  describe('Real-world usage patterns', () => {
    it('should handle button variant pattern', () => {
      const baseClasses = 'px-4 py-2 rounded font-medium'
      const variantClasses = 'bg-blue-500 text-white'
      const overrideClasses = 'bg-red-500'

      expect(cn(baseClasses, variantClasses, overrideClasses)).toBe(
        'px-4 py-2 rounded font-medium text-white bg-red-500'
      )
    })

    it('should handle disabled state pattern', () => {
      const isDisabled = true
      const result = cn('bg-blue-500 cursor-pointer', {
        'bg-gray-300 cursor-not-allowed': isDisabled
      })

      // Check both classes are present (order may vary)
      expect(result).toContain('cursor-not-allowed')
      expect(result).toContain('bg-gray-300')
      // Original conflicting classes should be replaced
      expect(result).not.toContain('bg-blue-500')
      expect(result).not.toContain('cursor-pointer')
    })

    it('should handle size variant pattern', () => {
      const size = 'large'

      expect(
        cn('p-2', {
          'p-4': size === 'large',
          'p-1': size === 'small'
        })
      ).toBe('p-4')
    })

    it('should handle dark mode pattern', () => {
      expect(cn('bg-white dark:bg-gray-800', 'text-black dark:text-white')).toBe(
        'bg-white dark:bg-gray-800 text-black dark:text-white'
      )
    })

    it('should handle component prop override pattern', () => {
      const defaultClasses = 'flex items-center gap-2 p-4'
      const userClasses = 'p-8 gap-4'

      // User classes should override defaults
      expect(cn(defaultClasses, userClasses)).toBe('flex items-center p-8 gap-4')
    })
  })
})

// Jest polyfills for browser APIs

// TextEncoder/TextDecoder polyfill (CommonJS for Jest)
const { TextEncoder, TextDecoder } = require('util')

// Polyfill for Node.js environment
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Fetch polyfill (if needed)
if (typeof global.fetch === 'undefined') {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve('')
    })
  )
}

// Performance API polyfill
global.performance = {
  now: jest.fn(() => Date.now()),
  getEntriesByType: jest.fn(() => []),
  getEntriesByName: jest.fn(() => []),
  mark: jest.fn(),
  measure: jest.fn()
}

// IntersectionObserver polyfill
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// ResizeObserver polyfill
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// matchMedia polyfill - only if window exists
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    }))
  })
}

// scrollTo polyfill
global.scrollTo = jest.fn()

// localStorage/sessionStorage polyfill
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}
global.localStorage = localStorageMock
global.sessionStorage = localStorageMock

// URL polyfill
global.URL = global.URL || require('url').URL
